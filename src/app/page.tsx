"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CalendarList } from "@/components/CalendarList";
import { MemoEditModal } from "@/components/MemoEditModal";
import { DeleteManagePanel } from "@/components/DeleteManagePanel";
import { GmailForegroundChecker } from "@/components/GmailForegroundChecker";
import { HomeHeader } from "@/components/HomeHeader";
import { NotificationSettings } from "@/components/NotificationSettings";
import { SelectDeleteToolbar } from "@/components/SelectDeleteToolbar";
import { getUpcomingEvents } from "@/lib/eventUtils";
import {
  deleteAllConfirmedEvents,
  deleteConfirmedEvent,
  deleteConfirmedEventsByIds,
  deletePastConfirmedEvents,
  getConfirmedEvents,
  getEventById,
  updateEventDescription,
} from "@/lib/storage";
import type { EventItem } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showManageMenu, setShowManageMenu] = useState(false);
  const [isSelectDeleteMode, setIsSelectDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [memoEvent, setMemoEvent] = useState<EventItem | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getConfirmedEvents();
      setEvents(data);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "予定の読み込みに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const upcomingEvents = useMemo(
    () => getUpcomingEvents(events),
    [events]
  );

  useEffect(() => {
    loadEvents();
    const onUpdate = () => loadEvents();
    window.addEventListener("latest-if-events-updated", onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      window.removeEventListener("latest-if-events-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [loadEvents]);

  async function handleDeleteEvent(id: string, isRange: boolean) {
    const message = isRange
      ? "この期間予定を削除しますか？"
      : "この予定を削除しますか？";
    if (!window.confirm(message)) return;
    try {
      await deleteConfirmedEvent(id);
      await loadEvents();
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    }
  }

  async function handleDeleteAll() {
    if (
      !window.confirm(
        "すべての予定を削除しますか？この操作は取り消せません。"
      )
    ) {
      return;
    }
    try {
      await deleteAllConfirmedEvents();
      setEvents([]);
      setShowManageMenu(false);
      setIsSelectDeleteMode(false);
      setSelectedIds(new Set());
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    }
  }

  async function handleDeletePast() {
    if (!window.confirm("今日より前の予定をすべて削除しますか？")) return;
    try {
      await deletePastConfirmedEvents();
      await loadEvents();
      setShowManageMenu(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    }
  }

  function handleStartSelectDelete() {
    setShowManageMenu(false);
    setIsSelectDeleteMode(true);
    setSelectedIds(new Set());
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    if (!window.confirm("選択した予定を削除しますか？")) return;
    try {
      await deleteConfirmedEventsByIds(Array.from(selectedIds));
      await loadEvents();
      setSelectedIds(new Set());
      setIsSelectDeleteMode(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "削除に失敗しました");
    }
  }

  function handleCancelSelect() {
    setIsSelectDeleteMode(false);
    setSelectedIds(new Set());
  }

  async function handleOpenMemo(id: string) {
    try {
      const event = await getEventById(id);
      if (event) setMemoEvent(event);
    } catch (e) {
      alert(e instanceof Error ? e.message : "予定の読み込みに失敗しました");
    }
  }

  async function handleSaveMemo(description: string | null) {
    if (!memoEvent) return;
    await updateEventDescription(memoEvent.id, description);
    await loadEvents();
  }

  async function handleDeleteMemo(id: string) {
    if (!window.confirm("このメモを削除しますか？")) return;
    try {
      await updateEventDescription(id, null);
      await loadEvents();
    } catch (e) {
      alert(e instanceof Error ? e.message : "メモの削除に失敗しました");
    }
  }

  function handleEditClick() {
    if (isSelectDeleteMode) {
      handleCancelSelect();
      return;
    }
    setShowManageMenu((v) => !v);
  }

  return (
    <AppShell>
      <GmailForegroundChecker />
      <HomeHeader
        onEditClick={handleEditClick}
        isEditActive={showManageMenu || isSelectDeleteMode}
      />

      <NotificationSettings />

      {loadError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </div>
      )}

      {showManageMenu && !isSelectDeleteMode && (
        <DeleteManagePanel
          onDeleteAll={handleDeleteAll}
          onDeletePast={handleDeletePast}
          onStartSelectDelete={handleStartSelectDelete}
          onClose={() => setShowManageMenu(false)}
        />
      )}

      {isSelectDeleteMode && (
        <SelectDeleteToolbar
          selectedCount={selectedIds.size}
          onDeleteSelected={handleDeleteSelected}
          onCancel={handleCancelSelect}
        />
      )}

      {loading ? (
        <p className="text-center text-sm text-muted">読み込み中...</p>
      ) : (
        <CalendarList
          events={upcomingEvents}
          emptyMessage="今後の予定はありません。右上の＋からPDFを追加できます。"
          onEdit={(id) => router.push(`/events/${id}/edit`)}
          onMemo={handleOpenMemo}
          onDeleteMemo={handleDeleteMemo}
          onDelete={handleDeleteEvent}
          highlightToday
          selectMode={isSelectDeleteMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          showCardActions={!isSelectDeleteMode}
        />
      )}

      {memoEvent && (
        <MemoEditModal
          event={memoEvent}
          onSave={handleSaveMemo}
          onClose={() => setMemoEvent(null)}
        />
      )}
    </AppShell>
  );
}
