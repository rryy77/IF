"use client";

type DeleteManagePanelProps = {
  onDeleteAll: () => void;
  onDeletePast: () => void;
  onStartSelectDelete: () => void;
  onClose: () => void;
};

export function DeleteManagePanel({
  onDeleteAll,
  onDeletePast,
  onStartSelectDelete,
  onClose,
}: DeleteManagePanelProps) {
  return (
    <div className="mb-4 rounded-2xl border border-card bg-card p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">削除管理</p>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted hover:text-foreground"
        >
          閉じる
        </button>
      </div>
      <div className="space-y-1">
        <button
          type="button"
          onClick={onDeleteAll}
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10"
        >
          全ての予定を削除
        </button>
        <button
          type="button"
          onClick={onDeletePast}
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-foreground hover:bg-background"
        >
          過去の予定を削除
        </button>
        <button
          type="button"
          onClick={onStartSelectDelete}
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-foreground hover:bg-background"
        >
          選択して削除
        </button>
      </div>
    </div>
  );
}
