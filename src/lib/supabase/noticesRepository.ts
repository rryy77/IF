import type { NoticeItem } from "@/lib/sakura/types";
import { createClient, isSupabaseConfigured } from "./client";
import { noticeToInsertRow, rowToNotice } from "./noticeMapper";
import { formatSupabaseError } from "./supabaseError";

function getClient() {
  const client = createClient();
  if (!client) {
    throw new Error(
      "Supabaseが設定されていません。.env.local を確認してください。"
    );
  }
  return client;
}

function wrapError(context: string, message: string): Error {
  return new Error(`${context}: ${formatSupabaseError(message)}`);
}

export async function fetchNotices(): Promise<NoticeItem[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getClient();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw wrapError("通知の取得に失敗しました", error.message);
  }

  return (data ?? []).map(rowToNotice);
}

export async function fetchUnreadNoticeCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = getClient();
  const { count, error } = await supabase
    .from("notices")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .neq("category", "unnecessary");

  if (error) {
    throw wrapError("未読数の取得に失敗しました", error.message);
  }

  return count ?? 0;
}

export async function insertNotice(
  notice: Omit<NoticeItem, "id" | "createdAt">
): Promise<NoticeItem> {
  const supabase = getClient();
  const row = noticeToInsertRow(notice);

  const { data, error } = await supabase
    .from("notices")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw wrapError("通知の保存に失敗しました", error.message);
  }

  return rowToNotice(data);
}

export async function markNoticeRead(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("notices")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    throw wrapError("既読の更新に失敗しました", error.message);
  }
}
