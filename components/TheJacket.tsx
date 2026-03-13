"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Donor } from "@/lib/types";
import DonorTreemap from "@/components/DonorTreemap";
import MoneyAmount from "@/components/MoneyAmount";

type TheJacketProps = {
  totalRaised: number | null;
  donors: Donor[];
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

export default function TheJacket({ totalRaised, donors }: TheJacketProps) {
  const grouped = donors.reduce<Record<string, number>>((acc, donor) => {
    if (typeof donor.amount === "number") {
      acc[donor.category] = (acc[donor.category] ?? 0) + donor.amount;
    }
    return acc;
  }, {});

  const barData = Object.entries(grouped).map(([category, amount]) => ({ category, amount }));

  return (
    <section className="space-y-6 border border-jacket-border p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-mono text-2xl uppercase tracking-wider">The Jacket</h2>
        <p className="text-sm text-zinc-400">
          Total Raised: <MoneyAmount value={totalRaised} className="text-lg" />
        </p>
      </div>

      <DonorTreemap donors={donors} />

      <div className="h-64 border border-jacket-border p-2">
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
              <XAxis type="number" stroke="#f5f4f0" />
              <YAxis dataKey="category" type="category" width={110} stroke="#f5f4f0" />
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
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-400">
            No category totals available.
          </div>
        )}
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
            {donors.length > 0 ? (
              donors.map((donor) => (
                <tr key={`${donor.name}-${donor.category}`} className="border-b border-jacket-border/60">
                  <td className="p-2">{donor.name}</td>
                  <td className="p-2 uppercase">{donor.category}</td>
                  <td className="p-2">
                    <MoneyAmount value={donor.amount} />
                  </td>
                  <td className="p-2">{donor.confirmed ? "confirmed" : "alleged/pending"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-zinc-400">
                  No donor rows yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
