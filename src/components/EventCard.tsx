import type { EventItem } from "@/lib/types";
import { formatDateRange, TYPE_COLORS, TYPE_LABELS } from "@/lib/eventUtils";

type EventCardProps = {
  event: EventItem;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  return (
    <article className="rounded-2xl border border-[#334155] bg-card p-4">
      <div className="mb-1 flex items-start justify-between gap-2">
        <time className="text-sm font-medium text-main">
          {formatDateRange(event)}
        </time>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${TYPE_COLORS[event.type]}`}
        >
          {TYPE_LABELS[event.type]}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>

      {event.startTime && (
        <p className="mt-1 text-sm text-muted">{event.startTime}</p>
      )}

      {(onEdit || onDelete) && (
        <div className="mt-3 flex gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 rounded-xl border border-main/40 py-2.5 text-sm text-main hover:bg-main/10"
            >
              編集
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 rounded-xl border border-red-500/30 py-2.5 text-sm text-red-300 hover:bg-red-500/10"
            >
              削除
            </button>
          )}
        </div>
      )}
    </article>
  );
}
