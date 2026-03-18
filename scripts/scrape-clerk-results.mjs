#!/usr/bin/env node
/**
 * scrape-clerk-results.mjs
 *
 * Scrapes Cook County Clerk election night static HTML pages and updates
 * candidate/judge JSON files with live primary results.
 *
 * The Clerk site publishes static HTML (no JSON API):
 *   https://electionnight.cookcountyclerkil.gov/StaticSummarypartyId1.html  (Dem)
 *   https://electionnight.cookcountyclerkil.gov/StaticSummarypartyId2.html  (Rep)
 *   https://electionnight.cookcountyclerkil.gov/StaticSummarydistrictIdJUDAC.html
 *   https://electionnight.cookcountyclerkil.gov/StaticSummarydistrictIdJUDCW.html
 *   https://electionnight.cookcountyclerkil.gov/StaticSummarydistrictIdJUDSS.html
 *
 * Winner detection: fa-caret-left icon in the first <td> of a candidate row.
 *
 * Usage:
 *   node scripts/scrape-clerk-results.mjs
 *   node scripts/scrape-clerk-results.mjs --dry-run
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES_DIR = path.join(__dirname, '../data/candidates');
const JUDGES_DIR     = path.join(__dirname, '../data/judges');
const MANIFEST_PATH  = path.join(__dirname, '../data/results-manifest.json');
const DRY_RUN        = process.argv.includes('--dry-run');

const BASE = 'https://electionnight.cookcountyclerkil.gov';

// Pages to scrape, in priority order.
// isJudicial=true routes rows to judge matching first.
const PAGES = [
  { url: `${BASE}/StaticSummarypartyId1.html`,              label: 'DEM',     isJudicial: false },
  { url: `${BASE}/StaticSummarypartyId2.html`,              label: 'REP',     isJudicial: false },
  { url: `${BASE}/StaticSummarydistrictIdJUDAC.html`,       label: 'JUD-AC',  isJudicial: true  },
  { url: `${BASE}/StaticSummarydistrictIdJUDCW.html`,       label: 'JUD-CW',  isJudicial: true  },
  { url: `${BASE}/StaticSummarydistrictIdJUDSS.html`,       label: 'JUD-SS',  isJudicial: true  },
];

// ── String utils ────────────────────────────────────────────────────────────

function decodeEntities(s) {
  return (s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripTags(s) {
  return decodeEntities((s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\(democratic\)|\(republican\)|\(libertarian\)|\(nonpartisan\)/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Fuzzy name matching ─────────────────────────────────────────────────────

function fuzzyMatch(resultName, pool) {
  const norm = normalize(resultName);
  if (!norm || norm === 'no candidate') return null;

  // 1. Exact
  let m = pool.find(c => c.normalizedName === norm);
  if (m) return m;

  // 2. One contains the other
  m = pool.find(c =>
    c.normalizedName.includes(norm) || norm.includes(c.normalizedName)
  );
  if (m) return m;

  // 3. Word-overlap: ≥2 non-trivial words match (covers most cases)
  const normWords = new Set(norm.split(' ').filter(w => w.length > 2));
  m = pool.find(c => {
    const shared = c.normalizedName.split(' ').filter(w => w.length > 2 && normWords.has(w));
    return shared.length >= 2;
  });
  if (m) return m;

  // 4. Last-word match — surname is high-specificity when >4 chars and unique in pool
  //    Handles "D'Anthony Tony Thedford" → normalized "danthony tony thedford" matching "d anthony thedford"
  const normLast = norm.split(' ').pop();
  if (normLast && normLast.length > 4) {
    const lastMatches = pool.filter(c => c.normalizedName.endsWith(normLast));
    if (lastMatches.length === 1) return lastMatches[0];
  }

  return null;
}

// ── Load all JSON files from a directory ────────────────────────────────────

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

// ── Fetch a page ────────────────────────────────────────────────────────────

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TheJacket/1.0 results-scraper' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

// ── Parse static HTML into result rows ─────────────────────────────────────
//
// Structure (each race):
//   <table>
//     <tr><td>race name cell</td><td>[Race Title]</td></tr>
//     <tr><td>precinct summary...</td></tr>
//     <tr><td></td><td>Candidate Name</td><td>Votes</td><td>%</td></tr>  ← header
//     <tr><td><i class="fa fa-user">... [fa-caret-left if winner]</i></td>
//         <td>Name (Party)</td><td>votes</td><td>pct%</td></tr>
//   </table>
//
// Returns: Array of { raceName, candidateName, votes, pct, winner, isJudicial }

function parseHTML(html, isJudicial) {
  const results = [];

  // Extract all <table>...</table> blocks
  const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch;

  while ((tableMatch = tableRe.exec(html)) !== null) {
    const tableBody = tableMatch[1];

    // Extract rows
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = [];
    let rowMatch;
    while ((rowMatch = rowRe.exec(tableBody)) !== null) {
      rows.push(rowMatch[1]);
    }

    if (rows.length < 3) continue;

    // Row 0: contains the race name in 2nd cell
    const firstRowCells = extractCells(rows[0]);
    if (firstRowCells.length < 2) continue;
    const raceName = stripTags(firstRowCells[1] || '');
    if (!raceName || /^(candidate name|votes|%|ballots cast|registered voters)$/i.test(raceName)) continue;
    if (/referenda|referend/i.test(raceName)) continue; // skip referenda

    const isJudicialRace = isJudicial ||
      /judge|justice|appellate|circuit|subcircuit/i.test(raceName);

    // Data rows start at index 2 (0=race name, 1=precinct summary, 2=header row, 3+=data)
    for (let i = 3; i < rows.length; i++) {
      const cells = extractCells(rows[i]);
      if (cells.length < 3) continue;

      const iconCell = cells[0] || '';
      const nameCell = stripTags(cells[1] || '');
      const voteCell = stripTags(cells[2] || '').replace(/,/g, '');
      const pctCell  = stripTags(cells[3] || '').replace('%', '');

      if (!nameCell || /^(candidate name|no candidate)$/i.test(nameCell)) continue;

      // Winner = fa-caret-left in first cell
      const winner = /fa-caret-left/i.test(iconCell);

      const votes = parseInt(voteCell, 10);
      const pct   = parseFloat(pctCell);

      results.push({
        raceName,
        candidateName: nameCell,
        votes: isNaN(votes) ? null : votes,
        pct:   isNaN(pct)   ? null : pct,
        winner,
        isJudicial: isJudicialRace,
      });
    }
  }

  return results;
}

function extractCells(rowHtml) {
  const cells = [];
  const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  let m;
  while ((m = cellRe.exec(rowHtml)) !== null) {
    cells.push(m[1]);
  }
  return cells;
}

// ── Write helpers ────────────────────────────────────────────────────────────

async function writeCandidateResult(entry, row, timestamp) {
  const { data, filePath } = entry;
  let status = 'pending';
  if (row.winner) {
    status = 'won';
  } else if (row.votes !== null) {
    // Has real vote data — mark lost (winner already marked above)
    status = 'lost';
  }

  data.primary_result = {
    status,
    votes: row.votes,
    pct:   row.pct,
    updated: timestamp,
  };

  if (!DRY_RUN) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
  }
}

async function writeJudgeResult(entry, row, timestamp) {
  const { data, filePath } = entry;
  // All tracked judges this cycle are contested (not retention ballots)
  const status = row.winner ? 'won' : row.votes !== null ? 'lost' : 'pending';

  data.primary_result = {
    status,
    yes_pct: null,
    no_pct:  null,
    votes:   row.votes,
    updated: timestamp,
  };

  if (!DRY_RUN) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
  }
}

// ── Determine winners when no fa-caret-left found ───────────────────────────
// For uncontested races (100%), the highest vote-getter is winner.

function resolveWinners(rows) {
  // Group by raceName
  const byRace = {};
  for (const r of rows) {
    (byRace[r.raceName] = byRace[r.raceName] || []).push(r);
  }

  for (const [raceName, raceRows] of Object.entries(byRace)) {
    const hasExplicitWinner = raceRows.some(r => r.winner);
    if (hasExplicitWinner) continue;

    // No explicit winner — if race is 100% reported and there's a single candidate,
    // or if votes are in and it looks like uncontested, mark top vote-getter
    const hasVotes = raceRows.some(r => r.votes !== null && r.votes > 0);
    if (!hasVotes) continue;

    // "Vote For N" — extract N
    const voteForMatch = raceName.match(/vote for (\d+)/i);
    const voteFor = voteForMatch ? parseInt(voteForMatch[1], 10) : 1;

    // Sort by votes descending, mark top N as winners
    const sorted = [...raceRows].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    for (let i = 0; i < Math.min(voteFor, sorted.length); i++) {
      sorted[i].winner = true;
    }
  }

  return rows;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const timestamp = new Date().toISOString();
  let candidatesUpdated = 0;
  let judgesUpdated     = 0;
  let racesScraped      = 0;
  const unmatched       = [];
  const updatedFiles    = new Set(); // prevent double-updates

  // Load all data files
  const [candidateFiles, judgeFiles] = await Promise.all([
    loadJsonDir(CANDIDATES_DIR),
    loadJsonDir(JUDGES_DIR),
  ]);

  console.log(`[CLERK] Loaded ${candidateFiles.length} candidates, ${judgeFiles.length} judges`);

  // Collect all result rows across pages
  let allRows = [];
  const pagesSeen = new Set();

  for (const page of PAGES) {
    console.log(`[CLERK] Fetching ${page.label}: ${page.url}`);
    let html;
    try {
      html = await fetchPage(page.url);
    } catch (err) {
      console.warn(`[CLERK] WARN: failed to fetch ${page.url}: ${err.message}`);
      continue;
    }

    const rows = parseHTML(html, page.isJudicial);
    const raceNames = new Set(rows.map(r => r.raceName));
    for (const n of raceNames) pagesSeen.add(n);

    allRows = allRows.concat(rows);
    console.log(`[CLERK]   → ${rows.length} result rows, ${raceNames.size} races`);
  }

  // Resolve implicit winners (no fa-caret-left in source)
  allRows = resolveWinners(allRows);

  racesScraped = new Set(allRows.map(r => r.raceName)).size;
  console.log(`[CLERK] Total: ${allRows.length} rows across ${racesScraped} races`);

  if (DRY_RUN) {
    console.log('[CLERK] DRY RUN — sample rows:');
    allRows.filter(r => r.winner).slice(0, 10).forEach(r =>
      console.log(`  WINNER ${r.candidateName} (${r.raceName}) — ${r.votes?.toLocaleString()} votes ${r.pct}%`)
    );
  }

  // Match rows to our files and write results
  for (const row of allRows) {
    if (!row.candidateName) continue;

    // Judge match (for judicial races)
    if (row.isJudicial) {
      const jMatch = fuzzyMatch(row.candidateName, judgeFiles);
      if (jMatch && !updatedFiles.has(jMatch.filePath + '|' + row.raceName)) {
        await writeJudgeResult(jMatch, row, timestamp);
        updatedFiles.add(jMatch.filePath + '|' + row.raceName);
        judgesUpdated++;
        if (DRY_RUN) console.log(`  [dry] judge ${jMatch.data.name} → ${row.winner ? 'won' : 'lost'}`);
        continue;
      }
    }

    // Candidate match
    const cMatch = fuzzyMatch(row.candidateName, candidateFiles);
    if (cMatch && !updatedFiles.has(cMatch.filePath + '|' + row.raceName)) {
      await writeCandidateResult(cMatch, row, timestamp);
      updatedFiles.add(cMatch.filePath + '|' + row.raceName);
      candidatesUpdated++;
      if (DRY_RUN) console.log(`  [dry] candidate ${cMatch.data.name} → ${row.winner ? 'won' : 'lost'}`);
      continue;
    }

    // Fallback: try judge even for non-judicial rows
    if (!row.isJudicial) {
      const jFallback = fuzzyMatch(row.candidateName, judgeFiles);
      if (jFallback && !updatedFiles.has(jFallback.filePath + '|' + row.raceName)) {
        await writeJudgeResult(jFallback, row, timestamp);
        updatedFiles.add(jFallback.filePath + '|' + row.raceName);
        judgesUpdated++;
        continue;
      }
    }

    // No match
    unmatched.push(`${row.candidateName} (${row.raceName})`);
  }

  // Summary
  console.log(`[CLERK] Races scraped: ${racesScraped}`);
  console.log(`[CLERK] Candidates updated: ${candidatesUpdated}`);
  console.log(`[CLERK] Judges updated: ${judgesUpdated}`);
  if (unmatched.length > 0) {
    console.log(`[CLERK] Unmatched (${unmatched.length}):`);
    unmatched.slice(0, 20).forEach(u => console.log(`  - ${u}`));
  }

  // Write manifest
  const manifest = {
    last_updated: timestamp,
    source: 'Cook County Clerk Election Night',
    source_url: `${BASE}/`,
    races_scraped: racesScraped,
    candidates_updated: candidatesUpdated,
    judges_updated: judgesUpdated,
    unmatched: unmatched.slice(0, 100), // cap to avoid giant manifests
    status: candidatesUpdated > 0 || judgesUpdated > 0 ? 'live' : 'pending',
  };

  if (!DRY_RUN) {
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`[CLERK] Manifest written.`);
  } else {
    console.log('[CLERK] DRY RUN complete — no files written');
    console.log('[CLERK] Manifest preview:', JSON.stringify(manifest, null, 2));
  }
}

main().catch(err => {
  console.error('[CLERK] Fatal:', err.message);
  process.exit(1);
});
