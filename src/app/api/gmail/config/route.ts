import { NextResponse } from "next/server";
import { getGmailEnvStatus, getGmailSearchQuery } from "@/lib/gmail/config";

export const runtime = "nodejs";

/** Gmail 連携の環境変数・設定状態（UI 表示用・常に 200） */
export async function GET() {
  const env = getGmailEnvStatus();
  return NextResponse.json({
    oauthReady: env.oauthReady,
    missingEnv: env.missingEnv,
    gmailSearchQuery: getGmailSearchQuery(),
    authUrl: "/api/gmail/auth",
    checkUrl: "/api/gmail/check-sakura-mails",
  });
}
