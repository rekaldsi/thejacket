#!/usr/bin/env node
/**
 * scripts/enrichment-cron.mjs
 *
 * Scheduled enrichment runner for TheJacket.
 * Runs the enrichment pipeline, commits any changes, pushes to main,
 * and sends a Telegram summary of what changed.
 *
 * Called by OpenClaw cron every 8 hours through election day (March 17, 2026).
 *
 * Usage:
 *   node scripts/enrichment-cron.mjs [--dry-run]
 */

import { execSync, exec } from "child_process";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data/candidates");

const DRY_RUN = process.argv.includes("--dry-run");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "7638568632";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8", ...opts }).trim();
}

async function sendTelegram(message) {
  if (!TELEGRAM_TOKEN) {
    console.log("No TELEGRAM_TOKEN — skipping notification");
    console.log("Message that would have been sent:");
    console.log(message);
    return;
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const body = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "HTML" });
  await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
}

function getModifiedCandidates(beforeState) {
  const changed = [];
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const id = file.replace(".json", "");
    const path = join(DATA_DIR, file);
    const currentContent = readFileSync(path, "utf8");
    if (beforeState[id] && beforeState[id] !== currentContent) {
      // Parse both to get meaningful diff summary
      const before = JSON.parse(beforeState[id]);
      const after = JSON.parse(currentContent);
      const diffs = [];

      const beforeTotal = before.jacket?.total_raised;
      const afterTotal = after.jacket?.total_raised;
      if (beforeTotal !== afterTotal && afterTotal != null) {
        diffs.push(`total raised updated: $${(afterTotal / 1000000).toFixed(1)}M`);
      }

      const beforeDonors = before.jacket?.donors?.length || 0;
      const afterDonors = after.jacket?.donors?.length || 0;
      if (afterDonors > beforeDonors) {
        diffs.push(`+${afterDonors - beforeDonors} donors added`);
      }

      const beforeFlags = before.red_flags?.length || 0;
      const afterFlags = after.red_flags?.length || 0;
      if (afterFlags > beforeFlags) {
        diffs.push(`+${afterFlags - beforeFlags} red flags`);
      }

      const beforeVotes = before.key_votes?.length || 0;
      const afterVotes = after.key_votes?.length || 0;
      if (afterVotes > beforeVotes) {
        diffs.push(`+${afterVotes - beforeVotes} votes`);
      }

      const beforeEndorsements = before.endorsements?.length || 0;
      const afterEndorsements = after.endorsements?.length || 0;
      if (afterEndorsements > beforeEndorsements) {
        diffs.push(`+${afterEndorsements - beforeEndorsements} endorsements`);
      }

      const beforeScore = before.transparency_score?.grade;
      const afterScore = after.transparency_score?.grade;
      if (beforeScore !== afterScore) {
        diffs.push(`score: ${beforeScore || "?"} → ${afterScore}`);
      }

      if (diffs.length > 0) {
        changed.push({ id, name: after.name, diffs });
      } else if (beforeState[id] !== currentContent) {
        changed.push({ id, name: after.name, diffs: ["data updated"] });
      }
    } else if (!beforeState[id]) {
      // New candidate added
      const after = JSON.parse(currentContent);
      changed.push({ id, name: after.name, diffs: ["new candidate added"] });
    }
  }

  return changed;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "America/Chicago" });
  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" });

  console.log(`\n[${dateStr} ${timeStr}] TheJacket enrichment cron starting...`);

  // Snapshot current state before enrichment
  const beforeState = {};
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    beforeState[file.replace(".json", "")] = readFileSync(join(DATA_DIR, file), "utf8");
  }

  // Run enrichment script
  console.log("Running enrichment pipeline...");
  try {
    const enrichCmd = `node scripts/enrich-candidates.mjs${DRY_RUN ? " --dry-run" : ""}`;
    const enrichOutput = run(enrichCmd);
    console.log(enrichOutput);
  } catch (err) {
    console.error("Enrichment script error:", err.message);
    await sendTelegram(`⚠️ TheJacket enrichment cron error at ${timeStr}\n${err.message}`);
    process.exit(1);
  }

  // Detect what changed
  const changed = getModifiedCandidates(beforeState);

  if (changed.length === 0) {
    console.log("No changes detected — nothing to commit.");
    await sendTelegram(
      `🔁 TheJacket enrichment — ${dateStr} ${timeStr}\n\n✅ All candidate data current — no changes`
    );
    return;
  }

  // Git commit and push
  if (!DRY_RUN) {
    try {
      run("git add data/candidates/");
      const commitMsg = `chore: auto-enrich ${changed.length} candidate(s) — ${dateStr} ${timeStr}`;
      run(`git commit -m "${commitMsg}"`);
      run("git push origin main");
      console.log(`Committed and pushed: ${changed.length} candidates updated`);
    } catch (err) {
      console.error("Git error:", err.message);
      await sendTelegram(`⚠️ TheJacket enrichment git error at ${timeStr}\n${err.message}`);
      process.exit(1);
    }
  }

  // Build Telegram summary
  const lines = [
    `🧥 TheJacket enriched — ${dateStr} ${timeStr}`,
    `${changed.length} candidate(s) updated\n`,
  ];

  for (const c of changed) {
    lines.push(`📋 ${c.name}`);
    for (const diff of c.diffs) {
      lines.push(`  • ${diff}`);
    }
  }

  lines.push("\n✅ Deployed to main → Vercel rebuilding");

  const message = lines.join("\n");
  console.log("\nTelegram summary:\n" + message);
  await sendTelegram(message);

  console.log("\nEnrichment cron complete.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
