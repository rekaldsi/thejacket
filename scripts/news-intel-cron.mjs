#!/usr/bin/env node
/**
 * TheJacket News Intelligence Cron
 *
 * Searches for breaking news on high-priority candidates and updates
 * their news_hits[] arrays in /data/candidates/*.json.
 * Only adds confirmed, sourced stories — no invented data.
 *
 * Schedule: 8am, 2pm, 8pm CDT daily (via OpenClaw cron job eb6bd14a)
 * Runs continuously through the November 2026 general election.
 *
 * Usage: node scripts/news-intel-cron.mjs
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CANDIDATES_DIR = join(ROOT, 'data', 'candidates')

// High-priority candidates to monitor
const CANDIDATES = [
  { slug: 'toni-preckwinkle',       name: 'Toni Preckwinkle' },
  { slug: 'fritz-kaegi',            name: 'Fritz Kaegi' },
  { slug: 'pat-hynes',              name: 'Pat Hynes' },
  { slug: 'robin-kelly',            name: 'Robin Kelly' },
  { slug: 'raja-krishnamoorthi',    name: 'Raja Krishnamoorthi' },
  { slug: 'juliana-stratton',       name: 'Juliana Stratton' },
  { slug: 'jb-pritzker',            name: 'JB Pritzker' },
  { slug: 'darren-bailey',          name: 'Darren Bailey' },
  { slug: 'holly-kim',              name: 'Holly Kim' },
  { slug: 'melissa-bean',           name: 'Melissa Bean' },
  { slug: 'melissa-conyears-ervin', name: 'Melissa Conyears-Ervin' },
  { slug: 'alexi-giannoulias',      name: 'Alexi Giannoulias' },
]

// Trusted news sources for search queries
const SOURCES = [
  'site:chicagotribune.com',
  'site:suntimes.com',
  'site:wbez.org',
  'site:politico.com',
  'site:injusticewatch.org',
]

/**
 * Load a candidate JSON file. Returns null if not found.
 */
function loadCandidate(slug) {
  const filePath = join(CANDIDATES_DIR, `${slug}.json`)
  try {
    return { filePath, data: JSON.parse(readFileSync(filePath, 'utf8')) }
  } catch {
    return null
  }
}

/**
 * Save a candidate JSON file (pretty-printed, 2-space indent).
 */
function saveCandidate(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

/**
 * Check if a news hit URL already exists in the candidate's news_hits array.
 */
function isDuplicate(newsHits, url) {
  if (!Array.isArray(newsHits)) return false
  return newsHits.some(hit => hit.url === url)
}

/**
 * Commit and push changes to GitHub.
 * Only called if at least one candidate file was updated.
 */
function commitAndPush(date) {
  try {
    execSync('git add data/candidates/', { cwd: ROOT, stdio: 'pipe' })
    execSync(`git commit -m "chore: news intel update ${date}"`, { cwd: ROOT, stdio: 'pipe' })
    execSync('git push origin main', { cwd: ROOT, stdio: 'pipe' })
    console.log('✅ Committed and pushed to main')
  } catch (err) {
    console.error('❌ Git error:', err.message)
  }
}

/**
 * Main entry point.
 * NOTE: Actual web search is performed by the OpenClaw agent that runs this script.
 * This file defines the data structure and commit logic; the agent injects
 * new news_hits entries directly into candidate files before calling commit.
 *
 * To add a news hit programmatically, call addNewsHit() below.
 */
export function addNewsHit(slug, hit) {
  const result = loadCandidate(slug)
  if (!result) {
    console.warn(`⚠️  Candidate not found: ${slug}`)
    return false
  }
  const { filePath, data } = result

  if (!Array.isArray(data.news_hits)) {
    data.news_hits = []
  }

  if (isDuplicate(data.news_hits, hit.url)) {
    console.log(`⏭️  Duplicate, skipping: ${hit.url}`)
    return false
  }

  data.news_hits.unshift({
    title:     hit.title,
    url:       hit.url,
    source:    hit.source,
    date:      hit.date,
    summary:   hit.summary,
    sentiment: hit.sentiment ?? 'neutral',
  })

  saveCandidate(filePath, data)
  console.log(`✅ Added news hit for ${slug}: ${hit.title}`)
  return true
}

/**
 * CLI entry: print candidate list and exit (for agent reference).
 */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const date = new Date().toISOString().split('T')[0]
  console.log(`TheJacket News Intel Cron — ${date}`)
  console.log(`Monitoring ${CANDIDATES.length} candidates:`)
  CANDIDATES.forEach(c => console.log(`  • ${c.name} (${c.slug})`))
  console.log('\nSources:', SOURCES.join(', '))
  console.log('\nThis script is invoked by OpenClaw cron job eb6bd14a.')
  console.log('The agent performs web searches and calls addNewsHit() for each new story found.')
  console.log('Only stories from the last 48h are added. No empty commits.')
}

export { CANDIDATES, SOURCES, commitAndPush }
