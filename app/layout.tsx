import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: "TheJacket",
  description: "See who they really work for."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} bg-jacket-black font-sans text-jacket-white antialiased`}>
        <div className="h-1 w-full bg-jacket-amber" />

        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 md:px-8">
          <header className="relative border-b border-jacket-border">
            <nav className="flex items-center justify-between py-4">
              <Link href="/" className="text-xl font-extrabold uppercase tracking-tight text-jacket-white">
                THEJACKET
              </Link>

              <div className="hidden items-center gap-3 text-xs uppercase tracking-widest text-zinc-300 sm:flex">
                <Link href="/races" className="transition-colors hover:text-jacket-amber">
                  Races
                </Link>
                <span className="text-zinc-600">|</span>
                <Link href="/scorecard" className="transition-colors hover:text-jacket-amber">
                  Scorecard
                </Link>
                <span className="text-zinc-600">|</span>
                <Link href="/about" className="transition-colors hover:text-jacket-amber">
                  About
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden font-mono text-xs uppercase tracking-widest text-jacket-amber sm:inline">COOK COUNTY &mdash; MAR 17</span>
                <MobileNav />
              </div>
            </nav>
          </header>

          <main className="flex-1 py-8">{children}</main>

          <footer className="border-t border-jacket-border py-6 text-xs uppercase tracking-wide text-zinc-400">
            <div className="flex flex-col justify-between gap-2 md:flex-row">
              <span>THEJACKET / COOK COUNTY PRIMARY / MARCH 17, 2026</span>
              <Link href="/about" className="text-jacket-amber">
                ABOUT + METHODOLOGY
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
