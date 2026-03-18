import type { Candidate } from "@/lib/types";

export type ScorecardEntry = {
  candidate: Candidate;
  score: number;
  grade: string;
  gradeColor: string;
  deductions: { reason: string; points: number }[];
  bonuses: { reason: string; points: number }[];
  gradeDataLimited: boolean;
};

const FLAG_DEDUCTIONS: Record<string, number> = {
  aipac: 20,
  "dark-money": 15,
  criminal: 25,
  ethics: 20,
  epstein: 30,
  "civil-rights": 10,
  patronage: 10,
};

const ALLEGED_DEDUCTION = 8;

// Grades: A requires positive evidence, not just absence of flags.
// A+ is never awarded — no candidate has justified it with full transparent disclosure.
function letterGrade(score: number): { grade: string; color: string } {
  if (score >= 85) return { grade: "A",  color: "text-green-400" };
  if (score >= 70) return { grade: "B",  color: "text-lime-400" };
  if (score >= 55) return { grade: "C",  color: "text-yellow-400" };
  if (score >= 40) return { grade: "D",  color: "text-orange-400" };
  return { grade: "F", color: "text-jacket-red" };
}

// Compute financial transparency grade based on % of total_raised broken out in donors array
function financialTransparencyGrade(candidate: Candidate): string {
  const total = candidate.jacket.total_raised;
  if (!total || total === 0) return "?";
  const listed = candidate.jacket.donors
    .filter((d) => typeof d.amount === "number" && d.amount > 0)
    .reduce((sum, d) => sum + (d.amount as number), 0);
  const pct = listed / total;
  if (pct >= 0.75) return "A";
  if (pct >= 0.50) return "B";
  if (pct >= 0.25) return "C";
  if (pct >= 0.05) return "D";
  return "F";
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

  // Deduct if data is limited (can't properly evaluate transparency)
  const gradeDataLimited = candidate.data_status === "limited";
  if (gradeDataLimited) {
    score = Math.min(score, 60); // Cap at C — we can't give a good grade without data
    deductions.push({ reason: "Limited public data — transparency unverifiable", points: 0 });
  }

  // Deduct for poor financial transparency (< 5% of total disclosed in donor breakdown)
  const ftGrade = financialTransparencyGrade(candidate);
  if (ftGrade === "F" && candidate.jacket.total_raised && candidate.jacket.total_raised > 10000) {
    score -= 15;
    deductions.push({ reason: "< 5% of total raised broken out in donor disclosure", points: 15 });
  } else if (ftGrade === "D" && candidate.jacket.total_raised && candidate.jacket.total_raised > 10000) {
    score -= 8;
    deductions.push({ reason: "< 25% of total raised broken out in donor disclosure", points: 8 });
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
    gradeDataLimited,
  };
}

// Office tier — higher = more prominent on scorecard when scores are tied
function officeTier(office: string): number {
  const o = office.toLowerCase();
  if (o.includes("u.s. senate") || o.includes("senate (illinois)")) return 5;
  if (o.includes("u.s. house") || o.includes("u.s. rep")) return 4;
  if (o.includes("state senate") || o.includes("il senate")) return 3;
  if (o.includes("state rep") || o.includes("il house")) return 3;
  if (o.includes("assessor") || o.includes("board president") || o.includes("sheriff") || o.includes("treasurer")) return 2;
  if (o.includes("mwrd")) return 1;
  return 0; // commissioner districts, etc.
}

export function buildScorecard(candidates: Candidate[]): ScorecardEntry[] {
  return candidates
    .map(scoreCandidate)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreak by office prominence
      return officeTier(b.candidate.office) - officeTier(a.candidate.office);
    });
}
