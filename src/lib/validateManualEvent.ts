import type { EventItem } from "./types";
import { isRangeEvent } from "./eventUtils";

export type ManualEventForm = {
  title: string;
  date: string;
  endDate: string;
  startTime: string;
  type: EventItem["type"];
  description: string;
};

export type ManualEventErrors = Partial<
  Record<"title" | "date" | "endDate", string>
>;

export function validateManualEvent(
  form: ManualEventForm,
  isRangeMode: boolean
): ManualEventErrors {
  const errors: ManualEventErrors = {};

  if (!form.title.trim()) {
    errors.title = "タイトルを入力してください";
  }

  if (!form.date) {
    errors.date = isRangeMode
      ? "開始日を選択してください"
      : "日付を選択してください";
  }

  if (isRangeMode) {
    if (!form.endDate) {
      errors.endDate = "終了日を選択してください";
    } else if (form.date && form.endDate < form.date) {
      errors.endDate = "終了日は開始日以降にしてください";
    }
  }

  return errors;
}

export function eventToForm(event: EventItem): {
  form: ManualEventForm;
  isRangeMode: boolean;
} {
  const range = isRangeEvent(event);
  return {
    isRangeMode: range,
    form: {
      title: event.title,
      date: event.date,
      endDate: range && event.endDate ? event.endDate : "",
      startTime: event.startTime ?? "",
      type: event.type,
      description: event.description ?? "",
    },
  };
}

export function formToNewEventItem(
  form: ManualEventForm,
  isRangeMode: boolean
): EventItem {
  return {
    id: `manual-${Date.now()}`,
    title: form.title.trim(),
    date: form.date,
    endDate: isRangeMode && form.endDate ? form.endDate : undefined,
    startTime: form.startTime || undefined,
    type: form.type,
    description: form.description.trim() || undefined,
    status: "confirmed",
    source: "manual",
  };
}

export function formToUpdatedEventItem(
  form: ManualEventForm,
  isRangeMode: boolean,
  existing: EventItem,
  options?: { updateDescription?: boolean }
): EventItem {
  const updateDescription = options?.updateDescription ?? true;
  return {
    ...existing,
    title: form.title.trim(),
    date: form.date,
    endDate: isRangeMode && form.endDate ? form.endDate : undefined,
    startTime: form.startTime || undefined,
    type: form.type,
    description: updateDescription
      ? form.description.trim() || undefined
      : existing.description,
    status: "confirmed",
  };
}
