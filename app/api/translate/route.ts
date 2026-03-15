/**
 * /api/translate — Server-side DeepL proxy.
 *
 * Keeps the API key server-side only (never exposed to client).
 * Accepts: { texts: string[], target_lang: string }
 * Returns: { translations: { text: string }[] }
 */

import { NextRequest, NextResponse } from "next/server";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY ?? "";
const DEEPL_BASE = DEEPL_API_KEY.endsWith(":fx")
  ? "https://api-free.deepl.com/v2"
  : "https://api.deepl.com/v2";

export async function POST(req: NextRequest) {
  if (!DEEPL_API_KEY) {
    return NextResponse.json(
      { error: "DEEPL_API_KEY not configured" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const texts: string[] = body.texts ?? [];
  const target_lang: string = body.target_lang ?? "ES";

  if (!texts.length) {
    return NextResponse.json({ translations: [] });
  }

  // Build DeepL request
  const params = new URLSearchParams();
  params.append("target_lang", target_lang);
  params.append("preserve_formatting", "1");
  for (const t of texts) {
    params.append("text", t);
  }

  try {
    const res = await fetch(`${DEEPL_BASE}/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      // 8-second timeout
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[translate] DeepL error:", res.status, err);
      // Return originals on error
      return NextResponse.json({
        translations: texts.map((t) => ({ text: t })),
      });
    }

    const data = await res.json();
    return NextResponse.json({ translations: data.translations });
  } catch (e) {
    console.error("[translate] fetch error:", e);
    return NextResponse.json({
      translations: texts.map((t) => ({ text: t })),
    });
  }
}
