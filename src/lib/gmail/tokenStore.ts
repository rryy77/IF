import { createAdminClient } from "@/lib/supabase/admin";

export type GmailTokenRow = {
  id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  user_email: string | null;
  auto_monitor_enabled: boolean;
  updated_at: string;
};

export async function getGmailToken(): Promise<GmailTokenRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("gmail_tokens")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Gmailトークンの取得に失敗: ${error.message}`);
  }

  return data as GmailTokenRow | null;
}

export async function saveGmailToken(params: {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  userEmail?: string | null;
}): Promise<void> {
  const supabase = createAdminClient();
  const existing = await getGmailToken();

  const row = {
    access_token: params.accessToken,
    refresh_token: params.refreshToken ?? existing?.refresh_token ?? null,
    expires_at: params.expiresAt?.toISOString() ?? null,
    user_email: params.userEmail ?? existing?.user_email ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("gmail_tokens")
      .update(row)
      .eq("id", existing.id);
    if (error) throw new Error(`Gmailトークン更新失敗: ${error.message}`);
  } else {
    const { error } = await supabase.from("gmail_tokens").insert({
      ...row,
      auto_monitor_enabled: true,
    });
    if (error) throw new Error(`Gmailトークン保存失敗: ${error.message}`);
  }
}

export async function setAutoMonitorEnabled(enabled: boolean): Promise<void> {
  const supabase = createAdminClient();
  const existing = await getGmailToken();
  if (!existing) {
    throw new Error("Gmailが連携されていません");
  }

  const { error } = await supabase
    .from("gmail_tokens")
    .update({
      auto_monitor_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  if (error) {
    throw new Error(`自動監視設定の更新に失敗: ${error.message}`);
  }
}

export async function deleteGmailToken(): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("gmail_tokens")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    throw new Error(`Gmail連携解除に失敗: ${error.message}`);
  }
}
