export type Donor = {
  name: string;
  amount: number | null;
  category: string;
  source: string;
  confirmed: boolean;
};

export type RedFlag = {
  type: string;
  label: string;
  detail: string;
  source: string;
  confirmed: boolean;
};

export type KeyVote = {
  bill: string;
  vote: string;
  summary: string;
  source: string;
};

export type Endorsement = {
  org: string;
  significance: string;
};

export interface JailTimelineEvent {
  year: number;
  event: string;
  type: 'milestone' | 'legal' | 'death' | 'ethics' | 'election';
}

export interface AccountabilityOversight {
  name: string;
  role: string;
  race_link: string | null;
  action: string;
}

export interface AccountabilityGap {
  oversight_bodies: AccountabilityOversight[];
  what_you_can_do: string[];
  read_more: { label: string; url: string }[];
}

export type TransparencyScore = {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  computed: true;
  financial_transparency: 'A' | 'B' | 'C' | 'D' | 'F';
  platform_completeness: 'A' | 'B' | 'C' | 'D' | 'F';
  record_available: boolean;
  red_flags_count: number;
  computed_at: string;
};

export type Candidate = {
  id: string;
  name: string;
  party: string;
  office: string;
  race_id: string;
  bio: string;
  prior_office: string;
  website: string;
  photo_url: string | null;
  uncontested?: boolean;
  years_in_office?: number;
  data_status?: 'limited' | 'partial' | 'full';
  data_note?: string;
  jail_timeline?: JailTimelineEvent[];
  accountability_gap?: AccountabilityGap;
  jacket: {
    total_raised: number | null;
    data_date: string;
    source: string;
    note: string;
    donors_note?: string;
    fec_id?: string | null;
    ilsbe_id?: string | null;
    donors: Donor[];
  };
  red_flags: RedFlag[];
  key_votes: KeyVote[];
  endorsements: Endorsement[];
  career_history?: Array<{ role: string; org: string; years: string; highlight?: string }>;
  policy_platform?: Array<{ topic: string; position: string; source?: string }>;
  social_pulse?: { summary: string; sentiment: 'positive' | 'negative' | 'mixed' | 'low-profile'; hashtags?: string[]; last_updated: string };
  trust_indicators?: Array<{ label: string; value: boolean | string; type: 'positive' | 'negative' | 'neutral' }>;
  transparency_score?: TransparencyScore;
};

export type Race = {
  id: string;
  slug: string;
  title: string;
  jurisdiction: string;
  description: string;
  party: string;
  candidateCount: number;
  uncontested?: boolean;
  note?: string;
};

export type BarRating = "Q" | "R" | "HR" | "NQ" | "NR" | "Mixed" | "Pending";

export type JudgeBarRatings = {
  alliance_rating: BarRating;
  alliance_detail?: string;
  cba_rating: BarRating;
  source: string;
};

export type JudicialRace = {
  id: string;
  slug: string;
  title: string;
  subcircuit: string;
  office: "circuit" | "appellate";
  vacancy_of: string;
  description: string;
  candidateCount: number;
  uncontested?: boolean;
  note?: string;
};

export type Judge = {
  id: string;
  name: string;
  party: "Democratic";
  office: "circuit" | "appellate";
  subcircuit: string;
  race_id: string;
  vacancy_of: string;
  bio: string;
  background: string;
  years_experience: number;
  bar_ratings: JudgeBarRatings;
  red_flags: RedFlag[];
  uncontested: boolean;
  website?: string;
  photo_url?: string | null;
};
