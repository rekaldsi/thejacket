#!/usr/bin/env node
/**
 * enrich-fec.mjs — FEC API enrichment for TheJacket federal candidates
 *
 * Pulls from OpenFEC API:
 *   - Candidate record (ID, party, office, state)
 *   - Principal committee (committee_id, COH, total raised, total spent)
 *   - Top donors (Schedule A itemized contributions, top 10)
 *
 * Rate limit: 1,000 req/hr — we cap at 800/hr and check X-RateLimit-Remaining
 * Data use: civic transparency / voter education — compliant with 52 U.S.C. § 30111
 *
 * Usage:
 *   node scripts/enrich-fec.mjs
 *   node scripts/enrich-fec.mjs --dry-run   (lookup only, no file writes)
 *   node scripts/enrich-fec.mjs --slug krishnamoorthi  (single candidate)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES_DIR = path.join(__dirname, "../data/candidates");

// Load API key
const FEC_API_KEY =
  process.env.FEC_API_KEY ||
  (() => {
    try {
      const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
      const match = env.match(/^FEC_API_KEY=(.+)$/m);
      return match ? match[1].trim() : null;
    } catch {
      return null;
    }
  })();

if (!FEC_API_KEY) {
  console.error("❌ FEC_API_KEY not found in .env.local");
  process.exit(1);
}

const BASE = "https://api.open.fec.gov/v1";
const DRY_RUN = process.argv.includes("--dry-run");
const SINGLE_SLUG = (() => {
  const i = process.argv.indexOf("--slug");
  return i >= 0 ? process.argv[i + 1] : null;
})();

// Rate limit tracking
let requestsThisHour = 0;
let remaining = 800;

async function fecGet(endpoint, params = {}) {
  if (remaining < 20) {
    console.log("⏳ Rate limit low — pausing 60s...");
    await sleep(60000);
  }

  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set("api_key", FEC_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  requestsThisHour++;

  const limitRemaining = res.headers.get("X-RateLimit-Remaining");
  if (limitRemaining) remaining = parseInt(limitRemaining);

  if (res.status === 429) {
    console.log("⚠️  429 rate limit hit — sleeping 65s");
    await sleep(65000);
    return fecGet(endpoint, params);
  }

  if (!res.ok) {
    throw new Error(`FEC API ${res.status}: ${endpoint}`);
  }

  return res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Extract last name for FEC search (FEC q= matches on last name only)
function toFecQuery(name) {
  const cleaned = name
    .replace(/\s+Jr\.?$/i, "")
    .replace(/\s+II+$/i, "")
    .replace(/\s+III$/i, "")
    .trim();
  // Return last word (last name)
  const parts = cleaned.split(/\s+/);
  return parts[parts.length - 1];
}

// Map our race_id to FEC office code + state
function raceToFecOffice(raceId) {
  if (raceId.includes("senate")) return { office: "S", state: "IL" };
  const distMatch = raceId.match(/il-(\d{2})-us-house/);
  if (distMatch) return { office: "H", state: "IL", district: distMatch[1] };
  return null;
}

async function enrichCandidate(filePath) {
  const slug = path.basename(filePath, ".json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!data.race_id || (!data.race_id.includes("senate") && !data.race_id.includes("us-house"))) {
    return { slug, status: "skipped", reason: "not a federal race" };
  }

  const officeInfo = raceToFecOffice(data.race_id);
  if (!officeInfo) return { slug, status: "skipped", reason: "no office mapping" };

  console.log(`\n🔍 ${data.name} (${data.race_id})`);

  // Step 1: Find candidate in FEC
  const query = toFecQuery(data.name);
  const searchParams = {
    q: query,
    office: officeInfo.office,
    state: officeInfo.state,
    per_page: 5,
  };
  if (officeInfo.district) searchParams.district = officeInfo.district.replace(/^0/, "");

  await sleep(500); // polite 500ms between requests
  const searchResult = await fecGet("/candidates/", searchParams);

  if (!searchResult.results || searchResult.results.length === 0) {
    console.log(`  ⚠️  No FEC match found for: ${query}`);
    return { slug, status: "no_match", name: data.name };
  }

  // Pick best match — prefer candidates active in 2026 cycle
  const results2026 = searchResult.results.filter(
    (r) => r.cycles && r.cycles.includes(2026)
  );
  const candidate = results2026.length > 0 ? results2026[0] : searchResult.results[0];
  const candidateId = candidate.candidate_id;
  console.log(`  ✅ Matched: ${candidate.name} (${candidateId})`);

  // Step 2: Get committee info
  await sleep(500);
  const committeeResult = await fecGet(`/candidate/${candidateId}/committees/`, {
    designation: "P", // principal committee
    per_page: 5,
  });

  let committeeData = null;
  let topDonors = [];
  let totalRaised = null;
  let totalSpent = null;
  let cashOnHand = null;
  let committeeId = null;

  if (committeeResult.results && committeeResult.results.length > 0) {
    const committee = committeeResult.results[0];
    committeeId = committee.committee_id;
    console.log(`  💰 Committee: ${committee.name} (${committeeId})`);

    // Step 3: Get financials
    await sleep(500);
    const finResult = await fecGet(`/committee/${committeeId}/totals/`, {
      cycle: 2026,
      per_page: 1,
    });

    if (finResult.results && finResult.results.length > 0) {
      const fin = finResult.results[0];
      totalRaised = fin.receipts || fin.individual_contributions || null;
      totalSpent = fin.disbursements || null;
      cashOnHand = fin.last_cash_on_hand_end_period || null;
      console.log(`  💵 Raised: $${totalRaised?.toLocaleString() ?? "?"} | COH: $${cashOnHand?.toLocaleString() ?? "?"}`);
    }

    // Step 4: Top donors (Schedule A — itemized individual contributions)
    await sleep(500);
    const donorResult = await fecGet("/schedules/schedule_a/", {
      committee_id: committeeId,
      two_year_transaction_period: 2026,
      sort: "-contribution_receipt_amount",
      per_page: 10,
      is_individual: true,
    });

    if (donorResult.results) {
      topDonors = donorResult.results.map((d) => ({
        name: d.contributor_name,
        amount: d.contribution_receipt_amount,
        employer: d.contributor_employer || null,
        occupation: d.contributor_occupation || null,
        date: d.contribution_receipt_date || null,
      }));
      console.log(`  👥 Top donors fetched: ${topDonors.length}`);
    }
  }

  // Build enrichment patch
  const patch = {
    fec_candidate_id: candidateId,
    fec_committee_id: committeeId,
  };

  // Update finance fields if we got them
  if (totalRaised || cashOnHand) {
    patch.finance = {
      ...(data.finance || {}),
      total_raised: totalRaised ? Math.round(totalRaised) : data.finance?.total_raised,
      total_spent: totalSpent ? Math.round(totalSpent) : data.finance?.total_spent,
      cash_on_hand: cashOnHand ? Math.round(cashOnHand) : data.finance?.cash_on_hand,
      source: "FEC",
      last_updated: new Date().toISOString().split("T")[0],
    };
  }

  if (topDonors.length > 0) {
    patch.fec_top_donors = topDonors;
  }

  const updated = { ...data, ...patch };

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    console.log(`  💾 Written: ${path.basename(filePath)}`);
  } else {
    console.log(`  🔎 DRY RUN — would write: fec_candidate_id=${candidateId}, raised=$${totalRaised?.toLocaleString()}`);
  }

  return {
    slug,
    status: "enriched",
    name: data.name,
    fec_candidate_id: candidateId,
    fec_committee_id: committeeId,
    total_raised: totalRaised,
    cash_on_hand: cashOnHand,
    top_donors: topDonors.length,
  };
}

async function main() {
  console.log("🇺🇸 FEC Enrichment — TheJacket Federal Candidates");
  console.log(`📋 Mode: ${DRY_RUN ? "DRY RUN" : "LIVE WRITE"}`);
  console.log(`🔑 API key: ...${FEC_API_KEY.slice(-6)}\n`);

  const files = fs.readdirSync(CANDIDATES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(CANDIDATES_DIR, f));

  const targets = SINGLE_SLUG
    ? files.filter((f) => f.includes(SINGLE_SLUG))
    : files;

  const results = [];

  for (const file of targets) {
    try {
      const result = await enrichCandidate(file);
      results.push(result);
    } catch (err) {
      console.error(`  ❌ Error on ${file}: ${err.message}`);
      results.push({ slug: path.basename(file, ".json"), status: "error", error: err.message });
    }
    // Polite delay between candidates
    await sleep(1000);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 ENRICHMENT SUMMARY");
  console.log("=".repeat(60));
  const enriched = results.filter((r) => r.status === "enriched");
  const noMatch = results.filter((r) => r.status === "no_match");
  const errors = results.filter((r) => r.status === "error");

  console.log(`✅ Enriched:   ${enriched.length}`);
  console.log(`⚠️  No match:  ${noMatch.length}`);
  console.log(`❌ Errors:     ${errors.length}`);
  console.log(`⏭️  Skipped:   ${results.filter((r) => r.status === "skipped").length}`);
  console.log(`🌐 API calls:  ${requestsThisHour}`);

  if (noMatch.length > 0) {
    console.log("\n⚠️  No FEC match found:");
    noMatch.forEach((r) => console.log(`   - ${r.name} (${r.slug})`));
  }

  if (enriched.length > 0) {
    console.log("\n✅ Enriched candidates:");
    enriched.forEach((r) =>
      console.log(`   - ${r.name}: raised=$${r.total_raised?.toLocaleString() ?? "?"}, COH=$${r.cash_on_hand?.toLocaleString() ?? "?"}, donors=${r.top_donors}`)
    );
  }
}

main().catch(console.error);
