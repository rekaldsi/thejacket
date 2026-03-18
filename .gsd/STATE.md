# TheJacket — GSD State
**PRD:** PRD-results-intelligence.md  
**Initialized:** 2026-03-17  
**Owner:** Jerry C. / MrMagoochi  

---

## Active Work
**Branch:** `main`  
**Slice:** M1 COMPLETE — all scrapers + schema live  
**Status:** ✅ DONE — merged to main, Vercel deploying

---

## Milestone / Slice Breakdown

### M1 — Data Schema + Scraper
> Foundation. Nothing else works without this.

| Slice | Description | Status | Branch |
|-------|-------------|--------|--------|
| S01 | Add `primary_result` to all candidate JSON (91 files), judge JSON (23 files), update `lib/types.ts` with `CandidatePrimaryResult` + `JudgePrimaryResult` types | ✅ DONE | `gsd/M1/S01-schema` |
| S02 | Build `scripts/scrape-clerk-results.mjs` — scrape electionnight.cookcountyclerkil.gov, fuzzy-match to candidate/judge files, update JSON | ✅ DONE | `gsd/M1/S02-clerk-scraper` |
| S03 | Build `scripts/scrape-ilsbe-results.mjs` — fallback ILSBE .txt parser for statewide races | ✅ DONE | `gsd/M1/S03-ilsbe-scraper` |
| S04 | Build `scripts/results-cron.mjs` — wraps scrapers, git commits, pushes to trigger Vercel auto-deploy | ✅ DONE | `gsd/M1/S04-results-cron` |
| S05 | Write `data/results-manifest.json` — last_updated, source, races_scraped, candidates_updated, judges_updated, unmatched[] | ✅ DONE | `main` |
| S06 | Merge M1 to main | ✅ DONE | `main` |

**M1 Done When:** `node scripts/scrape-clerk-results.mjs` pulls real results, updates JSON, manifest shows >0 races scraped.

---

### M2 — Race Coverage Audit + Gap Fill
> We apparently missed some races. Fix before results go live.

| Slice | Description | Status | Branch |
|-------|-------------|--------|--------|
| S01 | Audit `data/races.json` (44 races) against official March 17 Cook County ballot | 🔲 TODO | — |
| S02 | Cross-reference Cook County Clerk election night site full race list | 🔲 TODO | — |
| S03 | Add stub race + candidate files for any gaps found | 🔲 TODO | — |
| S04 | Verify all 23 judge races covered in `data/judges/` — add missing if any | 🔲 TODO | — |
| S05 | Ensure Republican, Independent, Working Class Party races all included | 🔲 TODO | — |
| S06 | Update `data/races.json` with corrected full list | 🔲 TODO | — |

**M2 Done When:** `data/races.json` matches official Cook County Clerk ballot 1:1.

---

### M3 — Homepage Results Pivot
> Flip the landing page from pre-election to results.

| Slice | Description | Status | Branch |
|-------|-------------|--------|--------|
| S01 | Replace countdown timer with results banner ("March 17 Primary Results — Last updated [timestamp]") | 🔲 TODO | — |
| S02 | Add `primary_result` display to candidate cards — winner badge 🏆, vote %, grey-out losers | 🔲 TODO | — |
| S03 | Update `components/HeroSection.tsx` — post-primary mode | 🔲 TODO | — |
| S04 | Update Hot Board carousel to show results headlines | 🔲 TODO | — |
| S05 | Add "Results" tab to race filter pills on `/races` page | 🔲 TODO | — |
| S06 | Pending state: show "Awaiting certification" when result not yet available | 🔲 TODO | — |

**M3 Done When:** Homepage shows results banner; race pages show winner/loser states with vote %.

---

### M4 — Judicial Results
> The competitive advantage. Nobody else is doing this.

| Slice | Description | Status | Branch |
|-------|-------------|--------|--------|
| S01 | Build `components/JudicialResults.tsx` — retention YES%/NO% bar with 60% threshold line, contested winner/loser, bar ratings alongside | 🔲 TODO | — |
| S02 | Build `/results/judges` page — dedicated judicial results view grouped by Appellate / Circuit / Subcircuit | 🔲 TODO | — |
| S03 | Add judicial results section to homepage below regular race results | 🔲 TODO | — |
| S04 | Add judicial results section to `/results` page | 🔲 TODO | — |
| S05 | SEO: meta title "2026 Illinois Primary Judge Results — TheJacket.cc" | 🔲 TODO | — |

**M4 Done When:** `/results/judges` shows retention % for all 23 judges with bar ratings. First site in Chicago.

---

### M5 — Full Results Page + Intelligence Feed
> All races, all results, intelligence pivot.

| Slice | Description | Status | Branch |
|-------|-------------|--------|--------|
| S01 | Build `/results` page — all races grouped (Federal / Statewide / Cook County / Judicial), winners highlighted, source attribution, last-updated timestamp | 🔲 TODO | — |
| S02 | Update news intel cron (eb6bd14a) — shift focus to winners' post-primary statements, opposition research, red flag monitoring | 🔲 TODO | — |
| S03 | Update enrichment cron (d59a75ea) — process November matchups as they become known | 🔲 TODO | — |
| S04 | Intelligence feed — `/intelligence` or Hot Board integration: "what's happening NOW with the winners" | 🔲 TODO | — |

**M5 Done When:** `/results` live with all races + results. Crons running with November-focused prompts.

---

### M6 — November Prep Foundation
> Plant seeds now, harvest August.

| Slice | Description | Status | Branch |
|-------|-------------|--------|--------|
| S01 | Tag all primary losers: `status: "lost-primary"` | 🔲 TODO | — |
| S02 | Tag all primary winners: add to `data/november-candidates.json` stub | 🔲 TODO | — |
| S03 | Stub out November matchup pages (winner D vs winner R) for key races | 🔲 TODO | — |
| S04 | Wire Google Civic Info API for address-based ballot lookup | 🔲 TODO | — |
| S05 | FEC API integration for live federal finance data | 🔲 TODO | — |
| S06 | Expand race coverage: Cook County Board of Review (D1, D2), suburban Cook races | 🔲 TODO | — |
| S07 | Activate `feat/full-i18n` branch (pending DeepL API key from Jerry) | 🔲 TODO | — |

**M6 Done When:** Platform has clear November mode ready to activate in August.

---

## Completed Slices Log

| Date | Milestone | Slice | Summary |
|------|-----------|-------|---------|
| 2026-03-17 | M1 | S01 | Added `primary_result` to all 91 candidate JSON files + all 23 judge JSON files. Updated `lib/types.ts` with `CandidatePrimaryResult` and `JudgePrimaryResult` types. Committed to `gsd/M1/S01-schema`. |

---

## Key Paths
- Candidates: `data/candidates/*.json` (91 files)
- Judges: `data/judges/*.json` (23 files)
- Races: `data/races.json`
- Types: `lib/types.ts`
- Scripts: `scripts/`
- New scripts needed: `scripts/scrape-clerk-results.mjs`, `scripts/scrape-ilsbe-results.mjs`, `scripts/results-cron.mjs`
- New data: `data/results-manifest.json`
- New components: `components/JudicialResults.tsx`
- New pages: `app/results/page.tsx`, `app/results/judges/page.tsx`

## Data Sources
- Cook County Clerk: https://electionnight.cookcountyclerkil.gov/
- ILSBE: https://www.elections.il.gov/electionoperations/DownloadVoteTotals.aspx
- Live site: https://thejacket.cc
- Repo: rekaldsi/thejacket
