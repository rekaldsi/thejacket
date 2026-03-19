/**
 * SITE_MODE — single flag that drives all landing copy, CTAs, pills, and banners.
 *
 * To transition the site between election phases, change ONLY this one export.
 * All landing components derive their state from this constant.
 *
 * Transition timeline (Cook County 2026):
 *   primary-results   → March 17 onward (current)
 *   between-elections → after primary cycle settles, bills/intel focus
 *   pre-november      → ~October 1, 2026 — countdown to Nov 3, /my-ballot CTA
 *   november-results  → November 3, 2026 evening onward
 */

export type SiteMode =
  | "pre-primary"       // countdown, find ballot CTA
  | "primary-results"   // March 17 primary — results CTAs (current)
  | "between-elections" // clean state, bills/intel focus
  | "pre-november"      // countdown to Nov 3, /my-ballot CTA
  | "november-results"; // general election results

export const SITE_MODE: SiteMode = "primary-results";

// ─── Mode-derived config ─────────────────────────────────────────────────────
// Centralized config objects so landing components just pull from here.

export type SiteModeConfig = {
  /** Short label for the status pill in the hero */
  statusPillLabel: string;
  /** Tailwind color class for the status dot */
  statusDotColor: string;
  /** Hero tagline (below THE JACKET wordmark) */
  heroTagline: string;
  /** Hero dateline (above wordmark) */
  dateline: string;
  /** Primary CTA button label */
  ctaLabel: string;
  /** Primary CTA href */
  ctaHref: string;
  /** Secondary CTA label (null = hide) */
  ctaSecondaryLabel: string | null;
  /** Secondary CTA href */
  ctaSecondaryHref: string | null;
  /** StartHereBanner collapsed pill text */
  startHerePillText: string;
  /** StartHereBanner expanded header */
  startHereHeader: string;
  /** StartHereBanner primary link label */
  startHerePrimaryLabel: string;
  /** StartHereBanner primary link href */
  startHerePrimaryHref: string;
  /** StartHereBanner secondary link label (null = hide) */
  startHereSecondaryLabel: string | null;
  /** StartHereBanner secondary link href */
  startHereSecondaryHref: string | null;
  /** Intel Grid card set key for IntelGrid component */
  intelGridVariant: "primary-results" | "pre-november" | "between-elections" | "default";
};

const CONFIGS: Record<SiteMode, SiteModeConfig> = {
  "pre-primary": {
    statusPillLabel: "March 17 Primary — Countdown",
    statusDotColor: "bg-jacket-amber",
    heroTagline:
      "Every candidate. Every dollar. Every red flag. Know who owns your ballot before you cast it.",
    dateline: "March 17, 2026 · Cook County Primary",
    ctaLabel: "Find Your Ballot →",
    ctaHref: "/races",
    ctaSecondaryLabel: "View All Races",
    ctaSecondaryHref: "/races",
    startHerePillText: "Mar 17 · Countdown",
    startHereHeader: "Primary in Countdown",
    startHerePrimaryLabel: "Find Your Ballot →",
    startHerePrimaryHref: "/races",
    startHereSecondaryLabel: "Browse All Races",
    startHereSecondaryHref: "/races",
    intelGridVariant: "default",
  },
  "primary-results": {
    statusPillLabel: "March 17 Primary — Results In",
    statusDotColor: "bg-green-500",
    heroTagline:
      "The primary is over. See who won, what it means, and who owns them.",
    dateline: "March 17, 2026 · Cook County Primary",
    ctaLabel: "All Results →",
    ctaHref: "/results",
    ctaSecondaryLabel: "⚖️ Judge Results",
    ctaSecondaryHref: "/results/judges",
    startHerePillText: "● Results In",
    startHereHeader: "Results Are In",
    startHerePrimaryLabel: "All Results →",
    startHerePrimaryHref: "/results",
    startHereSecondaryLabel: "⚖️ Judge Results",
    startHereSecondaryHref: "/results/judges",
    intelGridVariant: "primary-results",
  },
  "between-elections": {
    statusPillLabel: "Cook County Civic Intelligence",
    statusDotColor: "bg-jacket-amber",
    heroTagline:
      "Every bill. Every vote. Every dollar. The civic transparency layer Cook County didn't know it needed.",
    dateline: "Cook County · Illinois",
    ctaLabel: "Browse Bills →",
    ctaHref: "/bills",
    ctaSecondaryLabel: "March 17 Results Archive",
    ctaSecondaryHref: "/results",
    startHerePillText: "● Live Intel",
    startHereHeader: "Civic Intelligence",
    startHerePrimaryLabel: "Browse Bills →",
    startHerePrimaryHref: "/bills",
    startHereSecondaryLabel: "Results Archive",
    startHereSecondaryHref: "/results",
    intelGridVariant: "between-elections",
  },
  "pre-november": {
    statusPillLabel: "November 3 General — Coming Soon",
    statusDotColor: "bg-jacket-amber",
    heroTagline:
      "November 3 is coming. Know every candidate, every ballot measure, and exactly what's on YOUR ballot.",
    dateline: "November 3, 2026 · Cook County General",
    ctaLabel: "My Ballot →",
    ctaHref: "/my-ballot",
    ctaSecondaryLabel: "Results Archive",
    ctaSecondaryHref: "/results",
    startHerePillText: "● Nov 3 · Countdown",
    startHereHeader: "Nov 3 General",
    startHerePrimaryLabel: "My Ballot →",
    startHerePrimaryHref: "/my-ballot",
    startHereSecondaryLabel: "Results Archive",
    startHereSecondaryHref: "/results",
    intelGridVariant: "pre-november",
  },
  "november-results": {
    statusPillLabel: "November 3 General — Results In",
    statusDotColor: "bg-green-500",
    heroTagline:
      "November 3 results are in. See who won every Cook County and Illinois race.",
    dateline: "November 3, 2026 · Cook County General",
    ctaLabel: "All Results →",
    ctaHref: "/results",
    ctaSecondaryLabel: "⚖️ Judicial Results",
    ctaSecondaryHref: "/results/judges",
    startHerePillText: "● Nov 3 Results In",
    startHereHeader: "Results Are In",
    startHerePrimaryLabel: "All Results →",
    startHerePrimaryHref: "/results",
    startHereSecondaryLabel: "⚖️ Judicial Results",
    startHereSecondaryHref: "/results/judges",
    intelGridVariant: "default",
  },
};

export function getSiteModeConfig(): SiteModeConfig {
  return CONFIGS[SITE_MODE];
}
