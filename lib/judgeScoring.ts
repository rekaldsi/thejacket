import type { Judge, BarRating } from "@/lib/types";

export type JudgeScorecardEntry = {
  judge: Judge;
  score: number;
  grade: string;
  gradeColor: string;
  deductions: { reason: string; points: number }[];
  bonuses: { reason: string; points: number }[];
};

// Bar rating deduction rules
// Alliance NR: -20 per association (capped at -60 total from bar ratings)
// Alliance NQ: -15 per association (capped within overall -60 bar cap)
// Alliance Mixed: -10
// Alliance HR: +5 bonus
// CBA NR: -20
// CBA NQ: -15
// CBA Q or R or HR: no deduction

function allianceDeduction(rating: BarRating, detail?: string): number {
  switch (rating) {
    case "NR": {
      // Count how many NRs in detail string — e.g. "9 NR/NQ" → use 9
      const countMatch = detail?.match(/^(\d+)\s*NR/i);
      if (countMatch) {
        const count = parseInt(countMatch[1], 10);
        return Math.min(count * 20, 60);
      }
      // "unanimous" or "all" → treat as max penalty
      if (detail?.toLowerCase().includes("unanimous") || detail?.toLowerCase().includes("all")) {
        return 60; // cap
      }
      // single NR
      return 20;
    }
    case "NQ": {
      const countMatch = detail?.match(/^(\d+)\s*NQ/i);
      if (countMatch) {
        const count = parseInt(countMatch[1], 10);
        return Math.min(count * 15, 60);
      }
      if (detail?.toLowerCase().includes("unanimous") || detail?.toLowerCase().includes("all")) {
        return 60;
      }
      // "1 NQ" → 15
      return 15;
    }
    case "Mixed":
      return 10;
    case "HR":
    case "Q":
    case "R":
      return 0;
    default:
      return 0;
  }
}

function allianceBonus(rating: BarRating, detail?: string): number {
  if (rating === "HR") {
    // Count HRs in detail
    const countMatch = detail?.match(/(\d+)\s*HR/i);
    if (countMatch) {
      return parseInt(countMatch[1], 10) * 5;
    }
    return 5;
  }
  if (rating === "Q" || rating === "R") {
    // Unanimous Q/R is a small positive signal — small bonus
    if (detail?.toLowerCase().includes("unanimous")) return 5;
  }
  return 0;
}

function cbaDeduction(rating: BarRating): number {
  if (rating === "NR") return 20;
  if (rating === "NQ") return 15;
  return 0;
}

function letterGrade(score: number): { grade: string; color: string } {
  if (score >= 85) return { grade: "A", color: "text-green-400" };
  if (score >= 70) return { grade: "B", color: "text-lime-400" };
  if (score >= 55) return { grade: "C", color: "text-yellow-400" };
  if (score >= 40) return { grade: "D", color: "text-orange-400" };
  return { grade: "F", color: "text-jacket-red" };
}

export function scoreJudge(judge: Judge): JudgeScorecardEntry {
  let score = 100;
  const deductions: { reason: string; points: number }[] = [];
  const bonuses: { reason: string; points: number }[] = [];

  const { bar_ratings } = judge;

  // ── Alliance rating deductions ──
  const allianceDed = allianceDeduction(bar_ratings.alliance_rating, bar_ratings.alliance_detail);
  if (allianceDed > 0) {
    score -= allianceDed;
    deductions.push({
      reason: `Alliance: ${bar_ratings.alliance_detail ?? bar_ratings.alliance_rating}`,
      points: allianceDed,
    });
  }

  // ── Alliance bonuses (HR / unanimous Q) ──
  const allBonus = allianceBonus(bar_ratings.alliance_rating, bar_ratings.alliance_detail);
  if (allBonus > 0) {
    score += allBonus;
    bonuses.push({
      reason: `Alliance: ${bar_ratings.alliance_detail ?? bar_ratings.alliance_rating}`,
      points: allBonus,
    });
  }

  // ── CBA rating deductions ──
  const cbaDed = cbaDeduction(bar_ratings.cba_rating);
  if (cbaDed > 0) {
    score -= cbaDed;
    deductions.push({
      reason: `CBA: ${bar_ratings.cba_rating}`,
      points: cbaDed,
    });
  }

  // ── Red flag deductions ──
  for (const flag of judge.red_flags) {
    if (flag.confirmed) {
      score -= 25;
      deductions.push({ reason: flag.label, points: 25 });
    } else {
      score -= 8;
      deductions.push({ reason: `Alleged: ${flag.label}`, points: 8 });
    }
  }

  // ── Years experience penalty: < 5 years with no bar support ──
  const hasBarSupport =
    bar_ratings.alliance_rating === "Q" ||
    bar_ratings.alliance_rating === "HR" ||
    bar_ratings.alliance_rating === "R";
  if (judge.years_experience < 5 && !hasBarSupport) {
    score -= 10;
    deductions.push({ reason: "Less than 5 years experience — no bar support", points: 10 });
  }

  // ── Special: zero experience penalty ──
  if (judge.years_experience === 0) {
    score -= 20;
    deductions.push({ reason: "Zero years of legal experience", points: 20 });
  }

  score = Math.max(0, Math.min(100, score));

  const { grade, color } = letterGrade(score);

  return {
    judge,
    score,
    grade,
    gradeColor: color,
    deductions,
    bonuses,
  };
}

export function buildJudgeScorecard(judges: Judge[]): JudgeScorecardEntry[] {
  return judges.map(scoreJudge).sort((a, b) => b.score - a.score);
}

// Group judges by race_id and return scored entries per race
export function scoreJudgesByRace(
  judges: Judge[]
): Record<string, JudgeScorecardEntry[]> {
  const result: Record<string, JudgeScorecardEntry[]> = {};
  for (const judge of judges) {
    if (!result[judge.race_id]) result[judge.race_id] = [];
    result[judge.race_id].push(scoreJudge(judge));
  }
  // Sort each race's candidates by score descending
  for (const raceId of Object.keys(result)) {
    result[raceId].sort((a, b) => b.score - a.score);
  }
  return result;
}
