"use client";

import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

export default function UncontestedBadge() {
  const { lang } = useLanguage();
  const d = translations[lang];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm bg-red-900/60 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-widest text-red-300 ring-1 ring-red-700/50">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
      {d.uncontested_badge_label}
    </span>
  );
}
