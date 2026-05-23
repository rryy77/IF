import { NextResponse } from "next/server";
import {
  GMAIL_OAUTH_CALLBACK_PATH,
  OAuthConfigError,
  getNoticesRedirectUrlFallback,
} from "@/lib/gmail/config";
import {
  getLegacyCallbackRedirectUri,
  handleGmailOAuthCallback,
  redirectGmailError,
} from "@/lib/gmail/callbackHandler";
import { oauthConfigErrorResponse } from "@/lib/gmail/oauthRouteUtils";

export const runtime = "nodejs";

/**
 * 旧 OAuth コールバック URL 互換
 * Google Console / Vercel に /api/auth/callback/google が残っている場合の救済
 */
export async function GET(request: Request) {
  try {
    const legacyUri = getLegacyCallbackRedirectUri();
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        `[gmail] Legacy callback hit; exchange redirect_uri=${legacyUri}. ` +
          `Update Google Console redirect to ...${GMAIL_OAUTH_CALLBACK_PATH}`
      );
    }
    return await handleGmailOAuthCallback(request, {
      redirectUriForExchange: legacyUri,
    });
  } catch (error) {
    console.error("Gmail callback error (legacy route):", error);

    if (error instanceof OAuthConfigError) {
      return oauthConfigErrorResponse(error);
    }

    try {
      return redirectGmailError(
        error instanceof Error ? error.message : "unknown"
      );
    } catch {
      return NextResponse.redirect(
        getNoticesRedirectUrlFallback("gmail=error")
      );
    }
  }
}
