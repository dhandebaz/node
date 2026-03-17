import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { settingsService } from "@/lib/services/settingsService";

/**
 * Protected debug endpoint to inspect where the Gemini API key is being resolved from.
 * - Only accessible to authenticated superadmins.
 * - Returns masked values so secrets are not leaked.
 *
 * Usage: GET /api/debug/gemini
 */

const ENV_CANDIDATES = [
  { name: "GEMINI_API_KEY", env: process.env.GEMINI_API_KEY },
  { name: "NEXT_PUBLIC_GEMINI_API_KEY", env: process.env.NEXT_PUBLIC_GEMINI_API_KEY },
  { name: "VERCEL_GEMINI_API_KEY", env: process.env.VERCEL_GEMINI_API_KEY },
  { name: "GOOGLE_GENERATIVE_AI_API_KEY", env: process.env.GOOGLE_GENERATIVE_AI_API_KEY },
  { name: "GOOGLE_GEMINI_API_KEY", env: process.env.GOOGLE_GEMINI_API_KEY },
  { name: "GOOGLE_API_KEY", env: process.env.GOOGLE_API_KEY },
  { name: "GCP_GEMINI_KEY", env: process.env.GCP_GEMINI_KEY },
];

function maskKey(value?: string | null) {
  if (!value) return null;
  const s = value.trim();
  if (s.length <= 8) return s.replace(/./g, "*");
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
}

function resolveSourceFrom(settingsKey?: string) {
  if (settingsKey && settingsKey.trim().length > 0) {
    return { source: "settings", present: true, key: settingsKey.trim() };
  }

  for (const candidate of ENV_CANDIDATES) {
    if (candidate.env && candidate.env.trim().length > 0) {
      return { source: candidate.name, present: true, key: candidate.env.trim() };
    }
  }

  return { source: "none", present: false, key: null };
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    // Only allow superadmin users to access this debug endpoint
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await settingsService.getSettings();
    const configuredKey = settings?.api?.geminiApiKey || null;
    const resolved = resolveSourceFrom(configuredKey);

    // Compose a summary of all env candidates (masked)
    const envOverview = ENV_CANDIDATES.map((c) => ({
      name: c.name,
      masked: maskKey(c.env || null),
      present: Boolean(c.env && c.env.trim().length > 0),
    }));

    return NextResponse.json({
      ok: true,
      source: resolved.source,
      present: resolved.present,
      // Do not echo the full secret. Provide masked representations.
      settings_key_masked: maskKey(configuredKey),
      env_keys: envOverview,
      // Helpful instruction for operators
      note:
        "If 'present' is false and no env key shows as present, set GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) in your environment or paste the key into Admin -> Settings -> API.",
    });
  } catch (err) {
    console.error("Debug /api/debug/gemini error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
