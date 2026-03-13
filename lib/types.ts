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
  jail_timeline?: JailTimelineEvent[];
  accountability_gap?: AccountabilityGap;
  jacket: {
    total_raised: number | null;
    data_date: string;
    source: string;
    note: string;
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
