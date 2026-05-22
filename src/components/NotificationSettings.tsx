"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { subscribeToPushNotifications } from "@/lib/push/subscribeClient";

function readNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

export function isNotificationGranted(): boolean {
  return readNotificationPermission() === "granted";
}

export function NotificationSettings() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const syncPermission = useCallback(() => {
    setPermission(readNotificationPermission());
  }, []);

  useEffect(() => {
    syncPermission();
  }, [syncPermission]);

  const isGranted = permission === "granted";

  async function handleEnable() {
    setLoading(true);
    setError(null);
    try {
      await subscribeToPushNotifications();
      setPermission("granted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "通知の設定に失敗しました");
      syncPermission();
    } finally {
      setLoading(false);
    }
  }

  if (isGranted) {
    return (
      <p className="mb-3 inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300/90">
        通知ON
      </p>
    );
  }

  return (
    <section className="mb-4 rounded-2xl border border-card bg-card p-4">
      <h2 className="mb-1 text-sm font-semibold text-foreground">通知</h2>
      <p className="mb-3 text-xs leading-relaxed text-muted">
        予定の1日前（毎日20時）にスマホへ通知します。
      </p>
      <p className="mb-3 text-xs leading-relaxed text-amber-200/80">
        iPhoneで通知を使うには、Safariでこのサイトを開き、共有ボタンからホーム画面に追加してください。その後、ホーム画面のlatest
        IFアイコンから起動して通知をオンにしてください。
      </p>

      <Button disabled={loading} onClick={handleEnable}>
        通知をオンにする
      </Button>

      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
    </section>
  );
}
