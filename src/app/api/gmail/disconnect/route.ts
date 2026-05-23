import { NextResponse } from "next/server";
import { deleteGmailToken } from "@/lib/gmail/tokenStore";

export const runtime = "nodejs";

export async function POST() {
  try {
    await deleteGmailToken();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "解除失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
