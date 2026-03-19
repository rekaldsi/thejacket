# TheJacket — GSD2 Phase 1: Data Cleanup + Infrastructure Foundations

## Context
Read PRD-NOVEMBER-2026.md before doing anything. TheJacket (thejacket.cc) is a Cook County civic transparency platform. Phase 0 (SITE_MODE landing overhaul) just merged to main. You are on the `main` branch — create `feat/phase1-data-cleanup` before touching anything.

## Branch
`feat/phase1-data-cleanup` — create first. Never touch main.

---

## Task 1.1 — Data Cleanup (fix the known bad data)

### 1.1a — Remove lashawn-ford.json data error
`data/candidates/lashawn-ford.json` is a duplicate/incorrect file. La Shawn Ford's real file is `la-shawn-k-ford.json` (already correct, already marked `won`). The `lashawn-ford.json` file is incorrectly assigned to IL-08 and is a data error.
- Delete `data/candidates/lashawn-ford.json`
- Verify `la-shawn-k-ford.json` exists and is correct

### 1.1b — Fix pending write-in races
`data/candidates/max-rice.json` and `data/candidates/max-solomon.json` — both are write-in candidates for IL Treasurer Republican primary. Cook County Clerk shows "No Candidate". Update both files:
- Set `status: "pending"` → `status: "write-in-no-result"` (or add a new status value)
- Add `notes: "Write-in only candidate. Cook County Clerk shows No Candidate for Treasurer R primary. Race may have produced no major-party nominee."` 
- If those files don't exist, skip this task and note it

### 1.1c — Create missing candidate files: Tara Stamps + Stanley Moore
These two candidates won their races but have no JSON files:

Create `data/candidates/tara-stamps.json`:
```json
{
  "id": "tara-stamps",
  "name": "Tara Stamps",
  "party": "Democratic",
  "race_id": "cook-county-commissioner-d1-democratic-primary",
  "office": "Cook County Commissioner District 1",
  "status": "won",
  "result": "won",
  "vote_pct": 100,
  "uncontested": true,
  "bio": "",
  "photo_url": null,
  "finance": { "total_raised": null, "total_spent": null, "cash_on_hand": null, "sources": [] },
  "red_flags": [],
  "endorsements": [],
  "policy": {},
  "news_hits": [],
  "data_status": "stub",
  "last_updated": "2026-03-19"
}
```

Create `data/candidates/stanley-moore.json`:
```json
{
  "id": "stanley-moore",
  "name": "Stanley Moore",
  "party": "Democratic",
  "race_id": "cook-county-commissioner-d4-democratic-primary",
  "office": "Cook County Commissioner District 4",
  "status": "won",
  "result": "won",
  "vote_pct": 100,
  "uncontested": true,
  "bio": "",
  "photo_url": null,
  "finance": { "total_raised": null, "total_spent": null, "cash_on_hand": null, "sources": [] },
  "red_flags": [],
  "endorsements": [],
  "policy": {},
  "news_hits": [],
  "data_status": "stub",
  "last_updated": "2026-03-19"
}
```

### 1.1d — Fix Karen Yarbrough reference
Search the entire codebase for "Yarbrough" — Karen Yarbrough (Cook County Clerk) died in March 2024. If found anywhere in candidate files, docs, or comments, replace with "Monica Gordon (Cook County Clerk, running for re-election 2026)". Run:
```bash
grep -r "Yarbrough" . --include="*.json" --include="*.ts" --include="*.tsx" --include="*.md" -l
```

### 1.1e — Update results-manifest.json timestamp
Check if `data/results-manifest.json` exists. If it does, verify the `last_updated` field is accurate. If the file doesn't exist, create it:
```json
{
  "last_updated": "2026-03-19T00:00:00.000Z",
  "total_candidates": 91,
  "won": 41,
  "lost": 47,
  "pending": 2,
  "notes": "March 17, 2026 Cook County Primary results"
}
```

---

## Task 1.2 — vercel.json: Election Week Warning + Performance Config

Create or update `vercel.json` in the repo root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/candidate/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, stale-while-revalidate=86400"
        }
      ]
    },
    {
      "source": "/race/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, stale-while-revalidate=86400"
        }
      ]
    }
  ]
}
```

Also add a `ELECTION_WEEK_CHECKLIST.md` to the repo root:
```markdown
# Election Week Infrastructure Checklist
**Complete before October 1, 2026**

- [ ] Upgrade Vercel to Pro ($20/mo) — Hobby = 100GB/month bandwidth cap, will fail under election traffic
- [ ] Add Cloudflare free tier CDN in front of Vercel (DNS → Cloudflare → Vercel)
- [ ] Enable Vercel Edge Caching on all static routes
- [ ] Test /my-ballot with 20+ real Cook County addresses before launch
- [ ] Verify Cicero API credits are funded (5K credits = ~5K lookups, cache aggressively)
- [ ] Run full data audit on all candidates, races, and ballot measures
- [ ] Test git push → Vercel deploy time (target: < 5 min from push to live)
- [ ] Set up Vercel deployment notifications to Jerry's Telegram
- [ ] Confirm results-manifest.json auto-updates on November results night
```

---

## Task 1.3 — Methodology Page

Create `app/methodology/page.tsx` — a static page explaining TheJacket's editorial standards. This is critical for credibility when press picks up the platform.

Content to include:
- **How scoring works** — explain the A-F grade system, what factors go in
- **What "confirmed: true" vs "confirmed: false" means** — allegation vs. verified fact
- **Data sources** — ILSBE, FEC, Illinois Sunshine, Injustice Watch, Alliance of Bar Associations, CBA
- **Data freshness** — when data was last updated, how often it's refreshed
- **Judicial ratings** — explain bar association rating scale (Highly Recommended / Recommended / Not Recommended / Not Rated)
- **What TheJacket does NOT do** — no endorsements, no editorial positions, no advocacy
- **How to submit a correction** — email address or form (use a placeholder: corrections@thejacket.cc)
- **About the platform** — nonpartisan, independently operated, Cook County focused

Match the existing design language: dark background, jacket-amber accents, font-mono headings, uppercase tracking. Look at `app/about/page.tsx` for styling reference.

Add "Methodology" to the site nav — find the nav component and add it after "About".

---

## Task 1.4 — Schedule the May 3 Judicial Retention Cron (OpenClaw CLI)

The PRD identified that May 3 is the **judicial retention candidate filing deadline** (not the general election filing deadline — that's June-August). On May 3, we want to fire a monitoring task.

Create a shell script `scripts/may3-judicial-sweep.sh`:
```bash
#!/bin/bash
# May 3, 2026 — Judicial Retention Filing Deadline Sweep
# Fires on May 3 morning. Checks ISBA for updated judicial retention candidate list.
# Sends summary to Jerry via OpenClaw.

echo "=== May 3 Judicial Retention Sweep ===" 
echo "Date: $(date)"
echo ""
echo "ACTION REQUIRED:"
echo "1. Visit https://www.isba.org/judicial-elections for updated bar ratings"
echo "2. Visit https://elections.il.gov for certified judicial retention candidates"
echo "3. Check chicagobar.org for Alliance of Bar Associations evaluations"
echo "4. Update data/judges/*.json files with retention candidates"
echo "5. Create new judge files for any new November retention candidates"
echo ""
echo "Cook County judicial retention deadline: May 3, 2026"
echo "November ballot judicial candidates will be certified by Illinois SBE shortly after."

openclaw system event --text "⚖️ TheJacket: May 3 judicial retention filing deadline today. Time to check ISBA + CBA for new judicial ratings and update judge profiles for November. Visit https://isba.org/judicial-elections and https://elections.il.gov" --mode now
```

Make it executable: `chmod +x scripts/may3-judicial-sweep.sh`

Then schedule it via OpenClaw cron. Run this command:
```bash
openclaw cron add --schedule "2026-05-03T13:00:00Z" --payload "bash /Users/jerrycieslik/projects/thejacket/scripts/may3-judicial-sweep.sh" --name "thejacket-may3-judicial-sweep" --once
```

If the `openclaw cron add` command syntax is different on this machine, just output the cron details to a file `/tmp/may3-cron-spec.json` and note that it needs to be scheduled manually.

---

## Task 1.5 — LegiScan API Integration Foundation

Create the scaffolding for the bills tracker data pipeline.

Create `scripts/legiscan-sync.mjs`:
```javascript
#!/usr/bin/env node
/**
 * LegiScan IL Bill Sync
 * Fetches active Illinois bills from LegiScan API and outputs summary.
 * 
 * Setup: Get free API key at legiscan.com → set LEGISCAN_API_KEY in .env.local
 * Free tier: 30,000 queries/month
 * 
 * Run: node scripts/legiscan-sync.mjs
 */

import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!existsSync(envPath)) {
    console.warn('⚠️  No .env.local found. Create one with LEGISCAN_API_KEY=your_key')
    return {}
  }
  const env = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const [key, ...vals] = line.split('=')
    if (key && !key.startsWith('#')) env[key.trim()] = vals.join('=').trim()
  }
  return env
}

const env = loadEnv()
const API_KEY = env.LEGISCAN_API_KEY

if (!API_KEY) {
  console.error('❌ LEGISCAN_API_KEY not set in .env.local')
  console.error('   Get a free key at: https://legiscan.com/user/register')
  process.exit(1)
}

const BASE_URL = 'https://api.legiscan.com/'

async function legiscan(op, params = {}) {
  const url = new URL(BASE_URL)
  url.searchParams.set('key', API_KEY)
  url.searchParams.set('op', op)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`LegiScan HTTP ${res.status}`)
  const data = await res.json()
  if (data.status !== 'OK') throw new Error(`LegiScan error: ${JSON.stringify(data)}`)
  return data
}

async function main() {
  console.log('🔍 TheJacket — LegiScan IL Bill Sync')
  console.log('=====================================\n')

  // Step 1: Get Illinois session list
  console.log('📋 Fetching IL session list...')
  const sessions = await legiscan('getSessionList', { state: 'IL' })
  const currentSession = sessions.sessions.find(s => s.year_end >= 2026 && s.special === 0)
  
  if (!currentSession) {
    console.error('❌ Could not find current IL session')
    process.exit(1)
  }
  
  console.log(`✅ Current session: ${currentSession.session_name} (ID: ${currentSession.session_id})`)
  console.log(`   Bills in session: ~${currentSession.prior_session || 'unknown'}`)
  
  // Step 2: Get master bill list (summary only, 1 query)
  console.log('\n📦 Fetching master bill list (1 query)...')
  const masterList = await legiscan('getMasterList', { session_id: currentSession.session_id })
  
  const bills = Object.values(masterList.masterlist).filter(b => b.bill_id)
  console.log(`✅ ${bills.length} bills in session`)
  
  // Step 3: Show sample
  console.log('\n📊 Sample active bills (first 10):')
  bills.slice(0, 10).forEach(b => {
    console.log(`  ${b.bill_number.padEnd(8)} | ${b.title?.substring(0, 60) || 'No title'}`)
  })
  
  console.log('\n✅ LegiScan connection verified.')
  console.log('   Next steps:')
  console.log('   1. Run node scripts/legiscan-sync.mjs to verify your API key works')  
  console.log('   2. Add LEGISCAN_API_KEY to Vercel env vars when ready to deploy bills feature')
  console.log('   3. Build /app/bills/page.tsx for the bills tracker UI (Phase 2)')
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
```

Also create `scripts/legistar-test.mjs`:
```javascript
#!/usr/bin/env node
/**
 * Legistar API Test — Chicago City Council + Cook County Board
 * No API key required. Free, unauthenticated.
 * 
 * Run: node scripts/legistar-test.mjs
 */

async function testLegistar(client, label) {
  console.log(`\n🏛️  Testing Legistar: ${label} (${client})`)
  
  try {
    // Get recent active matters
    const url = `https://webapi.legistar.com/v1/${client}/Matters?$top=5&$filter=MatterStatusName eq 'Active'&$orderby=MatterLastModifiedUtc desc`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    
    console.log(`✅ Connected. Recent active matters:`)
    data.slice(0, 3).forEach(m => {
      console.log(`   ${m.MatterFile?.padEnd(12) || '?'.padEnd(12)} | ${m.MatterTitle?.substring(0, 55) || 'No title'}`)
    })
  } catch (err) {
    console.error(`❌ ${label} failed:`, err.message)
  }
}

async function main() {
  console.log('🔍 TheJacket — Legistar API Test')
  console.log('===================================')
  console.log('No API key required — testing live connections...')
  
  await testLegistar('chicago', 'Chicago City Council')
  await testLegistar('cook-county', 'Cook County Board')
  
  console.log('\n✅ Legistar APIs verified. Both are free and unauthenticated.')
  console.log('   Ready to build bills pipeline in Phase 2.')
}

main().catch(console.error)
```

---

## Task 1.6 — Add placeholder routes for November features

Create stub pages so the nav can link to them without 404s:

**`app/bills/page.tsx`** — Coming soon placeholder:
```tsx
import Link from 'next/link'

export const metadata = { title: 'Bills & Legislation — TheJacket' }

export default function BillsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
        Coming November 2026
      </p>
      <h1 className="mb-4 text-4xl font-black uppercase tracking-tight">Bills &amp; Legislation</h1>
      <p className="mb-8 max-w-lg text-zinc-400">
        Track Illinois state bills, Chicago City Council ordinances, and Cook County Board resolutions — 
        with plain-English summaries, impact tags, and alerts when bills move.
      </p>
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest text-jacket-amber hover:underline"
      >
        ← Back to Home
      </Link>
    </div>
  )
}
```

**`app/my-ballot/page.tsx`** — Coming soon placeholder:
```tsx
import Link from 'next/link'

export const metadata = { title: 'My Ballot — TheJacket' }

export default function MyBallotPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
        Coming November 2026
      </p>
      <h1 className="mb-4 text-4xl font-black uppercase tracking-tight">My Ballot</h1>
      <p className="mb-8 max-w-lg text-zinc-400">
        Enter your Chicago address to see every candidate and ballot measure on your specific November 3 ballot — 
        with full intelligence on every race.
      </p>
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest text-jacket-amber hover:underline"
      >
        ← Back to Home
      </Link>
    </div>
  )
}
```

---

## Success Criteria
- [ ] `data/candidates/lashawn-ford.json` deleted
- [ ] `data/candidates/tara-stamps.json` created
- [ ] `data/candidates/stanley-moore.json` created
- [ ] No "Yarbrough" references in codebase
- [ ] `vercel.json` created with cache headers
- [ ] `ELECTION_WEEK_CHECKLIST.md` created
- [ ] `app/methodology/page.tsx` created and linked in nav
- [ ] `scripts/may3-judicial-sweep.sh` created and executable
- [ ] `/tmp/may3-cron-spec.json` written (or cron scheduled if CLI supports it)
- [ ] `scripts/legiscan-sync.mjs` created
- [ ] `scripts/legistar-test.mjs` created
- [ ] `app/bills/page.tsx` stub created
- [ ] `app/my-ballot/page.tsx` stub created
- [ ] `npm run build` passes clean

## When Done
1. Commit everything to `feat/phase1-data-cleanup`
2. Write summary to `/tmp/gsd-phase1-result.md`
3. Run: `openclaw system event --text "GSD Phase 1 complete: data cleanup + vercel config + methodology page + LegiScan scaffolding + stub routes. feat/phase1-data-cleanup ready for review." --mode now`
