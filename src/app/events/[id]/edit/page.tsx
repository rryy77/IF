"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import {
  getDateInputBounds,
  ManualEventFormFields,
} from "@/components/ManualEventFormFields";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { getEventById, updateConfirmedEvent } from "@/lib/storage";
import type { EventItem } from "@/lib/types";
import {
  eventToForm,
  formToUpdatedEventItem,
  validateManualEvent,
  type ManualEventErrors,
  type ManualEventForm,
} from "@/lib/validateManualEvent";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const dateBounds = useMemo(() => getDateInputBounds(), []);

  const [existing, setExisting] = useState<EventItem | null>(null);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [form, setForm] = useState<ManualEventForm | null>(null);
  const [errors, setErrors] = useState<ManualEventErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const event = await getEventById(eventId);
        if (!event) {
          router.replace("/");
          return;
        }
        const { form: initialForm, isRangeMode: range } = eventToForm(event);
        setExisting(event);
        setForm(initialForm);
        setIsRangeMode(range);
      } catch (err) {
        alert(err instanceof Error ? err.message : "予定の読み込みに失敗しました");
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId, router]);

  function update<K extends keyof ManualEventForm>(
    key: K,
    value: ManualEventForm[K]
  ) {
    if (!form) return;
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    if (errors[key as keyof ManualEventErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function switchToRange(on: boolean) {
    if (!form) return;
    setIsRangeMode(on);
    setErrors((prev) => ({ ...prev, endDate: undefined, date: undefined }));
    if (on && !form.endDate) {
      setForm((prev) => (prev ? { ...prev, endDate: prev.date } : prev));
    }
    if (!on) {
      setForm((prev) => (prev ? { ...prev, endDate: "" } : prev));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !existing) return;

    const validation = validateManualEvent(form, isRangeMode);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setSaving(true);
    try {
      const updated = formToUpdatedEventItem(form, isRangeMode, existing, {
        updateDescription: false,
      });
      await updateConfirmedEvent(updated);
      router.push("/");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "予定の更新に失敗しました。Supabaseの設定を確認してください。"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <AppShell>
        <p className="text-center text-sm text-muted">読み込み中...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="予定を編集"
        subtitle="変更後も前日に通知されます"
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
          showMemoField={false}
        />

        <Button type="submit" disabled={saving}>
          {saving ? "保存中..." : "保存"}
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
