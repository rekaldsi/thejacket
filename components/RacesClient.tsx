"use client";

import { useState } from "react";
import Link from "next/link";

const OFFICE_EXPLAINERS: Record<string, string> = {
  "U.S. Senate": "Represents all of Illinois in Washington. One of the most powerful offices on the ballot.",
  "U.S. House": "Represents a congressional district in Washington. Sets federal policy on your behalf.",
  "Cook County Board President": "Runs Cook County government — health systems, criminal justice, $9B+ budget.",
  "Cook County Commissioner": "One of 17 seats that govern Cook County. Sets the county budget, oversees the sheriff, courts, and health system for 5M people.",
  "Cook County Assessor": "Determines property tax assessments for every home and business in Cook County.",
  "Cook County Clerk": "Runs elections and vital records for Cook County.",
  "Cook County Sheriff": "Oversees the Cook County Jail and county law enforcement.",
  "Cook County Treasurer": "Manages $11B+ in county funds and property tax collections.",
  "Metropolitan Water Reclamation District": "Controls sewage and stormwater for 5M people. $2B+ annual budget. Rarely covered — but it matters.",
  "Illinois Governor": "The most powerful office in state government. Controls a $52B+ budget, signs or vetoes every bill.",
  "Illinois Attorney General": "Illinois's chief law enforcement officer. Investigates consumer fraud and enforces environmental law.",
  "Illinois Treasurer": "Manages the state's investment portfolio and the I-Cash unclaimed property program.",
  "Illinois Comptroller": "Pays the state's bills and audits local governments. First line of financial oversight.",
};

function getExplainer(title: string): string | null {
  for (const [key, val] of Object.entries(OFFICE_EXPLAINERS)) {
    if (title.includes(key)) return val;
  }
  return null;
}

function seatKey(title: string): string {
  return title
    .replace(/\s*[—–-]\s*(Democratic|Republican|Libertarian|Independent|Green|Other|Multi-Party).*$/i, "")
    .replace(/\s*(Democratic|Republican|Libertarian|Independent|Green)\s*Primary/i, "")
    .replace(/\s*Primary/i, "")
    .trim();
}

function partyPill(party: string) {
  if (party === "Democratic") return "bg-blue-900/60 text-blue-300 border border-blue-700/40";
  if (party === "Republican") return "bg-red-900/60 text-red-300 border border-red-700/40";
  if (party === "Libertarian") return "bg-yellow-900/50 text-yellow-300 border border-yellow-700/40";
  if (party === "Multi-Party") return "bg-purple-900/50 text-purple-300 border border-purple-700/40";
  return "bg-zinc-800 text-zinc-400 border border-zinc-700";
}

function partyFilterClass(party: string, active: boolean) {
  const base = "cursor-pointer rounded-sm px-3 py-1 font-mono text-xs uppercase tracking-widest transition-colors border";
  if (active) {
    if (party === "All") return `${base} bg-jacket-amber text-jacket-black border-jacket-amber`;
    if (party === "Democratic") return `${base} bg-blue-600 text-white border-blue-600`;
    if (party === "Republican") return `${base} bg-red-600 text-white border-red-600`;
    if (party === "Libertarian") return `${base} bg-yellow-500 text-black border-yellow-500`;
    return `${base} bg-zinc-400 text-black border-zinc-400`;
  }
  return `${base} border-jacket-border text-zinc-500 hover:border-zinc-400 hover:text-zinc-300`;
}

const partyOrder: Record<string, number> = { Democratic: 0, Republican: 1, Libertarian: 2, "Multi-Party": 3 };

export type RaceData = {
  id: string;
  slug: string;
  title: string;
  jurisdiction: string;
  party: string;
  candidateCount: number;
  note?: string;
};

type SeatGroup = { seat: string; races: RaceData[] };

function groupBySeat(races: RaceData[]): SeatGroup[] {
  const map = new Map<string, RaceData[]>();
  for (const r of races) {
    const key = seatKey(r.title);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return Array.from(map.entries()).map(([seat, rs]) => ({
    seat,
    races: [...rs].sort((a, b) => (partyOrder[a.party] ?? 9) - (partyOrder[b.party] ?? 9)),
  }));
}

function RaceCard({ race }: { race: RaceData }) {
  const explainer = getExplainer(race.title);
  return (
    <Link
      href={`/race/${race.slug}`}
      className="flex flex-col gap-2 border border-jacket-border p-4 transition-colors hover:border-jacket-amber"
    >
      <span className={`self-start rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${partyPill(race.party)}`}>
        {race.party} Primary
      </span>
      <h3 className="font-mono text-sm font-black uppercase leading-tight">{seatKey(race.title)}</h3>
      {explainer && <p className="text-xs text-zinc-500 line-clamp-2">{explainer}</p>}
      <div className="mt-auto flex items-center gap-3 pt-1">
        <span className="font-mono text-xs text-jacket-amber">
          {race.candidateCount} candidate{race.candidateCount !== 1 ? "s" : ""}
        </span>
        <span className="font-mono text-xs text-zinc-600">{race.jurisdiction}</span>
        <span className="ml-auto font-mono text-xs text-zinc-500">→</span>
      </div>
    </Link>
  );
}

function SeatGroupBlock({ group }: { group: SeatGroup }) {
  if (group.races.length === 1) return <RaceCard race={group.races[0]} />;
  return (
    <div className="overflow-hidden rounded-sm border border-jacket-border/60">
      <div className="border-b border-jacket-border/40 bg-zinc-900/40 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          {group.seat} — {group.races.length} primaries
        </span>
      </div>
      <div className={`grid divide-x divide-jacket-border/40 ${group.races.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
        {group.races.map((race) => (
          <Link
            key={race.id}
            href={`/race/${race.slug}`}
            className="group flex flex-col gap-2 p-4 transition-colors hover:bg-zinc-900/60"
          >
            <span className={`self-start rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${partyPill(race.party)}`}>
              {race.party}
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-jacket-amber">
                {race.candidateCount} candidate{race.candidateCount !== 1 ? "s" : ""}
              </span>
              <span className="font-mono text-xs text-zinc-600 transition-colors group-hover:text-jacket-amber">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const isStatewide = (title: string) =>
  title.includes("Illinois Governor") ||
  title.includes("Illinois Attorney General") ||
  title.includes("Illinois Treasurer") ||
  title.includes("Illinois Comptroller");

// Cook County Commissioner district → key communities lookup
const DISTRICT_LOOKUP: { dist: string; communities: string }[] = [
  { dist: "2", communities: "Calumet City, Harvey, Dolton, Riverdale, South Holland, Thornton" },
  { dist: "3", communities: "Oak Lawn, Burbank, Bridgeview, Justice, Chicago Ridge, Worth" },
  { dist: "4", communities: "Maywood, Berwyn, Cicero, Stickney, Forest View, Lyons" },
  { dist: "5", communities: "Evanston, Skokie, Morton Grove, Niles, Lincolnwood" },
  { dist: "6", communities: "Chicago: North Side — Rogers Park, Edgewater, Uptown, Lincoln Square, Lakeview, Lincoln Park" },
  { dist: "7", communities: "Chicago: Northwest Side — Jefferson Park, Norwood Park, Edison Park, O'Hare" },
  { dist: "8", communities: "Chicago: Northwest Side — Portage Park, Irving Park, Dunning, Montclare" },
  { dist: "9", communities: "Chicago: West Side — Humboldt Park, Logan Square, Avondale, Hermosa" },
  { dist: "10", communities: "Chicago: South Side — Pilsen, Bridgeport, Brighton Park, Gage Park, McKinley Park" },
  { dist: "11", communities: "Chicago: South Side — Beverly, Morgan Park, Mt. Greenwood, West Englewood" },
  { dist: "12", communities: "Orland Park, Tinley Park, Mokena, New Lenox, Frankfort, Palos" },
  { dist: "13", communities: "Schaumburg, Elk Grove Village, Rolling Meadows, Arlington Heights, Palatine" },
  { dist: "14", communities: "Evanston (north), Wilmette, Kenilworth, Winnetka, Glencoe, Highland Park" },
  { dist: "15", communities: "Park Forest, Chicago Heights, Olympia Fields, Homewood, Flossmoor, Matteson" },
  { dist: "16", communities: "Chicago: West Side — Lawndale, Little Village, East Garfield Park, Austin (south)" },
  { dist: "17", communities: "Chicago: South Side — South Shore, Avalon Park, Calumet Heights, South Chicago, Burnside" },
];

function DistrictFinder() {
  return (
    <details className="group border border-jacket-border rounded-sm">
      <summary className="cursor-pointer select-none px-4 py-3 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-jacket-amber flex items-center gap-2">
        <span className="transition-transform group-open:rotate-90">▶</span>
        Which Cook County Commissioner district am I in?
      </summary>
      <div className="border-t border-jacket-border px-4 py-4 space-y-2">
        <p className="text-xs text-zinc-400 mb-3">
          Find your community below to identify your district, then scroll to the Cook County section.
          Not sure?{" "}
          <a
            href="https://www.cookcountyclerkil.gov/elections/voters/find-your-polling-place-and-sample-ballot"
            target="_blank"
            rel="noreferrer"
            className="text-jacket-amber hover:underline"
          >
            Look up your exact address on the Cook County Clerk site ↗
          </a>
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {DISTRICT_LOOKUP.map(({ dist, communities }) => (
            <div key={dist} className="flex gap-2 text-xs">
              <span className="shrink-0 font-mono font-black text-jacket-amber w-6">D{dist}</span>
              <span className="text-zinc-400">{communities}</span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

export default function RacesClient({ races }: { races: RaceData[] }) {
  const [partyFilter, setPartyFilter] = useState("All");

  const availableParties = ["All", ...Array.from(new Set(races.map((r) => r.party))).sort(
    (a, b) => (partyOrder[a] ?? 9) - (partyOrder[b] ?? 9)
  )];

  const filtered = partyFilter === "All" ? races : races.filter((r) => r.party === partyFilter);

  const groups = {
    federal: groupBySeat(filtered.filter((r) => r.title.includes("U.S."))),
    statewide: groupBySeat(filtered.filter((r) => isStatewide(r.title))),
    county: groupBySeat(filtered.filter((r) =>
      r.title.includes("Cook County") || r.title.includes("MWRD") || r.title.includes("Water Reclamation")
    )),
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-mono text-4xl uppercase tracking-tight">All Races</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Every primary on the March 17 Illinois ballot — all parties.
        </p>
      </div>

      {/* District finder */}
      <DistrictFinder />

      {/* Party filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Show:</span>
        {availableParties.map((p) => (
          <button key={p} onClick={() => setPartyFilter(p)} className={partyFilterClass(p, partyFilter === p)}>
            {p}
          </button>
        ))}
      </div>

      {groups.federal.length > 0 && (
        <section>
          <h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-jacket-amber">Federal</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {groups.federal.map((g) => <SeatGroupBlock key={g.seat} group={g} />)}
          </div>
        </section>
      )}

      {groups.statewide.length > 0 && (
        <section>
          <h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-jacket-amber">Statewide — Illinois</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {groups.statewide.map((g) => <SeatGroupBlock key={g.seat} group={g} />)}
          </div>
        </section>
      )}

      {groups.county.length > 0 && (
        <section>
          <h2 className="mb-4 font-mono text-sm uppercase tracking-widest text-jacket-amber">Cook County</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {groups.county.map((g) => <SeatGroupBlock key={g.seat} group={g} />)}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <p className="font-mono text-sm text-zinc-600">No races match this filter.</p>
      )}
    </div>
  );
}
