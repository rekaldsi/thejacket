"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Donor } from "@/lib/types";
import DonorTreemap from "@/components/DonorTreemap";
import MoneyAmount from "@/components/MoneyAmount";

type TheJacketProps = {
  candidateName: string;
  totalRaised: number | null;
  donors: Donor[];
  sourceCitation?: string;
};

const categoryColor: Record<string, string> = {
  individual: "#3b82f6",
  pac: "#f97316",
  "dark-money": "#dc2626",
  aipac: "#dc2626",
  "real-estate": "#8b5cf6",
  finance: "#eab308",
  defense: "#6b7280",
  labor: "#10b981"
};

export default function TheJacket({ candidateName, totalRaised, donors, sourceCitation }: TheJacketProps) {
  const donorsWithAmounts = donors.filter((d) => typeof d.amount === "number" && d.amount > 0);

  const grouped = donorsWithAmounts.reduce<Record<string, number>>((acc, donor) => {
    acc[donor.category] = (acc[donor.category] ?? 0) + (donor.amount as number);
    return acc;
  }, {});

  const barData = Object.entries(grouped)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <section className="space-y-6 border border-jacket-border p-4">
      <div className="space-y-2">
        <h2 className="font-mono text-3xl font-black uppercase text-jacket-amber">THE JACKET</h2>
        <p className="text-sm text-zinc-400">Who funds {candidateName}?</p>
        {totalRaised === null ? (
          <p className="font-mono text-5xl text-zinc-500">DATA PENDING</p>
        ) : (
          <MoneyAmount value={totalRaised} className="text-5xl" />
        )}
        <p className="text-xs text-zinc-600">Source: {sourceCitation || "Public disclosure filings"}</p>
      </div>

      {donorsWithAmounts.length === 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex min-h-16 items-center justify-center border border-dashed border-zinc-800 p-3 text-center text-xs text-zinc-600"
            >
              FEC DATA PENDING
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="min-h-48">
            <DonorTreemap donors={donorsWithAmounts} />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {barData.map((row) => (
              <span key={row.category} className="inline-flex items-center gap-2 rounded-full border border-jacket-border px-2 py-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: categoryColor[row.category] ?? "#525252" }} />
                <span className="font-mono uppercase text-zinc-300">{row.category.replace(/-/g, " ")}</span>
              </span>
            ))}
          </div>

          <div className="h-72 border border-jacket-border p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 10, top: 10, bottom: 10 }}>
                <XAxis type="number" stroke="#71717a" />
                <YAxis dataKey="category" type="category" width={120} stroke="#a1a1aa" className="font-mono text-xs" />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0
                    }).format(value)
                  }
                />
                <Bar dataKey="amount">
                  {barData.map((entry) => (
                    <Cell key={entry.category} fill={categoryColor[entry.category] ?? "#444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-hidden border border-jacket-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-jacket-border bg-jacket-gray/30 text-left">
                  <th className="p-2 font-mono">Donor</th>
                  <th className="p-2 font-mono">Category</th>
                  <th className="p-2 font-mono">Amount</th>
                  <th className="p-2 font-mono">Status</th>
                </tr>
              </thead>
              <tbody>
                {donorsWithAmounts.map((donor) => (
                  <tr key={`${donor.name}-${donor.category}`} className="odd:bg-jacket-gray/20">
                    <td className="p-2">{donor.name}</td>
                    <td className="p-2 font-mono uppercase text-zinc-300">{donor.category}</td>
                    <td className="p-2">
                      <MoneyAmount value={donor.amount} />
                    </td>
                    <td className="p-2 text-zinc-400">{donor.confirmed ? "confirmed" : "alleged/pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
