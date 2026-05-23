"use client";

import { useState } from "react";
import type { EventItem } from "@/lib/types";
import { formatMemoWithAI } from "@/lib/formatMemoWithAI";
import { formatDateRange } from "@/lib/eventUtils";
import { Button } from "@/components/ui/Button";

const textareaClass =
  "mt-2 w-full min-h-[200px] resize-y rounded-xl border border-[#334155] bg-background px-3 py-3 text-base leading-relaxed text-foreground placeholder:text-muted/60";

type MemoEditModalProps = {
  event: EventItem;
  onSave: (description: string | null) => Promise<void>;
  onClose: () => void;
};

export function MemoEditModal({ event, onSave, onClose }: MemoEditModalProps) {
  const [memo, setMemo] = useState(event.description ?? "");
  const [formatting, setFormatting] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleFormat() {
    setFormatting(true);
    try {
      const formatted = await formatMemoWithAI(memo);
      setMemo(formatted);
    } catch (err) {
      alert(err instanceof Error ? err.message : "整形に失敗しました");
    } finally {
      setFormatting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const trimmed = memo.trim();
      await onSave(trimmed || null);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "メモの保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#334155] bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="memo-edit-title"
      >
        <div className="overflow-y-auto p-5">
          <h2
            id="memo-edit-title"
            className="text-lg font-semibold text-foreground"
          >
            メモを編集
          </h2>
          <p className="mt-1 text-sm text-muted">
            {formatDateRange(event)} · {event.title}
          </p>

          <label className="mt-4 block">
            <span className="text-xs text-muted">メモ / 詳細</span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={"7/1 国語 数学\n7/2 英語 理科"}
              className={textareaClass}
              rows={8}
            />
          </label>
        </div>

        <div className="space-y-2 border-t border-[#334155] bg-card/95 p-4">
          <Button
            type="button"
            variant="secondary"
            disabled={formatting || saving || !memo.trim()}
            onClick={handleFormat}
          >
            {formatting ? "整形中..." : "AIで整える"}
          </Button>
          <Button type="button" disabled={saving} onClick={handleSave}>
            {saving ? "保存中..." : "保存"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={saving || formatting}
            onClick={onClose}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
}
