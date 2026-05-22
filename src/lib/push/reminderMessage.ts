import { formatShortDateJa } from "@/lib/dates/japan";
import type { EventItem } from "@/lib/types";
import { isRangeEvent } from "@/lib/eventUtils";

export function buildReminderNotification(events: EventItem[]): {
  title: string;
  body: string;
} {
  const title = "latest IF";

  if (events.length === 0) {
    return { title, body: "明日の予定はありません。" };
  }

  if (events.length === 1) {
    const e = events[0];
    if (isRangeEvent(e) && e.endDate) {
      return {
        title,
        body: `明日、${e.title}があります。期間：${formatShortDateJa(e.date)}〜${formatShortDateJa(e.endDate)}。忘れんなよ。`,
      };
    }
    return {
      title,
      body: `明日、${e.title}があります。忘れんなよ。`,
    };
  }

  const names = events
    .slice(0, 3)
    .map((e) => e.title)
    .join("、");

  return {
    title,
    body: `明日の予定が${events.length}件あります。${names}`,
  };
}
