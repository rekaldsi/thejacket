#!/usr/bin/env node
/**
 * scrape-results.mjs
 * Scrapes Cook County Clerk election night results and updates candidate/judge JSON files.
 *
 * Usage:
 *   node scripts/scrape-results.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES_DIR = path.join(__dirname, '../data/candidates');
const JUDGES_DIR = path.join(__dirname, '../data/judges');
const MANIFEST_PATH = path.join(__dirname, '../data/results-manifest.json');

const COOK_COUNTY_BASE = 'https://electionnight.cookcountyclerkil.gov';
const COOK_COUNTY_ENDPOINTS = [
  `${COOK_COUNTY_BASE}/api/results`,
  `${COOK_COUNTY_BASE}/api/races`,
  `${COOK_COUNTY_BASE}/results.json`,
  `${COOK_COUNTY_BASE}/data/results.json`,
];

const ILSBE_URL =
  'https://www.elections.il.gov/electionoperations/DownloadVoteTotals.aspx';

// ── String normalization & fuzzy matching ──────────────────────────────────

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Attempt to match a result name against a list of candidate objects.
 * Returns the matched object or null.
 * Each obj must have { name, normalizedName }.
 */
function fuzzyMatch(resultName, candidates) {
  const norm = normalize(resultName);
  if (!norm) return null;

  // 1. Exact
  let match = candidates.find(c => c.normalizedName === norm);
  if (match) return match;

  // 2. startsWith either direction
  match = candidates.find(
    c => c.normalizedName.startsWith(norm) || norm.startsWith(c.normalizedName)
  );
  if (match) return match;

  // 3. includes either direction
  match = candidates.find(
    c => c.normalizedName.includes(norm) || norm.includes(c.normalizedName)
  );
  if (match) return match;

  // 4. Word-overlap: ≥2 shared words
  const normWords = new Set(norm.split(' ').filter(w => w.length > 1));
  match = candidates.find(c => {
    const cWords = c.normalizedName.split(' ').filter(w => w.length > 1);
    const shared = cWords.filter(w => normWords.has(w));
    return shared.length >= 2;
  });
  return match || null;
}

// ── Load all JSON files from a directory ──────────────────────────────────

async function loadJsonDir(dir) {
  let files;
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const results = [];
  for (const f of files.filter(f => f.endsWith('.json'))) {
    try {
      const raw = await fs.readFile(path.join(dir, f), 'utf-8');
      const data = JSON.parse(raw);
      results.push({ filePath: path.join(dir, f), data });
    } catch {
      // skip corrupt files
    }
  }
  return results;
}

// ── Cook County Clerk fetch ────────────────────────────────────────────────

async function fetchCookCountyJSON() {
  for (const url of COOK_COUNTY_ENDPOINTS) {
    try {
      console.log(`[RESULTS] Trying endpoint: ${url}`);
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'TheJacket/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('json')) continue;
      const data = await res.json();
      if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
        console.log(`[RESULTS] Got JSON from ${url}`);
        return { source: url, data };
      }
    } catch {
      // try next
    }
  }
  return null;
}

async function fetchCookCountyHTML() {
  try {
    console.log(`[RESULTS] Fetching Cook County HTML: ${COOK_COUNTY_BASE}/`);
    const res = await fetch(`${COOK_COUNTY_BASE}/`, {
      headers: { 'User-Agent': 'TheJacket/1.0' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return { source: `${COOK_COUNTY_BASE}/`, html };
  } catch {
    return null;
  }
}

/**
 * Parse Cook County JSON results into a normalized array of race/candidate objects.
 * The API shape is unknown — we try common structures.
 *
 * Returns: Array of { raceName, candidateName, votes, pct, winner, isRetention, yesPct, noPct }
 */
function parseCookCountyJSON(data) {
  const races = [];

  // Common shape 1: { races: [ { name, candidates: [ { name, votes, pct, winner } ] } ] }
  const raceList = data.races || data.results || data.contests || (Array.isArray(data) ? data : null);
  if (!raceList) return races;

  for (const race of raceList) {
    const raceName = race.name || race.raceName || race.contest || race.office || '';
    const isRetention = /retention/i.test(raceName);

    const candidates = race.candidates || race.results || race.contestants || [];
    for (const c of candidates) {
      races.push({
        raceName,
        candidateName: c.name || c.candidateName || c.candidate || '',
        votes: typeof c.votes === 'number' ? c.votes : (parseInt(c.votes, 10) || null),
        pct: typeof c.pct === 'number' ? c.pct : (parseFloat(c.pct) || null),
        winner: c.winner === true || c.elected === true || c.status === 'winner',
        isRetention,
        // Retention-specific
        yesPct: parseFloat(c.yes_pct || c.yesPct || c.yes || '') || null,
        noPct: parseFloat(c.no_pct || c.noPct || c.no || '') || null,
      });
    }

    // Retention-only race shape: { name, yes_votes, no_votes, yes_pct, no_pct, retained }
    if (isRetention && !candidates.length) {
      races.push({
        raceName,
        candidateName: raceName.replace(/retention/i, '').trim(),
        votes: parseInt(race.total_votes || race.votes, 10) || null,
        pct: null,
        winner: race.retained === true,
        isRetention: true,
        yesPct: parseFloat(race.yes_pct || race.yesPct) || null,
        noPct: parseFloat(race.no_pct || race.noPct) || null,
      });
    }
  }

  return races;
}

/**
 * Parse Cook County HTML for results.
 * Looks for table rows with candidate names and vote counts.
 * Returns same shape as parseCookCountyJSON.
 */
function parseCookCountyHTML(html) {
  const races = [];

  // Try to find race sections: <h2|h3>Race Name</h2> followed by table rows
  const raceBlockRegex = /<(?:h[23]|div[^>]*class="[^"]*(?:race|contest)[^"]*")[^>]*>([\s\S]*?)<\/(?:h[23]|div)>([\s\S]*?)(?=<(?:h[23]|div[^>]*class="[^"]*(?:race|contest)[^"]*")|$)/gi;
  const tableRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const stripTags = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  let raceMatch;
  while ((raceMatch = raceBlockRegex.exec(html)) !== null) {
    const raceName = stripTags(raceMatch[1]);
    const block = raceMatch[2];
    const isRetention = /retention/i.test(raceName);

    let rowMatch;
    while ((rowMatch = tableRowRegex.exec(block)) !== null) {
      const row = rowMatch[1];
      const cells = [...row.matchAll(tdRegex)].map(m => stripTags(m[1]));
      if (cells.length < 2) continue;

      const name = cells[0];
      if (!name || /^(candidate|name|total)/i.test(name)) continue;

      const votesRaw = cells.find(c => /^\d[\d,]*$/.test(c.replace(/,/g, '')));
      const pctRaw = cells.find(c => /^\d+\.?\d*\s*%?$/.test(c));
      const votes = votesRaw ? parseInt(votesRaw.replace(/,/g, ''), 10) : null;
      const pct = pctRaw ? parseFloat(pctRaw) : null;
      const winner = row.toLowerCase().includes('winner') || row.includes('✓') || row.includes('★');

      races.push({ raceName, candidateName: name, votes, pct, winner, isRetention, yesPct: null, noPct: null });
    }
  }

  return races;
}

// ── ILSBE fallback ─────────────────────────────────────────────────────────

async function fetchILSBEResults() {
  try {
    console.log(`[RESULTS] Trying ILSBE fallback: ${ILSBE_URL}`);
    const res = await fetch(ILSBE_URL, {
      headers: { 'User-Agent': 'TheJacket/1.0' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const text = await res.text();

    // ILSBE publishes pipe-delimited or CSV .txt files linked from this page
    const txtLinks = [...text.matchAll(/href="([^"]+\.(?:txt|csv))"/gi)].map(m => m[1]);
    if (!txtLinks.length) return null;

    const races = [];
    for (const link of txtLinks.slice(0, 5)) {
      try {
        const fullUrl = link.startsWith('http') ? link : `https://www.elections.il.gov${link}`;
        const txtRes = await fetch(fullUrl, { signal: AbortSignal.timeout(10000) });
        if (!txtRes.ok) continue;
        const txt = await txtRes.text();

        // Pipe-delimited: ContestedName|CandidateName|Votes|Pct|Winner
        for (const line of txt.split('\n').filter(l => l.trim())) {
          const cols = line.split('|').map(c => c.trim());
          if (cols.length >= 3) {
            races.push({
              raceName: cols[0] || '',
              candidateName: cols[1] || '',
              votes: parseInt(cols[2], 10) || null,
              pct: parseFloat(cols[3]) || null,
              winner: (cols[4] || '').toLowerCase().includes('y'),
              isRetention: /retention/i.test(cols[0] || ''),
              yesPct: null,
              noPct: null,
            });
          }
        }
      } catch {
        // skip bad file
      }
    }

    return races.length > 0 ? races : null;
  } catch {
    return null;
  }
}

// ── Update candidate JSON ──────────────────────────────────────────────────

async function updateCandidateResult(entry, resultRow, timestamp) {
  const { data, filePath } = entry;

  // Determine status
  let status = 'pending';
  if (resultRow.winner) {
    status = 'won';
  } else if (resultRow.votes !== null) {
    // We have vote data but not marked winner — mark lost only if race has a winner
    status = 'lost';
  }

  data.primary_result = {
    status,
    votes: resultRow.votes,
    pct: resultRow.pct,
    updated: timestamp,
  };

  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

async function updateJudgeResult(entry, resultRow, timestamp) {
  const { data, filePath } = entry;
  const isRetention = data.race_type === 'retention' || resultRow.isRetention;

  if (isRetention) {
    const status =
      resultRow.yesPct !== null
        ? resultRow.yesPct > 50
          ? 'retained'
          : 'not_retained'
        : 'pending';

    data.primary_result = {
      status,
      yes_pct: resultRow.yesPct,
      no_pct: resultRow.noPct,
      votes: resultRow.votes,
      updated: timestamp,
    };
  } else {
    data.primary_result = {
      status: resultRow.winner ? 'won' : resultRow.votes !== null ? 'lost' : 'pending',
      votes: resultRow.votes,
      pct: resultRow.pct,
      updated: timestamp,
    };
  }

  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const timestamp = new Date().toISOString();
  let racesScraped = 0;
  let candidatesUpdated = 0;
  let judgesUpdated = 0;
  const unmatched = [];

  // ── 1. Load data files
  const [candidateFiles, judgeFiles] = await Promise.all([
    loadJsonDir(CANDIDATES_DIR),
    loadJsonDir(JUDGES_DIR),
  ]);

  // Annotate with normalized names for matching
  const candidates = candidateFiles.map(e => ({
    ...e,
    normalizedName: normalize(e.data.name),
  }));
  const judges = judgeFiles.map(e => ({
    ...e,
    normalizedName: normalize(e.data.name),
  }));

  console.log(`[RESULTS] Loaded ${candidates.length} candidates, ${judges.length} judges`);

  // ── 2. Fetch results
  let resultRows = null;
  let sourceUrl = COOK_COUNTY_BASE + '/';

  // Try JSON endpoints first
  const jsonResult = await fetchCookCountyJSON();
  if (jsonResult) {
    const parsed = parseCookCountyJSON(jsonResult.data);
    if (parsed.length > 0) {
      resultRows = parsed;
      sourceUrl = jsonResult.source;
    }
  }

  // Try HTML scrape
  if (!resultRows) {
    const htmlResult = await fetchCookCountyHTML();
    if (htmlResult) {
      const parsed = parseCookCountyHTML(htmlResult.html);
      if (parsed.length > 0) {
        resultRows = parsed;
        sourceUrl = htmlResult.source;
      }
    }
  }

  // Fallback to ILSBE
  if (!resultRows) {
    console.log('[RESULTS] Cook County returned no data — trying ILSBE fallback');
    const ilsbeRows = await fetchILSBEResults();
    if (ilsbeRows) {
      resultRows = ilsbeRows;
      sourceUrl = ILSBE_URL;
    }
  }

  if (!resultRows || resultRows.length === 0) {
    console.warn('[RESULTS] WARNING: No results data available from any source');
    await writeManifest({ timestamp, sourceUrl, racesScraped: 0, candidatesUpdated: 0, judgesUpdated: 0, unmatched });
    return;
  }

  racesScraped = new Set(resultRows.map(r => r.raceName)).size;
  console.log(`[RESULTS] Parsed ${resultRows.length} result rows across ${racesScraped} races`);

  // ── 3. Match and update
  for (const row of resultRows) {
    if (!row.candidateName) continue;

    // Try judges first (retention races), then candidates
    if (row.isRetention || /judge|justice|judicial/i.test(row.raceName)) {
      const match = fuzzyMatch(row.candidateName, judges);
      if (match) {
        await updateJudgeResult(match, row, timestamp);
        judgesUpdated++;
        continue;
      }
    }

    const candidateMatch = fuzzyMatch(row.candidateName, candidates);
    if (candidateMatch) {
      await updateCandidateResult(candidateMatch, row, timestamp);
      candidatesUpdated++;
      continue;
    }

    // Try judges as fallback
    const judgeMatch = fuzzyMatch(row.candidateName, judges);
    if (judgeMatch) {
      await updateJudgeResult(judgeMatch, row, timestamp);
      judgesUpdated++;
      continue;
    }

    unmatched.push(`${row.candidateName} (${row.raceName})`);
  }

  // ── 4. Print summary
  console.log(`[RESULTS] Scraped: ${racesScraped} races | Candidates updated: ${candidatesUpdated} | Judges updated: ${judgesUpdated}`);
  if (unmatched.length > 0) {
    console.log(`[RESULTS] Unmatched: ${unmatched.length} names`);
  }

  // ── 5. Write manifest
  await writeManifest({ timestamp, sourceUrl, racesScraped, candidatesUpdated, judgesUpdated, unmatched });
}

async function writeManifest({ timestamp, sourceUrl, racesScraped, candidatesUpdated, judgesUpdated, unmatched }) {
  const manifest = {
    last_updated: timestamp,
    source: 'Cook County Clerk',
    source_url: sourceUrl || 'https://electionnight.cookcountyclerkil.gov/',
    races_scraped: racesScraped,
    candidates_updated: candidatesUpdated,
    judges_updated: judgesUpdated,
    unmatched,
  };
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[RESULTS] Manifest written: ${MANIFEST_PATH}`);
}

main().catch(err => {
  console.error('[RESULTS] Fatal error:', err.message);
  process.exit(1);
});
