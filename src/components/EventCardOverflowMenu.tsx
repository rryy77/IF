"use client";

type EventCardOverflowMenuProps = {
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function EventCardOverflowMenu({
  isOpen,
  onToggle,
  onEdit,
  onDelete,
}: EventCardOverflowMenuProps) {
  return (
    <div className="absolute top-2 right-2 z-20">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-600/50 bg-slate-800/80 text-base leading-none text-slate-300 transition-colors hover:bg-slate-700/80 active:scale-95"
        aria-label="予定メニュー"
        aria-expanded={isOpen}
      >
        ⋯
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 min-w-[7.5rem] overflow-hidden rounded-xl border border-slate-600/60 bg-slate-900 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex min-h-[44px] w-full items-center px-4 py-2.5 text-left text-sm text-foreground hover:bg-slate-800 active:bg-slate-700"
          >
            編集
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex min-h-[44px] w-full items-center border-t border-slate-700/80 px-4 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10 active:bg-red-500/15"
          >
            削除
          </button>
        </div>
      )}
    </div>
  );
}
