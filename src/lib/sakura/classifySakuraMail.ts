import type {
  NoticeCategory,
  NoticeImportance,
  SakuraMailClassification,
  SakuraMailInput,
} from "./types";

// TODO: Replace rule-based classifier with real AI API later.

const UNNECESSARY = [
  "募金",
  "注意喚起",
  "自転車通学",
  "許可願",
  "PTA",
  "保護者会",
  "アンケート",
  "購入",
  "申込",
  "申し込み",
  "事務手続",
  "保険",
  "宣伝",
  "広告",
  "販売",
];

const SCHEDULE = [
  "予定表",
  "行事予定",
  "年間予定",
  "学期予定",
  "時間割",
  "テスト時間割",
  "学校行事予定",
  "1学期",
  "2学期",
];

const EVENT = [
  "遠足",
  "球技大会",
  "団体鑑賞",
  "クラス行事",
  "体育祭",
  "文化祭",
  "合宿",
  "校外学習",
  "延期",
  "中止",
  "日程変更",
  "持ち物",
  "行事",
];

const IMPORTANT = [
  "休校",
  "大雨",
  "警報",
  "登校時間",
  "下校時間",
  "遅れます",
  "遅れて",
  "変更",
  "実力テスト",
  "試験",
  "テスト",
  "授業変更",
  "交通機関",
  "緊急",
  "欠席",
  "遅刻",
];

const URGENT = ["休校", "緊急", "警報", "中止", "延期"];

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function containsAny(text: string, words: string[]): string[] {
  return words.filter((w) => text.includes(w));
}

function hasDateHint(text: string): boolean {
  return (
    /\d{1,2}\s*月\s*\d{1,2}\s*日/.test(text) ||
    /\d{1,2}\/\d{1,2}/.test(text) ||
    /今日|明日|本日|来週/.test(text)
  );
}

function buildSummary(
  category: NoticeCategory,
  subject: string,
  hits: string[]
): string {
  if (category === "schedule_pdf") {
    return "予定表・PDFの可能性があります。内容を確認してください。";
  }
  if (category === "important_school_notice") {
    return hits.length > 0
      ? `重要連絡（${hits.slice(0, 3).join("・")}）`
      : "学校からの重要なお知らせです。";
  }
  if (category === "event_notice") {
    return hits.length > 0
      ? `行事・イベント（${hits.slice(0, 3).join("・")}）`
      : "行事に関するお知らせです。";
  }
  return subject.slice(0, 80) || "お知らせ";
}

/**
 * さくら連絡網メールを分類（v1: ルールベース）
 */
export function classifySakuraMail(
  input: SakuraMailInput
): SakuraMailClassification {
  const subject = normalize(input.subject);
  const body = normalize(input.body);
  const combined = `${subject}\n${body}`;
  const pdfUrls = input.pdfUrls;

  const unnecessaryHits = containsAny(combined, UNNECESSARY);
  const scheduleHits = containsAny(combined, SCHEDULE);
  const eventHits = containsAny(combined, EVENT);
  const importantHits = containsAny(combined, IMPORTANT);
  const urgentHits = containsAny(combined, URGENT);

  const hasPdf = pdfUrls.length > 0;
  const scheduleByPdf =
    hasPdf &&
    (scheduleHits.length > 0 ||
      /予定表|時間割|行事/i.test(subject) ||
      /\.pdf/i.test(pdfUrls.join(" ")));

  if (unnecessaryHits.length > 0 && !urgentHits.length && !scheduleByPdf) {
    return {
      isNeeded: false,
      category: "unnecessary",
      importance: "low",
      title: subject || "不要な連絡",
      summary: `取り込み不要（${unnecessaryHits.slice(0, 2).join("・")}）`,
      shouldNotifyNow: false,
      shouldCreateEvent: false,
      reason: `不要キーワード: ${unnecessaryHits.join(", ")}`,
    };
  }

  if (scheduleByPdf || (scheduleHits.length > 0 && hasPdf)) {
    return {
      isNeeded: true,
      category: "schedule_pdf",
      importance: "high",
      title: subject || "予定表PDF",
      summary: buildSummary("schedule_pdf", subject, scheduleHits),
      shouldNotifyNow: true,
      shouldCreateEvent: true,
      reason: `予定表系キーワード + PDF (${scheduleHits.join(", ") || "PDFリンク"})`,
    };
  }

  if (scheduleHits.length > 0 && /予定表|時間割|行事予定|年間/.test(combined)) {
    return {
      isNeeded: true,
      category: "schedule_pdf",
      importance: "high",
      title: subject || "学校予定表",
      summary: buildSummary("schedule_pdf", subject, scheduleHits),
      shouldNotifyNow: true,
      shouldCreateEvent: true,
      reason: `予定表キーワード: ${scheduleHits.join(", ")}`,
    };
  }

  if (urgentHits.length > 0 || importantHits.length >= 2) {
    const importance: NoticeImportance = urgentHits.length > 0 ? "urgent" : "high";
    return {
      isNeeded: true,
      category: "important_school_notice",
      importance,
      title: subject || "重要なお知らせ",
      summary: buildSummary("important_school_notice", subject, [
        ...urgentHits,
        ...importantHits,
      ]),
      shouldNotifyNow: true,
      shouldCreateEvent: hasDateHint(combined),
      reason: `重要連絡: ${[...urgentHits, ...importantHits].join(", ")}`,
    };
  }

  if (importantHits.length > 0) {
    return {
      isNeeded: true,
      category: "important_school_notice",
      importance: "high",
      title: subject || "学校からのお知らせ",
      summary: buildSummary("important_school_notice", subject, importantHits),
      shouldNotifyNow: true,
      shouldCreateEvent: hasDateHint(combined),
      reason: `重要キーワード: ${importantHits.join(", ")}`,
    };
  }

  if (eventHits.length > 0) {
    return {
      isNeeded: true,
      category: "event_notice",
      importance: "normal",
      title: subject || "行事のお知らせ",
      summary: buildSummary("event_notice", subject, eventHits),
      shouldNotifyNow: true,
      shouldCreateEvent: hasDateHint(combined),
      reason: `行事キーワード: ${eventHits.join(", ")}`,
    };
  }

  if (hasPdf) {
    return {
      isNeeded: true,
      category: "schedule_pdf",
      importance: "normal",
      title: subject || "PDF付き連絡",
      summary: "PDFリンクがあります。予定表の可能性があります。",
      shouldNotifyNow: true,
      shouldCreateEvent: true,
      reason: "PDFリンク検出",
    };
  }

  return {
    isNeeded: false,
    category: "other",
    importance: "low",
    title: subject || "その他の連絡",
    summary: "取り込み対象外の可能性があります。",
    shouldNotifyNow: false,
    shouldCreateEvent: false,
    reason: "該当カテゴリなし",
  };
}
