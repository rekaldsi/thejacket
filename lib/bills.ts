import { readdirSync, readFileSync } from "fs";
import path from "path";

export type ImpactTag = {
  id: string;
  label: string;
  emoji: string;
};

export type TimelineEntry = {
  date: string;
  action: string;
  chamber: string;
  upcoming?: boolean;
};

export type NextHearing = {
  date: string;
  time: string;
  location: string;
  label: string;
};

export type BillSponsor = {
  name: string;
  party: string;
  district: string;
  jacket_slug: string | null;
};

export type Bill = {
  id: string;
  bill_number: string;
  session: string;
  chamber: string;
  title: string;
  short_title_official: string;
  plain_english_title: string;
  summary: string;
  sponsor: BillSponsor;
  status: "introduced" | "in-committee" | "floor-vote" | "passed-house" | "passed-senate" | "sent-to-governor" | "signed" | "vetoed" | "dead";
  status_label: string;
  introduced_date: string;
  last_action_date: string;
  last_action: string;
  next_hearing: NextHearing | null;
  timeline: TimelineEntry[];
  impact_tags: ImpactTag[];
  what_supporters_say: string[];
  what_critics_say: string[];
  fiscal_impact: string;
  full_text_url: string;
  legiscan_id: number | null;
  statutes: string[];
  effective_date: string;
  data_status: "stub" | "partial" | "full";
  confirmed: boolean;
  last_updated: string;
  featured: boolean;
  priority: number;
};

const BILLS_DIR = path.join(process.cwd(), "data", "bills");

let _cache: Bill[] | null = null;

export function getAllBills(): Bill[] {
  if (_cache) return _cache;
  const files = readdirSync(BILLS_DIR).filter((f) => f.endsWith(".json"));
  _cache = files
    .map((f) => JSON.parse(readFileSync(path.join(BILLS_DIR, f), "utf-8")) as Bill)
    .sort((a, b) => a.priority - b.priority);
  return _cache;
}

export function getBill(id: string): Bill | undefined {
  return getAllBills().find((b) => b.id === id);
}

export function getFeaturedBills(): Bill[] {
  return getAllBills().filter((b) => b.featured);
}

/** Bills with an upcoming hearing in the next N days */
export function getUrgentBills(days = 14): Bill[] {
  const now = Date.now();
  const cutoff = now + days * 86_400_000;
  return getAllBills().filter((b) => {
    if (!b.next_hearing) return false;
    const t = new Date(b.next_hearing.date).getTime();
    return t >= now && t <= cutoff;
  });
}

export const STATUS_LABELS: Record<Bill["status"], string> = {
  introduced: "Introduced",
  "in-committee": "In Committee",
  "floor-vote": "Floor Vote Pending",
  "passed-house": "Passed House",
  "passed-senate": "Passed Senate",
  "sent-to-governor": "Sent to Governor",
  signed: "Signed into Law",
  vetoed: "Vetoed",
  dead: "Dead / Failed",
};

export const STATUS_COLORS: Record<Bill["status"], string> = {
  introduced: "text-zinc-400 border-zinc-700",
  "in-committee": "text-jacket-amber border-jacket-amber/40",
  "floor-vote": "text-orange-400 border-orange-400/40",
  "passed-house": "text-blue-400 border-blue-400/40",
  "passed-senate": "text-blue-400 border-blue-400/40",
  "sent-to-governor": "text-purple-400 border-purple-400/40",
  signed: "text-green-400 border-green-500/40",
  vetoed: "text-jacket-red border-jacket-red/40",
  dead: "text-zinc-600 border-zinc-700",
};

export function daysUntilHearing(bill: Bill): number | null {
  if (!bill.next_hearing) return null;
  const diff = new Date(bill.next_hearing.date).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}
