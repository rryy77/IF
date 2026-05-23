import { createAdminClient } from "@/lib/supabase/admin";

export async function isMailProcessed(mailId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("processed_mail_ids")
    .select("id")
    .eq("mail_id", mailId)
    .maybeSingle();

  if (error) {
    throw new Error(`処理済み確認に失敗: ${error.message}`);
  }

  return Boolean(data);
}

export async function markMailProcessed(mailId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("processed_mail_ids").upsert(
    { mail_id: mailId, processed_at: new Date().toISOString() },
    { onConflict: "mail_id" }
  );

  if (error) {
    throw new Error(`処理済み登録に失敗: ${error.message}`);
  }
}
