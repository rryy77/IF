/** フォアグラウンド自動確認の最小間隔（5分） */
export const FOREGROUND_CHECK_INTERVAL_MS = 5 * 60 * 1000;

const LS_KEY = "latest-if-last-gmail-foreground-check";

export function getLastForegroundCheckMs(
  serverLastCheckedAt: string | null
): number {
  let local = 0;
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) local = Number.parseInt(raw, 10) || 0;
  }
  const server = serverLastCheckedAt
    ? new Date(serverLastCheckedAt).getTime()
    : 0;
  return Math.max(local, server);
}

export function shouldRunForegroundCheck(
  serverLastCheckedAt: string | null
): boolean {
  return (
    Date.now() - getLastForegroundCheckMs(serverLastCheckedAt) >=
    FOREGROUND_CHECK_INTERVAL_MS
  );
}

export function markForegroundCheckDone(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, String(Date.now()));
  }
}

/** 画面に結果を出さず Gmail 確認（通知一覧は新規があるときだけ更新） */
export async function runSilentGmailCheck(): Promise<void> {
  const res = await fetch("/api/gmail/check-sakura-mails", {
    method: "POST",
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "check failed");
  }

  markForegroundCheckDone();

  if (json.errors?.length) {
    console.warn("Gmail foreground check partial errors:", json.errors);
  }

  if (typeof json.savedNotices === "number" && json.savedNotices > 0) {
    window.dispatchEvent(new Event("latest-if-notices-updated"));
  }
}
