import { getAllBills, getUrgentBills } from "@/lib/bills";
import type { Metadata } from "next";
import BillsPageClient from "./BillsPageClient";

export const metadata: Metadata = {
  title: "Bills & Legislation — TheJacket",
  description:
    "Track Illinois state bills affecting Cook County voters. Plain-English summaries, impact tags, hearing dates, and what both sides say.",
};

export default function BillsPage() {
  const bills = getAllBills();
  const urgent = getUrgentBills(14);
  return <BillsPageClient bills={bills} urgent={urgent} />;
}
