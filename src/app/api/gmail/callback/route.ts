import { NextResponse } from "next/server";
import { OAuthConfigError, getSiteBaseUrl } from "@/lib/gmail/config";
import {
  exchangeCodeForTokens,
  fetchGoogleUserEmail,
} from "@/lib/gmail/oauth";
import {
  handleOAuthRouteError,
  oauthConfigErrorResponse,
} from "@/lib/gmail/oauthRouteUtils";
import { saveGmailToken } from "@/lib/gmail/tokenStore";

export const runtime = "nodejs";

/** OAuth コールバック（token 交換の redirect_uri = GOOGLE_REDIRECT_URI） */
export async function GET(request: Request) {
  try {
    const base = getSiteBaseUrl();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (error) {
      return NextResponse.redirect(
        `${base}/notices?gmail_error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(`${base}/notices?gmail_error=missing_code`);
    }

    const cookieState = request.headers
      .get("cookie")
      ?.match(/gmail_oauth_state=([^;]+)/)?.[1];

    if (!state || !cookieState || state !== cookieState) {
      return NextResponse.redirect(`${base}/notices?gmail_error=invalid_state`);
    }

    const tokens = await exchangeCodeForTokens(code);
    const email = await fetchGoogleUserEmail(tokens.accessToken);

    await saveGmailToken({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      userEmail: email,
    });

    const res = NextResponse.redirect(`${base}/notices?gmail_connected=1`);
    res.cookies.delete("gmail_oauth_state");
    return res;
  } catch (e) {
    if (e instanceof OAuthConfigError) {
      return oauthConfigErrorResponse(e);
    }
    return handleOAuthRouteError(e);
  }
}
