/**
 * <Tx> — Dynamic translation component for data-driven strings.
 *
 * Unlike <T k="key"> which uses a static dictionary,
 * <Tx> translates arbitrary strings via DeepL at runtime.
 *
 * Usage:
 *   <Tx>{candidate.bio}</Tx>
 *   <Tx as="p" className="text-sm">{signal.label}</Tx>
 *
 * The original text is shown immediately; translated text swaps in
 * once the API call resolves (usually <200ms with cache hit).
 */
"use client";

import { useTranslateStr } from "@/lib/useTranslate";

interface TxProps {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function Tx({ children, as: Tag = "span", className }: TxProps) {
  const translated = useTranslateStr(children ?? "");
  return <Tag className={className}>{translated}</Tag>;
}

/**
 * TxAttr — translates a string for use as an attribute value (title, aria-label, etc.)
 * Returns the translated string directly (not a JSX element).
 */
export function useTxAttr(text: string): string {
  return useTranslateStr(text);
}
