"use client";

type SelectDeleteToolbarProps = {
  selectedCount: number;
  onDeleteSelected: () => void;
  onCancel: () => void;
};

export function SelectDeleteToolbar({
  selectedCount,
  onDeleteSelected,
  onCancel,
}: SelectDeleteToolbarProps) {
  return (
    <div className="mb-4 flex gap-2">
      <button
        type="button"
        disabled={selectedCount === 0}
        onClick={onDeleteSelected}
        className="flex-1 rounded-xl bg-red-500/20 px-3 py-2.5 text-sm font-medium text-red-300 disabled:opacity-40"
      >
        選択した予定を削除（{selectedCount}）
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl bg-card px-4 py-2.5 text-sm text-muted"
      >
        キャンセル
      </button>
    </div>
  );
}
