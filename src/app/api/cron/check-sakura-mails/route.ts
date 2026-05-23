import { NextResponse } from "next/server";
import { processSakuraMails } from "@/lib/gmail/processSakuraMails";
import { getGmailToken } from "@/lib/gmail/tokenStore";

export const runtime = "nodejs";

/** Vercel Cron: さくら連絡網メール自動監視（30分ごと） */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getGmailToken();
    if (!token) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "Gmail未連携",
      });
    }

    if (!token.auto_monitor_enabled) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "自動監視OFF",
      });
    }

    const result = await processSakuraMails(20);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cron失敗";
    console.error("cron check-sakura-mails:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
