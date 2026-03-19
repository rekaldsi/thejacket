import type { Metadata } from "next";
import { getAllJudges } from "@/lib/data";
import JudicialResults from "@/components/JudicialResults";
import JudgesResultsPageClient from "./JudgesResultsPageClient";

export const metadata: Metadata = {
  title: "2026 Illinois Primary Judge Results — TheJacket.cc",
  description:
    "March 17, 2026 Cook County judicial primary results — contested races and retention votes with bar association ratings. First site in Chicago tracking all 23 judicial races.",
  openGraph: {
    title: "2026 Illinois Primary Judge Results — TheJacket.cc",
    description:
      "Cook County judicial primary results with bar association ratings. No other outlet is showing this.",
    images: [{ url: "/logo.png" }],
  },
};

export default function JudgesResultsPage() {
  const judges = getAllJudges();
  return <JudgesResultsPageClient judges={judges} />;
}
