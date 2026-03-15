"use client";

import { useLanguage } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "es" : "en")}
      className="flex items-center overflow-hidden rounded-full border border-zinc-600 font-mono text-[10px] uppercase tracking-widest transition-colors hover:border-jacket-amber"
      aria-label={lang === "en" ? "Cambiar a español" : "Switch to English"}
    >
      <span className={`px-2 py-1 transition-colors ${lang === "en" ? "bg-jacket-amber text-jacket-black" : "text-zinc-500 hover:text-zinc-300"}`}>EN</span>
      <span className={`px-2 py-1 transition-colors ${lang === "es" ? "bg-jacket-amber text-jacket-black" : "text-zinc-500 hover:text-zinc-300"}`}>ES</span>
    </button>
  );
}
