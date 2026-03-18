#!/usr/bin/env node
/**
 * scripts/results-cron.mjs
 *
 * Wraps all result scrapers, commits any changes, pushes to main.
 * Triggers Vercel auto-deploy → thejacket.cc updates live.
 * Sends Telegram summary of what changed.
 *
 * Schedule (registered in OpenClaw):
 *   - Election week: every 30 minutes
 *   - Normal weeks: once daily at 8 AM CST
 *
 * Usage:
 *   node scripts/results-cron.mjs [--dry-run] [--no-push]
 */

import { execSync, exec } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data");

const DRY_RUN = process.argv.includes("--dry-run");
const NO_PUSH = process.argv.includes("--no-push");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7638568632";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8", ...opts }).trim();
}

async function sendTelegram(message) {
  if (!TELEGRAM_TOKEN) {
    console.log("[cron] TELEGRAM_TOKEN not set — skipping notification");
    console.log("[cron] Message:", message);
    return;
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "HTML",
  });
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (err) {
    console.error("[cron] Telegram send failed:", err.message);
  }
}

function snapshotDir(dir) {
  const snapshot = {};
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    snapshot[f] = readFileSync(join(dir, f), "utf8");
  }
  return snapshot;
}

function diffSnapshots(before, after) {
  const changed = [];
  for (const [file, content] of Object.entries(after)) {
    if (before[file] !== content) {
      changed.push(file.replace(".json", ""));
    }
  }
  return changed;
}

function readManifest() {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, "results-manifest.json"), "utf8"));
  } catch {
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  const now = new Date().toISOString();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[results-cron] Starting at ${now}`);
  if (DRY_RUN) console.log("[results-cron] DRY RUN mode");
  if (NO_PUSH) console.log("[results-cron] NO PUSH mode");

  // Snapshot before state
  const beforeCandidates = snapshotDir(join(ROOT, "data/candidates"));
  const beforeJudges = snapshotDir(join(ROOT, "data/judges"));

  // ── Run Cook County Clerk scraper ──
  console.log("\n[results-cron] Step 1: Cook County Clerk scraper");
  try {
    const clerkArgs = DRY_RUN ? "--dry-run" : "";
    const { stdout, stderr } = await execAsync(
      `node ${join(__dirname, "scrape-clerk-results.mjs")} ${clerkArgs}`,
      { cwd: ROOT }
    );
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (err) {
    console.error("[results-cron] Clerk scraper failed:", err.message);
    // Continue — try ILSBE fallback
  }

  // ── Run ILSBE fallback scraper ──
  console.log("\n[results-cron] Step 2: ILSBE fallback scraper");
  try {
    const ilsbeArgs = DRY_RUN ? "--dry-run" : "";
    const { stdout, stderr } = await execAsync(
      `node ${join(__dirname, "scrape-ilsbe-results.mjs")} ${ilsbeArgs}`,
      { cwd: ROOT }
    );
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (err) {
    console.error("[results-cron] ILSBE scraper failed:", err.message);
  }

  // Check what changed
  const afterCandidates = snapshotDir(join(ROOT, "data/candidates"));
  const afterJudges = snapshotDir(join(ROOT, "data/judges"));
  const changedCandidates = diffSnapshots(beforeCandidates, afterCandidates);
  const changedJudges = diffSnapshots(beforeJudges, afterJudges);
  const manifest = readManifest();

  const totalChanged = changedCandidates.length + changedJudges.length;
  console.log(`\n[results-cron] Changed: ${changedCandidates.length} candidates, ${changedJudges.length} judges`);

  if (DRY_RUN || NO_PUSH) {
    console.log("[results-cron] Skipping git commit/push (dry-run or no-push mode)");
    await sendTelegram(buildSummary(manifest, changedCandidates, changedJudges, startTime, true));
    return;
  }

  if (totalChanged === 0) {
    console.log("[results-cron] No changes — skipping git commit");
    await sendTelegram(`🗳️ <b>TheJacket Results Cron</b>\nNo new results. Site unchanged.\n<i>${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} CST</i>`);
    return;
  }

  // ── Git commit + push ──
  console.log("\n[results-cron] Step 3: Git commit + push");
  try {
    run("git add data/candidates/ data/judges/ data/results-manifest.json");

    const commitMsg = [
      `results: update ${totalChanged} races — ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })} CST`,
      "",
      `candidates: ${changedCandidates.length} updated`,
      `judges: ${changedJudges.length} updated`,
      `source: ${manifest?.source ?? "Cook County Clerk"}`,
    ].join("\n");

    run(`git commit -m "${commitMsg.replace(/"/g, '\\"').replace(/\n/g, " | ")}"`);
    console.log("[results-cron] Committed. Pushing...");
    run("git push origin main");
    console.log("[results-cron] Pushed → Vercel deploy triggered");
  } catch (err) {
    console.error("[results-cron] Git error:", err.message);
  }

  // ── Telegram summary ──
  const summary = buildSummary(manifest, changedCandidates, changedJudges, startTime, false);
  await sendTelegram(summary);

  console.log(`\n[results-cron] Done in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

function buildSummary(manifest, changedCandidates, changedJudges, startTime, dryRun) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const ts = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  const totalChanged = changedCandidates.length + changedJudges.length;

  const lines = [
    `🗳️ <b>TheJacket Results Update${dryRun ? " (DRY RUN)" : ""}</b>`,
    `<i>${ts} CST</i>`,
    "",
  ];

  if (manifest) {
    lines.push(`📊 Races scraped: ${manifest.races_scraped}`);
    lines.push(`✅ Updated: ${totalChanged} profiles`);
    if (manifest.unmatched?.length) {
      lines.push(`⚠️ Unmatched: ${manifest.unmatched.length}`);
    }
  }

  if (changedCandidates.length > 0) {
    lines.push(`\n<b>Candidates:</b> ${changedCandidates.slice(0, 5).join(", ")}${changedCandidates.length > 5 ? ` +${changedCandidates.length - 5} more` : ""}`);
  }

  if (changedJudges.length > 0) {
    lines.push(`<b>Judges:</b> ${changedJudges.slice(0, 3).join(", ")}${changedJudges.length > 3 ? ` +${changedJudges.length - 3} more` : ""}`);
  }

  lines.push(`\n⏱️ ${elapsed}s`);
  if (!dryRun) lines.push(`🚀 Deployed → thejacket.cc`);

  return lines.join("\n");
}

main().catch((err) => {
  console.error("[results-cron] Fatal:", err);
  process.exit(1);
});
