"use client";

import { useLanguage } from "@/lib/i18n";
import { translations, type TranslationKey } from "@/lib/translations";

export function T({ k }: { k: TranslationKey }) {
  const { lang } = useLanguage();
  const dict = translations[lang] as Record<string, string>;
  const fallback = translations.en as Record<string, string>;
  return <>{dict[k] ?? fallback[k] ?? k}</>;
}
