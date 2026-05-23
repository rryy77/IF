import type { NoticeItem } from "@/lib/sakura/types";
import { fetchNotices } from "./supabase/noticesRepository";

function dispatchNoticesUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("latest-if-notices-updated"));
  }
}

export async function getNotices(): Promise<NoticeItem[]> {
  return fetchNotices();
}

export { dispatchNoticesUpdated };
