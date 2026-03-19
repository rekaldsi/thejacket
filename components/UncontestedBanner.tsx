"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { translations } from "@/lib/translations";

type UncontestedBannerProps = {
  count: number;
  topCandidate: string;
};

export default function UncontestedBanner({ count, topCandidate }: UncontestedBannerProps) {
  const { lang } = useLanguage();
  const d = translations[lang];
  const officeLabel = count === 1 ? d.uncontested_banner_offices_singular : d.uncontested_banner_offices_plural;

  return (
    <Link
      href="/races/uncontested"
      className="group block border border-jacket-border border-l-4 border-l-jacket-amber bg-jacket-gray px-5 py-4 transition-colors hover:border-l-yellow-400 hover:bg-zinc-800/80"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-jacket-amber" />
            <p className="font-mono text-sm font-black uppercase tracking-[0.18em] text-jacket-amber">
              ⚠️ {d.uncontested_banner_heading}{" "}
              <span className="text-white">
                {count} {officeLabel}
              </span>
            </p>
          </div>
          <p className="pl-4 text-sm text-zinc-400">
            {d.uncontested_banner_body}{" "}
            <span className="text-zinc-500">
              {d.uncontested_banner_featuring} {topCandidate}{" "}
              {count - 1 > 0 ? `${lang === "es" ? "y" : "and"} ${count - 1} ${d.uncontested_banner_and_more}` : `${lang === "es" ? "y" : "and"} ${d.uncontested_banner_and_others}`}.
            </span>
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-jacket-amber group-hover:underline">
          {d.uncontested_banner_cta}
        </span>
      </div>
    </Link>
  );
}
