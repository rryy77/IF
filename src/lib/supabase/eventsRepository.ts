import type { EventItem } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "./client";
import { eventToInsertRow, rowToEvent } from "./eventMapper";

function getClient() {
  const client = createClient();
  if (!client) {
    throw new Error(
      "Supabaseが設定されていません。.env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。"
    );
  }
  return client;
}

export async function fetchConfirmedEvents(): Promise<EventItem[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "confirmed")
    .order("date", { ascending: true });

  if (error) {
    throw new Error(`予定の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map(rowToEvent);
}

export async function insertConfirmedEvents(events: EventItem[]): Promise<void> {
  const supabase = getClient();
  const rows = events.map((e) => eventToInsertRow({ ...e, status: "confirmed" }));

  const { error } = await supabase.from("events").insert(rows);

  if (error) {
    throw new Error(`予定の保存に失敗しました: ${error.message}`);
  }
}

export async function deleteEventById(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    throw new Error(`予定の削除に失敗しました: ${error.message}`);
  }
}

export async function deleteAllEvents(): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("events")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    throw new Error(`予定の全削除に失敗しました: ${error.message}`);
  }
}

export async function deletePastEvents(today: string): Promise<void> {
  const all = await fetchConfirmedEvents();
  const toDelete = all.filter((event) => {
    if (event.endDate && event.endDate !== event.date) {
      return event.endDate < today;
    }
    return event.date < today;
  });

  for (const event of toDelete) {
    await deleteEventById(event.id);
  }
}

export async function deleteEventsByIds(ids: string[]): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from("events").delete().in("id", ids);
  if (error) {
    throw new Error(`予定の削除に失敗しました: ${error.message}`);
  }
}
