import type { RedFlag } from "@/lib/types";

type RedFlagBadgeProps = {
  flag: RedFlag;
};

export default function RedFlagBadge({ flag }: RedFlagBadgeProps) {
  return (
    <article className="border border-jacket-border bg-jacket-black p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-mono">
        <span>{flag.confirmed ? "🚩" : "⚠️"}</span>
        <span className="border border-jacket-border px-2 py-1 text-jacket-amber">{flag.type}</span>
        <span className="text-jacket-white">{flag.label}</span>
      </div>
      <p className="text-sm leading-relaxed text-jacket-white">{flag.detail}</p>
      <p className="mt-2 text-xs text-zinc-400">Source: {flag.source}</p>
    </article>
  );
}
