import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/google-calendar";
import { saveGoogleConnection } from "@/lib/tenant";

/** Deve casar com o redirect usado em /api/google/connect. */
function resolveRedirectUri(req: NextRequest): string {
  const fromEnv = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (fromEnv) return fromEnv;
  return new URL("/api/google/callback", req.nextUrl.origin).toString();
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const params = req.nextUrl.searchParams;

  if (params.get("error")) {
    return NextResponse.redirect(new URL("/admin?google=error", origin));
  }

  const code = params.get("code");
  const state = params.get("state");
  const cookieState = req.cookies.get("g_oauth_state")?.value;

  // Confere o state anti-CSRF.
  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(new URL("/admin?google=error", origin));
  }

  const result = await exchangeCode(code, resolveRedirectUri(req));
  if (!result?.refreshToken) {
    // Sem refresh token (ex.: consentimento sem prompt=consent) → reconectar.
    return NextResponse.redirect(new URL("/admin?google=error", origin));
  }

  const saved = await saveGoogleConnection({
    refreshToken: result.refreshToken,
    accountEmail: result.email,
  });

  const response = NextResponse.redirect(
    new URL(saved ? "/admin?google=connected" : "/admin?google=error", origin)
  );
  response.cookies.delete("g_oauth_state");
  return response;
}
