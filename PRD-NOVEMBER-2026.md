# TheJacket — November 2026 PRD
**Version:** 1.0-DRAFT (gap-finder + reviewer results pending)
**Author:** MrMagoochi / Jerry Cieslik
**Created:** 2026-03-19
**Status:** 🟡 DRAFT — Awaiting gap-finder + concept-reviewer agent results before final lock

---

## 0. Mission

TheJacket is the civic transparency layer Cook County voters didn't know they needed. Every candidate. Every dollar. Every red flag. Now: every bill, every ballot measure, every race on YOUR specific ballot.

**November 2026 goal:** When a Cook County voter goes to the booth on November 3, they should be able to pull up thejacket.cc on their phone, enter their address, and see exactly what's on their ballot — with full intelligence on every person and measure they'll vote on.

No other tool in Chicago does this. This is the one.

---

## 1. Context & Background

### What shipped (Primary 2026)
- 91 candidates, 44 races, 23 judges
- Candidate profiles: bio, finance, red flags, endorsements, scoring (A–F)
- Hot Board carousel, Scorecard, Booth Mode (/booth)
- Autonomous news intel cron (eb6bd14a) + enrichment cron (d59a75ea) — running daily
- Site monitor cron (01ff093b) — alerts Jerry if site goes down
- Live at https://thejacket.cc | GitHub: rekaldsi/thejacket | Vercel auto-deploy

### What's broken / needs cleanup (from primary sweep)
- 2 pending races: Max Rice + Max Solomon (IL Treasurer R write-ins, unresolved)
- lashawn-ford.json is a duplicate/data error — needs cleanup
- No candidate JSON files for: Tara Stamps (D1), Stanley Moore (D4), or any judicial candidates
- Finance math errors: Kaegi, Preckwinkle, Abughazaleh
- 28/36 November winners have 0 news hits
- Missing Commissioner Districts: D1, D4, D11, D13, D14
- No Spanish translation anywhere

---

## 2. Strategic Goals — November 2026

1. **Be the #1 Cook County voter resource for November 2026** — the tool people text to each other the week before the election
2. **Personalized ballot lookup** — show each voter exactly their ballot with full intelligence on every item
3. **Bills & Legislation** — expand from candidates → legislation, becoming the full civic intelligence layer
4. **Self-sustaining intelligence** — autonomous crons keep data fresh with no manual intervention
5. **Nonpartisan trust** — maintain 100% sourced, zero-editorialized data discipline

---

## 3. Feature Set — November 2026

### Feature 1: /my-ballot — Personalized Ballot Lookup [P1 — MUST HAVE]

**What it does:**
User enters their Chicago address (or ward number, or precinct) → system resolves all their electoral districts → renders a personalized "Your November Ballot" card showing every race and ballot measure they'll encounter at the booth.

**Why it matters:**
The Chicago Board of Election Commissioners voter card shows 10 district assignments per voter (Ward, Congressional, State Senate, State Rep, Judicial, County Board, Board of Review, CPD District, CPS Board, plus suburban equivalents). Most voters don't know which County Board district they're in. They miss races. The /my-ballot page closes that gap.

**User flow:**
1. User lands on `/my-ballot`
2. Enter address, ward, or precinct → submit
3. System geocodes address → resolves all 10 district codes
4. Renders "Your November 3 Ballot" card:
   - Ward X · Precinct Y header
   - Each race in ballot order with candidate names + party
   - Each candidate card links to full Jacket profile
   - Ballot measures in their own section with plain-English summaries
   - Judicial races with bar ratings shown inline
5. Shareable URL: `/my-ballot?address=...`
6. "Save your ballot" → email capture for update alerts

**API stack:**
| District Type | Data Source | Cost |
|---|---|---|
| IL State Rep / State Senate | OpenStates /people.geo (lat/lng) | Free |
| US Congressional | OpenStates /people.geo | Free |
| Ward / Aldermanic | Cicero API OR Chicago ward GeoJSON | $298/5K or self-host |
| Cook County Board | Cicero API | $298/5K |
| Board of Review | Cicero API | $298/5K |
| Judicial district | Static district map (rarely changes) | Free |
| CPD / CPS Board | Chicago Data Portal GeoJSON | Free |

**Geocoding:** Google Maps Geocoding API → lat/lng (free up to 40K/month)

**Address → district resolution flow:**
```
User address
  → Google Geocoding API → lat/lng
  → OpenStates /people.geo(lat, lng) → IL State Rep, IL State Senator, US Rep
  → Cicero API(lat, lng) → Ward, Alderperson, County Board, Board of Review
  → Static GeoJSON lookup → Judicial district, CPD district, CPS Board district
  → Filter races.json by district codes → return matching races + measures
```

**Data model — races.json extension:**
Each race needs `districts` array listing which district codes it applies to:
```json
{
  "id": "cook-county-board-d8-2026",
  "title": "Cook County Commissioner District 8",
  "districts": { "county_board": [8] },
  "candidates": ["alice-hu"]
}
```

**Ballot measures data model:**
```json
// data/measures/cook-county-property-tax-freeze-2026.json
{
  "id": "cook-county-property-tax-freeze-2026",
  "title": "Cook County Property Tax Freeze Amendment",
  "full_text": "Shall the Cook County...",
  "plain_english": "A yes vote would...",
  "yes_means": "Approves a 30-year property tax exemption for homeowners 65+",
  "no_means": "Rejects the exemption, property taxes continue under current rules",
  "fiscal_impact": "Estimated $X million reduction in County revenue annually",
  "districts": { "county_wide": true },
  "source": "Cook County Board Resolution #...",
  "last_updated": "2026-09-01"
}
```

---

### Feature 2: Bills & Legislation Tracker [P1 — MUST HAVE]

**What it does:**
A dedicated section of TheJacket that tracks active Illinois state bills, Chicago City Council ordinances, and Cook County Board resolutions — with plain-English summaries, impact tags, status timelines, hearing dates, and community sentiment.

**Why it matters:**
Every election cycle, voters are asked to vote on ballot measures they've never heard of. And between elections, their representatives are passing bills that directly affect their lives — with zero civic transparency layer. Nobody combines IL bill tracking + civic engagement for general Cook County voters. TheJacket is the first.

**Data sources:**
| Scope | Source | Coverage | Cost |
|---|---|---|---|
| IL State Bills | LegiScan Free API | All 104th GA bills (11K+) | Free / 30K queries/mo |
| Chicago City Council | Legistar API (/chicago/) | All ordinances, real-time | Free, no auth |
| Cook County Board | Legistar API (/cook-county/) | All resolutions, real-time | Free, no auth |

**Bill detail page — fields:**
- Plain-English title (not "CRIM CD-HANDGUN AMMO-SERIALIZE")
- AI-generated 2-3 sentence summary (from bill text via Claude Haiku)
- Impact tags (see taxonomy below)
- Sponsor name + party + link to their Jacket profile if they're in our DB
- Status timeline: Introduced → Committee → Floor Vote → Governor
- ⚠️ Upcoming hearing: date, time, location
- What supporters say / What critics say (2-3 sourced bullets each)
- Community sentiment: thumbs up/down with percentage display
- 🔔 Bill Alerts: email signup → notified when bill moves
- 📤 Share: pre-written tweet/text + OG image
- [MVP] Contact your rep: Resistbot deep link
- [V2] Inline contact relay via OpenStates + Resend

**Impact tag taxonomy:**
- 💰 New Fee/Tax | 💸 Increases Existing Tax | ✂️ Budget Cut | 💼 Business Impact
- 🔒 Privacy/Surveillance | 🔫 Second Amendment | 🗣️ Free Speech | ⛪ Religious Liberty
- 🏠 Homeowners | 🏢 Renters | 🚗 Drivers | 🧑‍🤝‍🧑 Families | 👴 Seniors
- ⚖️ Criminal Justice | 🏛️ Government Expansion | 📋 Requires Registration

**Editorial model (Injustice Watch standard):**
- Zero editorializing. Facts only. Let the bill text speak.
- "HB-4414 makes it a Class C misdemeanor to possess non-serialized handgun ammo in public" — not "HB-4414 criminalizes law-abiding gun owners"
- Every claim sourced to official document (bill text, ILGA.gov, official vote record)
- confirmed: true = independently verified. confirmed: false = allegation / single source.

**Bill surfacing / feed logic:**
1. Upcoming hearing in next 14 days → float to top
2. Recently changed status
3. Tagged as high-impact (New Tax, Privacy/Surveillance, Restricts Right)
4. High community engagement

**Pilot bill:** HB-4414 (CRIM CD-HANDGUN AMMO-SERIALIZE) — hearing March 24, 2026. Use as the build + test case for the full bill treatment.

**Bill Alerts system:**
- Email signup tied to specific bill — "Notify me when this bill moves"
- Store email + bill ID in Convex (no static JSON — dynamic data)
- Resend for email delivery
- LegiScan status polling: daily check via cron → compare to cached status → fire alerts on change
- Double opt-in (send confirmation email first)
- CAN-SPAM compliant: unsubscribe link, physical address in footer

---

### Feature 3: May 3 Candidate Lock-In Cron [P1 — TIME-SENSITIVE]

**What it does:**
One-shot cron fires the morning of May 3, 2026 (IL candidate filing deadline). Pulls all confirmed November candidates from ILSBE, locks the roster, triggers enrichment on new candidates, sends Jerry a Telegram briefing.

**Cron spec:**
- Schedule: 2026-05-03 08:00:00 CDT
- Payload: agentTurn (isolated session)
- Task: Pull ILSBE candidate filings for November 2026 races → compare to current roster → identify new/missing candidates → trigger enrichment pass → generate summary → Telegram to 7638568632
- After fire: shift news intel cron (eb6bd14a) to monitor November candidates (update candidate list)
- Delivery: Telegram message to Jerry

**What the cron should produce:**
1. List of all confirmed November 2026 Cook County races
2. For each race: Democratic candidate (primary winner) vs. Republican/Libertarian/Independent opponent
3. New candidate slugs to create
4. Enrichment queue: bio, finance, red flags for all new candidates
5. Stale primary-only candidates to archive (no November race)

---

### Feature 4: Ballot Measures / Referendums [P1]

**What it does:**
Track every ballot measure, referendum, and constitutional amendment that will appear on Cook County ballots in November 2026. Integrate into /my-ballot so voters see measures relevant to their district.

**Types to track:**
- Statewide constitutional amendments (all Cook County voters see these)
- Cook County-wide measures (County Board puts these on ballot)
- Ward-specific or district-specific referendums
- Chicago-specific measures (City Council ballot questions)
- School district referendums (CPS and suburban school districts)

**Data pipeline:**
- Sources: Cook County Clerk, IL State Board of Elections, Chicago City Clerk
- Timeline: Ballot questions typically certified 60-90 days before election → September 2026
- Action: Manual research + AI-assisted summary pass in September; then static JSON

---

### Feature 5: November General Election Candidate Roster [P1]

**Full race coverage needed (Cook County, November 2026):**

**Statewide IL:**
- IL Governor: Pritzker (D) vs. TBD (R)
- IL Attorney General: Kwame Raoul (D) vs. Bob Fioretti (R)
- IL Secretary of State: Alexi Giannoulias (D) vs. TBD (R)
- IL Comptroller: Susana Mendoza (D) vs. TBD (R)
- IL Treasurer: Mike Frerichs (D) vs. TBD (R/write-in pending)

**Cook County:**
- Cook County Board President: Toni Preckwinkle (D) vs. TBD (R)
- Cook County Assessor: Kaegi or Hynes (D primary winner) vs. Nico Tsatsoulis (Libertarian)
- Cook County Clerk: TBD
- Cook County Treasurer: TBD
- Cook County Board of Review: District 1 (Cardenas vs. Irizarry) + District 2 (Steele vs. Nicholson)
- Cook County Commissioners: All 17 districts (those up in 2026)

**US House (Cook County districts):**
- IL-01 through IL-09 generals (all Cook County-adjacent)

**IL Senate + House:**
- All Cook County state senate and house districts up in 2026

**Judicial:**
- All November judicial retention votes + contested vacancies
- Individual JSON files needed for every judicial candidate (none currently exist)

---

### Feature 6: Judicial Candidate Files [P2]

**Current state:** 20+ judges have primary results but zero individual JSON files exist.

**What's needed:**
- Create `data/candidates/[judge-slug].json` for every November judicial candidate
- Fields: name, race_id, bar_ratings (Alliance + CBA), red_flags, injustice_watch_findings, status, result
- Scores auto-calculated by existing `lib/judgeScoring.ts`
- Source: Alliance of Bar Associations ratings (published before elections), Injustice Watch, CBA

---

### Feature 7: Platform Data Cleanup [P1 — before November launch]

**Must fix before November:**
- [ ] lashawn-ford.json data error — remove duplicate file
- [ ] Finance math errors: Kaegi, Preckwinkle, Abughazaleh — recalculate
- [ ] Tara Stamps (D1) + Stanley Moore (D4) — create candidate files
- [ ] Max Rice + Max Solomon — resolve pending status or mark as write-in/no nominee
- [ ] Run full enrichment pass on all 91 existing candidates (most are data_status: partial/limited)
- [ ] Candidate photos: source headshots for all candidates (currently photo_url: null on most)

---

## 4. Architecture

### Current stack (unchanged)
- Next.js 15 App Router + TypeScript + Tailwind CSS
- Static JSON data files (`data/candidates/`, `data/judges/`, `data/races.json`)
- Vercel (free tier, auto-deploy from GitHub)
- Convex (operational logging + dynamic data: bill alerts, sentiment votes)

### New components for November
| Component | Where | Notes |
|---|---|---|
| Bill alerts subscriptions | Convex DB | Dynamic — email + bill ID |
| Community sentiment votes | Convex DB | IP-rate-limited counters |
| Address → district resolution | Vercel API route | Calls Cicero + OpenStates |
| LegiScan bill cache | Convex DB | Daily sync via cron |
| Ballot measures data | data/measures/*.json | Static JSON, same pattern |
| Legistar sync | Convex cron | Daily pull, Chicago + Cook |

### Static vs. Dynamic split
**Static (GitHub → Vercel):** Candidate profiles, judge profiles, race data, ballot measures, platform copy
**Dynamic (Convex):** Bill alerts subscriptions, community sentiment, bill status cache, operational logs

### Traffic / scaling
- Vercel free tier handles up to ~100GB bandwidth/month
- Election week (Nov 1-3) will spike. Vercel auto-scales, free tier has limits.
- Mitigation: Enable Vercel Edge Caching on all static routes. Consider Vercel Pro ($20/mo) for election week.
- /my-ballot address lookup: calls Cicero + OpenStates → cache responses by address in Convex (TTL: 24h)

---

## 5. API Keys Required

| Key | Source | Cost | When Needed |
|---|---|---|---|
| LegiScan API | legiscan.com | Free | Now (bills feature) |
| OpenStates API | open.pluralpolicy.com | Free | August (ballot lookup) |
| Cicero API | cicerodata.com | Free trial 90 days / $298 after | August (ballot lookup) |
| Google Maps Geocoding | Google Cloud Console | Free up to 40K/mo | August (geocoding) |
| Resend | resend.com | Free up to 3K/mo | August (bill alerts) |
| FEC API | api.open.fec.gov | Free | August (federal finance) |
| ILSBE bulk | illinoissunshine.org | Free | May (candidate lock-in) |

---

## 6. Intelligence System — Cron Architecture

### Existing crons (keep running)
| Job ID | Schedule | What it does |
|---|---|---|
| eb6bd14a | 8am/2pm/8pm CDT | News intel — update 10+ high-priority candidate news_hits[] |
| d59a75ea | 6am/2pm/10pm CDT | Enrichment — finance, red flags, scoring pass |
| 01ff093b | Every 6h | Site monitor — alert Jerry on Telegram if site goes down |

### New crons to add
| Name | Schedule | What it does |
|---|---|---|
| thejacket-may3-sweep | 2026-05-03 08:00 CDT | One-shot: pull ILSBE filings, lock November roster, enrichment queue, Telegram briefing |
| thejacket-bills-sync | Daily 6am CDT | Pull IL bill updates from LegiScan, update Convex cache, trigger alerts on status changes |
| thejacket-legistar-sync | Daily 7am CDT | Pull Chicago City Council + Cook County Board updates from Legistar API |
| thejacket-november-intel | Aug 1 onward, 3x/day | Expand news intel to all November candidates (not just 10) |

### After May 3: update eb6bd14a
- Expand candidate monitoring list from 10 primary candidates → full November roster
- Shift from primary results mode → general election mode

---

## 7. Editorial Standards

1. **ZERO invented data** — every claim needs a source
2. **confirmed: true** = independently verified from 2+ sources or official record
3. **confirmed: false** = allegation, single-source, or unverified — still publishable but labeled
4. **No editorial positions** — TheJacket does not endorse or oppose candidates or legislation
5. **Injustice Watch model for bills** — report the record, reveal connections, let data speak
6. **Impact tags describe effect, not politics** — "New Fee" is factual, not partisan
7. **Both sides on every bill** — supporter rationale and critic rationale, sourced

---

## 8. Build Sequence (GSD2 Milestones)

### Phase 1 — Cleanup + Foundation (April 2026)
**Goal:** Primary data is clean, platform ready for November expansion
- M1: Data cleanup (lashawn-ford, finance math, Stamps/Moore files, pending races)
- M2: May 3 cron built and scheduled
- M3: LegiScan API integrated — bills ingestion pipeline
- M4: Legistar API integrated — Chicago + Cook County ordinance pipeline

### Phase 2 — Bills Feature (May-June 2026)
**Goal:** Bills & Legislation section live, HB-4414 as pilot
- M5: Bill detail pages (plain-English summary, impact tags, status timeline)
- M6: Community sentiment votes (Convex counters, IP rate-limited)
- M7: Bill Alerts (Resend + Convex subscriptions + LegiScan polling cron)
- M8: Bills feed page (filterable by category, sorted by urgency)

### Phase 3 — November Roster (July-August 2026)
**Goal:** All November candidates profiled, judicial files created
- M9: Pull confirmed November candidates post-May 3 → create all candidate files
- M10: Judicial candidate files (all November judges)
- M11: Run full enrichment pass on all candidates
- M12: FEC + ILSBE live API integration (replace manual finance snapshots)

### Phase 4 — /my-ballot (August-September 2026)
**Goal:** Address-based personalized ballot lookup live
- M13: Geocoding pipeline (Google Maps → lat/lng)
- M14: District resolution (Cicero + OpenStates + static GeoJSON)
- M15: races.json district metadata added to all races
- M16: Ballot measures data (data/measures/*.json)
- M17: /my-ballot page built, tested across all Cook County districts
- M18: Integration test — spot-check 20+ real addresses across wards/suburbs

### Phase 5 — Pre-Launch Polish (September-October 2026)
**Goal:** Platform is airtight before election week
- M19: Spanish translation activation (feat/full-i18n branch + DeepL key)
- M20: Candidate photos sourced for all major races
- M21: OG image generation per candidate (/next/og)
- M22: Performance audit + Vercel caching optimization for election week traffic
- M23: Mobile UX audit (booth mode, ballot lookup — thumb-accessible)
- M24: Full data audit — all candidates, all races, all measures verified

### Phase 6 — November Launch + Election Coverage (October-November 2026)
**Goal:** Real-time updates through election night, then archive
- M25: Election night results integration (same pattern as primary sweep)
- M26: Post-election archive mode (mark winners/losers, preserve record)
- M27: Apply for Illinois Local Journalism Sustainability Tax Credit

---

## 9. Success Metrics

- **Launch:** Platform live with full November ballot coverage by October 1, 2026
- **Traffic:** 10,000+ unique visitors election week
- **/my-ballot:** Tested and verified accurate for 20+ Cook County address/ward combinations
- **Bills:** 50+ IL bills tracked with full treatment by October launch
- **Data quality:** Zero confirmed factual errors reported post-launch
- **Alerts:** 500+ bill alert subscribers by October launch
- **Judicial:** 100% of November judges with bar ratings in the system

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Cicero API kills free trial early | /my-ballot blocked | Build OpenStates-only fallback; cache aggressively |
| Vercel free tier traffic spike | Site down on election day | Enable Vercel Pro for election week ($20); Edge caching |
| Data error goes viral | Trust/brand damage | Strict confirmed: true discipline; daily data audit in October |
| LegiScan changes pricing | Bills feature crippled | Cache all data in Convex; weekly bulk snapshot as backup |
| November roster late filing (after May 3) | Incomplete candidate coverage | Monitor ILSBE weekly June-August; intelligence cron catches late additions |
| Static JSON deploy lag | Last-minute candidate change not live | Emergency deploy script; GitHub Actions CI/CD stays tight |
| Google Geocoding API quota exceeded | /my-ballot broken | Cache all geocoded addresses in Convex; 40K/mo is plenty at MVP scale |

---

## 11. Open Questions (to be resolved by gap-finder + reviewer agents)

- [ ] Do suburban Cook County municipalities have their own November 2026 local races that need coverage?
- [ ] Chicago aldermanic elections — are they November 2026 or April 2027?
- [ ] How do we handle Cook County voters outside Chicago city limits (unincorporated Cook)?
- [ ] Does Cicero API actually cover all 10 district types from the voter card? CPD and CPS Board?
- [ ] What are the specific eligibility requirements for the IL Local Journalism Sustainability Tax Credit?
- [ ] Are there ChiHackNight or WBEZ tools already doing parts of this we should be aware of?
- [ ] What is the official ballot certification date for Cook County November 2026?
- [ ] Do we need any legal review for the "contact your rep" action feature at scale?

---

*This PRD is version 1.0-DRAFT. Gap-finder and concept-reviewer agent results will be incorporated into v1.1 before GSD2 sprint kick-off.*
