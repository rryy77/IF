import { NextResponse } from "next/server";
import { getGmailSearchQuery } from "@/lib/gmail/config";
import { getGmailToken } from "@/lib/gmail/tokenStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const token = await getGmailToken();
    return NextResponse.json({
      connected: Boolean(token),
      userEmail: token?.user_email ?? null,
      autoMonitorEnabled: token?.auto_monitor_enabled ?? false,
      gmailSearchQuery: getGmailSearchQuery(),
      expiresAt: token?.expires_at ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "状態取得失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
