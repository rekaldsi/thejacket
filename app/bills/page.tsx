import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bills & Legislation — TheJacket' }

export default function BillsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-jacket-amber">
        Coming November 2026
      </p>
      <h1 className="mb-4 text-4xl font-black uppercase tracking-tight">Bills &amp; Legislation</h1>
      <p className="mb-8 max-w-lg text-zinc-400">
        Track Illinois state bills, Chicago City Council ordinances, and Cook County Board resolutions —
        with plain-English summaries, impact tags, and alerts when bills move.
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
