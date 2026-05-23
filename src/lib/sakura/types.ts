export type NoticeCategory =
  | "event_notice"
  | "schedule_pdf"
  | "important_school_notice"
  | "unnecessary"
  | "other";

export type NoticeImportance = "low" | "normal" | "high" | "urgent";

export type SakuraMailInput = {
  subject: string;
  body: string;
  pdfUrls: string[];
};

export type SakuraMailClassification = {
  isNeeded: boolean;
  category: NoticeCategory;
  importance: NoticeImportance;
  title: string;
  summary: string;
  shouldNotifyNow: boolean;
  shouldCreateEvent: boolean;
  reason: string;
};

export type NoticeItem = {
  id: string;
  title: string;
  summary?: string;
  body?: string;
  category: NoticeCategory;
  importance: NoticeImportance;
  source: string;
  pdfUrl?: string;
  shouldNotify: boolean;
  shouldCreateEvent: boolean;
  isRead: boolean;
  createdAt: string;
};
