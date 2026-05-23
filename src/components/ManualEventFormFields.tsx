"use client";

import type { EventItem } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/eventUtils";
import type { ManualEventErrors, ManualEventForm } from "@/lib/validateManualEvent";

const MANUAL_TYPES: EventItem["type"][] = [
  "school",
  "test",
  "event",
  "other",
];

const inputClass =
  "mt-1 w-full rounded-xl border border-[#334155] bg-background px-3 py-3 text-foreground";

export function getDateInputBounds(): { min: string; max: string } {
  const y = new Date().getFullYear();
  return {
    min: `${y - 1}-01-01`,
    max: `${y + 2}-12-31`,
  };
}

type ManualEventFormFieldsProps = {
  form: ManualEventForm;
  errors: ManualEventErrors;
  isRangeMode: boolean;
  dateBounds: { min: string; max: string };
  onUpdate: <K extends keyof ManualEventForm>(
    key: K,
    value: ManualEventForm[K]
  ) => void;
  onSwitchRange: (on: boolean) => void;
  /** false のときメモ欄を非表示（予定編集画面用） */
  showMemoField?: boolean;
};

export function ManualEventFormFields({
  form,
  errors,
  isRangeMode,
  dateBounds,
  onUpdate,
  onSwitchRange,
  showMemoField = true,
}: ManualEventFormFieldsProps) {
  return (
    <div className="rounded-2xl border border-[#334155] bg-card p-4">
      <label className="block">
        <span className="text-xs text-muted">タイトル</span>
        <input
          type="text"
          value={form.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="例：期末試験"
          className={inputClass}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-300">{errors.title}</p>
        )}
      </label>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted">
            {isRangeMode ? "開始日" : "日付"}
          </span>
          <div
            className="flex rounded-lg bg-background p-0.5 text-xs"
            role="group"
            aria-label="予定の日付タイプ"
          >
            <button
              type="button"
              onClick={() => onSwitchRange(false)}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                !isRangeMode
                  ? "bg-card text-main"
                  : "text-muted hover:text-foreground"
              }`}
            >
              単日
            </button>
            <button
              type="button"
              onClick={() => onSwitchRange(true)}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                isRangeMode
                  ? "bg-card text-main"
                  : "text-muted hover:text-foreground"
              }`}
            >
              期間
            </button>
          </div>
        </div>
        <input
          type="date"
          value={form.date}
          min={dateBounds.min}
          max={dateBounds.max}
          onChange={(e) => onUpdate("date", e.target.value)}
          className={inputClass}
        />
        {errors.date && (
          <p className="mt-1 text-xs text-red-300">{errors.date}</p>
        )}
      </div>

      {isRangeMode && (
        <label className="mt-4 block">
          <span className="text-xs text-muted">終了日</span>
          <input
            type="date"
            value={form.endDate}
            min={form.date || dateBounds.min}
            max={dateBounds.max}
            onChange={(e) => onUpdate("endDate", e.target.value)}
            className={inputClass}
          />
          {errors.endDate && (
            <p className="mt-1 text-xs text-red-300">{errors.endDate}</p>
          )}
        </label>
      )}

      <label className="mt-4 block">
        <span className="text-xs text-muted">時間（任意）</span>
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => onUpdate("startTime", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs text-muted">種類</span>
        <select
          value={form.type}
          onChange={(e) => onUpdate("type", e.target.value as EventItem["type"])}
          className={inputClass}
        >
          {MANUAL_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>

      {showMemoField && (
        <label className="mt-4 block">
          <span className="text-xs text-muted">メモ / 詳細（任意）</span>
          <textarea
            value={form.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            rows={4}
            placeholder={"例：\n7/1 国語・数学\n7/2 英語・理科"}
            className={`${inputClass} resize-none`}
          />
        </label>
      )}
    </div>
  );
}
