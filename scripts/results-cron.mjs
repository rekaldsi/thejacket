#!/usr/bin/env node
/**
 * results-cron.mjs
 *
 * Orchestration wrapper for election results scraping.
 * Runs both scrapers in sequence, then git-commits and pushes if data changed.
 * This triggers an automatic Vercel deploy, making results live.
 *
 * Designed for cron scheduling (see OpenClaw / Railway cron):
 *   - Election weeks: every 30 minutes
 *   - Off-season:     once daily
 *
 * Usage:
 *   node scripts/results-cron.mjs              # full run
 *   node scripts/results-cron.mjs --no-push    # scrape + commit, skip push
 *   node scripts/results-cron.mjs --dry-run    # scrape only, no writes
 */

import { execSync, spawnSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST  = path.join(__dirname, '../data/results-manifest.json');
const NO_PUSH   = process.argv.includes('--no-push');
const DRY_RUN   = process.argv.includes('--dry-run');

const timestamp = new Date().toISOString();
console.log(`[CRON] ${timestamp} — TheJacket results cron starting`);

function run(cmd, label) {
  console.log(`[CRON] Running: ${cmd}`);
  const result = spawnSync(cmd, {
    shell: true,
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  if (result.status !== 0) {
    const msg = `[CRON] ${label} failed (exit ${result.status})`;
    console.error(msg);
    if (result.error) console.error(result.error.message);
    throw new Error(msg);
  }
}

function readManifest() {
  if (!existsSync(MANIFEST)) return null;
  try { return JSON.parse(readFileSync(MANIFEST, 'utf-8')); } catch { return null; }
}

async function main() {
  const beforeManifest = readManifest();
  const beforeTotal = beforeManifest
    ? (beforeManifest.candidates_updated || 0) + (beforeManifest.judges_updated || 0)
    : 0;

  const dryFlag = DRY_RUN ? ' --dry-run' : '';

  // ── Step 1: Cook County Clerk (primary source)
  try {
    run(`node scripts/scrape-clerk-results.mjs${dryFlag}`, 'Clerk scraper');
  } catch (err) {
    console.error('[CRON] Clerk scraper error (non-fatal):', err.message);
  }

  // ── Step 2: ILSBE fallback (statewide + suburban subcircuit judges)
  try {
    run(`node scripts/scrape-ilsbe-results.mjs${dryFlag}`, 'ILSBE scraper');
  } catch (err) {
    console.error('[CRON] ILSBE scraper error (non-fatal):', err.message);
  }

  if (DRY_RUN) {
    console.log('[CRON] DRY RUN — no git operations');
    return;
  }

  // ── Step 3: Check if anything changed
  const afterManifest = readManifest();
  if (!afterManifest) {
    console.log('[CRON] No manifest found — skipping commit');
    return;
  }

  const afterTotal = (afterManifest.candidates_updated || 0) + (afterManifest.judges_updated || 0);
  const { candidates_updated, judges_updated, races_scraped } = afterManifest;

  if (afterTotal === 0 && races_scraped === 0) {
    console.log('[CRON] No data scraped — skipping commit');
    return;
  }

  // Always commit when we have data (results can change with precinct updates)
  const commitMsg = [
    `chore: results update — ${candidates_updated} candidates, ${judges_updated} judges, ${races_scraped} races`,
    `[${timestamp}]`,
  ].join(' ');

  try {
    // Stage all result files
    run('git add data/candidates/ data/judges/ data/results-manifest.json', 'git add');

    // Check if there's actually a diff to commit
    const diffResult = spawnSync('git diff --cached --stat', {
      shell: true,
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
    });
    const hasDiff = diffResult.stdout && diffResult.stdout.trim().length > 0;

    if (!hasDiff) {
      console.log('[CRON] No file changes to commit — skipping');
      return;
    }

    run(`git commit -m "${commitMsg}"`, 'git commit');
    console.log(`[CRON] Committed: ${commitMsg}`);

    if (!NO_PUSH) {
      // Push to main to trigger Vercel auto-deploy
      const branch = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf-8',
        cwd: path.join(__dirname, '..'),
      }).trim();

      run(`git push origin ${branch}`, 'git push');
      console.log(`[CRON] Pushed to ${branch} — Vercel deploy triggered`);
    } else {
      console.log('[CRON] --no-push: skipped git push');
    }

  } catch (err) {
    console.error('[CRON] Git operation failed:', err.message);
    process.exit(1);
  }

  console.log(`[CRON] Done — ${candidates_updated} candidates, ${judges_updated} judges updated`);
}

main().catch(err => {
  console.error('[CRON] Fatal:', err.message);
  process.exit(1);
});
