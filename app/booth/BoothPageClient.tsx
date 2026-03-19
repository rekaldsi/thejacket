"use client";

import BoothBuilder, { type BoothSection, type BoothJudicialRace } from "@/components/BoothBuilder";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

type Props = {
  sections: BoothSection[];
  judicialRaces: BoothJudicialRace[];
};

export default function BoothPageClient({ sections, judicialRaces }: Props) {
  const { lang } = useLanguage();
  const d = translations[lang];

  return (
    <div className="space-y-10 pb-16">

      {/* Header */}
      <section className="space-y-3 border-b border-jacket-border pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-jacket-amber">
          {d.booth_header_dateline}
        </p>
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight md:text-6xl">
          {d.booth_header_title}
        </h1>
        <p className="text-zinc-300">
          {d.booth_header_desc}
        </p>
        <p className="font-mono text-xs text-zinc-500">
          {d.booth_header_disclaimer}
        </p>
      </section>

      {/* Interactive ballot builder */}
      <BoothBuilder sections={sections} judicialRaces={judicialRaces} />

    </div>
  );
}
