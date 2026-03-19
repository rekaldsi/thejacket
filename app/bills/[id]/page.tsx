import { getAllBills, getBill } from "@/lib/bills";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BillDetailPageClient from "./BillDetailPageClient";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return getAllBills().map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bill = getBill(id);
  if (!bill) return { title: "Bill Not Found — TheJacket" };
  return {
    title: `${bill.bill_number}: ${bill.title} — TheJacket`,
    description: bill.plain_english_title,
  };
}

export default async function BillDetailPage({ params }: Props) {
  const { id } = await params;
  const bill = getBill(id);
  if (!bill) notFound();
  return <BillDetailPageClient bill={bill} />;
}
