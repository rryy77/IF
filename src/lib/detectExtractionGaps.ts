import type { EventItem, ExtractionGapWarning } from "./types";

/** この日数より長い空白があると「抜け」の可能性あり（祝日連続は除く目安） */
const GAP_THRESHOLD_DAYS = 12;

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(start: string, end: string): number {
  const ms = parseDate(end).getTime() - parseDate(start).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function formatDateShort(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}月${Number(d)}日`;
}

/**
 * 抽出結果の日付列を見て、大きな空白があれば警告を返す。
 * 例: 4月18日の次が5月22日 → 間に予定が抜けている可能性
 */
export function detectExtractionGaps(
  events: EventItem[]
): ExtractionGapWarning[] {
  if (events.length < 2) return [];

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const warnings: ExtractionGapWarning[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const currentEnd = current.endDate ?? current.date;
    const gapDays = daysBetween(currentEnd, next.date);

    if (gapDays > GAP_THRESHOLD_DAYS) {
      const fromLabel = formatDateShort(currentEnd);
      const toLabel = formatDateShort(next.date);
      warnings.push({
        fromDate: currentEnd,
        toDate: next.date,
        gapDays,
        message: `${fromLabel}〜${toLabel}の間に予定が抜けている可能性があります。PDFを再確認してください。`,
      });
    }
  }

  return warnings;
}
