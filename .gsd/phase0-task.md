# TheJacket — GSD2 Phase 0: Landing Overhaul + SITE_MODE System

## Context
TheJacket (thejacket.cc) is a Cook County civic transparency platform. Full PRD is at PRD-NOVEMBER-2026.md in this repo. Read it before starting.

## Immediate Goal
Fix the landing page — it currently has 4 redundant "Results" touchpoints. Consolidate to a clean, scalable SITE_MODE-driven architecture that will support the full November 2026 feature expansion (bills tracker, /my-ballot, general election candidates).

## Branch
`feat/site-mode-landing-overhaul` — create before any changes. Never touch main.

---

## Task 0.1 — Create lib/siteMode.ts

Create `/Users/jerrycieslik/projects/thejacket/lib/siteMode.ts`:

```ts
/**
 * SITE_MODE — single source of truth for TheJacket's election cycle state.
 * Change this one constant to transition the entire landing page.
 *
 * ELECTION WEEK NOTE: Before Oct 1, 2026:
 *   1. Upgrade to Vercel Pro ($20/mo) — Hobby = 100GB/month, will fail under traffic
 *   2. Add Cloudflare free tier CDN in front of Vercel
 */

export type SiteMode =
  | 'pre-primary'       // Pre-March 17: countdown timer, "Find Your Ballot" CTA
  | 'primary-results'   // Post-March 17: results in, winner/loser display
  | 'between-elections' // Quiet period: bills/intel focus, no election countdown
  | 'pre-november'      // Pre-Nov 3: countdown to general election, /my-ballot CTA live
  | 'november-results'  // Post-Nov 3: general election results

export const SITE_MODE: SiteMode = 'primary-results'

export const SITE_COPY = {
  'pre-primary': {
    dateline: 'MARCH 17, 2026 · COOK COUNTY PRIMARY',
    tagline: 'Every candidate. Every dollar. Every red flag.',
    statusPill: null,
    primaryCTA: { label: 'Find Your Ballot →', href: '/races' },
    secondaryCTA: null,
  },
  'primary-results': {
    dateline: 'MARCH 17, 2026 · COOK COUNTY PRIMARY',
    tagline: 'The primary is over. See who won, what it means, and who owns them.',
    statusPill: { label: 'March 17 Primary — Results In', color: 'green' as const },
    primaryCTA: { label: 'All Results →', href: '/results' },
    secondaryCTA: { label: '⚖️ Judge Results', href: '/results/judges' },
  },
  'between-elections': {
    dateline: 'COOK COUNTY · NOVEMBER 2026',
    tagline: 'Every candidate. Every bill. Every dollar. Every red flag.',
    statusPill: { label: 'November 3, 2026 General Election', color: 'amber' as const },
    primaryCTA: { label: 'Browse Candidates →', href: '/races' },
    secondaryCTA: { label: 'Active Bills', href: '/bills' },
  },
  'pre-november': {
    dateline: 'NOVEMBER 3, 2026 · COOK COUNTY GENERAL',
    tagline: 'The general election is coming. Know every candidate, every bill, every dollar.',
    statusPill: { label: 'November 3, 2026 — General Election', color: 'amber' as const },
    primaryCTA: { label: 'Find Your Ballot →', href: '/my-ballot' },
    secondaryCTA: { label: 'Browse Candidates', href: '/races' },
  },
  'november-results': {
    dateline: 'NOVEMBER 3, 2026 · COOK COUNTY GENERAL',
    tagline: 'The general election results are in.',
    statusPill: { label: 'November 3 General — Results In', color: 'green' as const },
    primaryCTA: { label: 'General Results →', href: '/results/general' },
    secondaryCTA: { label: '⚖️ Judge Results', href: '/results/judges' },
  },
} satisfies Record<SiteMode, {
  dateline: string
  tagline: string
  statusPill: { label: string; color: 'green' | 'amber' } | null
  primaryCTA: { label: string; href: string }
  secondaryCTA: { label: string; href: string } | null
}>
```

## Task 0.2 — Refactor HeroSection.tsx

Update `components/HeroSection.tsx` to:
1. Import `SITE_MODE` and `SITE_COPY` from `lib/siteMode`
2. Remove the hardcoded `RESULTS_MODE = true` constant
3. Replace the inline `ResultsBanner` component in HeroSection with a status pill derived from `SITE_COPY[SITE_MODE].statusPill`
4. Make the CTA buttons derive from `SITE_COPY[SITE_MODE].primaryCTA` and `secondaryCTA`
5. Make the dateline text derive from `SITE_COPY[SITE_MODE].dateline`
6. Make the tagline derive from `SITE_COPY[SITE_MODE].tagline`
7. Keep the jacket image, Robin Williams quote, and all animations exactly as-is
8. Keep CountdownWidget for pre-primary and pre-november modes (show countdown when SITE_MODE is 'pre-primary' or 'pre-november')

## Task 0.3 — Refactor app/page.tsx

In `app/page.tsx`:
1. Remove the `ResultsBanner` server component (the function definition AND the `<ResultsBanner />` JSX at line ~207)
2. Remove the entire "FIND YOUR FULL BALLOT / See Who Won" section at the bottom of the page
3. Add a new `IntelGrid` section immediately below the Hero. This replaces both removed sections.

The `IntelGrid` is a 1-3 card grid section with the heading "INTELLIGENCE OVERVIEW" (or similar). It should be SITE_MODE-aware:

**In 'primary-results' mode — show 1 card:**
```
[Card: March 17 Results]
● Results Live  (green dot)
Primary results for all 91 candidates
Updated {timestamp from results-manifest.json}
[VIEW ALL RESULTS →] button
```

**In 'pre-november' or 'between-elections' mode — show 3 cards:**
```
[Card 1: Results Archive]    [Card 2: Active Bills]       [Card 3: Your Ballot]
Primary results archive      X bills in committee          Enter your address
View March 17 outcomes       this week                    See your exact ballot
[VIEW RESULTS →]             [VIEW BILLS →]               [MY BALLOT →]
```

Cards use the existing border/amber design language. Each card is a `<Link>` wrapping. The Bills and My Ballot cards in non-primary modes should be `opacity-50 cursor-not-allowed` styled with a "Coming November 2026" badge if those routes don't exist yet — do NOT link to non-existent pages.

## Task 0.4 — Update StartHereBanner.tsx

Update `components/StartHereBanner.tsx` to be SITE_MODE-aware:
- In 'primary-results': shows "● Results In" (green, links to /results) — same as now
- In 'pre-november': shows "● Nov 3 · {X days}" (amber)
- In 'between-elections': hide entirely (return null)
- In 'november-results': shows "● Results In" (green, links to /results/general)

## Task 0.5 — Nav placeholder links

In the main nav component (find it — likely `components/Nav.tsx` or similar):
Add two placeholder nav items after ABOUT:
- `BILLS` — styled with `opacity-40 cursor-not-allowed` and a `title="Coming November 2026"` tooltip. No href or href="#".
- `MY BALLOT` — same treatment.

This communicates the roadmap without linking to dead pages.

## Task 0.6 — Cleanup

- Search for any remaining `RESULTS_MODE` references in the codebase and remove/replace with SITE_MODE
- Ensure `npm run build` passes with zero errors
- Ensure `npm run lint` passes (or note any pre-existing lint issues that aren't new)

---

## Success Criteria
- [ ] `lib/siteMode.ts` exists with full type definitions
- [ ] Landing page has exactly 2 results touchpoints: hero CTA buttons + IntelGrid card (not 4)
- [ ] ResultsBanner server component removed from page.tsx
- [ ] "See Who Won" bottom section removed from page.tsx  
- [ ] StartHereBanner is SITE_MODE-aware
- [ ] Nav has Bills + My Ballot placeholder items
- [ ] `npm run build` passes
- [ ] All existing pages (results, races, judges, scorecard, booth) still work
- [ ] No RESULTS_MODE references remaining

## When Done
1. Commit to `feat/site-mode-landing-overhaul` branch
2. Write summary to `/tmp/gsd-phase0-result.md`
3. Run: `openclaw system event --text "GSD Phase 0 complete: SITE_MODE system + landing overhaul committed to feat/site-mode-landing-overhaul. Ready to review and merge." --mode now`
