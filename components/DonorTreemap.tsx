"use client";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import type { Donor } from "@/lib/types";

const colorMap: Record<string, string> = {
  individual: "#3b82f6",
  pac: "#f97316",
  "dark-money": "#dc2626",
  aipac: "#dc2626",
  "real-estate": "#8b5cf6",
  finance: "#eab308",
  defense: "#6b7280",
  labor: "#10b981"
};

type TreemapNode = {
  name: string;
  size: number;
  category: string;
};

type DonorTreemapProps = {
  donors: Donor[];
};

function ContentCell(props: any) {
  const { x, y, width, height, name, category } = props;
  const fill = colorMap[category] ?? "#333333";
  const showLabel = width > 80 && height > 40;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill, stroke: "#0d0d0d", strokeWidth: 1 }} />
      {showLabel ? (
        <text x={x + 6} y={y + 18} fill="#f5f4f0" fontSize={12} fontFamily="JetBrains Mono">
          {name}
        </text>
      ) : null}
    </g>
  );
}

export default function DonorTreemap({ donors }: DonorTreemapProps) {
  const data: TreemapNode[] = donors
    .filter((d) => typeof d.amount === "number" && d.amount > 0)
    .map((d) => ({ name: d.name, size: d.amount as number, category: d.category }));

  if (data.length === 0) {
    return <div className="border border-jacket-border p-6 text-sm text-zinc-400">No confirmed donor amount data yet.</div>;
  }

  return (
    <div className="h-72 w-full border border-jacket-border p-2">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap data={data} dataKey="size" stroke="#0d0d0d" content={<ContentCell />}>
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0
              }).format(value)
            }
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
