import { NextResponse } from "next/server";
import { setAutoMonitorEnabled } from "@/lib/gmail/tokenStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { autoMonitorEnabled } = (await request.json()) as {
      autoMonitorEnabled?: boolean;
    };

    if (typeof autoMonitorEnabled !== "boolean") {
      return NextResponse.json(
        { error: "autoMonitorEnabled が必要です" },
        { status: 400 }
      );
    }

    await setAutoMonitorEnabled(autoMonitorEnabled);
    return NextResponse.json({ ok: true, autoMonitorEnabled });
  } catch (e) {
    const message = e instanceof Error ? e.message : "設定更新失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
