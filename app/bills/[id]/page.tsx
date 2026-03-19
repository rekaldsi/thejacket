import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBills, getBill, daysUntilHearing } from "@/lib/bills";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return getAllBills().map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bill = getBill(id);
  if (!bill) return { title: "Bill Not Found — TheJacket" };
  return {
    title: `${bill.bill_number}: ${bill.title} — TheJacket`,
    description: bill.plain_english_title,
  };
}

export default async function BillDetailPage({ params }: Props) {
  const { id } = await params;
  const bill = getBill(id);
  if (!bill) notFound();

  const days = daysUntilHearing(bill);
  const urgentHearing = days !== null && days <= 7;

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* Back */}
      <Link
        href="/bills"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-jacket-amber"
      >
        ← Bills &amp; Legislation
      </Link>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-black uppercase tracking-widest text-jacket-amber">
            {bill.bill_number}
          </span>
          <span className="rounded-sm border border-jacket-amber/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-jacket-amber">
            {bill.status_label}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            {bill.session}
          </span>
        </div>

        <h1 className="text-3xl font-black uppercase leading-tight tracking-tight">
          {bill.title}
        </h1>

        <p className="text-lg text-zinc-300">{bill.plain_english_title}</p>

        {/* Sponsor */}
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          Sponsored by{" "}
          <span className="text-zinc-300">
            {bill.sponsor.name}
          </span>{" "}
          · {bill.sponsor.party} · {bill.sponsor.district}
        </p>
      </header>

      {/* Urgent hearing banner */}
      {bill.next_hearing && (
        <div
          className={`rounded-sm border px-5 py-4 ${
            urgentHearing
              ? "border-orange-400/50 bg-orange-400/10"
              : "border-jacket-amber/40 bg-jacket-amber/5"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="relative mt-0.5 flex h-2.5 w-2.5 shrink-0">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  urgentHearing ? "bg-orange-400" : "bg-jacket-amber"
                }`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  urgentHearing ? "bg-orange-400" : "bg-jacket-amber"
                }`}
              />
            </span>
            <div>
              <p
                className={`font-black uppercase tracking-tight ${
                  urgentHearing ? "text-orange-400" : "text-jacket-amber"
                }`}
              >
                {urgentHearing
                  ? `Hearing in ${days === 0 ? "Today" : `${days} Day${days !== 1 ? "s" : ""}`}`
                  : "Upcoming Hearing"}
              </p>
              <p className="mt-0.5 text-sm text-zinc-300">
                {bill.next_hearing.date} · {bill.next_hearing.time}
              </p>
              <p className="text-sm text-zinc-400">{bill.next_hearing.location}</p>
            </div>
          </div>
        </div>
      )}

      {/* Impact tags */}
      <section>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Impact Tags
        </p>
        <div className="flex flex-wrap gap-2">
          {bill.impact_tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-sm border border-zinc-700 bg-zinc-900/50 px-3 py-1 font-mono text-xs text-zinc-300"
            >
              {tag.emoji} {tag.label}
            </span>
          ))}
        </div>
      </section>

      {/* Summary */}
      <section>
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          What This Bill Does
        </h2>
        <p className="leading-relaxed text-zinc-300">{bill.summary}</p>
        {bill.fiscal_impact && (
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              Fiscal Impact:{" "}
            </span>
            {bill.fiscal_impact}
          </p>
        )}
      </section>

      {/* Both sides */}
      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-green-400">
            What Supporters Say
          </p>
          <ul className="space-y-2">
            {bill.what_supporters_say.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-400">
                <span className="mt-0.5 shrink-0 text-green-600">+</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-jacket-red">
            What Critics Say
          </p>
          <ul className="space-y-2">
            {bill.what_critics_say.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-400">
                <span className="mt-0.5 shrink-0 text-jacket-red">−</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Bill Timeline
        </h2>
        <div className="relative space-y-0">
          {bill.timeline.map((entry, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border ${
                    entry.upcoming
                      ? "border-jacket-amber bg-jacket-amber/30 animate-pulse"
                      : "border-zinc-600 bg-zinc-800"
                  }`}
                />
                {i < bill.timeline.length - 1 && (
                  <div className="w-px flex-1 bg-zinc-800" style={{ minHeight: 24 }} />
                )}
              </div>
              <div className="pb-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                  {entry.date} · {entry.chamber}
                  {entry.upcoming && (
                    <span className="ml-2 text-jacket-amber">upcoming</span>
                  )}
                </p>
                <p className={`text-sm ${entry.upcoming ? "text-jacket-amber font-semibold" : "text-zinc-400"}`}>
                  {entry.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Statutes */}
      {bill.statutes.length > 0 && (
        <section>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Statutes Affected
          </p>
          <div className="flex flex-wrap gap-2">
            {bill.statutes.map((s) => (
              <span
                key={s}
                className="rounded-sm border border-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-600"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <section className="border-t border-jacket-border pt-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Take Action
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={bill.full_text_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-sm border border-jacket-amber px-5 py-2.5 font-mono text-xs font-black uppercase tracking-widest text-jacket-amber transition-colors hover:bg-jacket-amber hover:text-jacket-black"
          >
            Read Full Bill Text →
          </a>
          <a
            href="https://resist.bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-sm border border-zinc-700 px-5 py-2.5 font-mono text-xs font-black uppercase tracking-widest text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
          >
            Contact Your Rep via Resistbot →
          </a>
        </div>
        <p className="mt-3 font-mono text-[10px] text-zinc-600">
          Effective date: {bill.effective_date}
        </p>
      </section>

      {/* Footer note */}
      <section className="border-t border-jacket-border pt-6">
        <p className="text-xs leading-relaxed text-zinc-600">
          TheJacket presents both sides of every bill using facts from official sources. We do not endorse or oppose any legislation.{" "}
          <Link href="/methodology" className="text-jacket-amber hover:underline">
            Read our methodology →
          </Link>
        </p>
      </section>
    </div>
  );
}
