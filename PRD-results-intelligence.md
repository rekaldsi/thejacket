# PRD: TheJacket — Primary Results + Intelligence Platform
**Version:** 1.0  
**Date:** 2026-03-17  
**Status:** APPROVED — Ready for GSD execution  
**Owner:** Jerry C. / MrMagoochi  

---

## Problem Statement

The March 17, 2026 Illinois Primary is over. TheJacket.cc was built to profile candidates before the election. Now it needs to evolve into a **results hub** — showing what happened, who won, and preparing voters for November 2026.

Three gaps exist right now:
1. **No results layer** — the site still shows pre-election profiles with a countdown timer
2. **No judge results anywhere** — no major news outlet (NPR, Tribune, Block Club) is showing the 60–80 judicial race results. We can be first.
3. **No autonomous intelligence pipeline** — the platform needs to feed itself continuously through November without manual intervention

---

## Goals

1. Pivot the homepage to show primary results (winners, vote %, all races)
2. Show judicial results — something NO other site is doing
3. Build an autonomous data pipeline that pulls from Cook County Clerk + ILSBE
4. Prepare the platform for November 2026 general election intelligence
5. Ensure every race is tracked — fix gaps in original race coverage
6. Non-partisan throughout: all parties, all races, DYOR philosophy

---

## Non-Goals

- No AP Elections API (too expensive)
- No paywalled data sources
- No invented or unverified data (confirmed: true/false discipline stays)
- No breaking the mobile layout or jacket visual identity
- No Stripe integration (explicitly parked)

---

## Data Sources (Confirmed by Research Agent 2026-03-17)

| Source | What | URL | Cost |
|--------|------|-----|------|
| Cook County Clerk election night site | All Cook County results incl. judges | https://electionnight.cookcountyclerkil.gov/ | Free, scrapeable |
| ILSBE download | Statewide certified results (post-election) | https://www.elections.il.gov/electionoperations/DownloadVoteTotals.aspx | Free, .txt/.xlsx |
| Injustice Watch | Judicial coverage + context | https://injusticewatch.org | Manual research |
| Ballotpedia | Race coverage gaps | https://ballotpedia.org | Free |
| Google Civic Info API | Ballot lookup (November) | developers.google.com/civic-information | Free |

**Key finding:** NPR and Tribune use AP Elections API (expensive). Block Club does manual entry from official sources. We go direct to Cook County Clerk — same primary source, zero cost.

---

## Milestones

### M1 — Data Schema + Scraper (2–3 days)
Foundation. Nothing else works without this.

- [ ] Add `primary_result` field to all candidate JSON files (81 files)
- [ ] Add `primary_result` field to all judge JSON files (23 files)  
- [ ] Update `lib/types.ts` with PrimaryResult type
- [ ] Build `scripts/scrape-clerk-results.mjs` — hits electionnight.cookcountyclerkil.gov, parses all races, fuzzy-matches to our candidate/judge files, updates JSON
- [ ] Build `scripts/scrape-ilsbe-results.mjs` — fallback, parses ILSBE .txt download for statewide races
- [ ] Build `scripts/results-cron.mjs` — wraps scrapers, git commits changes, pushes to main (triggers Vercel auto-deploy)
- [ ] Write `data/results-manifest.json` — last_updated, source, races_scraped, candidates_updated, judges_updated, unmatched[]
- [ ] Register results cron in OpenClaw (every 30 min during election weeks, daily otherwise)

**Definition of done:** Running `node scripts/scrape-clerk-results.mjs` pulls real results, updates JSON files, manifest shows > 0 races scraped.

---

### M2 — Race Coverage Audit + Gap Fill (2 days)
We apparently missed some races. Fix it before results go live.

- [ ] Audit current `data/races.json` (44 races) against actual March 17 ballot
- [ ] Cross-reference with Cook County Clerk full race list from election night site
- [ ] Identify all missing races — add stub race + candidate files for any gaps
- [ ] Verify all judge races are covered in `data/judges/` (23 files currently)
- [ ] Add missing judges if any
- [ ] Ensure Republican, Independent, Working Class Party races are all included
- [ ] Update `data/races.json` with corrected full list

**Definition of done:** races.json matches the official Cook County Clerk ballot 1:1.

---

### M3 — Homepage Results Pivot (2–3 days)
Flip the landing page from pre-election to results.

- [ ] Replace countdown timer with results banner: "March 17 Primary Results — Last updated [timestamp]"
- [ ] Add `primary_result` display to candidate cards on race pages — winner badge (🏆), vote %, grey-out losers
- [ ] Add results state to `components/HeroSection.tsx` — post-primary mode
- [ ] Update Hot Board carousel to show results headlines ("Preckwinkle wins Board President", "Kaegi survives with 54%")
- [ ] Add "Results" tab to race filter pills on `/races` page
- [ ] Pending state: if result not yet available, show "Awaiting certification" — no fake numbers ever

**Definition of done:** Homepage shows results banner, race pages show winner/loser states with vote %.

---

### M4 — Judicial Results (3 days)
The competitive advantage. Nobody else is doing this.

- [ ] Build `components/JudicialResults.tsx`:
  - Retention races: YES % / NO % bar with 60% threshold line marked (IL retention threshold)
  - Contested races: winner/loser with vote %
  - Bar association ratings displayed alongside results
  - Group by: Appellate | Circuit | Subcircuit
- [ ] Build `/results/judges` page — dedicated judicial results view
- [ ] Add judicial results section to homepage below regular race results
- [ ] Add judicial results section to `/results` page
- [ ] SEO: meta title "2026 Illinois Primary Judge Results — TheJacket.cc"

**Definition of done:** /results/judges shows retention % for all 23 judges with bar ratings. First site in Chicago to have this.

---

### M5 — Full Results Page + Intelligence Feed (2–3 days)

- [ ] Build `/results` page:
  - All races grouped: Federal | Statewide | Cook County | Judicial
  - Winners highlighted, all candidates with vote %
  - Source attribution footer
  - Last updated timestamp
- [ ] Update news intel cron (eb6bd14a) to shift focus from candidate profiles to:
  - Winners' post-primary statements
  - Opposition research on winners heading into November
  - Red flag monitoring: do any winners have new issues emerging?
- [ ] Update enrichment cron (d59a75ea) to process November matchups as they become known
- [ ] Intelligence feed: `/intelligence` or integrate into Hot Board — "what's happening NOW with the winners"

**Definition of done:** /results is live, showing all races with results. Crons are running with November-focused prompts.

---

### M6 — November Prep Foundation (ongoing, August target)
Plant the seeds now, harvest in August.

- [ ] Tag all primary losers: `status: "lost-primary"`
- [ ] Tag all primary winners: add to `data/november-candidates.json` stub
- [ ] Stub out November matchup pages (winner D vs winner R) for key races
- [ ] Wire Google Civic Info API for address-based ballot lookup
- [ ] FEC API integration for live federal finance data
- [ ] Expand race coverage: Cook County Board of Review (D1, D2), suburban Cook races
- [ ] Activate feat/full-i18n branch (pending DeepL API key from Jerry)

**Definition of done:** Platform has a clear November mode ready to activate in August.

---

## Technical Architecture

### Data Flow
```
Cook County Clerk (electionnight.cookcountyclerkil.gov)
    → scripts/scrape-clerk-results.mjs
    → data/candidates/*.json (primary_result fields)
    → data/judges/*.json (primary_result fields)
    → data/results-manifest.json
    → git commit + push → Vercel auto-deploy
    → thejacket.cc updates live
```

### New Fields — Candidate JSON
```json
"primary_result": {
  "status": "pending | won | lost | runoff",
  "votes": null,
  "pct": null,
  "updated": null
}
```

### New Fields — Judge JSON
```json
"primary_result": {
  "status": "pending | retained | not_retained | won | lost",
  "yes_pct": null,
  "no_pct": null,
  "votes": null,
  "updated": null
}
```

### Results Cron Schedule
- Election week: every 30 minutes
- Normal weeks: once daily at 8 AM
- Registered in OpenClaw cron system

---

## Design Principles (carry forward)
- **ZERO invented data** — confirmed: true/false discipline. Pending = "Awaiting certification"
- **Nonpartisan** — all parties, all races, all results. DYOR.
- **Mobile-first** — centered layout, jacket on top. Do not restructure.
- **Static JSON** — no database. Fast, free, zero runtime cost.
- **Judge results = our edge** — nobody else is doing it. Own it.

---

## Success Metrics
- [ ] /results page live within 1 week
- [ ] Judge results page live — first in Chicago
- [ ] Results cron running autonomously (zero manual updates needed)
- [ ] All races covered (no gaps vs. official ballot)
- [ ] November foundation ready for August sprint

---

## Files & Paths (existing)
- Repo: `/Users/jerrycieslik/projects/thejacket`
- Candidates: `data/candidates/*.json` (81 files)
- Judges: `data/judges/*.json` (23 files)
- Races: `data/races.json` (44 races)
- Scoring: `lib/scoring.ts`, `lib/judgeScoring.ts`
- Types: `lib/types.ts`
- Scripts: `scripts/enrichment-cron.mjs`, `scripts/news-intel-cron.mjs`
- Live: https://thejacket.cc | GitHub: rekaldsi/thejacket

## New Files to Create
- `data/results-manifest.json`
- `scripts/scrape-clerk-results.mjs`
- `scripts/scrape-ilsbe-results.mjs`
- `scripts/results-cron.mjs`
- `components/JudicialResults.tsx`
- `app/results/page.tsx`
- `app/results/judges/page.tsx`
