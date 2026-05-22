import type { ExtractionGapWarning } from "@/lib/types";

type ExtractionWarningsProps = {
  warnings: ExtractionGapWarning[];
};

export function ExtractionWarnings({ warnings }: ExtractionWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {warnings.map((w, i) => (
        <div
          key={`${w.fromDate}-${w.toDate}-${i}`}
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
        >
          <p className="font-medium">⚠ 抽出漏れの可能性</p>
          <p className="mt-1 text-amber-200/90">{w.message}</p>
          <p className="mt-1 text-xs text-amber-200/60">
            空白 {w.gapDays} 日間 · 不要な予定は削除、足りない予定は「修正する」から再アップロードしてください
          </p>
        </div>
      ))}
    </div>
  );
}
