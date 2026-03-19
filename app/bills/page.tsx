import Link from "next/link";
import { getAllBills, getUrgentBills, daysUntilHearing } from "@/lib/bills";
import type { Bill } from "@/lib/bills";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bills & Legislation — TheJacket",
  description:
    "Track Illinois state bills affecting Cook County voters. Plain-English summaries, impact tags, hearing dates, and what both sides say.",
};

function StatusPill({ bill }: { bill: Bill }) {
  const urgent = daysUntilHearing(bill);
  if (urgent !== null && urgent <= 7) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-orange-400/40 bg-orange-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-orange-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-400" />
        </span>
        Hearing in {urgent === 0 ? "today" : `${urgent}d`}
      </span>
    );
  }
  if (urgent !== null && urgent <= 14) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-jacket-amber/40 bg-jacket-amber/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-jacket-amber">
        ⚠️ Hearing in {urgent}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-zinc-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
      {bill.status_label}
    </span>
  );
}

function BillCard({ bill }: { bill: Bill }) {
  const days = daysUntilHearing(bill);
  return (
    <Link
      href={`/bills/${bill.id}`}
      className="group block border border-jacket-border p-5 transition-colors hover:border-jacket-amber hover:bg-jacket-amber/5"
    >
      {/* Bill number + status */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-black uppercase tracking-widest text-jacket-amber">
          {bill.bill_number}
        </span>
        <StatusPill bill={bill} />
        {bill.featured && (
          <span className="rounded-sm bg-jacket-amber/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-jacket-amber">
            Featured
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="mb-2 text-base font-black uppercase leading-snug text-jacket-white transition-colors group-hover:text-jacket-amber">
        {bill.title}
      </h2>

      {/* Plain English */}
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-zinc-400">
        {bill.plain_english_title}
      </p>

      {/* Impact tags */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {bill.impact_tags.slice(0, 3).map((tag) => (
          <span
            key={tag.id}
            className="rounded-sm border border-zinc-700 px-2 py-0.5 font-mono text-[10px] text-zinc-400"
          >
            {tag.emoji} {tag.label}
          </span>
        ))}
        {bill.impact_tags.length > 3 && (
          <span className="rounded-sm border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
            +{bill.impact_tags.length - 3} more
          </span>
        )}
      </div>

      {/* Hearing alert */}
      {bill.next_hearing && (
        <p className="mb-3 font-mono text-[11px] text-orange-400">
          ⚠️ {bill.next_hearing.label}
        </p>
      )}

      {/* Sponsor + CTA */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          {bill.sponsor.name} · {bill.sponsor.party.charAt(0)}
        </span>
        <span className="font-mono text-xs font-black uppercase tracking-widest text-jacket-amber opacity-0 transition-opacity group-hover:opacity-100">
          Read Bill →
        </span>
      </div>
    </Link>
  );
}

export default function BillsPage() {
  const bills = getAllBills();
  const urgent = getUrgentBills(14);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
          Illinois Legislature · Cook County
        </p>
        <h1 className="mb-3 text-4xl font-black uppercase tracking-tight">
          Bills &amp; Legislation
        </h1>
        <p className="max-w-xl text-zinc-400">
          Plain-English tracking of Illinois state bills that affect Cook County voters. No spin — just the facts, both sides, and what it means for you.
        </p>
      </div>

      {/* Urgent — hearing soon */}
      {urgent.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-400" />
            </span>
            <h2 className="font-mono text-xs font-black uppercase tracking-[0.22em] text-orange-400">
              Hearings This Week
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              {urgent.length} bill{urgent.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {urgent.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </section>
      )}

      {/* All bills */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-xs font-black uppercase tracking-[0.22em] text-jacket-amber">
            All Tracked Bills
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            {bills.length} bill{bills.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {bills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      </section>

      {/* Methodology note */}
      <section className="border-t border-jacket-border pt-8">
        <p className="text-xs leading-relaxed text-zinc-600">
          TheJacket tracks bills that directly affect Cook County residents. Summaries are written in plain English from official bill text — no editorializing. We present what supporters say and what critics say, sourced to official records. Both sides, always.{" "}
          <Link href="/methodology" className="text-jacket-amber hover:underline">
            Read our methodology →
          </Link>
        </p>
      </section>
    </div>
  );
}
