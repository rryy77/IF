"use client";

import { useState } from "react";
import type { EventItem } from "@/lib/types";
import { TYPE_LABELS, TYPE_OPTIONS } from "@/lib/eventUtils";
import { Button } from "@/components/ui/Button";

type EventEditModalProps = {
  event: EventItem;
  onSave: (updated: EventItem) => void;
  onClose: () => void;
};

export function EventEditModal({
  event,
  onSave,
  onClose,
}: EventEditModalProps) {
  const [form, setForm] = useState<EventItem>({ ...event });

  function update<K extends keyof EventItem>(key: K, value: EventItem[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          予定を編集
        </h2>

        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-muted">タイトル</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-foreground"
            />
          </label>

          <label className="block">
            <span className="text-xs text-muted">開始日</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-foreground"
            />
          </label>

          <label className="block">
            <span className="text-xs text-muted">終了日（期間予定）</span>
            <input
              type="date"
              value={form.endDate ?? ""}
              onChange={(e) =>
                update("endDate", e.target.value || undefined)
              }
              className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-foreground"
            />
          </label>

          <label className="block">
            <span className="text-xs text-muted">開始時刻</span>
            <input
              type="time"
              value={form.startTime ?? ""}
              onChange={(e) =>
                update("startTime", e.target.value || undefined)
              }
              className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-foreground"
            />
          </label>

          <label className="block">
            <span className="text-xs text-muted">種類</span>
            <select
              value={form.type}
              onChange={(e) =>
                update("type", e.target.value as EventItem["type"])
              }
              className="mt-1 w-full rounded-xl bg-background px-3 py-2 text-foreground"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>

        </div>

        <div className="mt-5 space-y-2">
          <Button onClick={() => onSave(form)}>保存</Button>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
}
