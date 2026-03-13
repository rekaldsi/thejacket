# TheJacket — Product Requirements Document
**Domain:** thejacket.cc
**Tagline:** *"See who they really work for."*
**Status:** PRD v1.0 — 2026-03-13
**Primary launch target:** March 17, 2026 (Illinois Primary Day)
**General election expansion:** November 3, 2026

---

## 1. The Vision

Robin Williams once said politicians should wear a jacket with every company and organization that funds them — so voters can see who they really work for. **TheJacket is that jacket.**

A radical civic transparency platform for Cook County voters. Every candidate. Every office. Every donor. Every red flag. No spin. No party line. Just the record.

---

## 2. Problem Statement

Cook County voters going into the March 17, 2026 primary face:
- 21+ race categories (federal, state, county, judicial, MWRD)
- Hundreds of candidates across those races
- Donor data scattered across FEC, ILSBE, and dead APIs
- No single place that shows the funding picture alongside the voting record alongside the ethics record
- Judicial races that are functionally opaque (bar association ratings buried, candidate bios nonexistent)

Voters deserve one place. TheJacket is that place.

---

## 3. Scope

### Phase 1 — Primary Launch (by March 17, 2026)
- Cook County only
- March 17, 2026 primary candidates
- Key races prioritized: US Senate, US House (open seats), Governor, Cook County Board President, Assessor, State legislative seats with contested primaries
- Static data (JSON files, no live DB required to launch)
- The Jacket feature (donor treemap) for all candidates with FEC/ILSBE data available
- Red flag system (AIPAC, dark money, ethics violations, criminal record)
- Mobile-first, shareable per-candidate pages with OG image previews

### Phase 2 — General Election (by November 3, 2026)
- Full Cook County general election ballot
- Live data refresh via scheduled ETL (ILSBE + FEC)
- Expanded candidate profiles
- Voting record integration (VoteSmart API)
- Expanded judicial section with bar ratings

### Out of Scope (Phase 1)
- Collar counties (DuPage, Lake, Will, Kane, McHenry)
- Real-time donation tracking
- User accounts / saved candidates
- Mobile app

---

## 4. Key Features

### 4.1 The Jacket (Donor Visualization) — HERO FEATURE
The centerpiece. Every candidate profile shows a visual "jacket" — their funding sources displayed as a NASCAR-style sponsor grid.

**UI layers:**
1. **Treemap / Sponsor Patch Grid** — blocks sized by dollar amount, colored by industry category. Real estate = one color. Pharma = another. Defense = another. AIPAC = flagged red.
2. **Horizontal bar chart** — total by industry category
3. **Sortable top donors table** — name, amount, type (individual/PAC/dark money)
4. **"Tainted money" flags** — AIPAC, fossil fuel PACs, dark money orgs, any Epstein-connected entities (ICIJ lookup)

**Viral mechanic:** Each candidate's jacket generates a unique OG image (next/og) showing their treemap. When someone shares "look at [Candidate]'s jacket," the link preview IS the funding breakdown.

### 4.2 Candidate Profile Page
Per candidate:
- Photo, name, party, office sought
- **The Jacket** (donor visualization, above)
- **The Record** — prior offices held, key votes, controversies
- **Red Flags** — criminal record, ethics violations, nefarious org connections
- **Endorsements** — who backs them and what that signals
- **Key Positions** — where they stand on major issues
- **Bar Association Rating** (judicial candidates only)

### 4.3 Race Pages
Per office/race:
- What the office does (plain English, 2 sentences)
- All candidates running, sortable by party
- Side-by-side jacket comparison (top donors, biggest red flags)
- Filter: "Show me candidates with no corporate PAC money"

### 4.4 Home / Ballot Explorer
- "Find my ballot" — enter address → Google Civic API → show only the races on your specific ballot
- Race browser — browse all 21 race categories
- Red Flag feed — most flagged candidates surfaced prominently
- Search by candidate name

### 4.5 Red Flag System
Automated + manually curated flags:
- 🚩 **AIPAC** — received AIPAC PAC money or AIPAC-aligned bundler money
- 🚩 **Dark Money** — donations from 501(c)(4) orgs with undisclosed donors
- 🚩 **Epstein-Connected** — name match against ICIJ Offshore Leaks + Epstein document sets
- 🚩 **Ethics Violation** — official ethics board finding, censure, or indictment
- 🚩 **Criminal Record** — any conviction (traffic excluded)
- 🚩 **Corporate PAC** — receives money from corporate PACs (not inherently disqualifying but visible)
- 🟡 **Tainted Company** — works for or received money from companies with documented misconduct

---

## 5. Data Architecture

### Phase 1: Static JSON (ETL → commit → Vercel rebuild)
No live database needed for launch. All data lives in `/data/*.json` files committed to the repo.

```
/data
  /elections/march-2026-primary.json     # All races + metadata
  /candidates/[candidate-slug].json      # Per-candidate data
  /donors/[candidate-slug]-donors.json   # Donor breakdown
  /flags/red-flags.json                  # Aggregated flag data
```

**ETL scripts** (run manually, commit output):
- `scripts/fetch-fec.mjs` — pulls federal candidate finance from FEC API
- `scripts/fetch-ilsbe.mjs` — pulls state/county candidate finance from ILSBE bulk download
- `scripts/fetch-votesmart.mjs` — pulls candidate bios + ratings
- `scripts/run-icij-check.mjs` — batch checks candidate names against ICIJ Offshore Leaks (25/request, free)
- `scripts/build-jackets.mjs` — assembles donor data → jacket JSON per candidate

### Phase 2: Live DB (post-launch)
- Supabase (already in stack for other projects) OR PlanetScale
- Scheduled ETL via Vercel Cron or GitHub Actions
- ILSBE filings refresh weekly; FEC refreshes daily

---

## 6. Data Sources

| Source | Races Covered | Cost | Notes |
|---|---|---|---|
| **FEC API** (api.open.fec.gov) | Federal (US House, US Senate) | Free | Instant key; 1K req/hr |
| **ILSBE Bulk Download** | All IL state + county races | Free | XML/TXT; daily updates; DataMade ETL available |
| **VoteSmart API** | Bios, ratings, voting records | Free (request key) | Register at votesmart.org/share/api |
| **Google Civic Info API** | Voter ballot lookup by address | Free | 25K req/day |
| **ProPublica Campaign Finance API** | Federal (FEC wrapper) | Free (email for key) | Cleaner JSON than raw FEC |
| **ICIJ Offshore Leaks API** | Epstein/offshore entity check | Free | Batch 25 names; 810K+ entities |
| **OpenSecrets Bulk Data** | Federal, historical | Free download | API dead; bulk CSV still available |
| **FollowTheMoney API** | State-level IL | Free (account req) | Best free option for state races |
| **Cook County Bar Association ratings** | Judicial candidates | Public | WTTW Voter Guide + bar assoc websites |

---

## 7. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Static export for launch speed + dynamic routes when needed |
| **Hosting** | Vercel | Auto-deploy, edge functions for OG image generation, free tier |
| **Styling** | Tailwind CSS + shadcn/ui | Speed. Already known. Clean civic aesthetic. |
| **Charts** | Recharts | Treemap + bar charts; React-native, lightweight |
| **Search** | Fuse.js | Client-side fuzzy search; no server needed for Phase 1 |
| **OG Images** | next/og (Vercel OG) | Per-candidate jacket OG images for viral sharing |
| **Data** | Static JSON files (Phase 1) → Supabase (Phase 2) | Ship fast, scale later |
| **Animations** | Framer Motion | Consistent with DigiJerry stack |
| **Repo** | GitHub (Sig.Seeker org) | New repo: `sig-seeker/thejacket` |

---

## 8. Design Direction

**Aesthetic:** Dark, serious, civic. This is not a playful app — it's accountability journalism in UI form.
- Background: Near-black (`#0a0a0a`)
- Accent: **Warning red** (`#ef4444`) for red flags
- Secondary: **Civic gold** (`#f59e0b`) for financial data
- Text: Off-white (`#f5f5f5`)
- Font: Inter or Geist — clean, readable, trustworthy

**The Jacket visual:**
- Inspired by NASCAR sponsor patches + the literal jacket concept
- Each donor/industry = a patch, sized by dollars
- The "jacket" fills the top of every candidate profile — it's the first thing you see
- Mobile: vertical stack of patches; Desktop: grid layout

---

## 9. Race Priority for Phase 1

Given 4 days to launch, focus data effort on highest-impact races first:

| Priority | Race | Why |
|---|---|---|
| P1 | **US Senate — IL** | Open seat (Durbin retiring); 8+ D candidates; massive donor profiles |
| P1 | **Cook County Board President** | Preckwinkle vs. Reilly — contested, county-wide impact |
| P1 | **Cook County Assessor** | Kaegi vs. Hynes — directly affects property taxes for millions |
| P1 | **IL-02 US House** | Open (Kelly running for Senate); very contested D primary |
| P1 | **IL-04 US House** | Open (Chuy retiring); Pilsen/Little Village |
| P1 | **IL-07 US House** | Open (Danny Davis retiring); West Side |
| P1 | **IL-09 US House** | Open (Schakowsky retiring); North Shore |
| P2 | Governor | Pritzker likely unopposed D; still document the jacket |
| P2 | IL State Senate contested primaries | ~20 Cook County districts |
| P2 | IL State House contested primaries | ~50 Cook County districts |
| P3 | MWRD | Less visible but real power over water/environment |
| P3 | Judicial (Circuit Court) | Bar ratings + basic profiles |

---

## 10. Red Flags — Research Checklist Per Candidate

For every P1 candidate, run:
- [ ] FEC search: `api.open.fec.gov/v1/candidates/?name=&state=IL&election_year=2026`
- [ ] ILSBE search: `elections.il.gov` disclosure lookup
- [ ] ICIJ name check: `offshoreleaks.icij.org/api/...` (batch)
- [ ] Web search: `[name] ethics violation`, `[name] AIPAC`, `[name] indicted`, `[name] controversy`
- [ ] OpenSecrets bulk: industry categorization for federal candidates
- [ ] VoteSmart: voting record if prior office held
- [ ] BGA (bettergov.org): any investigations
- [ ] Illinois Answers Project: any investigations

---

## 11. Build Phases

### Phase 0 — Setup (Day 1, ~2 hrs)
- [ ] Create GitHub repo: `sig-seeker/thejacket`
- [ ] Init Next.js 14 + Tailwind + shadcn/ui
- [ ] Deploy to Vercel, connect thejacket.cc domain
- [ ] Set up `/data` directory structure

### Phase 1 — Data ETL (Day 1–2, ~4 hrs)
- [ ] Get API keys: FEC, VoteSmart, Google Civic, FollowTheMoney
- [ ] Write `fetch-fec.mjs` — pull P1 federal candidates + donor data
- [ ] Write `fetch-ilsbe.mjs` — pull P1 county/state candidates
- [ ] Write `run-icij-check.mjs` — batch all P1 candidates
- [ ] Manually curate red flags for P1 candidates
- [ ] Build `/data/candidates/*.json` for all P1 races

### Phase 2 — Core UI (Day 2–3, ~8 hrs)
- [ ] Home page: race browser + "find my ballot" search
- [ ] Race page: list of candidates per office
- [ ] Candidate profile page: bio + the jacket + red flags + record
- [ ] The Jacket component: Recharts treemap + bar chart + donor table
- [ ] Red flag badge system
- [ ] OG image generation (next/og) — jacket treemap per candidate

### Phase 3 — Polish + Launch (Day 3–4, ~4 hrs)
- [ ] Mobile responsiveness
- [ ] SEO meta tags + social sharing
- [ ] "About" page — explain the Robin Williams quote + mission
- [ ] Launch day: post to social, submit to Reddit/Twitter/Discord civic groups

---

## 12. Success Metrics (Phase 1)

- Launches before March 17, 2026 primary
- P1 races fully populated with jacket data
- At least 1 viral share of a candidate's jacket OG image
- Zero factual errors in donor data (source-cited, verifiable)

---

## 13. Future Features (Post-Launch Parking Lot)

- **Jacket Score** — single 0–100 score based on % corporate/dark money vs. small donors
- **Side-by-side comparison** — pick 2 candidates, compare jackets
- **Alerts** — "get notified when new filings come in for [candidate]"
- **Collar counties expansion** (Phase 3)
- **National expansion** — other major city primaries
- **The Jacket browser extension** — shows jacket data on any candidate's Wikipedia page

---

## 14. Project Files

- PRD: `memory/THEJACKET/PRD.md` (this file)
- Project Summary: `memory/THEJACKET/PROJECT_SUMMARY.md` (create after first session)
- Scout reports: `/tmp/scout-ballot-positions.md`, `/tmp/scout-techstack-datasources.md`
- Repo: `github.com/sig-seeker/thejacket` (to be created)
- Domain: thejacket.cc (purchased 2026-03-13)

---
*"Politicians should wear a jacket with all the companies and organizations that pay into them — so we can see who they really work for." — Robin Williams*
