import Link from "next/link";

type UncontestedBannerProps = {
  count: number;
  topCandidate: string;
};

export default function UncontestedBanner({ count, topCandidate }: UncontestedBannerProps) {
  const officeLabel = count === 1 ? "office" : "offices";

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
              ⚠️ Running Alone —{" "}
              <span className="text-white">
                {count} {officeLabel} with no competition
              </span>
            </p>
          </div>
          <p className="pl-4 text-sm text-zinc-400">
            No challenger doesn&apos;t mean no record.{" "}
            <span className="text-zinc-500">
              Featuring {topCandidate} and {count - 1 > 0 ? `${count - 1} more` : "others"}.
            </span>
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-jacket-amber group-hover:underline">
          See the full list →
        </span>
      </div>
    </Link>
  );
}
