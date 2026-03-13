"use client";

import type { Donor } from "@/lib/types";

const colorMap: Record<string, string> = {
  individual: "#60a5fa",
  pac: "#fb923c",
  "Union PAC": "#fb923c",
  "union pac": "#fb923c",
  Corporate: "#a78bfa",
  corporate: "#a78bfa",
  "dark-money": "#f87171",
  aipac: "#f87171",
  "real-estate": "#a78bfa",
  finance: "#facc15",
  defense: "#94a3b8",
  labor: "#34d399"
};

type DonorTreemapProps = {
  donors: Donor[];
};

export default function DonorTreemap({ donors }: DonorTreemapProps) {
  const filtered = donors.filter((d) => typeof d.amount === "number" && d.amount > 0);

  if (filtered.length === 0) {
    return <div className="border border-jacket-border p-6 text-sm text-zinc-400">No confirmed donor amount data yet.</div>;
  }

  // Group by category
  const grouped = filtered.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = (acc[d.category] ?? 0) + (d.amount as number);
    return acc;
  }, {});

  const total = Object.values(grouped).reduce((s, v) => s + v, 0);
  const segments = Object.entries(grouped)
    .map(([category, amount]) => ({ category, amount, pct: amount / total }))
    .sort((a, b) => b.amount - a.amount);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-3 border border-jacket-border p-3">
      {/* Stacked proportional bar */}
      <div className="flex h-10 w-full overflow-hidden rounded-sm">
        {segments.map((seg) => (
          <div
            key={seg.category}
            style={{
              width: `${seg.pct * 100}%`,
              backgroundColor: colorMap[seg.category] ?? "#525252"
            }}
            title={`${seg.category}: ${fmt(seg.amount)}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((seg) => (
          <div key={seg.category} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: colorMap[seg.category] ?? "#525252" }}
            />
            <span className="font-mono uppercase text-zinc-300">{seg.category.replace(/-/g, " ")}</span>
            <span className="text-zinc-500">{fmt(seg.amount)}</span>
            <span className="text-zinc-600">({(seg.pct * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
