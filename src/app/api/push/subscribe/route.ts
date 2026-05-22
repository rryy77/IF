import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PushSubscriptionPayload } from "@/lib/supabase/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PushSubscriptionPayload & {
      userAgent?: string;
    };

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json(
        { error: "購読情報が不正です" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        user_agent: body.userAgent ?? null,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      return NextResponse.json(
        { error: `Supabase保存に失敗: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "不明なエラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
