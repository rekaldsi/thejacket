#!/usr/bin/env node
/**
 * scrape-ilsbe-results.mjs
 *
 * Fallback scraper: Illinois State Board of Elections (ILSBE) results.
 * Used for:
 *   1. Statewide races not covered by Cook County Clerk
 *   2. Suburban Cook subcircuit judges (1st, 8th) not on the Clerk site
 *
 * ILSBE publishes results via:
 *   - A downloadable .txt file (pipe-delimited) on election night / post-election
 *   - An ASP.NET grid at elections.il.gov/electionoperations/DownloadVoteTotals.aspx
 *
 * Strategy:
 *   1. Try to find the 2026 primary .txt file via known URL patterns
 *   2. Try the ASP.NET POST form to get the file listing for the current year
 *   3. Parse pipe-delimited data and match to our candidates/judges
 *
 * Usage:
 *   node scripts/scrape-ilsbe-results.mjs
 *   node scripts/scrape-ilsbe-results.mjs --dry-run
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES_DIR = path.join(__dirname, '../data/candidates');
const JUDGES_DIR     = path.join(__dirname, '../data/judges');
const MANIFEST_PATH  = path.join(__dirname, '../data/results-manifest.json');
const DRY_RUN        = process.argv.includes('--dry-run');

const ILSBE_BASE = 'https://www.elections.il.gov';
const DOWNLOAD_PAGE = `${ILSBE_BASE}/electionoperations/DownloadVoteTotals.aspx`;

// Known URL patterns for ILSBE result files (newest first)
const ILSBE_FILE_PATTERNS = [
  // 2026 Gubernatorial Primary — try common naming conventions
  `${ILSBE_BASE}/Downloads/ElectionInformation/VoteTotals/2026GubPrimary.txt`,
  `${ILSBE_BASE}/Downloads/ElectionInformation/VoteTotals/26GubPrim.txt`,
  `${ILSBE_BASE}/Downloads/ElectionInformation/VoteTotals/26Primary.txt`,
  `${ILSBE_BASE}/Downloads/ElectionInformation/VoteTotals/2026Primary.txt`,
  `${ILSBE_BASE}/Downloads/ElectionInformation/VoteTotals/Prim2026.txt`,
  `${ILSBE_BASE}/Downloads/ElectionInformation/VoteTotals/March2026Primary.txt`,
];

// ── String utils ────────────────────────────────────────────────────────────

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\(democratic\)|\(republican\)|\(libertarian\)|\(nonpartisan\)/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fuzzyMatch(resultName, pool) {
  const norm = normalize(resultName);
  if (!norm || norm === 'no candidate') return null;

  let m = pool.find(c => c.normalizedName === norm);
  if (m) return m;

  m = pool.find(c =>
    c.normalizedName.includes(norm) || norm.includes(c.normalizedName)
  );
  if (m) return m;

  const normWords = new Set(norm.split(' ').filter(w => w.length > 2));
  m = pool.find(c => {
    const shared = c.normalizedName.split(' ').filter(w => w.length > 2 && normWords.has(w));
    return shared.length >= 2;
  });
  if (m) return m;

  const normLast = norm.split(' ').pop();
  if (normLast && normLast.length > 4) {
    const matches = pool.filter(c => c.normalizedName.endsWith(normLast));
    if (matches.length === 1) return matches[0];
  }

  return null;
}

// ── Load JSON directory ──────────────────────────────────────────────────────

async function loadJsonDir(dir) {
  let files;
  try { files = await fs.readdir(dir); } catch { return []; }
  const out = [];
  for (const f of files.filter(f => f.endsWith('.json'))) {
    try {
      const raw = await fs.readFile(path.join(dir, f), 'utf-8');
      const data = JSON.parse(raw);
      out.push({ filePath: path.join(dir, f), data, normalizedName: normalize(data.name) });
    } catch { /* skip */ }
  }
  return out;
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function tryFetch(url, opts = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TheJacket/1.0 ilsbe-scraper' },
      signal: AbortSignal.timeout(20_000),
      ...opts,
    });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  }
}

// ── Try known file URL patterns ──────────────────────────────────────────────

async function tryKnownPatterns() {
  for (const url of ILSBE_FILE_PATTERNS) {
    console.log(`[ILSBE] Trying: ${url}`);
    const res = await tryFetch(url);
    if (!res) continue;
    const text = await res.text();
    if (text && text.length > 100) {
      console.log(`[ILSBE] Found file at ${url} (${text.length} bytes)`);
      return { url, text };
    }
  }
  return null;
}

// ── Try ASP.NET download page ────────────────────────────────────────────────
// The page has a year dropdown and a grid of file links per year.
// We do a GET to get form fields, then POST for year=2026 data.

async function tryAspNetDownload() {
  console.log(`[ILSBE] Trying ASP.NET download page...`);
  const res = await tryFetch(DOWNLOAD_PAGE);
  if (!res) return null;
  const html = await res.text();

  // Extract ASP.NET form fields
  const vsMatch = html.match(/name="__VIEWSTATE"\s+value="([^"]+)"/);
  const vegMatch = html.match(/name="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/);
  const evMatch  = html.match(/name="__EVENTVALIDATION"\s+value="([^"]+)"/);
  if (!vsMatch) {
    console.log('[ILSBE] Could not extract VIEWSTATE');
    return null;
  }

  // Find the select element for year and pick 2026 (or the latest available)
  const yearOpts = [...html.matchAll(/value="(\d{4})"/g)].map(m => parseInt(m[1]));
  const latestYear = Math.max(...yearOpts, 2026);
  console.log(`[ILSBE] Years available: ${yearOpts.join(', ')} — requesting ${latestYear}`);

  // POST to get the file listing for this year
  const formData = new URLSearchParams({
    __VIEWSTATE: vsMatch[1],
    __VIEWSTATEGENERATOR: vegMatch ? vegMatch[1] : '',
    __EVENTVALIDATION: evMatch ? evMatch[1] : '',
    // The year dropdown — name is from the page
    'ctl00$ContentPlaceHolder1$DDLYear': String(latestYear),
    'ctl00$ContentPlaceHolder1$BtnSearch': 'Search',
  });

  const postRes = await tryFetch(DOWNLOAD_PAGE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': DOWNLOAD_PAGE,
    },
    body: formData.toString(),
  });
  if (!postRes) return null;
  const postHtml = await postRes.text();

  // Extract .txt file links from the results grid
  const fileLinks = [...postHtml.matchAll(/href="([^"]+\.txt)"/gi)].map(m => m[1]);
  console.log(`[ILSBE] Found ${fileLinks.length} .txt file links`);

  for (const link of fileLinks) {
    const url = link.startsWith('http') ? link : `${ILSBE_BASE}${link.startsWith('/') ? '' : '/'}${link}`;
    // Prefer primary election files
    if (/prim|primary|gubern/i.test(url)) {
      const fRes = await tryFetch(url);
      if (!fRes) continue;
      const text = await fRes.text();
      if (text && text.length > 100) {
        console.log(`[ILSBE] Downloaded primary file: ${url}`);
        return { url, text };
      }
    }
  }

  // If no primary-specific file, try first available
  for (const link of fileLinks.slice(0, 3)) {
    const url = link.startsWith('http') ? link : `${ILSBE_BASE}${link.startsWith('/') ? '' : '/'}${link}`;
    const fRes = await tryFetch(url);
    if (!fRes) continue;
    const text = await fRes.text();
    if (text && text.length > 100) {
      console.log(`[ILSBE] Downloaded file: ${url}`);
      return { url, text };
    }
  }

  return null;
}

// ── Parse ILSBE pipe-delimited results ──────────────────────────────────────
//
// ILSBE .txt format (pipe-delimited):
//   ElectionName|RaceName|CandidateName|Votes|Pct|DistrictName|PartyName|Winner
//   or variations — we try both with and without header row

function parseTxt(text) {
  const rows = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Skip obvious header lines
    if (/^(ElectionName|Race|Contest|Candidate)/i.test(line)) continue;

    const cols = line.split('|').map(c => c.trim());
    if (cols.length < 3) continue;

    // Try to identify column positions
    // Common formats:
    //   [election, race, candidate, votes, pct, district?, party?, winner?]
    //   [race, candidate, votes, pct, winner]
    let raceName, candidateName, votes, pct, winner;

    if (cols.length >= 6) {
      // Full ILSBE format
      raceName      = cols[1] || cols[0];
      candidateName = cols[2];
      votes         = parseInt(cols[3].replace(/,/g, ''), 10);
      pct           = parseFloat(cols[4]);
      winner        = /^y/i.test(cols[7] || '') || /^y/i.test(cols[5] || '');
    } else {
      // Condensed format
      raceName      = cols[0];
      candidateName = cols[1];
      votes         = parseInt(cols[2].replace(/,/g, ''), 10);
      pct           = parseFloat(cols[3]);
      winner        = /^y/i.test(cols[4] || '');
    }

    if (!candidateName || !raceName) continue;
    if (isNaN(votes)) votes = null;
    if (isNaN(pct))   pct   = null;

    const isJudicial = /judge|justice|appellate|circuit|subcircuit/i.test(raceName);

    rows.push({ raceName, candidateName, votes, pct, winner, isJudicial });
  }

  return rows;
}

// ── Resolve winners (for races with no explicit Y in winner col) ─────────────

function resolveWinners(rows) {
  const byRace = {};
  for (const r of rows) {
    (byRace[r.raceName] = byRace[r.raceName] || []).push(r);
  }

  for (const raceRows of Object.values(byRace)) {
    if (raceRows.some(r => r.winner)) continue;
    const hasVotes = raceRows.some(r => r.votes !== null && r.votes > 0);
    if (!hasVotes) continue;

    const voteForMatch = raceRows[0].raceName.match(/vote for (\d+)/i);
    const voteFor = voteForMatch ? parseInt(voteForMatch[1], 10) : 1;
    const sorted = [...raceRows].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    for (let i = 0; i < Math.min(voteFor, sorted.length); i++) {
      sorted[i].winner = true;
    }
  }

  return rows;
}

// ── Write helpers ────────────────────────────────────────────────────────────

async function writeCandidateResult(entry, row, timestamp) {
  const { data, filePath } = entry;
  const status = row.winner ? 'won' : row.votes !== null ? 'lost' : 'pending';
  data.primary_result = { status, votes: row.votes, pct: row.pct, updated: timestamp };
  if (!DRY_RUN) await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

async function writeJudgeResult(entry, row, timestamp) {
  const { data, filePath } = entry;
  const status = row.winner ? 'won' : row.votes !== null ? 'lost' : 'pending';
  data.primary_result = { status, yes_pct: null, no_pct: null, votes: row.votes, updated: timestamp };
  if (!DRY_RUN) await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
}

// ── Merge with existing manifest ─────────────────────────────────────────────

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'));
  } catch {
    return { races_scraped: 0, candidates_updated: 0, judges_updated: 0, unmatched: [], status: 'pending' };
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const timestamp = new Date().toISOString();

  const [candidateFiles, judgeFiles] = await Promise.all([
    loadJsonDir(CANDIDATES_DIR),
    loadJsonDir(JUDGES_DIR),
  ]);

  console.log(`[ILSBE] Loaded ${candidateFiles.length} candidates, ${judgeFiles.length} judges`);

  // Identify candidates/judges with pending results (to focus matching)
  const pendingCandidates = candidateFiles.filter(e =>
    !e.data.primary_result || e.data.primary_result.status === 'pending'
  );
  const pendingJudges = judgeFiles.filter(e =>
    !e.data.primary_result || e.data.primary_result.status === 'pending'
  );

  console.log(`[ILSBE] Pending: ${pendingCandidates.length} candidates, ${pendingJudges.length} judges`);

  // Fetch results
  let fileData = null;

  fileData = await tryKnownPatterns();
  if (!fileData) {
    fileData = await tryAspNetDownload();
  }

  if (!fileData) {
    console.log('[ILSBE] No data available from ILSBE — results not yet published');
    console.log('[ILSBE] This is expected on election night; ILSBE publishes final results later');
    return { candidatesUpdated: 0, judgesUpdated: 0, racesScraped: 0, unmatched: [], sourceUrl: null };
  }

  let rows = parseTxt(fileData.text);
  rows = resolveWinners(rows);
  const racesScraped = new Set(rows.map(r => r.raceName)).size;
  console.log(`[ILSBE] Parsed ${rows.length} rows, ${racesScraped} races`);

  let candidatesUpdated = 0;
  let judgesUpdated = 0;
  const unmatched = [];
  const updatedFiles = new Set();

  for (const row of rows) {
    if (!row.candidateName) continue;

    if (row.isJudicial) {
      const jMatch = fuzzyMatch(row.candidateName, pendingJudges);
      if (jMatch && !updatedFiles.has(jMatch.filePath)) {
        await writeJudgeResult(jMatch, row, timestamp);
        updatedFiles.add(jMatch.filePath);
        judgesUpdated++;
        if (DRY_RUN) console.log(`  [dry] judge ${jMatch.data.name} → ${row.winner ? 'won' : 'lost'}`);
        continue;
      }
    }

    const cMatch = fuzzyMatch(row.candidateName, pendingCandidates);
    if (cMatch && !updatedFiles.has(cMatch.filePath)) {
      await writeCandidateResult(cMatch, row, timestamp);
      updatedFiles.add(cMatch.filePath);
      candidatesUpdated++;
      if (DRY_RUN) console.log(`  [dry] candidate ${cMatch.data.name} → ${row.winner ? 'won' : 'lost'}`);
      continue;
    }

    unmatched.push(`${row.candidateName} (${row.raceName})`);
  }

  console.log(`[ILSBE] Candidates updated: ${candidatesUpdated}`);
  console.log(`[ILSBE] Judges updated: ${judgesUpdated}`);

  // Merge into existing manifest (additive — clerk results remain)
  if (!DRY_RUN) {
    const existing = await readManifest();
    const merged = {
      ...existing,
      last_updated: timestamp,
      ilsbe_source_url: fileData.url,
      candidates_updated: existing.candidates_updated + candidatesUpdated,
      judges_updated: existing.judges_updated + judgesUpdated,
      unmatched: [...(existing.unmatched || []), ...unmatched.slice(0, 50)],
    };
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(merged, null, 2) + '\n');
    console.log('[ILSBE] Manifest updated.');
  }

  return { candidatesUpdated, judgesUpdated, racesScraped, unmatched, sourceUrl: fileData.url };
}

main().catch(err => {
  console.error('[ILSBE] Fatal:', err.message);
  process.exit(1);
});
