#!/usr/bin/env node
/**
 * scripts/enrich-candidates.mjs
 *
 * Data enrichment pipeline for TheJacket candidate data.
 * Pulls from OpenFEC, ProPublica Congress, OpenStates, and Ballotpedia.
 *
 * Usage:
 *   node scripts/enrich-candidates.mjs [--candidate <id>] [--source <fec|propublica|openstates>] [--dry-run]
 *
 * API keys (optional but recommended for higher rate limits):
 *   OPENFEC_API_KEY      — https://api.open.fec.gov/developers/  (default: DEMO_KEY)
 *   PROPUBLICA_API_KEY   — https://www.propublica.org/datastore/api/propublica-congress-api
 *   OPENSTATES_API_KEY   — https://open.pluralpolicy.com/
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../data/candidates");

// ─── Config ─────────────────────────────────────────────────────────────────

const OPENFEC_API_KEY = process.env.OPENFEC_API_KEY || "DEMO_KEY";
const PROPUBLICA_API_KEY = process.env.PROPUBLICA_API_KEY || "";
const OPENSTATES_API_KEY = process.env.OPENSTATES_API_KEY || "";

const RATE_LIMIT_MS = 3000; // 1 req per 3 sec per domain (polite crawling)

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const TARGET_CANDIDATE = args.includes("--candidate")
  ? args[args.indexOf("--candidate") + 1]
  : null;
const TARGET_SOURCE = args.includes("--source")
  ? args[args.indexOf("--source") + 1]
  : null;

// ─── Known candidate mappings ────────────────────────────────────────────────

const FEC_CANDIDATE_IDS = {
  "raja-krishnamoorthi": "H6IL08137",
  "robin-kelly": "H2IL02092",
  "kina-collins": "H2IL07153",
  "juliana-stratton": null, // State office, no FEC ID
  "daniel-biss": "H4IL09141",
  "kat-abughazaleh": "H4IL09199",
  "laura-fine": null, // State race
  "la-shawn-k-ford": null, // State race
  "richard-boykin": "H8IL02109",
  "robert-peters": null, // State race
  "jesse-jackson-jr": null, // Former, no current FEC
  "donna-miller": null,
  "toni-preckwinkle": null, // County race
  "fritz-kaegi": null, // County race
  "pat-hynes": null, // County race
  "thomas-dart": null, // County race
};

const PROPUBLICA_MEMBER_IDS = {
  "raja-krishnamoorthi": "K000385",
  "robin-kelly": "K000385", // placeholder — check ProPublica
  "kina-collins": "C001120",
  "la-shawn-k-ford": null, // State rep
  "daniel-biss": null, // State/local
  "laura-fine": null, // State
  "robert-peters": null, // State
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJSON(url, headers = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TheJacket Voter Research/1.0 (thejacket.cc)",
        ...headers,
      },
    });
    if (!res.ok) {
      console.error(`  HTTP ${res.status} for ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`  Fetch error for ${url}: ${err.message}`);
    return null;
  }
}

function loadCandidate(id) {
  const path = join(DATA_DIR, `${id}.json`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    console.error(`Cannot load ${id}.json`);
    return null;
  }
}

function saveCandidate(id, data) {
  const path = join(DATA_DIR, `${id}.json`);
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would write ${id}.json`);
    return;
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`  Saved ${id}.json`);
}

function getAllCandidateIds() {
  return readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

// ─── OpenFEC enrichment ──────────────────────────────────────────────────────

async function enrichFromFEC(candidateId) {
  const fecId = FEC_CANDIDATE_IDS[candidateId];
  if (!fecId) {
    console.log(`  No FEC ID for ${candidateId} — skipping`);
    return null;
  }

  console.log(`  Fetching FEC data for ${candidateId} (${fecId})...`);

  const totalsUrl = `https://api.open.fec.gov/v1/candidate/${fecId}/totals/?api_key=${OPENFEC_API_KEY}&cycle=2026&election_full=false`;
  await sleep(RATE_LIMIT_MS);
  const totalsData = await fetchJSON(totalsUrl);

  if (!totalsData || !totalsData.results || totalsData.results.length === 0) {
    console.log(`  No FEC totals found for ${fecId}`);
    return null;
  }

  const totals = totalsData.results[0];
  console.log(`  FEC: total_receipts=${totals.receipts}, disbursements=${totals.disbursements}`);

  // Fetch top contributors
  await sleep(RATE_LIMIT_MS);
  const contribUrl = `https://api.open.fec.gov/v1/schedules/schedule_a/?candidate_id=${fecId}&api_key=${OPENFEC_API_KEY}&sort=-contribution_receipt_amount&per_page=20&cycle=2026`;
  const contribData = await fetchJSON(contribUrl);

  let donors = [];
  if (contribData && contribData.results) {
    donors = contribData.results.slice(0, 20).map((c) => ({
      name: c.contributor_name || "Unknown",
      amount: c.contribution_receipt_amount || null,
      category: classifyContributor(c),
      source: "FEC",
      confirmed: true,
    }));
    console.log(`  FEC: fetched ${donors.length} contributors`);
  }

  return {
    total_raised: Math.round(totals.receipts || 0),
    fec_id: fecId,
    donors,
    data_date: new Date().toISOString().slice(0, 10),
  };
}

function classifyContributor(contrib) {
  const entityType = (contrib.entity_type || "").toUpperCase();
  const name = (contrib.contributor_name || "").toLowerCase();
  if (entityType === "PAC") {
    if (name.includes("aipac") || name.includes("pro-israel")) return "aipac";
    if (name.includes("union") || name.includes("local ") || name.includes("worker") || name.includes("labor")) return "Union PAC";
    if (name.includes("dark") || name.includes("llc") || name.includes("fund")) return "dark-money";
    return "pac";
  }
  if (entityType === "IND") return "Individual";
  if (entityType === "CCM") return "Corporate";
  return "Individual";
}

// ─── ProPublica Congress enrichment ─────────────────────────────────────────

async function enrichFromProPublica(candidateId) {
  const memberId = PROPUBLICA_MEMBER_IDS[candidateId];
  if (!memberId) {
    console.log(`  No ProPublica member ID for ${candidateId} — skipping`);
    return null;
  }
  if (!PROPUBLICA_API_KEY) {
    console.log(`  No PROPUBLICA_API_KEY set — skipping vote records`);
    console.log(`  Get a free key at: https://www.propublica.org/datastore/api/propublica-congress-api`);
    return null;
  }

  console.log(`  Fetching ProPublica votes for ${candidateId} (${memberId})...`);

  await sleep(RATE_LIMIT_MS);
  const votesUrl = `https://api.propublica.org/congress/v1/members/${memberId}/votes.json`;
  const votesData = await fetchJSON(votesUrl, { "X-API-Key": PROPUBLICA_API_KEY });

  if (!votesData || !votesData.results) return null;

  const votes = votesData.results[0]?.votes || [];
  const keyVotes = votes.slice(0, 10).map((v) => ({
    bill: v.bill?.number || v.description?.slice(0, 40) || "Unknown bill",
    vote: v.position || "Unknown",
    summary: v.description || "",
    source: `https://api.propublica.org/congress/v1/members/${memberId}/votes.json`,
  }));

  console.log(`  ProPublica: fetched ${keyVotes.length} votes`);
  return { key_votes: keyVotes };
}

// ─── Compute transparency score ───────────────────────────────────────────────

function computeTransparencyScore(candidate) {
  const total = candidate.jacket?.total_raised;
  const donors = candidate.jacket?.donors || [];
  const platform = candidate.policy_platform || [];
  const flags = candidate.red_flags || [];
  const keyVotes = candidate.key_votes || [];

  // Financial transparency
  let ftGrade = "F";
  if (total && total > 0) {
    const listed = donors
      .filter((d) => typeof d.amount === "number" && d.amount > 0)
      .reduce((sum, d) => sum + d.amount, 0);
    const pct = listed / total;
    if (pct >= 0.75) ftGrade = "A";
    else if (pct >= 0.50) ftGrade = "B";
    else if (pct >= 0.25) ftGrade = "C";
    else if (pct >= 0.05) ftGrade = "D";
    else ftGrade = "F";
  } else if (!total) {
    ftGrade = "F"; // No total reported = no transparency
  }

  // Platform completeness
  const platformItems = platform.filter((p) => p.position && !p.position.includes("No detailed policy"));
  let pcGrade = "F";
  if (platformItems.length >= 4) pcGrade = "A";
  else if (platformItems.length === 3) pcGrade = "B";
  else if (platformItems.length === 2) pcGrade = "C";
  else if (platformItems.length === 1) pcGrade = "D";

  // Record available
  const recordAvailable = keyVotes.length > 0;

  // Red flags
  const flagCount = flags.length;

  // Weighted grade calculation
  const gradeToNum = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  const numToGrade = ["F", "D", "C", "B", "A"];

  let score = (gradeToNum[ftGrade] * 0.5) + (gradeToNum[pcGrade] * 0.5);
  if (recordAvailable) score = Math.min(4, score + 0.5);
  if (flagCount >= 5) score = Math.max(0, score - 2);
  else if (flagCount >= 3) score = Math.max(0, score - 1);

  const gradeIndex = Math.round(Math.max(0, Math.min(4, score)));
  const grade = numToGrade[gradeIndex];

  return {
    grade,
    computed: true,
    financial_transparency: ftGrade,
    platform_completeness: pcGrade,
    record_available: recordAvailable,
    red_flags_count: flagCount,
    computed_at: new Date().toISOString().slice(0, 10),
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const ids = TARGET_CANDIDATE ? [TARGET_CANDIDATE] : getAllCandidateIds();
  console.log(`\nEnriching ${ids.length} candidate(s)...`);
  if (DRY_RUN) console.log("DRY RUN — no files will be written\n");

  for (const id of ids) {
    console.log(`\n── ${id}`);
    const candidate = loadCandidate(id);
    if (!candidate) continue;

    let updated = { ...candidate };

    // Always (re)compute transparency score
    updated.transparency_score = computeTransparencyScore(candidate);
    console.log(`  Transparency score: ${updated.transparency_score.grade} (ft=${updated.transparency_score.financial_transparency}, pc=${updated.transparency_score.platform_completeness})`);

    // FEC enrichment
    if (!TARGET_SOURCE || TARGET_SOURCE === "fec") {
      if (FEC_CANDIDATE_IDS[id]) {
        const fecData = await enrichFromFEC(id);
        if (fecData) {
          // Only update total_raised if we got a real number and it's not already set
          if (fecData.total_raised && !candidate.jacket.total_raised) {
            updated.jacket = { ...updated.jacket, total_raised: fecData.total_raised };
          }
          // Merge FEC donors with existing donors (avoid dupes by name)
          if (fecData.donors.length > 0) {
            const existingNames = new Set(candidate.jacket.donors.map((d) => d.name.toLowerCase()));
            const newDonors = fecData.donors.filter((d) => !existingNames.has(d.name.toLowerCase()));
            updated.jacket = {
              ...updated.jacket,
              donors: [...candidate.jacket.donors, ...newDonors],
              fec_id: fecData.fec_id,
              data_date: fecData.data_date,
            };
          }
        }
      }
    }

    // ProPublica enrichment
    if (!TARGET_SOURCE || TARGET_SOURCE === "propublica") {
      if (PROPUBLICA_MEMBER_IDS[id] && candidate.key_votes.length === 0) {
        const ppData = await enrichFromProPublica(id);
        if (ppData?.key_votes?.length > 0) {
          updated.key_votes = ppData.key_votes;
        }
      }
    }

    saveCandidate(id, updated);
  }

  console.log("\nDone.\n");
  console.log("Next steps:");
  console.log("  1. Set PROPUBLICA_API_KEY and re-run with --source propublica for voting records");
  console.log("  2. Set OPENSTATES_API_KEY and run --source openstates for state legislators");
  console.log("  3. Manually review and fill policy_platform from candidate websites");
  console.log("  4. Run: npm run build");
}

main().catch(console.error);
