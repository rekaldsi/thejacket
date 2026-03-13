import Link from "next/link";
import { getRaces } from "@/lib/data";

export default function RacesPage() {
  const races = getRaces();

  const grouped = {
    federal: races.filter((race) => race.title.includes("U.S.")),
    county: races.filter((race) => race.title.includes("Cook County"))
  };

  return (
    <div className="space-y-8">
      <h1 className="font-mono text-4xl uppercase">All Races</h1>

      <section>
        <h2 className="mb-3 font-mono text-xl uppercase text-jacket-amber">Federal</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {grouped.federal.map((race) => (
            <Link key={race.id} href={`/race/${race.slug}`} className="border border-jacket-border p-4 hover:border-jacket-amber">
              <h3 className="font-mono uppercase">{race.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{race.jurisdiction}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xl uppercase text-jacket-amber">County</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {grouped.county.map((race) => (
            <Link key={race.id} href={`/race/${race.slug}`} className="border border-jacket-border p-4 hover:border-jacket-amber">
              <h3 className="font-mono uppercase">{race.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{race.jurisdiction}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
