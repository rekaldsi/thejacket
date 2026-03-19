import { existsSync, readFileSync } from "fs";
import path from "path";
import { SITE_MODE } from "@/lib/siteMode";
import IntelGridClient from "./IntelGridClient";

// ─── Results timestamp from manifest ─────────────────────────────────────────

function getResultsTimestamp(): string | null {
  try {
    const p = path.join(process.cwd(), "data", "results-manifest.json");
    if (!existsSync(p)) return null;
    const manifest = JSON.parse(readFileSync(p, "utf-8")) as { last_updated?: string };
    if (!manifest.last_updated) return null;
    // Return the raw ISO timestamp; client will localize it
    return manifest.last_updated;
  } catch {
    return null;
  }
}

// ─── Server wrapper — reads file system, passes to client ────────────────────

export default function IntelGrid() {
  const resultsTimestamp = getResultsTimestamp();
  return <IntelGridClient mode={SITE_MODE} resultsTimestamp={resultsTimestamp} />;
}
