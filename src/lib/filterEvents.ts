import type { EventItem } from "./types";

/** 「特別補講」はユーザーに関係ない予定として除外 */
export function excludeSpecialLectureEvents(events: EventItem[]): EventItem[] {
  return events.filter((event) => {
    const text = `${event.title} ${event.rawText ?? ""}`;
    return !text.includes("特別補講");
  });
}
