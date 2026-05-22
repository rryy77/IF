import { createAdminClient } from "@/lib/supabase/admin";
import { rowToEvent } from "@/lib/supabase/eventMapper";
import type { EventItem } from "@/lib/types";
import { isRangeEvent } from "@/lib/eventUtils";

/** 明日リマインド対象（reminder_sent_at が null） */
export async function fetchTomorrowReminderEvents(
  tomorrow: string
): Promise<EventItem[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null);

  if (error) {
    throw new Error(`明日の予定取得に失敗: ${error.message}`);
  }

  const events = (data ?? []).map(rowToEvent);

  return events.filter((event) => isReminderTarget(event, tomorrow));
}

function isReminderTarget(event: EventItem, tomorrow: string): boolean {
  if (isRangeEvent(event) && event.endDate) {
    return event.date <= tomorrow && event.endDate >= tomorrow;
  }
  return event.date === tomorrow;
}

export async function markRemindersSent(eventIds: string[]): Promise<void> {
  if (eventIds.length === 0) return;

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("events")
    .update({ reminder_sent_at: now })
    .in("id", eventIds);

  if (error) {
    throw new Error(`reminder_sent_at 更新に失敗: ${error.message}`);
  }
}
