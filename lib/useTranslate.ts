/**
 * useTranslate — React hook for dynamic translation.
 *
 * Usage:
 *   const tx = useTranslate();
 *   const label = tx("View full profile");   // returns ES/PL/etc. string async, updates on resolve
 *
 * For batch:
 *   const [a, b, c] = useBatchTranslate(["string1", "string2", "string3"]);
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";
import { translateText, translateBatch, type SupportedLang } from "@/lib/translate";

/**
 * Single-string hook. Returns the (possibly translated) string.
 * Shows original while loading, swaps when translation arrives.
 */
export function useTranslateStr(text: string): string {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    setTranslated(text); // reset immediately on text/lang change
    if (lang === "en" || !text) return;
    let cancelled = false;
    translateText(text, lang as SupportedLang).then((result) => {
      if (!cancelled) setTranslated(result);
    });
    return () => { cancelled = true; };
  }, [text, lang]);

  return lang === "en" ? text : translated;
}

/**
 * Batch hook. Returns array of translated strings (same order as input).
 * Initialises with originals, swaps all at once when batch resolves.
 */
export function useBatchTranslate(texts: string[]): string[] {
  const { lang } = useLanguage();
  const [results, setResults] = useState<string[]>(texts);

  // Stable key: join texts + lang
  const key = texts.join("||") + lang;

  useEffect(() => {
    setResults(texts); // reset
    if (lang === "en") return;
    let cancelled = false;
    translateBatch(texts, lang as SupportedLang).then((arr) => {
      if (!cancelled) setResults(arr);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return lang === "en" ? texts : results;
}

/**
 * useTranslate() — returns a translate function for use in component body.
 * Useful when you need to translate strings inside event handlers or derived values.
 * 
 * NOTE: This is for inline use where you manage state yourself.
 * For reactive rendering, prefer useTranslateStr / useBatchTranslate.
 */
export function useTranslate() {
  const { lang } = useLanguage();
  return useCallback(
    (text: string) => translateText(text, lang as SupportedLang),
    [lang]
  );
}
