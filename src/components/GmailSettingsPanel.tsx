"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type GmailStatus = {
  connected: boolean;
  userEmail: string | null;
  autoMonitorEnabled: boolean;
  gmailSearchQuery: string;
};

type CheckResult = {
  checked: number;
  processed: number;
  savedNotices: number;
  ignored: number;
  pushed: number;
  errors?: string[];
};

export function GmailSettingsPanel() {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [lastResult, setLastResult] = useState<CheckResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gmail/status");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "状態取得失敗");
      setStatus(json as GmailStatus);
    } catch (e) {
      setStatus(null);
      setMessage(e instanceof Error ? e.message : "Gmail状態の取得に失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail_connected")) {
      setMessage("Gmail連携が完了しました");
      window.history.replaceState({}, "", "/notices");
    }
    const err = params.get("gmail_error");
    if (err) {
      setMessage(decodeURIComponent(err));
      window.history.replaceState({}, "", "/notices");
    }
  }, [loadStatus]);

  async function handleToggleMonitor() {
    if (!status?.connected) return;
    try {
      const res = await fetch("/api/gmail/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoMonitorEnabled: !status.autoMonitorEnabled,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await loadStatus();
      setMessage(
        json.autoMonitorEnabled ? "自動監視をONにしました" : "自動監視をOFFにしました"
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "設定の更新に失敗");
    }
  }

  async function handleCheckNow() {
    setChecking(true);
    setLastResult(null);
    try {
      const res = await fetch("/api/gmail/check-sakura-mails", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "チェック失敗");
      setLastResult(json as CheckResult);
      setMessage(
        `確認 ${json.checked}件 / 処理 ${json.processed}件 / 保存 ${json.savedNotices}件`
      );
      window.dispatchEvent(new Event("latest-if-notices-updated"));
    } catch (e) {
      alert(e instanceof Error ? e.message : "メール確認に失敗");
    } finally {
      setChecking(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Gmail連携を解除しますか？")) return;
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await loadStatus();
      setMessage("Gmail連携を解除しました");
    } catch (e) {
      alert(e instanceof Error ? e.message : "解除に失敗");
    }
  }

  if (loading) {
    return (
      <p className="mb-4 text-sm text-muted">Gmail連携状態を読み込み中...</p>
    );
  }

  return (
    <section className="mb-6 rounded-2xl border border-[#334155] bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground">Gmail自動監視</h2>
      <p className="mt-1 text-xs text-muted">
        さくら連絡網メールを自動取得（v2）
      </p>

      {message && (
        <p className="mt-2 rounded-lg bg-main/10 px-3 py-2 text-xs text-main">
          {message}
        </p>
      )}

      {status?.connected ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-foreground">
            連携中
            {status.userEmail && (
              <span className="block text-xs text-muted">{status.userEmail}</span>
            )}
          </p>
          <p className="text-[11px] text-muted">
            検索: {status.gmailSearchQuery}
          </p>
          <p className="text-xs text-muted">
            自動監視:{" "}
            <span className={status.autoMonitorEnabled ? "text-main" : ""}>
              {status.autoMonitorEnabled ? "ON" : "OFF"}
            </span>
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              disabled={checking}
              onClick={handleCheckNow}
            >
              {checking ? "確認中..." : "今すぐ確認"}
            </Button>
            <button
              type="button"
              onClick={handleToggleMonitor}
              className="rounded-xl border border-[#334155] px-3 py-2 text-sm text-foreground"
            >
              自動監視 {status.autoMonitorEnabled ? "OFF" : "ON"}
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              className="rounded-xl px-3 py-2 text-sm text-red-300"
            >
              連携解除
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <a href="/api/gmail/auth">
            <Button type="button">Gmail連携する</Button>
          </a>
        </div>
      )}

      {lastResult && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-2 text-[10px] text-muted">
          {JSON.stringify(lastResult, null, 2)}
        </pre>
      )}
    </section>
  );
}
