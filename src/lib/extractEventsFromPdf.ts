import { detectExtractionGaps } from "./detectExtractionGaps";
import { excludeSpecialLectureEvents } from "./filterEvents";
import { MOCK_EVENTS } from "./mockEventData";
import type { EventItem, ExtractionGapWarning } from "./types";

export type ExtractionResult = {
  events: EventItem[];
  warnings: ExtractionGapWarning[];
};

/**
 * PDFから予定を抽出するメイン関数（高精度解析のみ）
 *
 * 【本番AI実装時の推奨フロー】
 * 1. PDFを画像としてレンダリング（pdf.js 等）
 * 2. 画像を月ごとの列に分割（4月・5月・6月・7月…）
 * 3. 各月ブロック内で、日付行×曜日列のセルを認識
 * 4. 空白でないセルのテキストをすべて OCR
 * 5. 矢印・縦書きでまたがる期間は endDate 付きの期間予定に
 * 6. 祝日・小さい文字・HR も捨てずに候補化
 * 7. confidence が低くても status: "pending" で返す
 * 8. excludeSpecialLectureEvents で特別補講を除外
 */
export async function extractEventsFromPdf(file: File): Promise<ExtractionResult> {
  const rawEvents = await mockExtractEventsFromPdf(file);
  const events = excludeSpecialLectureEvents(rawEvents);
  const warnings = detectExtractionGaps(events);
  return { events, warnings };
}

/**
 * モック抽出（後から OpenAI / Gemini Vision 等に差し替え）
 */
export async function mockExtractEventsFromPdf(
  _file: File
): Promise<EventItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 2200));
  return MOCK_EVENTS.map((item, index) => toPendingEvent(item, index));
}

function toPendingEvent(
  item: Omit<
    EventItem,
    "id" | "status" | "source" | "confidence" | "rawText"
  >,
  index: number
): EventItem {
  const rawText = buildRawText(item);
  return {
    ...item,
    id: `pending-${Date.now()}-${index}`,
    status: "pending",
    source: "pdf",
    confidence: estimateConfidence(item),
    rawText,
  };
}

function buildRawText(
  item: Omit<EventItem, "id" | "status" | "source" | "confidence" | "rawText">
): string {
  const parts = [item.title];
  if (item.startTime) parts.push(item.startTime);
  if (item.endDate && item.endDate !== item.date) {
    parts.push(`〜${item.endDate}`);
  }
  return parts.join(" ");
}

function estimateConfidence(
  item: Omit<EventItem, "id" | "status" | "source" | "confidence" | "rawText">
): number {
  let score = 0.88;
  if (item.type === "holiday") score = 0.95;
  if (item.endDate) score = 0.85;
  if (item.title.length > 20) score = 0.78;
  if (item.title.includes("HR") || item.title.includes("限")) score = 0.82;
  return Math.round(score * 100) / 100;
}
