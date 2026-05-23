"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/lib/types";
import {
  getDateInputBounds,
  ManualEventFormFields,
} from "@/components/ManualEventFormFields";
import { Button } from "@/components/ui/Button";
import {
  eventToForm,
  formToUpdatedEventItem,
  validateManualEvent,
  type ManualEventErrors,
  type ManualEventForm,
} from "@/lib/validateManualEvent";

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
  const dateBounds = useMemo(() => getDateInputBounds(), []);
  const initial = useMemo(() => eventToForm(event), [event]);
  const [isRangeMode, setIsRangeMode] = useState(initial.isRangeMode);
  const [form, setForm] = useState<ManualEventForm>(initial.form);
  const [errors, setErrors] = useState<ManualEventErrors>({});

  function update<K extends keyof ManualEventForm>(
    key: K,
    value: ManualEventForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof ManualEventErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function switchToRange(on: boolean) {
    setIsRangeMode(on);
    setErrors((prev) => ({ ...prev, endDate: undefined, date: undefined }));
    if (on && !form.endDate) {
      setForm((prev) => ({ ...prev, endDate: prev.date }));
    }
    if (!on) {
      setForm((prev) => ({ ...prev, endDate: "" }));
    }
  }

  function handleSave() {
    const validation = validateManualEvent(form, isRangeMode);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    onSave(
      formToUpdatedEventItem(form, isRangeMode, event, {
        updateDescription: false,
      })
    );
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

        <ManualEventFormFields
          form={form}
          errors={errors}
          isRangeMode={isRangeMode}
          dateBounds={dateBounds}
          onUpdate={update}
          onSwitchRange={switchToRange}
          showMemoField={false}
        />

        <div className="mt-5 space-y-2">
          <Button onClick={handleSave}>保存</Button>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
}
