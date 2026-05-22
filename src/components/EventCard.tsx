import type { EventItem } from "@/lib/types";
import {
  formatConfidence,
  formatDateRange,
  formatTime,
  TYPE_COLORS,
  TYPE_LABELS,
} from "@/lib/eventUtils";

type EventCardProps = {
  event: EventItem;
  showDetail?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function EventCard({
  event,
  showDetail = false,
  onEdit,
  onDelete,
}: EventCardProps) {
  const confidenceLabel = formatConfidence(event.confidence);
  const isLowConfidence =
    event.confidence !== undefined && event.confidence < 0.8;

  return (
    <article className="rounded-2xl bg-card p-4 shadow-lg shadow-black/20">
      <div className="mb-2 flex items-start justify-between gap-2">
        <time className="text-sm text-muted">{formatDateRange(event)}</time>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[event.type]}`}
        >
          {TYPE_LABELS[event.type]}
        </span>
      </div>

      <h3 className="mb-1 text-lg font-semibold text-foreground">
        {event.title}
      </h3>
      <p className="text-sm text-muted">時間：{formatTime(event)}</p>

      {showDetail && (
        <>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span
              className={`rounded-lg px-2 py-1 ${
                isLowConfidence
                  ? "bg-amber-500/15 text-amber-200"
                  : "bg-background text-muted"
              }`}
            >
              信頼度：{confidenceLabel}
            </span>
            <span className="rounded-lg bg-background px-2 py-1 text-muted">
              状態：確認待ち
            </span>
          </div>

          {event.rawText && (
            <p className="mt-2 rounded-lg bg-background/80 px-3 py-2 text-xs leading-relaxed text-muted">
              <span className="text-main">原文：</span>
              {event.rawText}
            </p>
          )}

          {(onEdit || onDelete) && (
            <div className="mt-3 flex gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex-1 rounded-xl border border-main/40 py-2 text-sm text-main hover:bg-main/10"
                >
                  編集
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex-1 rounded-xl border border-red-500/30 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  削除
                </button>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}
