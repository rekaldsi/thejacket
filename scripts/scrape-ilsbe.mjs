#!/usr/bin/env node
/**
 * scrape-ilsbe.mjs
 * Firecrawl-powered Illinois Sunshine scraper for TheJacket
 * Fetches top-25 donors, cash on hand, committee officers for every candidate
 * with a known ILSBE committee ID. Updates candidate JSON files in place.
 *
 * Usage:
 *   node scripts/scrape-ilsbe.mjs              # all candidates with ilsbe_id
 *   node scripts/scrape-ilsbe.mjs thomas-dart  # single candidate by id
 *   node scripts/scrape-ilsbe.mjs --dry-run    # parse only, don't write
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES_DIR = path.join(__dirname, '../data/candidates');
const FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const TARGET = process.argv.find(a => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]);

if (!FIRECRAWL_KEY) {
  console.error('❌ FIRECRAWL_API_KEY not set');
  process.exit(1);
}

// ── Categorize a donor name ────────────────────────────────────────────────
function categorizeDonor(name) {
  const n = name.toLowerCase();
  if (n.includes('seiu') || n.includes('ibew') || n.includes('teamster') || 
      n.includes('ufcw') || n.includes('afscme') || n.includes('union') ||
      n.includes('laborers') || n.includes('carpenters') || n.includes('plumbers') ||
      n.includes('operating engineers') || n.includes('iuoe') || n.includes(' ua ') ||
      n.includes('federation of labor') || n.includes('ctu') || n.includes('teachers') ||
      n.includes('nurses') || n.includes('firefighters') || n.includes('police') ||
      n.includes('ift ') || n.includes('iea ') || n.includes('afl-cio')) {
    return 'labor';
  }
  if (n.includes('pac') || n.includes('political action') || n.includes('political education') ||
      n.includes('political fund') || n.includes('committee for') || n.includes('citizens for') ||
      n.includes('friends of') || n.includes('for illinois') || n.includes('for congress') ||
      n.includes('actblue') || n.includes('winred')) {
    return 'pac';
  }
  if (n.includes('aipac') || n.includes('american israel')) return 'aipac';
  if (n.includes('llc') || n.includes('inc') || n.includes('corp') || n.includes('co.') ||
      n.includes('company') || n.includes('associates') || n.includes('partners') ||
      n.includes('group') || n.includes('enterprises') || n.includes('holdings') ||
      n.includes('services') || n.includes('solutions') || n.includes('consulting') ||
      n.includes('law firm') || n.includes('llp') || n.includes('pc') || n.includes('pllc')) {
    return 'Corporate';
  }
  return 'individual';
}

// ── Parse Firecrawl HTML output for donor table ────────────────────────────
function parseCommitteePage(html, markdown, url) {
  const result = {
    cash_on_hand: null,
    total_raised: null,
    donors: [],
    officers: [],
  };

  // Cash on Hand — from markdown (reliably rendered)
  const cohMatch = markdown.match(/\*\*Cash on Hand[^*]*\*\*[^$]*\$([\d,]+\.?\d*)/i);
  if (cohMatch) result.cash_on_hand = parseFloat(cohMatch[1].replace(/,/g, ''));

  // Funds available
  const fundsMatch = markdown.match(/Funds available[^\$]*\$([\d,]+\.?\d*)/i);
  if (fundsMatch) result.total_raised = parseFloat(fundsMatch[1].replace(/,/g, ''));

  // ── Parse donor table from HTML (the JS-rendered table is present in HTML) ──
  // Pattern: <td><a href="...">NAME</a></td><td class="nowrap">$AMOUNT</td>
  const donorRowRegex = /<tr>\s*<td>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/td>\s*<td[^>]*>\s*(\$[\d,]+\.?\d*)\s*<\/td>/gi;
  const matches = [...html.matchAll(donorRowRegex)];

  for (const m of matches) {
    // Clean up name: strip HTML tags, normalize whitespace
    let name = m[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const amountStr = m[2];
    const amountMatch = amountStr.match(/\$([\d,]+\.?\d*)/);

    if (name && amountMatch && name.length > 1) {
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      if (amount > 0) {
        result.donors.push({
          name,
          amount,
          category: categorizeDonor(name),
          source: url,
          confirmed: true,
        });
      }
    }
  }

  // Officers — from HTML
  const officerRegex = /<td>([A-Z][^<]{3,50})<\/td>\s*<td>(Chair|Treasurer|Secretary|Officer|President|Director)[^<]*<\/td>/gi;
  const officerMatches = [...html.matchAll(officerRegex)];
  for (const m of officerMatches) {
    result.officers.push({ name: m[1].trim(), title: m[2].trim() });
  }

  return result;
}

// ── Firecrawl fetch ────────────────────────────────────────────────────────
async function fetchCommitteePage(committeeId) {
  const url = `https://illinoissunshine.org/committees/${committeeId}/`;
  console.log(`  🔍 Fetching ILSBE committee ${committeeId}...`);

  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      waitFor: 3000,
    }),
  });

  if (!res.ok) {
    throw new Error(`Firecrawl HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(`Firecrawl error: ${data.error || 'unknown'}`);
  }

  return { markdown: data.data.markdown, html: data.data.html || '', url };
}

// ── Search for committee ID by candidate name ──────────────────────────────
async function searchCommitteeId(candidateName) {
  const searchUrl = `https://illinoissunshine.org/search/?term=${encodeURIComponent(candidateName)}`;
  console.log(`  🔎 Searching ILSBE for "${candidateName}"...`);

  const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FIRECRAWL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: searchUrl,
      formats: ['markdown'],
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      waitFor: 2000,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data.success) return null;

  const markdown = data.data.markdown;
  // Look for committee links: /committees/12345/
  const match = markdown.match(/\/committees\/(\d+)\//);
  return match ? match[1] : null;
}

// ── Process a single candidate file ───────────────────────────────────────
async function processCandidate(filePath) {
  const candidate = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const name = candidate.name;
  let ilsbeId = candidate.jacket?.ilsbe_id;

  console.log(`\n📋 ${name} (${candidate.office})`);

  // If no ILSBE ID, try to find it by searching
  if (!ilsbeId) {
    ilsbeId = await searchCommitteeId(name);
    if (!ilsbeId) {
      console.log(`  ⚠️  No ILSBE committee found — skipping`);
      return false;
    }
    console.log(`  ✅ Found ILSBE committee ID: ${ilsbeId}`);
  }

  // Fetch the committee page
  let parsed;
  try {
    const { markdown, html, url } = await fetchCommitteePage(ilsbeId);
    parsed = parseCommitteePage(html, markdown, url);
  } catch (err) {
    console.log(`  ❌ Fetch failed: ${err.message}`);
    return false;
  }

  console.log(`  💰 Cash on hand: $${parsed.cash_on_hand?.toLocaleString() ?? 'n/a'}`);
  console.log(`  👥 Donors found: ${parsed.donors.length}`);

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would write ${parsed.donors.length} donors`);
    return true;
  }

  // Merge into candidate JSON — preserve existing confirmed donors, add new ones
  const existingDonorNames = new Set(
    (candidate.jacket?.donors ?? []).map(d => d.name.toLowerCase())
  );

  const newDonors = parsed.donors.filter(d => !existingDonorNames.has(d.name.toLowerCase()));
  const allDonors = [...(candidate.jacket?.donors ?? []), ...newDonors]
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

  // Update jacket
  candidate.jacket = {
    ...candidate.jacket,
    ilsbe_id: ilsbeId,
    cash_on_hand: parsed.cash_on_hand ?? candidate.jacket?.cash_on_hand,
    total_raised: parsed.total_raised ?? candidate.jacket?.total_raised,
    data_date: new Date().toISOString().split('T')[0],
    source: `https://illinoissunshine.org/committees/${ilsbeId}/`,
    note: `ILSBE committee #${ilsbeId}. Top-25 donors scraped via Firecrawl ${new Date().toISOString().split('T')[0]}.`,
    donors: allDonors,
  };

  // Update data_status
  if (candidate.data_status === 'stub' || !candidate.data_status) {
    candidate.data_status = allDonors.length > 0 ? 'partial' : 'limited';
  }

  fs.writeFileSync(filePath, JSON.stringify(candidate, null, 2));
  console.log(`  ✅ Written: ${allDonors.length} donors, $${parsed.cash_on_hand?.toLocaleString() ?? '?'} CoH`);
  return true;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const files = fs.readdirSync(CANDIDATES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(CANDIDATES_DIR, f));

  // Filter to target if specified
  const targets = TARGET
    ? files.filter(f => path.basename(f, '.json') === TARGET)
    : files.filter(f => {
        const c = JSON.parse(fs.readFileSync(f, 'utf-8'));
        // Process if: has ilsbe_id, OR has no donors yet (we'll search for the ID)
        return c.jacket?.ilsbe_id || (!c.jacket?.donors?.length && c.party !== 'Republican');
      });

  if (targets.length === 0) {
    console.log('No matching candidates found.');
    process.exit(0);
  }

  console.log(`\n🗳  TheJacket ILSBE Scraper`);
  console.log(`📦 Processing ${targets.length} candidates${DRY_RUN ? ' (DRY RUN)' : ''}...\n`);

  let success = 0, skipped = 0, failed = 0;

  for (const filePath of targets) {
    try {
      const ok = await processCandidate(filePath);
      if (ok) success++; else skipped++;
    } catch (err) {
      console.log(`  💥 Error: ${err.message}`);
      failed++;
    }
    // Rate limit: ~2 seconds between requests to be polite
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n✅ Done: ${success} updated, ${skipped} skipped, ${failed} failed`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
