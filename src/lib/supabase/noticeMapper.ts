import type { NoticeItem } from "@/lib/sakura/types";
import type { NoticeRow } from "./types";

export function rowToNotice(row: NoticeRow): NoticeItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? undefined,
    body: row.body ?? undefined,
    category: row.category as NoticeItem["category"],
    importance: row.importance as NoticeItem["importance"],
    source: row.source,
    pdfUrl: row.pdf_url ?? undefined,
    shouldNotify: row.should_notify,
    shouldCreateEvent: row.should_create_event,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export function noticeToInsertRow(
  notice: Omit<NoticeItem, "id" | "createdAt" | "isRead"> & {
    isRead?: boolean;
  }
): Omit<NoticeRow, "id" | "created_at"> {
  return {
    title: notice.title,
    summary: notice.summary ?? null,
    body: notice.body ?? null,
    category: notice.category,
    importance: notice.importance,
    source: notice.source ?? "sakura_mail",
    pdf_url: notice.pdfUrl ?? null,
    should_notify: notice.shouldNotify,
    should_create_event: notice.shouldCreateEvent,
    is_read: notice.isRead ?? false,
  };
}
