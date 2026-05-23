"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const connectLinkClass =
  "flex w-full items-center justify-center rounded-2xl bg-main px-4 py-3.5 text-base font-semibold text-background transition-all hover:bg-sky-300 active:scale-[0.98]";

type GmailStatus = {
  connected: boolean;
  userEmail: string | null;
  autoMonitorEnabled: boolean;
  gmailSearchQuery: string;
  oauthReady: boolean;
  missingEnv: string[];
  dbError?: string;
};

type CheckResult = {
  checked: number;
  processed: number;
  savedNotices: number;
  ignored: number;
  pushed?: number;
  errors?: string[];
  error?: string;
};

export function GmailSettingsPanel() {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [lastResult, setLastResult] = useState<CheckResult | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gmail/status", { cache: "no-store" });
      const json = await res.json();
      setStatus(json as GmailStatus);
    } catch {
      setStatus({
        connected: false,
        userEmail: null,
        autoMonitorEnabled: false,
        gmailSearchQuery: "",
        oauthReady: false,
        missingEnv: ["NETWORK"],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail_connected")) {
      setFlash("Gmail連携が完了しました");
      window.history.replaceState({}, "", "/notices");
      loadStatus();
    }
    const err = params.get("gmail_error");
    if (err) {
      setFlash(decodeURIComponent(err));
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
      setFlash(
        json.autoMonitorEnabled ? "自動監視をONにしました" : "自動監視をOFFにしました"
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "設定の更新に失敗");
    }
  }

  async function handleCheckNow() {
    if (!status?.connected) {
      alert("先に「Gmail連携する」からGoogleアカウントを連携してください。");
      return;
    }
    setChecking(true);
    setLastResult(null);
    try {
      const res = await fetch("/api/gmail/check-sakura-mails", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "チェック失敗");
      setLastResult(json as CheckResult);
      setFlash(
        `確認 ${json.checked}件 · 処理 ${json.processed}件 · 保存 ${json.savedNotices}件 · 無視 ${json.ignored}件`
      );
      window.dispatchEvent(new Event("latest-if-notices-updated"));
    } catch (e) {
      alert(e instanceof Error ? e.message : "メール確認に失敗");
    } finally {
      setChecking(false);
    }
  }

  const oauthReady = status?.oauthReady ?? false;
  const connected = status?.connected ?? false;

  return (
    <section
      id="gmail-settings"
      className="mb-6 rounded-2xl border-2 border-main/25 bg-card p-4 shadow-lg shadow-main/5"
    >
      <h2 className="text-base font-semibold text-foreground">Gmail連携</h2>
      <p className="mt-1 text-sm text-muted">
        さくら連絡網メールを自動で確認します（Gmail API）
      </p>

      {flash && (
        <p className="mt-3 rounded-lg border border-main/30 bg-main/10 px-3 py-2 text-sm text-main">
          {flash}
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-muted">連携状態を読み込み中...</p>
      ) : (
        <>
          {!oauthReady && (
            <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm text-amber-100">
              <p className="font-medium">Google連携の環境変数が未設定です</p>
              <p className="mt-1 text-xs text-amber-200/90">
                Vercel に以下を設定して Redeploy してください。
              </p>
              <ul className="mt-2 list-inside list-disc text-xs">
                {(status?.missingEnv ?? []).map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
            </div>
          )}

          {status?.dbError && (
            <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
              DB: {status.dbError}（supabase/migrations/add_gmail_tokens.sql
              を実行してください）
            </p>
          )}

          {connected && status ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-emerald-300">
                Gmail連携済み
              </p>
              {status.userEmail && (
                <p className="mt-0.5 text-xs text-muted">{status.userEmail}</p>
              )}
              <p className="mt-2 text-[11px] text-muted">
                検索条件: {status.gmailSearchQuery}
              </p>
              <p className="text-xs text-muted">
                自動監視（30分ごと）:{" "}
                <span className="text-main">
                  {status.autoMonitorEnabled ? "ON" : "OFF"}
                </span>
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              未連携 — 「Gmail連携する」でGoogle認証を行ってください。
            </p>
          )}

          <div className="mt-4 space-y-2">
            {!connected &&
              (oauthReady ? (
                <a href="/api/gmail/auth" className={connectLinkClass}>
                  Gmail連携する
                </a>
              ) : (
                <Button type="button" disabled>
                  Gmail連携する
                </Button>
              ))}

            <Button
              type="button"
              variant="secondary"
              disabled={checking || !connected}
              onClick={handleCheckNow}
            >
              {checking ? "確認中..." : "さくら連絡網メールを今すぐ確認"}
            </Button>

            {connected && status && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleToggleMonitor}
                  className="min-h-[44px] flex-1 rounded-xl border border-[#334155] px-3 py-2 text-sm text-foreground"
                >
                  自動監視 {status.autoMonitorEnabled ? "OFF" : "ON"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Gmail連携を解除しますか？")) return;
                    const res = await fetch("/api/gmail/disconnect", {
                      method: "POST",
                    });
                    const json = await res.json();
                    if (!res.ok) {
                      alert(json.error ?? "解除失敗");
                      return;
                    }
                    setFlash("Gmail連携を解除しました");
                    loadStatus();
                  }}
                  className="min-h-[44px] rounded-xl px-3 py-2 text-sm text-red-300"
                >
                  連携解除
                </button>
              </div>
            )}
          </div>

          {lastResult && !lastResult.error && (
            <div className="mt-4 rounded-xl bg-background px-3 py-3 text-sm">
              <p className="font-medium text-foreground">確認結果</p>
              <ul className="mt-2 space-y-1 text-muted">
                <li>確認: {lastResult.checked}件</li>
                <li>処理: {lastResult.processed}件</li>
                <li>通知欄に保存: {lastResult.savedNotices}件</li>
                <li>無視: {lastResult.ignored}件</li>
                {lastResult.pushed != null && (
                  <li>即時通知: {lastResult.pushed}件</li>
                )}
              </ul>
              {lastResult.errors && lastResult.errors.length > 0 && (
                <p className="mt-2 text-xs text-red-300">
                  {lastResult.errors.join(" / ")}
                </p>
              )}
            </div>
          )}

          <p className="mt-3 text-[10px] text-muted">
            API: GET /api/gmail/auth · POST /api/gmail/check-sakura-mails
          </p>
        </>
      )}
    </section>
  );
}
