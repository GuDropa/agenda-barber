import { NextRequest, NextResponse } from "next/server";
import { buildConsentUrl, isGoogleConfigured } from "@/lib/google-calendar";

/** URI de redirect: env explícito ou derivado do host da requisição. */
function resolveRedirectUri(req: NextRequest): string {
  const fromEnv = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (fromEnv) return fromEnv;
  return new URL("/api/google/callback", req.nextUrl.origin).toString();
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL("/admin?google=unconfigured", origin));
  }

  // State anti-CSRF: guardado em cookie httpOnly e conferido no callback.
  const state = globalThis.crypto.randomUUID();
  const consentUrl = buildConsentUrl({
    redirectUri: resolveRedirectUri(req),
    state,
  });

  if (!consentUrl) {
    return NextResponse.redirect(new URL("/admin?google=unconfigured", origin));
  }

  const response = NextResponse.redirect(consentUrl);
  response.cookies.set("g_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
