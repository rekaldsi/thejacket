import Link from "next/link";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { SITE_MODE } from "@/lib/siteMode";

// ─── Card types ───────────────────────────────────────────────────────────────

type IntelCard = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  meta: string | null;
  href: string;
  ctaLabel: string;
  /** Tailwind border-color class variant */
  accent: "amber" | "green" | "blue" | "coming-soon";
};

// ─── Results timestamp from manifest ─────────────────────────────────────────

function getResultsTimestamp(): string | null {
  try {
    const p = path.join(process.cwd(), "data", "results-manifest.json");
    if (!existsSync(p)) return null;
    const manifest = JSON.parse(readFileSync(p, "utf-8")) as { last_updated?: string };
    if (!manifest.last_updated) return null;
    return new Date(manifest.last_updated).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Chicago",
      timeZoneName: "short",
    });
  } catch {
    return null;
  }
}

// ─── Card sets per mode ───────────────────────────────────────────────────────

function getCards(
  mode: typeof SITE_MODE,
  resultsTimestamp: string | null
): IntelCard[] {
  if (mode === "primary-results") {
    return [
      {
        id: "results",
        eyebrow: "March 17, 2026 Primary",
        title: "Results Archive",
        description: "Full results for every Cook County and Illinois race — plus judicial results no other outlet is tracking.",
        meta: resultsTimestamp ? `Updated ${resultsTimestamp}` : "Results live",
        href: "/results",
        ctaLabel: "View All Results →",
        accent: "green",
      },
    ];
  }

  if (mode === "pre-november") {
    return [
      {
        id: "my-ballot",
        eyebrow: "November 3, 2026",
        title: "Your Ballot",
        description: "Enter your address to see every race and ballot measure on your specific ballot, with full intelligence on each.",
        meta: null,
        href: "/my-ballot",
        ctaLabel: "Look Up My Ballot →",
        accent: "amber",
      },
      {
        id: "results-archive",
        eyebrow: "March 17 Primary",
        title: "Results Archive",
        description: "Primary winners, judicial outcomes, and the full Cook County record from the March 17 primary.",
        meta: null,
        href: "/results",
        ctaLabel: "View Archive →",
        accent: "green",
      },
      {
        id: "bills",
        eyebrow: "Illinois Legislature",
        title: "Active Bills",
        description: "Track Illinois state bills, Chicago City Council ordinances, and Cook County Board resolutions — with plain-English summaries.",
        meta: null,
        href: "/bills",
        ctaLabel: "Browse Bills →",
        accent: "blue",
      },
    ];
  }

  if (mode === "between-elections") {
    return [
      {
        id: "bills",
        eyebrow: "Illinois Legislature",
        title: "Active Bills",
        description: "Track Illinois state bills, Chicago City Council ordinances, and Cook County Board resolutions — with plain-English summaries.",
        meta: null,
        href: "/bills",
        ctaLabel: "Browse Bills →",
        accent: "amber",
      },
      {
        id: "results-archive",
        eyebrow: "March 17 Primary",
        title: "Results Archive",
        description: "Primary winners, judicial outcomes, and the full Cook County record from the March 17 primary.",
        meta: null,
        href: "/results",
        ctaLabel: "View Archive →",
        accent: "green",
      },
    ];
  }

  // Default / pre-primary / november-results
  return [
    {
      id: "races",
      eyebrow: "Cook County",
      title: "All Races",
      description: "Every candidate, every race — with finance, red flags, and our proprietary transparency score.",
      meta: null,
      href: "/races",
      ctaLabel: "Browse Races →",
      accent: "amber",
    },
  ];
}

// ─── Accent styles ────────────────────────────────────────────────────────────

const ACCENT_STYLES: Record<IntelCard["accent"], string> = {
  amber:
    "border-jacket-amber/50 hover:border-jacket-amber bg-jacket-amber/5 hover:bg-jacket-amber/8",
  green:
    "border-green-500/40 hover:border-green-500 bg-green-500/5 hover:bg-green-500/8",
  blue: "border-blue-500/30 hover:border-blue-400 bg-blue-500/5 hover:bg-blue-500/8",
  "coming-soon": "border-zinc-700/50 bg-zinc-900/30 opacity-60 cursor-default",
};

const EYEBROW_STYLES: Record<IntelCard["accent"], string> = {
  amber: "text-jacket-amber",
  green: "text-green-400",
  blue: "text-blue-400",
  "coming-soon": "text-zinc-600",
};

const CTA_STYLES: Record<IntelCard["accent"], string> = {
  amber: "text-jacket-amber group-hover:underline",
  green: "text-green-400 group-hover:underline",
  blue: "text-blue-400 group-hover:underline",
  "coming-soon": "text-zinc-600",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function IntelGrid() {
  const resultsTimestamp = getResultsTimestamp();
  const cards = getCards(SITE_MODE, resultsTimestamp);

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-mono text-xs font-black uppercase tracking-[0.22em] text-jacket-amber">
          Platform Intel
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          {cards.length} section{cards.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div
        className={`grid gap-4 ${
          cards.length === 1
            ? "md:grid-cols-1 max-w-xl"
            : cards.length === 2
            ? "sm:grid-cols-2"
            : "sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {cards.map((card) => {
          if (card.accent === "coming-soon") {
            return (
              <div
                key={card.id}
                className={`rounded-sm border p-5 transition-colors ${ACCENT_STYLES[card.accent]}`}
              >
                <CardInner card={card} />
              </div>
            );
          }
          return (
            <Link
              key={card.id}
              href={card.href}
              className={`group rounded-sm border p-5 transition-colors ${ACCENT_STYLES[card.accent]}`}
            >
              <CardInner card={card} eyebrowClass={EYEBROW_STYLES[card.accent]} ctaClass={CTA_STYLES[card.accent]} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CardInner({
  card,
  eyebrowClass = "text-zinc-500",
  ctaClass = "text-zinc-500",
}: {
  card: IntelCard;
  eyebrowClass?: string;
  ctaClass?: string;
}) {
  return (
    <>
      <p className={`mb-1 font-mono text-[10px] uppercase tracking-widest ${eyebrowClass}`}>
        {card.eyebrow}
      </p>
      <h3 className="mb-1.5 text-base font-black uppercase leading-snug text-jacket-white">
        {card.title}
      </h3>
      <p className="mb-3 text-sm leading-relaxed text-zinc-400">{card.description}</p>
      {card.meta && (
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">{card.meta}</p>
      )}
      <span className={`font-mono text-xs font-black uppercase tracking-widest ${ctaClass}`}>
        {card.ctaLabel}
      </span>
    </>
  );
}
