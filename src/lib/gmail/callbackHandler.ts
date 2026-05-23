import { NextResponse } from "next/server";
import {
  GMAIL_OAUTH_CALLBACK_PATH,
  LEGACY_OAUTH_CALLBACK_PATH,
  OAuthConfigError,
  getGoogleRedirectUri,
  getLegacyGoogleRedirectUri,
  getNoticesRedirectUrl,
} from "@/lib/gmail/config";
import {
  exchangeCodeForTokens,
  fetchGoogleUserEmail,
} from "@/lib/gmail/oauth";
import { saveGmailToken } from "@/lib/gmail/tokenStore";

export type GmailCallbackOptions = {
  /** token 交換時に Google へ送る redirect_uri（コールバック URL と完全一致必須） */
  redirectUriForExchange: string;
};

function redirectGmailSuccess(): NextResponse {
  const url = getNoticesRedirectUrl("gmail=connected");
  url.hash = "gmail-settings";
  const res = NextResponse.redirect(url);
  res.cookies.delete("gmail_oauth_state");
  return res;
}

function redirectGmailError(reason?: string): NextResponse {
  const url = getNoticesRedirectUrl("gmail=error");
  if (reason) {
    url.searchParams.set("reason", reason.slice(0, 200));
  }
  const res = NextResponse.redirect(url);
  res.cookies.delete("gmail_oauth_state");
  return res;
}

/**
 * Gmail OAuth コールバック共通処理
 */
export async function handleGmailOAuthCallback(
  request: Request,
  options: GmailCallbackOptions
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return redirectGmailError(oauthError);
  }

  const code = searchParams.get("code");
  if (!code) {
    return redirectGmailError("missing_code");
  }

  const state = searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.match(/gmail_oauth_state=([^;]+)/)?.[1];

  if (!state || !cookieState || state !== cookieState) {
    return redirectGmailError("invalid_state");
  }

  const tokens = await exchangeCodeForTokens(
    code,
    options.redirectUriForExchange
  );
  const email = await fetchGoogleUserEmail(tokens.accessToken);

  await saveGmailToken({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
    userEmail: email,
  });

  return redirectGmailSuccess();
}

export function getCanonicalCallbackRedirectUri(): string {
  return getGoogleRedirectUri();
}

export function getLegacyCallbackRedirectUri(): string {
  return getLegacyGoogleRedirectUri();
}

export {
  GMAIL_OAUTH_CALLBACK_PATH,
  LEGACY_OAUTH_CALLBACK_PATH,
  OAuthConfigError,
  redirectGmailError,
};
