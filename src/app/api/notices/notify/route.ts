import { NextResponse } from "next/server";
import { sendPushToAll } from "@/lib/push/webPushServer";

export const runtime = "nodejs";

type NotifyBody = {
  title?: string;
  body: string;
  url?: string;
};

/** さくら連絡網取り込み時の即時PWA通知 */
export async function POST(request: Request) {
  try {
    const json = (await request.json()) as NotifyBody;
    if (!json.body?.trim()) {
      return NextResponse.json(
        { error: "通知本文が必要です" },
        { status: 400 }
      );
    }

    const result = await sendPushToAll({
      title: json.title?.trim() || "latest IF",
      body: json.body.trim(),
      url: json.url ?? "/notices",
    });

    return NextResponse.json({
      ok: true,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "通知送信に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
