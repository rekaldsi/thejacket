import type { RedFlag } from "@/lib/types";

type RedFlagBadgeProps = {
  flag: RedFlag;
};

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export default function RedFlagBadge({ flag }: RedFlagBadgeProps) {
  return (
    <article className="w-full rounded-sm border-l-4 border-jacket-red bg-red-950/20 p-4">
      <div className="flex items-center gap-2 text-sm">
        <span>{flag.confirmed ? "🚩" : "⚠️"}</span>
        <span className="rounded-sm bg-jacket-red px-2 py-0.5 font-mono text-xs uppercase text-white">{flag.type}</span>
        <span className="font-bold text-jacket-white">{flag.label}</span>
      </div>

      <p className={`mt-2 text-sm leading-relaxed text-zinc-300 ${!flag.confirmed ? "italic" : ""}`}>{flag.detail}</p>

      <p className="mt-2 text-xs text-zinc-500">
        Source:{" "}
        {isHttpUrl(flag.source) ? (
          <a href={flag.source} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-jacket-amber">
            &rarr; {flag.source}
          </a>
        ) : (
          <span>{flag.source}</span>
        )}
      </p>
    </article>
  );
}
