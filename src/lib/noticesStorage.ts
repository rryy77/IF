import type { NoticeItem } from "@/lib/sakura/types";
import {
  fetchNotices,
  fetchUnreadNoticeCount,
  insertNotice,
  markNoticeRead,
} from "./supabase/noticesRepository";

function dispatchNoticesUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("latest-if-notices-updated"));
  }
}

export async function getNotices(): Promise<NoticeItem[]> {
  return fetchNotices();
}

export async function getUnreadNoticeCount(): Promise<number> {
  return fetchUnreadNoticeCount();
}

export async function saveNotice(
  notice: Omit<NoticeItem, "id" | "createdAt">
): Promise<NoticeItem> {
  const saved = await insertNotice(notice);
  dispatchNoticesUpdated();
  return saved;
}

export async function setNoticeRead(id: string): Promise<void> {
  await markNoticeRead(id);
  dispatchNoticesUpdated();
}
