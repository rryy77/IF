import { NextResponse } from "next/server";
import { OAuthConfigError } from "@/lib/gmail/config";
import { buildGoogleAuthUrl } from "@/lib/gmail/oauth";
import { handleOAuthRouteError } from "@/lib/gmail/oauthRouteUtils";

export const runtime = "nodejs";

/** Google OAuth 認証へリダイレクト（redirect_uri = GOOGLE_REDIRECT_URI） */
export async function GET() {
  try {
    const state = crypto.randomUUID();
    const url = buildGoogleAuthUrl(state);
    const res = NextResponse.redirect(url);
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
