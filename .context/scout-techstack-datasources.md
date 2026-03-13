# Civic Transparency Web App — Tech Stack & Data Sources Research
**Scout Run:** March 13, 2026 | Focus: Cook County, IL — March 17, 2026 Primary & Nov 3, 2026 General

---

## 1. EXISTING PLATFORMS ANALYSIS

### BallotReady / CivicEngine
- **API Host:** `api.civicengine.com` (BallotReady rebranded to CivicEngine)
- **Data Model:**
  - `/elections` — election IDs, names, dates, state
  - `/positions` — offices by address/lat-lon/level (federal/state/local/county)
  - `/candidates` — candidate_id, name, party, election_id, position, current_office_holder, website, org_endorsements, photo flag
- **Query params:** `address`, `lat/lon`, `include_candidates=1`, `election_id`, `level`, `search_radius`
- **Access:** Requires API key; enterprise B2B pricing — not cheap; built for civic orgs
- **Data quality:** Very high — team of researchers makes FOIA requests and phone calls; covers down to school board
- **Usefulness:** Excellent for office/candidate structure; NOT for donor data
- **Verdict for this project:** Too expensive for a solo dev. Use Ballotpedia scraping + ILSBE instead.

### VoteSmart (Project Vote Smart)
- **API host:** `api.votesmart.org` — REST, returns XML or JSON
- **Endpoints:** `CandidateBio.getBio()`, `CandidateBio.getDetailedBio()`, `Votes`, `Rating`, `Officials`, `Election`, `Office`, `District`, `Ballot Measure`, `NPAT` (political positions survey)
- **Access:** Free for nonprofits/journalists — must create account & request key from votesmart.org/share/api; easy registration
- **Data quality:** Good for bio/positions/ratings; NOT campaign finance; data can lag
- **Verdict:** Worth getting a key for candidate bios and ratings; limited to candidates who engage with VoteSmart

### OpenSecrets
- **API Status:** ⚠️ **DISCONTINUED as of April 15, 2025**
- **Bulk Data:** Still available at opensecrets.org/open-data/bulk-data — PAC contributions, individual contributions, expenditures (federal races, historical)
- **Contact:** data@opensecrets.org for custom data solutions
- **Verdict:** API is dead. Bulk data download is still viable for federal candidate research (U.S. House IL districts, Senate). Request bulk data files directly. Data is excellent but only covers **federal races** — not state/county.

### FollowTheMoney (National Institute on Money in Politics)
- **Status:** ⚠️ **In transition** — integrating with OpenSecrets; site displays 2024 data but described as "not maintained" during integration
- **API:** "Ask Anything API" — free after creating a myFollowTheMoney account; PDF documentation
- **Data:** 50-state campaign contributions, independent spending, lobbying; Illinois data goes back years
- **Access:** Free API key, no cost tier listed
- **IL Coverage:** YES — state-level Illinois data for state legislative races, governor, etc.
- **Verdict:** Sign up immediately. Best free option for state-level Illinois finance data. Cross-ref with ILSBE downloads.

### Illinois Answers Project / Better Government Association
- **URL:** illinoisanswers.org
- **Type:** Nonprofit investigative journalism — NOT a data API
- **What they have:** Original investigations, FOIA document sets, source contacts
- **Data access:** No public API; useful for story context and leads, not programmatic data
- **Verdict:** Mine their archives for story angles and data leads. Good for understanding existing narratives on IL corruption.

### Democracy Works / TurboVote
- **Elections API:** `democracy.works/elections-api` — REST/JSON; enterprise pricing ("Request Pricing")
- **Coverage:** 14K+ elections since 2020; federal + state + county + municipal + school board (5,000+ pop)
- **Features:** Election dates, deadlines, polling locations (300K+ locations in 2024), candidate info, voter ID requirements, ballot info by address
- **Access:** Paid; pricing not listed publicly — contact required
- **Verdict:** Overkill and unaffordable for solo dev. Use Google Civic API for voter info lookup (free, same data).

### Google Civic Information API
- **Host:** `googleapis.com/civicinfo/v2/`
- **Endpoints:**
  - `GET /elections` — list election IDs
  - `GET /voterinfo?address=&electionId=` — voter info, polling place, ballot items, election officials
  - `GET /representatives?address=` — current officials by address
- **Auth:** API key via Google Cloud Console; free tier with quota limits
- **Data quality:** Powered by Voting Information Project (VIP) — state election officials contribute data; decent but can be incomplete for hyperlocal races
- **Cost:** Free up to quota; ~25,000 requests/day on free tier
- **Verdict:** ✅ **Use this.** Free, easy, great for voter-facing "find your ballot" features. Covers the March 17, 2026 election.

---

## 2. DATA SOURCES — API/Download Details

### 🟢 FEC API (api.open.fec.gov)
- **URL:** `https://api.open.fec.gov/v1/`
- **Cost:** FREE — requires API key from api.data.gov (instant, free)
- **Rate limits:** 1,000 requests/hour with key; 20/hour without
- **Coverage:** Federal races ONLY — U.S. House, U.S. Senate, Presidential
- **Relevant for IL:** All IL U.S. House races (districts 1–17), IL U.S. Senate race (2026)
- **Key endpoints:**
  - `/candidates/?state=IL&election_year=2026`
  - `/candidate/{id}/totals/`
  - `/schedules/schedule_a/` — individual contributions
  - `/schedules/schedule_b/` — expenditures
- **Data quality:** ⭐⭐⭐⭐⭐ — official FEC data, updated daily; electronic filings every 15 min
- **Verdict:** ✅ **Essential. Use for all federal IL races.** Get the key today.

### 🔴 OpenSecrets API
- **Status:** DEAD as of April 15, 2025
- **Workaround:** Bulk data downloads still available at opensecrets.org/open-data/bulk-data
  - Files: `.csv` format; contributors, PAC money, expenditures, lobbying
  - Historical data from 1980s–2024
- **Cost:** Free download; contact data@opensecrets.org for 2026 cycle data
- **Verdict:** For federal races, use FEC API directly. OpenSecrets bulk data useful for historical context and industry categorization (they do excellent industry tagging that raw FEC data lacks).

### 🟢 Illinois State Board of Elections (ILSBE) Bulk Data
- **URL:** `elections.il.gov`
- **System:** IDIS (Illinois Disclosure Information System) — web-based
- **Download format:** `.xml` or `.txt`
- **Coverage:** ALL Illinois state and local political committees since 1994; quarterly reports
- **What's in it:** Contributions (A-1 forms), expenditures, candidate/committee registration
- **Update frequency:** Daily updates; electronic filings; quarterly report windows
- **How to get it:**
  - Web search/download from ILSBE directly; also available via DataMade's `etl.py` script (github.com/datamade/illinois-sunshine)
  - FTP-style bulk: `influence-usa/campaign-finance_state_IL` on GitHub has parsing code
- **Data quality:** ⭐⭐⭐⭐ — authoritative, but format is clunky (fixed-width or XML); needs ETL work
- **Verdict:** ✅ **Primary source for ALL state/county IL races** — governor, Cook County offices, state legislature, judges. This is the data.

### 🟡 Cook County Clerk (cookcountyclerkil.gov)
- **Elections page:** cookcountyclerkil.gov/elections/current-elections/2026-elections
- **Available:**
  - "View all candidates" list for March 17, 2026 primary
  - Ballot Lottery results
  - Write-in candidates
  - Referenda
- **Format:** HTML only — no API, no bulk download
- **Offices on 2026 ballot:** Cook County Assessor, Clerk, Sheriff, Treasurer, Board President, all 17 Board of Commissioners seats, 2 Board of Review seats, 4 Water Reclamation District seats, Circuit Court judgeships
- **Verdict:** ✅ **Manually scrape the candidate list as seed data.** Supplement with ILSBE for finance data linked to those candidates.

### 🟢 ProPublica Campaign Finance API
- **URL:** `api.propublica.org/campaign-finance/v1/`
- **Auth:** Email apihelp@propublica.org for free key; 5,000 requests/day
- **Coverage:** Federal FEC data (wraps FEC data); 1980–present; electronic filings every 15 min
- **Key endpoints:**
  - `/{cycle}/candidates/IL` — IL candidates by cycle
  - `/candidates/{fec-id}/totals` — total raised/spent
  - `/{cycle}/committees/{fec-id}` — committee details
  - `/contributions/search?committee_id=&zip=` — contribution search
- **Data quality:** ⭐⭐⭐⭐ — same as FEC, but cleaner JSON; better for dev use; includes congressional summary data
- **Verdict:** ✅ **Use instead of raw FEC API** for federal data — cleaner interface, same data, free.

### 🟡 ICIJ Offshore Leaks Database
- **URL:** offshoreleaks.icij.org
- **API:** Reconciliation API (W3C standard) — `https://offshoreleaks.icij.org/reconcile`
  - Match names against 810,000+ offshore entities (Pandora Papers, Panama Papers, Paradise Papers, Bahamas Leaks)
  - Entity types: Address, Entity, Intermediary, Officer, Other
  - Batch size: 25 names at a time; returns confidence scores + matches
  - Free, no auth required
- **Also:** Full database downloadable as CSV/JSON at offshoreleaks.icij.org
- **Coverage for IL/Cook County:** Search donors' names against offshore entity database; identify if major donors have offshore connections
- **Epstein connections:** "Jeffrey E. Epstein" appears in the database (node #80063035); also "Eli Epstein" — can cross-ref donors against Epstein-linked entities
- **Verdict:** 🔍 **Use as enrichment layer** — run top 50 donors per candidate through reconciliation API; flag matches as investigative leads. NOT a primary data source; supplemental/investigative use only.

### 🟡 FollowTheMoney API (National Institute on Money in Politics)
- **URL:** followthemoney.org/our-data/apis
- **Access:** Free — create account at myFollowTheMoney; immediate access
- **Documentation:** PDF format; "Ask Anything API" style
- **IL Coverage:** State-level contributions for Illinois legislative/statewide races
- **Note:** Site labeled "not maintained" during OpenSecrets integration — may have data gaps post-2024
- **Verdict:** ✅ Supplement for state races where ILSBE data needs industry categorization

---

## 3. TECH STACK RECOMMENDATION

### Context Requirements
- Launch within days (before March 17, 2026 — TODAY is March 13, 2026 — **you have 4 days**)
- Candidates by office
- Donor breakdowns prominently
- Publicly shareable / viral-ready
- One developer maintainable

### ⚡ RECOMMENDED STACK

#### Framework: **Next.js 14+ (App Router)**
- **Why:** React-based, SSG + ISR support, Vercel zero-config deploy, huge ecosystem, file-based routing
- **For this project:** Pre-render all candidate pages at build time (`generateStaticParams`); ISR every 24h for live data updates
- **Alternative:** Astro — better for pure static, but worse for interactive donor charts/search; Next.js wins here

#### Hosting: **Vercel** (free tier)
- Zero-config deploy from GitHub
- Edge CDN globally
- ISR support built in
- Free tier handles massive traffic spikes (viral traffic)
- Custom domain: connect immediately

#### Data Layer: **Static JSON files + GitHub**
- Given 4-day timeline: **DO NOT build a live database**
- Strategy:
  1. Pull ILSBE bulk data → run Python ETL → output `/public/data/candidates.json`, `/public/data/donors-{candidateId}.json`
  2. Pull FEC API for federal candidates → merge into same JSON schema
  3. Commit to GitHub → Vercel rebuilds automatically
  4. Schedule GitHub Action to re-pull + rebuild nightly
- **File structure:**
  ```
  /public/data/
    candidates.json          — all candidates, indexed by office
    offices.json             — list of offices on ballot
    donors/
      {candidate_slug}.json  — top donors, industry breakdown, total raised
    meta.json                — last updated timestamp
  ```
- **Why not Supabase/PlanetScale:** You don't have time. Static JSON on Vercel's CDN will be faster anyway.

#### Search: **Fuse.js** (client-side fuzzy search)
- Lightweight, zero-backend fuzzy search across candidate names, offices
- Load `candidates.json` once, run Fuse on it
- For viral shareability: deep-linkable URLs like `/candidate/toni-preckwinkle`

#### Styling: **Tailwind CSS + shadcn/ui**
- Tailwind: fastest to build with; utility classes
- shadcn/ui: pre-built accessible components (cards, tabs, badges, progress bars)
- For charts: **Recharts** (React-native, good treemaps and bar charts) or **Chart.js via react-chartjs-2**

#### Sharing / Virality
- OpenGraph image generation via **@vercel/og** (next/og) — generate dynamic OG images per candidate showing their top donor total
- Twitter Card support
- "Share this candidate's jacket" button → copies URL or pre-fills tweet
- Each candidate page is a standalone shareable URL

#### State Management: None needed (static data)
- React `useState` for UI state only
- No Redux, no Zustand — overkill

### Complete Stack Summary

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14 App Router | Fast SSG, ISR, ecosystem |
| Hosting | Vercel (free) | Zero-config, CDN, handles viral traffic |
| Data | Static JSON + GitHub Actions | Ship in hours, update nightly |
| Search | Fuse.js | Zero backend, fast |
| Styling | Tailwind + shadcn/ui | Fast build, polished |
| Charts | Recharts | React-native, treemap support |
| Sharing | next/og dynamic OG images | Viral card per candidate |
| Data ETL | Python scripts (one-time + cron) | ILSBE → JSON pipeline |

---

## 4. "JACKET" FEATURE DESIGN

### The Concept
The "jacket" is the donor/funding breakdown view for each candidate — inspired by the widely-shared Robin Williams quote: *"Politicians should wear sponsor jackets like NASCAR drivers, then we know who owns them."* This meme has gone viral multiple times (HuffPost 2015, Reddit threads, Snopes fact-checks 2025). **The NASCAR jacket framing is culturally potent and viral-ready.**

A 2015 protest in Sacramento literally built cardboard cutouts of California lawmakers wearing their donors' logos NASCAR-style — this is the visual language people already understand.

### Visual Design Recommendation

#### Primary: **NASCAR Jacket / Sponsor Patch Grid**
The hero feature. Render a candidate silhouette or jacket outline with sponsor logos/names tiled across it, sized proportionally to donation amount.

```
┌─────────────────────────────────────────┐
│   [Candidate Photo]   💰 $2.4M raised   │
│                                          │
│  ┌──────────┐ ┌──────┐ ┌─────────────┐  │
│  │  SEIU    │ │ ABC  │ │ Real Estate │  │
│  │  $420K   │ │Corp  │ │ PAC $180K   │  │
│  └──────────┘ │$300K │ └─────────────┘  │
│  ┌──────┐    └──────┘ ┌──────┐          │
│  │Law   │  ┌────────┐ │Small │          │
│  │Firm  │  │ Tech   │ │Donors│          │
│  │$95K  │  │PAC $80K│ │$340K │          │
│  └──────┘  └────────┘ └──────┘          │
└─────────────────────────────────────────┘
```

**Implementation:** Treemap (d3-treemap or Recharts `<Treemap>`) where each rectangle = a donor/industry category, sized by dollar amount.

#### Secondary: **Horizontal Bar Chart by Category**
Below the treemap, show a ranked horizontal bar chart:
```
Real Estate PACs     ████████████████ $420,000  (17%)
Labor Unions         ██████████████   $380,000  (15%)
Law Firms            ████████         $210,000   (8%)
Individual < $200    ████████         $190,000   (7%)
Dark Money           █████            $140,000   (5%)
...
```

#### Tertiary: **Top Individual Donors Table**
Sortable table: Donor name | Amount | Employer | Date | City

#### Quaternary: **ICIJ Flag Badge**
If any top donor matches ICIJ offshore database: show a 🚩 badge with tooltip "This donor has offshore entity connections (Pandora Papers)"

### UX Layout for the Jacket Page

```
/candidate/[slug]
├── Hero: Name, Office, Party, Photo
├── Summary bar: Total raised | Total spent | Cash on hand
├── 🏁 THE JACKET (Treemap — above the fold)
│    → Click a patch → drill into that donor category
├── Industry breakdown (bar chart)
├── Top donors table (top 25, sortable)
├── Expenditures breakdown
├── Offshore flags (if any)
└── Share button → "Share [Name]'s Jacket" → OG card
```

### OG Image for Sharing
Use `next/og` to generate a card image that shows:
- Candidate name + office
- The treemap rendered as a static image
- "💰 Funded by: [Top 3 industries]"
- "See the full jacket at [domain]"

This image previews on Twitter/X, Facebook, iMessage. When someone shares "look at Toni Preckwinkle's jacket" and the preview shows the treemap — that's the viral mechanic.

### Color Coding
Industry categories should have consistent colors across all candidates:
- 🔵 Labor/Unions → blue
- 🔴 Real Estate → red
- 🟠 Legal/Law Firms → orange
- 🟢 Health/Pharma → green
- ⚫ Dark Money/Unknown → dark gray
- 🟡 Individual Small Donors (<$200) → yellow/gold
- 🟣 Finance/Banking → purple

### Existing Implementations to Reference
| Platform | Design Pattern | What Works |
|----------|---------------|------------|
| OpenSecrets candidate page | Horizontal bar charts + top donors table | Industry categorization is excellent |
| FollowTheMoney | Simple bar chart, sortable table | Clean but dated |
| Illinois Sunshine | Search + contribution list | No visualization, just data |
| FiveThirtyEight election pages | Cards + waffle charts | Good shareability |

**OpenSecrets is the gold standard** for industry categorization — they categorize every donor's employer into ~80 standardized industry codes. Their bar chart showing "Real Estate: $420K" is well-understood. The difference: **we add the treemap/patch visual that ties into the NASCAR jacket meme,** make it shareable per candidate, and expose it for Illinois state races that OpenSecrets doesn't cover deeply.

---

## 5. RECOMMENDED DATA PIPELINE (4-Day Launch Plan)

### Day 1 (Today, March 13)
- [ ] Get FEC API key at api.data.gov
- [ ] Get VoteSmart API key at votesmart.org/share/api
- [ ] Get FollowTheMoney API account
- [ ] Create Google Cloud project, enable Civic Info API, get key
- [ ] Manually scrape Cook County Clerk candidate list → seed `candidates.json`
- [ ] Download ILSBE bulk data for 2025-2026 reporting period

### Day 2 (March 14)
- [ ] Build Python ETL: ILSBE XML/TXT → candidates.json + donors/{slug}.json
- [ ] Scaffold Next.js app on Vercel
- [ ] Build candidate index page + office filter

### Day 3 (March 15)
- [ ] Build candidate detail page with jacket treemap
- [ ] Wire up Recharts Treemap component
- [ ] Add top donors table
- [ ] Add OG image generation per candidate

### Day 4 (March 16 — day before primary)
- [ ] Final data refresh from ILSBE
- [ ] QA all candidate pages
- [ ] Social share testing
- [ ] Launch 🚀

### Post-Launch (ongoing through Nov 2026)
- [ ] GitHub Action: nightly ILSBE data refresh + Vercel rebuild
- [ ] Add FEC data for federal IL candidates
- [ ] ICIJ reconciliation enrichment pass
- [ ] FollowTheMoney industry categorization enrichment

---

## 6. KEY GOTCHAS & WARNINGS

1. **ILSBE data is in weird formats** — old XML/fixed-width; use DataMade's `illinois-sunshine` ETL code as reference: github.com/datamade/illinois-sunshine (archived but working Python 3 ETL)

2. **OpenSecrets API is dead** — do not plan on it; use FEC + ProPublica instead for federal

3. **FollowTheMoney is in transition** — may have reliability issues during OpenSecrets integration; verify data freshness before relying on it

4. **Cook County judicial races** — there are hundreds of circuit court judge races; they're hard to data-mine and most voters care about them; consider deferring unless you have specific data

5. **Dark money**: Illinois has "independent expenditure" committees that don't disclose donors directly; flag these explicitly in the jacket with "Dark Money" category

6. **Candidate name matching** across data sources is messy — normalize to slugs carefully (e.g., "Toni Preckwinkle" vs "Tonia Preckwinkle"); use fuzzy matching for ETL joins

7. **ICIJ reconciliation** is approximate — treat high-confidence matches as investigative leads, not confirmed facts; display with disclaimer

8. **The primary is in 4 days** — for the primary, candidate finance data for Cook County races will be from the most recent pre-primary ILSBE quarterly filing (due January 15, 2026). This covers contributions through end of 2025; late contributions won't be in the system until post-election filing.

---

## 7. NOTABLE EXISTING TOOLS TO FORK/REFERENCE

| Project | URL | Language | Notes |
|---------|-----|----------|-------|
| Illinois Sunshine | github.com/datamade/illinois-sunshine | Python/Flask | ILSBE ETL; archived but gold |
| Election Money | github.com/datamade/election-money | Python/Flask | ILSBE bulk download tool |
| IL Campaign Finance | github.com/newsapps/ilcampaignfinance | Python | Tribune news apps ILSBE parser |
| IL Influence-USA | github.com/influence-usa/campaign-finance_state_IL | Python | Powers election-money app |
| OpenFEC | github.com/fecgov/openFEC | Python | Official FEC API source |

---

*Research compiled by research-scout subagent | March 13, 2026*
*Sources: Direct web fetches of platform docs, GitHub repos, and official data portals*
