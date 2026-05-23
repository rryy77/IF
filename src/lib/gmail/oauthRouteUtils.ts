import { NextResponse } from "next/server";
import { OAuthConfigError, getNoticesRedirectUrl } from "./config";
import { redirectGmailError } from "./callbackHandler";

export function oauthConfigErrorResponse(error: OAuthConfigError): NextResponse {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

export function handleOAuthRouteError(e: unknown): NextResponse {
  if (e instanceof OAuthConfigError) {
    return oauthConfigErrorResponse(e);
  }
  const message = e instanceof Error ? e.message : "Unknown error";
  try {
    return redirectGmailError(message);
  } catch {
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
