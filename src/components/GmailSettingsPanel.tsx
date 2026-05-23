"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
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
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const foregroundStarted = useRef(false);

  const loadStatus = useCallback(async (): Promise<GmailStatus> => {
    try {
      const res = await fetch("/api/gmail/status", { cache: "no-store" });
      const json = await res.json();
      return {
        connected: Boolean(json.connected),
        lastCheckedAt: json.lastCheckedAt ?? null,
        oauthReady: Boolean(json.oauthReady),
        dbError: json.dbError,
      };
    } catch {
      return {
        connected: false,
        lastCheckedAt: null,
        oauthReady: false,
      };
    }
  }, []);

  const applyStatus = useCallback(async () => {
    const next = await loadStatus();
    setStatus(next);
    setReady(true);
    return next;
  }, [loadStatus]);

  useEffect(() => {
    void (async () => {
      const next = await applyStatus();

      const params = new URLSearchParams(window.location.search);
      if (
        params.get("gmail") === "connected" ||
        params.get("gmail_connected") ||
        params.get("gmail") === "error" ||
        params.get("gmail_error")
      ) {
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
    setCheckError(false);
    try {
      await runSilentGmailCheck();
      await applyStatus();
    } catch (e) {
      console.error("Gmail check failed:", e);
      setCheckError(true);
    } finally {
      setChecking(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Gmail連携を解除しますか？")) return;
    setMenuOpen(false);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCheckError(false);
      await applyStatus();
    } catch (e) {
      console.error("Gmail disconnect failed:", e);
    }
  }

  const connected = status?.connected ?? false;
  const canConnect = ready && (status?.oauthReady ?? false) && !status?.dbError;

  return (
    <section id="gmail-settings" className="mb-6 rounded-2xl bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">
          {ready && connected ? "Gmail連携済み" : "Gmail連携"}
        </h2>
        {ready && connected && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-[#334155]/50"
              aria-label="メニュー"
              aria-expanded={menuOpen}
            >
              ⋯
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  aria-label="閉じる"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-[#334155] bg-card shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDisconnect}
                    className="min-h-[40px] px-4 text-left text-sm text-muted hover:bg-[#334155]/40"
                  >
                    連携を解除
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {checkError && (
        <p className="mt-2 text-sm text-red-300">メール確認に失敗しました</p>
      )}

      {ready && (
        <div className="mt-3">
          {connected ? (
            <Button
              type="button"
              variant="secondary"
              disabled={checking}
              onClick={handleCheckNow}
              className="w-full"
            >
              {checking ? "確認中..." : "確認する"}
            </Button>
          ) : canConnect ? (
            <a href="/api/gmail/auth" className={connectLinkClass}>
              Googleと連携する
            </a>
          ) : (
            <Button type="button" disabled className="w-full">
              Googleと連携する
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
