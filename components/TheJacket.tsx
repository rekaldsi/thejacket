"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Donor } from "@/lib/types";
import DonorTreemap from "@/components/DonorTreemap";
import MoneyAmount from "@/components/MoneyAmount";

type TheJacketProps = {
  candidateName: string;
  totalRaised: number | null;
  donors: Donor[];
  sourceCitation?: string;
  donorsNote?: string;
};

const categoryColor: Record<string, string> = {
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

export default function TheJacket({ candidateName, totalRaised, donors, sourceCitation, donorsNote }: TheJacketProps) {
  const donorsWithAmounts = donors.filter((d) => typeof d.amount === "number" && d.amount > 0);

  const grouped = donorsWithAmounts.reduce<Record<string, number>>((acc, donor) => {
    acc[donor.category] = (acc[donor.category] ?? 0) + (donor.amount as number);
    return acc;
  }, {});

  const barData = Object.entries(grouped)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Compute partial donor coverage warning
  const listedTotal = donorsWithAmounts.reduce((sum, d) => sum + (d.amount as number), 0);
  const coveragePct = totalRaised && totalRaised > 0 ? listedTotal / totalRaised : null;
  const showPartialNote = coveragePct !== null && coveragePct < 0.9 && donorsWithAmounts.length > 0;

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
        <div className="border border-dashed border-zinc-800 p-4 space-y-2">
          <p className="text-sm text-zinc-400">No donor breakdown available yet.</p>
          <p className="text-xs text-zinc-600">
            This candidate has limited public financial disclosure. Check{" "}
            <a href="https://www.fec.gov/data/candidates/" target="_blank" rel="noreferrer" className="text-jacket-amber hover:underline">FEC.gov</a>
            {" "}or{" "}
            <a href="https://www.illinoissunshine.org/" target="_blank" rel="noreferrer" className="text-jacket-amber hover:underline">IllinoisSunshine.org</a>
            {" "}for filing details.
          </p>
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

          <div className="h-80 border border-jacket-border p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 50, top: 10, bottom: 10 }}>
                <XAxis
                  type="number"
                  stroke="#71717a"
                  tickFormatter={(v: number) => "$" + (v / 1000).toFixed(0) + "k"}
                />
                <YAxis dataKey="category" type="category" width={100} stroke="#a1a1aa" className="font-mono text-xs" />
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
                  <LabelList
                    dataKey="amount"
                    position="right"
                    fill="#a1a1aa"
                    formatter={(v: number) => "$" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto border border-jacket-border">
            <table className="w-full min-w-[520px] border-collapse text-sm">
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

          {(showPartialNote || donorsNote) && (
            <div className="border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-400">
              {donorsNote
                ? donorsNote
                : coveragePct !== null
                  ? `Showing ${donorsWithAmounts.length} donor${donorsWithAmounts.length !== 1 ? "s" : ""} (${Math.round(coveragePct * 100)}% of total raised). See source filing for full breakdown.`
                  : null}
            </div>
          )}
        </>
      )}
    </section>
  );
}
