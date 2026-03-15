/**
 * translate.ts — DeepL-backed translation utility with localStorage cache.
 *
 * - Uses DeepL Free API (DEEPL_API_KEY env var, or falls back to no-cost
 *   unofficial endpoint for testing).
 * - Batches up to 50 strings per API call.
 * - Caches results in localStorage keyed by `tj_tx_<lang>_<hash>`.
 * - Returns original string on any error (graceful degradation).
 */

export type SupportedLang = "en" | "es" | "pl" | "zh" | "tl" | "hi";

const DEEPL_LANG_MAP: Record<SupportedLang, string> = {
  en: "EN",
  es: "ES",
  pl: "PL",
  zh: "ZH",
  tl: "EN", // DeepL doesn't support Tagalog — fallback to EN (handled separately)
  hi: "HI",
};

// Simple hash for cache key
function hashStr(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function cacheKey(lang: string, text: string) {
  return `tj_tx_${lang}_${hashStr(text)}`;
}

function readCache(lang: string, text: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(cacheKey(lang, text));
  } catch {
    return null;
  }
}

function writeCache(lang: string, text: string, translated: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(cacheKey(lang, text), translated);
  } catch {
    // storage full — ignore
  }
}

/**
 * Translate a single string via /api/translate (Next.js API route).
 * Returns the original string immediately while async fetch is in flight,
 * then updates via the returned Promise.
 */
export async function translateText(text: string, lang: SupportedLang): Promise<string> {
  if (lang === "en" || !text || text.trim() === "") return text;

  // Tagalog not supported by DeepL — skip
  if (lang === "tl") return text;

  const cached = readCache(lang, text);
  if (cached) return cached;

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: [text], target_lang: DEEPL_LANG_MAP[lang] }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    const translated: string = data.translations?.[0]?.text ?? text;
    writeCache(lang, text, translated);
    return translated;
  } catch {
    return text;
  }
}

/**
 * Batch translate multiple strings in one API call.
 * Returns array in same order as input.
 */
export async function translateBatch(texts: string[], lang: SupportedLang): Promise<string[]> {
  if (lang === "en" || lang === "tl") return texts;

  const results: string[] = new Array(texts.length);
  const toFetch: { idx: number; text: string }[] = [];

  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    if (!t || t.trim() === "") {
      results[i] = t;
      continue;
    }
    const cached = readCache(lang, t);
    if (cached !== null) {
      results[i] = cached;
    } else {
      toFetch.push({ idx: i, text: t });
    }
  }

  if (toFetch.length === 0) return results;

  // Batch in chunks of 50
  const CHUNK = 50;
  for (let c = 0; c < toFetch.length; c += CHUNK) {
    const chunk = toFetch.slice(c, c + CHUNK);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: chunk.map((x) => x.text),
          target_lang: DEEPL_LANG_MAP[lang],
        }),
      });
      if (!res.ok) {
        chunk.forEach(({ idx, text }) => { results[idx] = text; });
        continue;
      }
      const data = await res.json();
      chunk.forEach(({ idx, text }, j) => {
        const translated = data.translations?.[j]?.text ?? text;
        results[idx] = translated;
        writeCache(lang, text, translated);
      });
    } catch {
      chunk.forEach(({ idx, text }) => { results[idx] = text; });
    }
  }

  return results;
}
