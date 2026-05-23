"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  markForegroundCheckDone,
  runSilentGmailCheck,
  shouldRunForegroundCheck,
} from "@/lib/gmail/foregroundCheck";

const connectLinkClass =
  "flex w-full items-center justify-center rounded-2xl bg-main px-4 py-3.5 text-base font-semibold text-background transition-all hover:bg-sky-300 active:scale-[0.98]";

type GmailStatus = {
  connected: boolean;
  lastCheckedAt: string | null;
  oauthReady: boolean;
  dbError?: string;
};

export function GmailSettingsPanel() {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const foregroundStarted = useRef(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gmail/status", { cache: "no-store" });
      const json = await res.json();
      return {
        connected: Boolean(json.connected),
        lastCheckedAt: json.lastCheckedAt ?? null,
        oauthReady: Boolean(json.oauthReady),
        dbError: json.dbError,
      } as GmailStatus;
    } catch {
      return {
        connected: false,
        lastCheckedAt: null,
        oauthReady: false,
      } as GmailStatus;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyStatus = useCallback(async () => {
    const next = await loadStatus();
    setStatus(next);
    return next;
  }, [loadStatus]);

  useEffect(() => {
    void (async () => {
      const next = await applyStatus();

      const params = new URLSearchParams(window.location.search);
      if (params.get("gmail") === "connected" || params.get("gmail_connected")) {
        window.history.replaceState({}, "", "/notices#gmail-settings");
      } else if (params.get("gmail") === "error" || params.get("gmail_error")) {
        setErrorMessage("Gmail連携に失敗しました。");
        window.history.replaceState({}, "", "/notices#gmail-settings");
      }

      if (
        next.connected &&
        !foregroundStarted.current &&
        shouldRunForegroundCheck(next.lastCheckedAt)
      ) {
        foregroundStarted.current = true;
        try {
          await runSilentGmailCheck();
          await applyStatus();
        } catch (e) {
          console.warn("Gmail foreground check on notices:", e);
        }
      }
    })();
  }, [applyStatus]);

  async function handleCheckNow() {
    if (!status?.connected) return;

    setChecking(true);
    setErrorMessage(null);
    try {
      await runSilentGmailCheck();
      await applyStatus();
    } catch (e) {
      console.error("Gmail check failed:", e);
      setErrorMessage("メール確認に失敗しました。");
    } finally {
      setChecking(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Gmail連携を解除しますか？")) return;
    setMenuOpen(false);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      markForegroundCheckDone();
      await applyStatus();
    } catch (e) {
      console.error("Gmail disconnect failed:", e);
      setErrorMessage("連携の解除に失敗しました。");
    }
  }

  const oauthReady = status?.oauthReady ?? false;
  const connected = status?.connected ?? false;
  const canConnect = oauthReady && !status?.dbError;

  return (
    <section
      id="gmail-settings"
      className="mb-6 rounded-2xl border border-[#334155] bg-card p-4"
    >
      {loading ? (
        <p className="text-sm text-muted">読み込み中...</p>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">
            {connected ? "Gmail連携済み" : "Gmail連携"}
          </h2>
          {connected && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-muted hover:bg-[#334155]/60"
                aria-label="Gmailメニュー"
                aria-expanded={menuOpen}
              >
                ⋯
              </button>
              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10"
                    aria-label="メニューを閉じる"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-20 mt-1 min-w-[8rem] overflow-hidden rounded-xl border border-[#334155] bg-card shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleDisconnect}
                      className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-red-300 hover:bg-[#334155]/40"
                    >
                      連携を解除
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !connected && (
        <p className="mt-1 text-sm text-muted">学校メールを取り込む</p>
      )}

      {errorMessage && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {errorMessage}
        </p>
      )}

      {!loading && !connected && !canConnect && (
        <p className="mt-3 text-sm text-amber-200/90">
          いま Gmail 連携を利用できません。
        </p>
      )}

      {!loading && (
        <div className="mt-3 space-y-2">
          {!connected &&
            (canConnect ? (
              <a href="/api/gmail/auth" className={connectLinkClass}>
                Googleと連携する
              </a>
            ) : (
              <Button type="button" disabled>
                Googleと連携する
              </Button>
            ))}

          {connected && (
            <Button
              type="button"
              variant="secondary"
              disabled={checking}
              onClick={handleCheckNow}
              className="w-full"
            >
              {checking ? "確認中..." : "確認する"}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
