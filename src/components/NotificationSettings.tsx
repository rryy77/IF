"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  sendTestNotification,
  subscribeToPushNotifications,
} from "@/lib/push/subscribeClient";

export function NotificationSettings() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEnable() {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      await subscribeToPushNotifications();
      setStatus("通知をオンにしました。テスト通知で確認できます。");
    } catch (e) {
      setError(e instanceof Error ? e.message : "通知の設定に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleTest() {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const { sent } = await sendTestNotification();
      setStatus(`テスト通知を送信しました（${sent}件の端末）`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "テスト通知に失敗しました";
      setError(
        msg.includes("Vapid subject")
          ? `${msg} … .env.local の VAPID_SUBJECT を mailto:あなたのメール@example.com の形式にしてください。`
          : msg
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-4 rounded-2xl border border-card bg-card p-4">
      <h2 className="mb-1 text-sm font-semibold text-foreground">通知</h2>
      <p className="mb-3 text-xs leading-relaxed text-muted">
        予定の1日前（毎日20時）にスマホへ通知します。
      </p>
      <p className="mb-3 text-xs leading-relaxed text-amber-200/80">
        iPhoneで通知を受け取るには、このサイトをホーム画面に追加してから通知をオンにしてください。
      </p>

      <div className="space-y-2">
        <Button disabled={loading} onClick={handleEnable}>
          通知をオンにする
        </Button>
        <Button variant="secondary" disabled={loading} onClick={handleTest}>
          テスト通知を送る
        </Button>
      </div>

      {status && (
        <p className="mt-3 text-xs text-main">{status}</p>
      )}
      {error && (
        <p className="mt-3 text-xs text-red-300">{error}</p>
      )}
    </section>
  );
}
