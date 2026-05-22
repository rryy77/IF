import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { sendPushToAll } from "@/lib/push/webPushServer";

export async function POST() {
  try {
    const result = await sendPushToAll({
      title: "latest IF",
      body: "通知テスト成功。これで前日通知を受け取れます。",
      url: "/",
    });

    if (result.sent === 0 && result.failed === 0) {
      return NextResponse.json(
        {
          error:
            "通知先が登録されていません。先に「通知をオンにする」を実行してください。",
        },
        { status: 400 }
      );
    }

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
