import type { EventItem } from "./types";

export function formatDateJa(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const date = new Date(y, m - 1, d);
  const w = weekdays[date.getDay()];
  return `${m}月${d}日（${w}）`;
}

export function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export function formatDateRange(event: EventItem): string {
  if (isRangeEvent(event)) {
    return `${formatShortDate(event.date)} 〜 ${formatShortDate(event.endDate!)}`;
  }
  return formatDateJa(event.date);
}

export function formatTime(event: EventItem): string {
  if (event.startTime && event.endTime) {
    return `${event.startTime}〜${event.endTime}`;
  }
  if (event.startTime) return event.startTime;
  if (isRangeEvent(event)) return "期間指定";
  return "終日";
}

export function formatConfidence(confidence?: number): string {
  if (confidence === undefined) return "—";
  return `${Math.round(confidence * 100)}%`;
}

export const TYPE_LABELS: Record<EventItem["type"], string> = {
  school: "学校行事",
  test: "試験",
  event: "イベント",
  holiday: "祝日・休日",
  other: "その他",
};

export const TYPE_COLORS: Record<EventItem["type"], string> = {
  school: "bg-main/20 text-main",
  test: "bg-amber-500/20 text-amber-300",
  event: "bg-emerald-500/20 text-emerald-300",
  holiday: "bg-rose-500/20 text-rose-300",
  other: "bg-muted/20 text-muted",
};

export const TYPE_OPTIONS: EventItem["type"][] = [
  "school",
  "test",
  "event",
  "holiday",
  "other",
];

export function groupEventsByMonth(
  events: EventItem[]
): Map<string, EventItem[]> {
  const map = new Map<string, EventItem[]>();
  for (const event of events) {
    const monthKey = event.date.slice(0, 7);
    const list = map.get(monthKey) ?? [];
    list.push(event);
    map.set(monthKey, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => a.date.localeCompare(b.date));
  }
  return map;
}

export function getMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-");
  return `${y}年${Number(m)}月`;
}

export function sortEventsByDate(events: EventItem[]): EventItem[] {
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}

export function getTodayDateString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function hasEventMemo(event: EventItem): boolean {
  return Boolean(event.description?.trim());
}

export function isRangeEvent(event: EventItem): boolean {
  return Boolean(event.endDate && event.endDate !== event.date);
}

export function getRangeDays(startDate: string, endDate?: string): number {
  if (!endDate || endDate === startDate) return 1;
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/** 今日が期間内か（期間予定のみ） */
export function isRangeEventActiveToday(event: EventItem): boolean {
  if (!isRangeEvent(event) || !event.endDate) return false;
  const today = getTodayDateString();
  return event.date <= today && event.endDate >= today;
}

/** 今日以降に関係する予定のみ */
export function getUpcomingEvents(events: EventItem[]): EventItem[] {
  const today = getTodayDateString();
  return events
    .filter((event) => {
      if (isRangeEvent(event)) {
        return event.endDate! >= today;
      }
      return event.date >= today;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function isSingleDayEventToday(event: EventItem): boolean {
  if (isRangeEvent(event)) return false;
  return event.date === getTodayDateString();
}

export type RangeCardStyle = {
  card: string;
  label: string;
  accent: string;
};

export function getRangeCardStyle(type: EventItem["type"]): RangeCardStyle {
  if (type === "test") {
    return {
      card: "bg-[#7f1d1d] border-[#f87171]",
      label: "text-[#fecaca] bg-[#991b1b]/60",
      accent: "text-[#fecaca]",
    };
  }
  return {
    card: "bg-[#1e1b4b] border-[#818cf8]",
    label: "text-[#a5b4fc] bg-[#312e81]/60",
    accent: "text-[#a5b4fc]",
  };
}

export const NORMAL_CARD_STYLE =
  "bg-card border-[#334155]";
