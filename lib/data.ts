import fs from "node:fs";
import path from "node:path";
import races from "@/data/races.json";
import type { Candidate, Race } from "@/lib/types";

const candidatesDir = path.join(process.cwd(), "data", "candidates");

export function getRaces(): Race[] {
  return races as Race[];
}

export function getAllCandidates(): Candidate[] {
  const files = fs.readdirSync(candidatesDir);
  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const fullPath = path.join(candidatesDir, file);
      const contents = fs.readFileSync(fullPath, "utf-8");
      return JSON.parse(contents) as Candidate;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCandidateBySlug(slug: string): Candidate | null {
  const fullPath = path.join(candidatesDir, `${slug}.json`);
  if (!fs.existsSync(fullPath)) return null;
  const contents = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(contents) as Candidate;
}

export function getCandidatesByRaceId(raceId: string): Candidate[] {
  return getAllCandidates().filter((candidate) => candidate.race_id === raceId);
}

export function getRaceBySlug(slug: string): Race | null {
  return getRaces().find((race) => race.slug === slug) ?? null;
}
