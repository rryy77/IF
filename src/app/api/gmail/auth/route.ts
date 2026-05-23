import { NextResponse } from "next/server";
import {
  LEGACY_OAUTH_CALLBACK_PATH,
  OAuthConfigError,
  getGoogleOAuthConfig,
  getGoogleRedirectUri,
  getSiteBaseUrl,
} from "@/lib/gmail/config";
import { buildGoogleAuthUrl } from "@/lib/gmail/oauth";
import { handleOAuthRouteError } from "@/lib/gmail/oauthRouteUtils";

export const runtime = "nodejs";

function logOAuthDebugContext(redirectUri: string) {
  const envGoogleRedirect = process.env.GOOGLE_REDIRECT_URI?.trim() ?? "(unset)";
  const envGmailRedirect =
    process.env.GMAIL_REDIRECT_URI?.trim() ?? "(unset)";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "(unset)";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "(unset)";

  console.log("OAuth redirect_uri:", redirectUri);
  console.log("[gmail/oauth-debug] env snapshot:", {
    GOOGLE_REDIRECT_URI: envGoogleRedirect,
    GMAIL_REDIRECT_URI: envGmailRedirect,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_APP_URL: appUrl,
    getSiteBaseUrl: (() => {
      try {
        return getSiteBaseUrl();
      } catch {
        return "(error)";
      }
    })(),
    redirectUriEndsWithSlash: redirectUri.endsWith("/"),
    usesGmailRedirectEnv: envGmailRedirect !== "(unset)",
    usesGoogleRedirectEnv: envGoogleRedirect !== "(unset)",
    containsLocalhost:
      redirectUri.includes("localhost") ||
      envGoogleRedirect.includes("localhost") ||
      envGmailRedirect.includes("localhost"),
    containsLegacyCallback:
      redirectUri.includes(LEGACY_OAUTH_CALLBACK_PATH) ||
      envGoogleRedirect.includes(LEGACY_OAUTH_CALLBACK_PATH) ||
      envGmailRedirect.includes(LEGACY_OAUTH_CALLBACK_PATH),
  });
}

/** Google OAuth 認証へリダイレクト（redirect_uri = canonical /api/gmail/callback） */
export async function GET() {
  try {
    const state = crypto.randomUUID();

    // 実際に Google へ送る redirect_uri を明示取得してログ
    const { redirectUri: configRedirectUri } = getGoogleOAuthConfig();
    const redirectUri = getGoogleRedirectUri();
    logOAuthDebugContext(redirectUri);
    if (configRedirectUri !== redirectUri) {
      console.warn(
        "[gmail/oauth-debug] config redirectUri differs:",
        configRedirectUri,
        redirectUri
      );
    }

    const authUrl = buildGoogleAuthUrl(state);
    console.log("Generated Google OAuth URL:", authUrl);

    const res = NextResponse.redirect(authUrl);
    res.cookies.set("gmail_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return res;
  } catch (e) {
    if (e instanceof OAuthConfigError) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
    return handleOAuthRouteError(e);
  }
}
