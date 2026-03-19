import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Ballot — TheJacket' }

export default function MyBallotPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
        Coming November 2026
      </p>
      <h1 className="mb-4 text-4xl font-black uppercase tracking-tight">My Ballot</h1>
      <p className="mb-8 max-w-lg text-zinc-400">
        Enter your Chicago address to see every candidate and ballot measure on your specific November 3 ballot —
        with full intelligence on every race.
      </p>
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-widest text-jacket-amber hover:underline"
      >
        ← Back to Home
      </Link>
    </div>
  )
}
