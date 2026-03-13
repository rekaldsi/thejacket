import Link from "next/link";
import type { AccountabilityGap as AccountabilityGapType } from "@/lib/types";

type AccountabilityGapProps = {
  gap: AccountabilityGapType;
};

export default function AccountabilityGap({ gap }: AccountabilityGapProps) {
  return (
    <div className="space-y-6 rounded-sm border border-jacket-border bg-jacket-gray/50 p-5">
      {/* Header */}
      <div>
        <h3 className="border-l-2 border-jacket-amber pl-3 text-sm font-black uppercase tracking-widest text-zinc-200">
          Who&apos;s Watching?
        </h3>
        <p className="mt-2 pl-5 text-sm text-zinc-400">
          The Sheriff runs the jail. But the Sheriff isn&apos;t the only check. These bodies have oversight power — and accountability of their own.
        </p>
      </div>

      {/* Oversight bodies */}
      <div className="space-y-4">
        {gap.oversight_bodies.map((body) => (
          <div key={body.name} className="border-l-2 border-zinc-700 pl-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-jacket-white">{body.name}</span>
              {body.race_link ? (
                <Link
                  href={`/race/${body.race_link}`}
                  className="font-mono text-xs text-jacket-amber hover:underline"
                >
                  → See race on TheJacket
                </Link>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-zinc-400">{body.role}</p>
            <p className="mt-1.5 text-xs font-medium text-orange-400">
              ↳ {body.action}
            </p>
          </div>
        ))}
      </div>

      {/* What can I do */}
      <div>
        <h4 className="mb-3 font-mono text-xs font-black uppercase tracking-widest text-jacket-amber">
          What Can I Do?
        </h4>
        <p className="mb-3 text-sm text-zinc-500">
          You can&apos;t vote against Thomas Dart in the primary. But you can:
        </p>
        <ol className="space-y-2">
          {gap.what_you_can_do.map((action, i) => (
            <li key={i} className="flex gap-3 text-sm text-zinc-300">
              <span className="shrink-0 font-mono text-jacket-amber">{i + 1}.</span>
              <span>{action}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Read more */}
      <div>
        <h4 className="mb-3 font-mono text-xs font-black uppercase tracking-widest text-jacket-amber">
          Read More
        </h4>
        <ul className="space-y-1.5">
          {gap.read_more.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-zinc-400 hover:text-jacket-amber hover:underline"
              >
                ↗ {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
