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
  jacket: {
    total_raised: number | null;
    data_date: string;
    source: string;
    note: string;
    fec_id?: string | null;
    donors: Donor[];
  };
  red_flags: RedFlag[];
  key_votes: KeyVote[];
  endorsements: Endorsement[];
};

export type Race = {
  id: string;
  slug: string;
  title: string;
  jurisdiction: string;
  description: string;
  party: string;
  candidateCount: number;
};
