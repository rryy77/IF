"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EventCard } from "@/components/EventCard";
import { EventEditModal } from "@/components/EventEditModal";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { detectExtractionGaps } from "@/lib/detectExtractionGaps";
import { sortEventsByDate } from "@/lib/eventUtils";
import {
  addConfirmedEvents,
  clearPendingEvents,
  getPendingEvents,
  savePendingEvents,
} from "@/lib/storage";
import type { EventItem } from "@/lib/types";

export default function PreviewPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const pending = getPendingEvents();
    if (pending.length === 0) {
      router.replace("/add");
      return;
    }
    const sorted = sortEventsByDate(pending);
    setEvents(sorted);

    const gaps = detectExtractionGaps(sorted);
    if (gaps.length > 0) {
      console.warn("[latest IF] 抽出漏れの可能性:", gaps);
    }
  }, [router]);

  function persistEvents(updated: EventItem[]) {
    const sorted = sortEventsByDate(updated);
    setEvents(sorted);
    savePendingEvents(sorted);

    const gaps = detectExtractionGaps(sorted);
    if (gaps.length > 0) {
      console.warn("[latest IF] 抽出漏れの可能性:", gaps);
    }
  }

  function handleDelete(id: string) {
    if (!confirm("この予定を一覧から削除しますか？")) return;
    persistEvents(events.filter((e) => e.id !== id));
  }

  function handleSaveEdit(updated: EventItem) {
    persistEvents(
      events.map((e) => (e.id === updated.id ? updated : e))
    );
    setEditingEvent(null);
  }

  async function handleConfirm() {
    if (events.length === 0) {
      alert("追加する予定がありません。");
      return;
    }
    setSaving(true);
    try {
      const confirmed: EventItem[] = events.map((e) => ({
        ...e,
        status: "confirmed" as const,
      }));
      await addConfirmedEvents(confirmed);
      clearPendingEvents();
      sessionStorage.removeItem("latest-if-upload-filename");
      router.push("/");
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : "Supabaseへの保存に失敗しました。環境変数を確認してください。"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    clearPendingEvents();
    sessionStorage.removeItem("latest-if-upload-filename");
    router.push("/");
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <AppShell>
      <PageHeader
        title="読み取り結果"
        subtitle={`${events.length}件 · 内容を確認して追加`}
      />

      <div className="mb-6 space-y-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={() => setEditingEvent(event)}
            onDelete={() => handleDelete(event.id)}
          />
        ))}
      </div>

      <div className="space-y-3">
        <Button disabled={saving} onClick={handleConfirm}>
          {saving ? "保存中..." : "確認して追加"}
        </Button>
        <Button variant="secondary" onClick={() => router.push("/add")}>
          修正する（PDFを再選択）
        </Button>
        <Button variant="ghost" onClick={handleCancel}>
          キャンセル
        </Button>
      </div>

      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          onSave={handleSaveEdit}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </AppShell>
  );
}
