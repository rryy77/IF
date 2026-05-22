import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PushSubscriptionRow } from "@/lib/supabase/types";

/** web-push は mailto: または https:// 形式の subject が必須 */
export function normalizeVapidSubject(subject: string): string {
  const trimmed = subject.trim();
  if (
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed;
  }
  if (trimmed.includes("@")) {
    return `mailto:${trimmed}`;
  }
  return trimmed;
}

function ensureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subjectRaw = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subjectRaw) {
    throw new Error(
      "VAPIDキーが設定されていません。NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT を設定してください。"
    );
  }

  const subject = normalizeVapidSubject(subjectRaw);
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function fetchAllSubscriptions(): Promise<PushSubscriptionRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("push_subscriptions").select("*");

  if (error) {
    throw new Error(`購読情報の取得に失敗しました: ${error.message}`);
  }

  return data ?? [];
}

export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url?: string;
}): Promise<{ sent: number; failed: number }> {
  ensureVapid();

  const subscriptions = await fetchAllSubscriptions();
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;

  const json = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/",
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        json
      );
      sent++;
    } catch (err) {
      failed++;
      console.error("Push send failed:", sub.endpoint, err);
      if (isGoneError(err)) {
        const supabase = createAdminClient();
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      }
    }
  }

  return { sent, failed };
}

function isGoneError(err: unknown): boolean {
  if (err && typeof err === "object" && "statusCode" in err) {
    return (err as { statusCode: number }).statusCode === 410;
  }
  return false;
}
