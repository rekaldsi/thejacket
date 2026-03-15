"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

interface ShareButtonProps {
  candidateName?: string;
  className?: string;
}

export default function ShareButton({ candidateName, className = "" }: ShareButtonProps) {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const shareLabel = lang === "es" ? "Compartir" : "Share";
  const copiedLabel = lang === "es" ? "✓ Enlace copiado!" : "✓ Link copied!";

  const shareText = candidateName
    ? `${candidateName} on TheJacket — See who they really work for. thejacket.cc`
    : "TheJacket — Cook County primary transparency. thejacket.cc";

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "https://thejacket.cc";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "TheJacket", text: shareText, url });
        return;
      } catch {
        // user cancelled or error — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-1.5 rounded-sm border border-zinc-700 px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:border-jacket-amber hover:text-jacket-amber ${className}`}
      aria-label={shareLabel}
    >
      {copied ? (
        <span className="text-green-400">{copiedLabel}</span>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {shareLabel}
        </>
      )}
    </button>
  );
}
