import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "TheJacket",
  description: "See who they really work for."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 md:px-8">
          <header className="border-b border-jacket-border py-5">
            <nav className="flex items-center justify-between font-mono uppercase tracking-wider">
              <Link href="/" className="text-xl text-jacket-white">
                THEJACKET
              </Link>
              <span className="text-jacket-amber">thejacket.cc</span>
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
