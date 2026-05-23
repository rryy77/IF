"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  getDateInputBounds,
  ManualEventFormFields,
} from "@/components/ManualEventFormFields";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { getTodayDateString } from "@/lib/eventUtils";
import { createManualEvent } from "@/lib/storage";
import {
  formToNewEventItem,
  validateManualEvent,
  type ManualEventErrors,
  type ManualEventForm,
} from "@/lib/validateManualEvent";

export default function NewManualEventPage() {
  const router = useRouter();
  const dateBounds = useMemo(() => getDateInputBounds(), []);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [form, setForm] = useState<ManualEventForm>({
    title: "",
    date: getTodayDateString(),
    endDate: "",
    startTime: "",
    type: "other",
    description: "",
  });
  const [errors, setErrors] = useState<ManualEventErrors>({});
  const [saving, setSaving] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateManualEvent(form, isRangeMode);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setSaving(true);
    try {
      const event = formToNewEventItem(form, isRangeMode);
      await createManualEvent(event);
      router.push("/");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "予定の保存に失敗しました。Supabaseの設定を確認してください。"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="手動予定を作成"
        subtitle="自分で予定を追加します"
        backHref="/"
        backLabel="戻る"
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <ManualEventFormFields
          form={form}
          errors={errors}
          isRangeMode={isRangeMode}
          dateBounds={dateBounds}
          onUpdate={update}
          onSwitchRange={switchToRange}
        />

        <Button type="submit" disabled={saving}>
          {saving ? "作成中..." : "作成"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={saving}
          onClick={() => router.push("/")}
        >
          キャンセル
        </Button>
      </form>
    </AppShell>
  );
}
