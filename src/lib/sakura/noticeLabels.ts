import type { NoticeCategory, NoticeImportance } from "./types";

export const CATEGORY_LABELS: Record<NoticeCategory, string> = {
  event_notice: "行事・イベント",
  schedule_pdf: "予定表PDF",
  important_school_notice: "重要連絡",
  unnecessary: "不要",
  other: "その他",
};

export const IMPORTANCE_LABELS: Record<NoticeImportance, string> = {
  low: "低",
  normal: "通常",
  high: "高",
  urgent: "緊急",
};

export const IMPORTANCE_COLORS: Record<NoticeImportance, string> = {
  low: "bg-slate-500/20 text-slate-300",
  normal: "bg-main/15 text-main",
  high: "bg-amber-500/20 text-amber-200",
  urgent: "bg-red-500/20 text-red-300",
};
