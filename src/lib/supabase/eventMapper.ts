import type { EventItem } from "@/lib/types";
import type { EventRow } from "./types";

export function rowToEvent(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    endDate: row.end_date ?? undefined,
    startTime: row.start_time ?? undefined,
    endTime: row.end_time ?? undefined,
    type: row.type as EventItem["type"],
    status: row.status as EventItem["status"],
    source: row.source as EventItem["source"],
    rawText: row.raw_text ?? undefined,
    confidence: row.confidence ?? undefined,
  };
}

export function eventToInsertRow(
  event: EventItem
): Omit<EventRow, "id" | "reminder_sent_at" | "created_at"> {
  return {
    title: event.title,
    date: event.date,
    end_date: event.endDate ?? null,
    start_time: event.startTime ?? null,
    end_time: event.endTime ?? null,
    type: event.type,
    status: event.status ?? "confirmed",
    source: event.source ?? "pdf",
    raw_text: event.rawText ?? null,
    confidence: event.confidence ?? null,
  };
}
