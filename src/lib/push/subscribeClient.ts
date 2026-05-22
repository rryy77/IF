import { urlBase64ToUint8Array } from "./vapid";

export async function subscribeToPushNotifications(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    throw new Error(
      "Service Workerが使えません。HTTPS環境またはlocalhostで開いてください。"
    );
  }

  if (!("PushManager" in window)) {
    throw new Error("このブラウザはプッシュ通知に対応していません。");
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error(
      "VAPIDキーが設定されていません。NEXT_PUBLIC_VAPID_PUBLIC_KEY を設定してください。"
    );
  }

  let permission = Notification.permission;

  if (permission === "denied") {
    throw new Error(
      "通知が拒否されています。ブラウザの設定から通知を許可してください。"
    );
  }

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    throw new Error("通知の許可が得られませんでした。");
  }

  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        vapidPublicKey
      ) as BufferSource,
    });
  }

  const json = subscription.toJSON();

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
      userAgent: navigator.userAgent,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "購読情報の保存に失敗しました");
  }
}

export async function sendTestNotification(): Promise<{ sent: number }> {
  const res = await fetch("/api/push/test", { method: "POST" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "テスト通知の送信に失敗しました");
  }

  return { sent: data.sent ?? 0 };
}
