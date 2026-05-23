"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventItem } from "@/lib/types";
import { EventCardOverflowMenu } from "@/components/EventCardOverflowMenu";
import { EventDescriptionBox } from "@/components/EventDescriptionBox";
import {
  formatDateJa,
  formatDateRange,
  formatTime,
  getMonthLabel,
  getRangeCardStyle,
  groupEventsByMonth,
  hasEventMemo,
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
  onEdit?: (id: string) => void;
  onMemo?: (id: string) => void;
  onDeleteMemo?: (id: string) => void;
  onDelete?: (id: string, isRange: boolean) => void;
  highlightToday?: boolean;
  selectMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  showCardActions?: boolean;
};

const memoBtnBase =
  "min-h-[32px] shrink-0 rounded-lg px-3 py-1 text-sm transition-colors active:scale-[0.98]";

const memoCreateClass = `${memoBtnBase} border border-amber-500/30 bg-amber-500/10 text-amber-200/90 hover:bg-amber-500/15`;

const memoDeleteClass = `${memoBtnBase} border border-slate-500/30 bg-slate-800/40 text-slate-400 hover:bg-slate-700/50`;

export function CalendarList({
  events,
  emptyMessage = "まだ予定がありません。右上の＋からPDFを追加できます。",
  onEdit,
  onMemo,
  onDeleteMemo,
  onDelete,
  highlightToday = false,
  selectMode = false,
  selectedIds = new Set(),
  onToggleSelect,
  showCardActions = true,
}: CalendarListProps) {
  const [openMenuEventId, setOpenMenuEventId] = useState<string | null>(null);

  const grouped = useMemo(() => groupEventsByMonth(events), [events]);
  const months = useMemo(
    () => Array.from(grouped.keys()).sort(),
    [grouped]
  );

  useEffect(() => {
    if (!openMenuEventId) return;

    const closeMenu = () => setOpenMenuEventId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [openMenuEventId]);

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-muted/30 bg-card/50 p-8 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  const showOverflowMenu =
    showCardActions && !selectMode && (onEdit || onDelete);
  const showMemoActions =
    showCardActions && !selectMode && (onMemo || onDeleteMemo);

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
              const rangeLabel = isActiveRange ? "期間中" : "期間予定";
              const isSelected = selectedIds.has(event.id);
              const hasMemo = hasEventMemo(event);

              const showMemoBtn =
                showMemoActions &&
                ((!hasMemo && onMemo) || (hasMemo && onDeleteMemo));

              return (
                <div
                  key={event.id}
                  className={`relative flex gap-3 rounded-xl border p-3 pr-10 ${
                    showMemoBtn ? "pb-10" : ""
                  } ${
                    range
                      ? rangeStyle!.card
                      : `${NORMAL_CARD_STYLE} ${isTodaySingle ? "ring-2 ring-main/50" : ""}`
                  }`}
                >
                  {showOverflowMenu && (
                    <EventCardOverflowMenu
                      isOpen={openMenuEventId === event.id}
                      onToggle={() =>
                        setOpenMenuEventId((prev) =>
                          prev === event.id ? null : event.id
                        )
                      }
                      onEdit={() => {
                        setOpenMenuEventId(null);
                        onEdit?.(event.id);
                      }}
                      onDelete={() => {
                        setOpenMenuEventId(null);
                        onDelete?.(event.id, range);
                      }}
                    />
                  )}

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
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${rangeStyle!.accent}`}
                      >
                        {formatDateRange(event)}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {event.title}
                      </p>
                      {hasMemo && (
                        <EventDescriptionBox
                          text={event.description!}
                          onClick={
                            onMemo ? () => onMemo(event.id) : undefined
                          }
                        />
                      )}
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
                        {hasMemo && (
                          <EventDescriptionBox
                            text={event.description!}
                            onClick={
                              onMemo ? () => onMemo(event.id) : undefined
                            }
                          />
                        )}
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] ${TYPE_COLORS[event.type]}`}
                        >
                          {TYPE_LABELS[event.type]}
                        </span>
                      </div>
                    </>
                  )}

                  {showMemoBtn && (
                    <div className="absolute bottom-2 right-2 z-10">
                      {!hasMemo && onMemo && (
                        <button
                          type="button"
                          onClick={() => onMemo(event.id)}
                          className={memoCreateClass}
                        >
                          メモ作成
                        </button>
                      )}
                      {hasMemo && onDeleteMemo && (
                        <button
                          type="button"
                          onClick={() => onDeleteMemo(event.id)}
                          className={memoDeleteClass}
                        >
                          メモ削除
                        </button>
                      )}
                    </div>
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
