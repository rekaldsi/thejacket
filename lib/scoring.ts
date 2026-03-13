import type { Candidate } from "@/lib/types";

export type ScorecardEntry = {
  candidate: Candidate;
  score: number;
  grade: string;
  gradeColor: string;
  deductions: { reason: string; points: number }[];
  bonuses: { reason: string; points: number }[];
};

const FLAG_DEDUCTIONS: Record<string, number> = {
  aipac: 20,
  "dark-money": 15,
  criminal: 25,
  ethics: 20,
  epstein: 30,
};

const ALLEGED_DEDUCTION = 8;

function letterGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: "A+", color: "text-green-400" };
  if (score >= 80) return { grade: "A",  color: "text-green-400" };
  if (score >= 70) return { grade: "B",  color: "text-lime-400" };
  if (score >= 60) return { grade: "C",  color: "text-yellow-400" };
  if (score >= 50) return { grade: "D",  color: "text-orange-400" };
  return { grade: "F", color: "text-jacket-red" };
}

export function scoreCandidate(candidate: Candidate): ScorecardEntry {
  let score = 100;
  const deductions: { reason: string; points: number }[] = [];
  const bonuses: { reason: string; points: number }[] = [];

  // Deduct for red flags
  for (const flag of candidate.red_flags) {
    if (flag.confirmed) {
      const pts = FLAG_DEDUCTIONS[flag.type] ?? 10;
      score -= pts;
      deductions.push({ reason: flag.label, points: pts });
    } else {
      score -= ALLEGED_DEDUCTION;
      deductions.push({ reason: `Alleged: ${flag.label}`, points: ALLEGED_DEDUCTION });
    }
  }

  // Bonus: small-dollar only (no confirmed PAC donors with amounts)
  const hasPacMoney = candidate.jacket.donors.some(
    (d) => (d.category === "pac" || d.category === "dark-money" || d.category === "aipac") && d.confirmed && d.amount
  );
  const hasSmallDollarNote = candidate.jacket.note?.toLowerCase().includes("small-dollar") ||
    candidate.jacket.note?.toLowerCase().includes("avg $");
  if (!hasPacMoney && hasSmallDollarNote) {
    score += 10;
    bonuses.push({ reason: "Small-dollar fundraising only", points: 10 });
  }

  // Bonus: data transparency (has FEC ID on file)
  if (candidate.jacket.fec_id) {
    score += 5;
    bonuses.push({ reason: "FEC filing on record", points: 5 });
  }

  score = Math.max(0, Math.min(100, score));

  const { grade, color } = letterGrade(score);

  return {
    candidate,
    score,
    grade,
    gradeColor: color,
    deductions,
    bonuses,
  };
}

export function buildScorecard(candidates: Candidate[]): ScorecardEntry[] {
  return candidates
    .map(scoreCandidate)
    .sort((a, b) => b.score - a.score);
}
