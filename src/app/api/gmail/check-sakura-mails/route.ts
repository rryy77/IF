import { NextResponse } from "next/server";
import { processSakuraMails } from "@/lib/gmail/processSakuraMails";

export const runtime = "nodejs";

/** 手動でさくら連絡網メールをチェック */
export async function POST() {
  try {
    const result = await processSakuraMails(20);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "チェック失敗";
    console.error("check-sakura-mails:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
