"use client";

import { useMemo } from "react";
import type { EventItem } from "@/lib/types";
import {
  formatDateJa,
  formatDateRange,
  formatShortDate,
  formatTime,
  getMonthLabel,
  getRangeCardStyle,
  getRangeDays,
  groupEventsByMonth,
  isRangeEvent,
  isRangeEventActiveToday,
  isSingleDayEventToday,
  NORMAL_CARD_STYLE,
  TYPE_COLORS,
  TYPE_LABELS,
} from "@/lib/eventUtils";

type CalendarListProps = {
  events: EventItem[];
  emptyMessage?: string;
  onDelete?: (id: string, isRange: boolean) => void;
  highlightToday?: boolean;
  selectMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  showCardDelete?: boolean;
};

export function CalendarList({
  events,
  emptyMessage = "まだ予定がありません。右上の＋からPDFを追加できます。",
  onDelete,
  highlightToday = false,
  selectMode = false,
  selectedIds = new Set(),
  onToggleSelect,
  showCardDelete = true,
}: CalendarListProps) {
  const grouped = useMemo(() => groupEventsByMonth(events), [events]);
  const months = useMemo(
    () => Array.from(grouped.keys()).sort(),
    [grouped]
  );

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-muted/30 bg-card/50 p-8 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {months.map((monthKey) => (
        <section key={monthKey}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-main">
            <span className="h-px flex-1 bg-main/30" />
            {getMonthLabel(monthKey)}
            <span className="h-px flex-1 bg-main/30" />
          </h2>
          <div className="space-y-2">
            {(grouped.get(monthKey) ?? []).map((event) => {
              const range = isRangeEvent(event);
              const rangeStyle = range ? getRangeCardStyle(event.type) : null;
              const isTodaySingle =
                highlightToday && isSingleDayEventToday(event);
              const isActiveRange =
                highlightToday && isRangeEventActiveToday(event);
              const days = range
                ? getRangeDays(event.date, event.endDate)
                : 1;
              const rangeLabel = isActiveRange ? "期間中" : "期間予定";
              const isSelected = selectedIds.has(event.id);

              return (
                <div
                  key={event.id}
                  className={`relative flex gap-3 rounded-xl border p-3 ${
                    selectMode || !showCardDelete ? "pb-3" : "pb-9"
                  } ${
                    range
                      ? rangeStyle!.card
                      : `${NORMAL_CARD_STYLE} ${isTodaySingle ? "ring-2 ring-main/50" : ""}`
                  }`}
                >
                  {selectMode && onToggleSelect && (
                    <label className="flex shrink-0 items-start pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(event.id)}
                        className="h-5 w-5 accent-main"
                      />
                    </label>
                  )}

                  {range ? (
                    <>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${rangeStyle!.accent}`}
                        >
                          {formatDateRange(event)}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {event.title}
                        </p>
                        <p className="mt-1 text-sm text-muted">{days}日間</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${rangeStyle!.label}`}
                          >
                            {rangeLabel}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] ${TYPE_COLORS[event.type]}`}
                          >
                            {TYPE_LABELS[event.type]}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`flex w-12 shrink-0 flex-col items-center justify-center rounded-lg py-2 ${
                          isTodaySingle ? "bg-main/20" : "bg-background"
                        }`}
                      >
                        {isTodaySingle && (
                          <span className="mb-0.5 text-[10px] font-semibold text-main">
                            今日
                          </span>
                        )}
                        <span className="text-xs text-muted">
                          {Number(event.date.slice(5, 7))}月
                        </span>
                        <span className="text-xl font-bold text-main">
                          {Number(event.date.slice(8, 10))}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted">
                          {formatTime(event)} · {formatDateJa(event.date)}
                        </p>
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] ${TYPE_COLORS[event.type]}`}
                        >
                          {TYPE_LABELS[event.type]}
                        </span>
                      </div>
                    </>
                  )}

                  {showCardDelete && !selectMode && onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(event.id, range)}
                      className="absolute bottom-2 right-2 min-h-[32px] min-w-[52px] rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-300/90 transition-colors hover:bg-red-500/15 active:scale-[0.98]"
                    >
                      削除
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
