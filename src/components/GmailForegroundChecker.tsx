"use client";

import { useEffect, useRef } from "react";
import {
  runSilentGmailCheck,
  shouldRunForegroundCheck,
} from "@/lib/gmail/foregroundCheck";

/**
 * ホーム等で表示 — 連携済みかつ5分以上経過ならバックグラウンドで Gmail 確認
 */
export function GmailForegroundChecker() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const res = await fetch("/api/gmail/status", { cache: "no-store" });
        const json = await res.json();
        if (!json.connected) return;
        if (!shouldRunForegroundCheck(json.lastCheckedAt ?? null)) return;
        await runSilentGmailCheck();
      } catch (e) {
        console.warn("Gmail foreground check skipped:", e);
      }
    })();
  }, []);

  return null;
}
