import { notFound } from "next/navigation";
import { getAllCandidates, getCandidateBySlug } from "@/lib/data";
import CandidatePageClient from "./CandidatePageClient";

export function generateStaticParams() {
  return getAllCandidates().map((candidate) => ({ slug: candidate.id }));
}

export default function CandidatePage({ params }: { params: { slug: string } }) {
  const candidate = getCandidateBySlug(params.slug);
  if (!candidate) notFound();
  return <CandidatePageClient candidate={candidate} />;
}
