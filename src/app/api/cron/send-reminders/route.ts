import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { getTomorrowInJapanDateString } from "@/lib/dates/japan";
import { buildReminderNotification } from "@/lib/push/reminderMessage";
import {
  fetchTomorrowReminderEvents,
  markRemindersSent,
} from "@/lib/push/reminderQuery";
import { sendPushToAll } from "@/lib/push/webPushServer";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tomorrow = getTomorrowInJapanDateString();
    const events = await fetchTomorrowReminderEvents(tomorrow);

    if (events.length === 0) {
      return NextResponse.json({
        ok: true,
        tomorrow,
        message: "明日の未通知予定はありません",
        sent: 0,
      });
    }

    const { title, body } = buildReminderNotification(events);
    const result = await sendPushToAll({ title, body, url: "/" });

    await markRemindersSent(events.map((e) => e.id));

    return NextResponse.json({
      ok: true,
      tomorrow,
      events: events.length,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cron処理に失敗";
    console.error("send-reminders:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
