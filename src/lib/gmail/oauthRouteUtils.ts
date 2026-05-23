import { NextResponse } from "next/server";
import { OAuthConfigError, getSiteBaseUrl } from "./config";

export function oauthConfigErrorResponse(error: OAuthConfigError): NextResponse {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

export function redirectToNotices(
  query: Record<string, string>
): NextResponse {
  const base = getSiteBaseUrl();
  const params = new URLSearchParams(query);
  return NextResponse.redirect(`${base}/notices?${params.toString()}`);
}

export function handleOAuthRouteError(e: unknown): NextResponse {
  if (e instanceof OAuthConfigError) {
    return oauthConfigErrorResponse(e);
  }
  const message = e instanceof Error ? e.message : "Unknown error";
  try {
    return redirectToNotices({ gmail_error: message });
  } catch {
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
