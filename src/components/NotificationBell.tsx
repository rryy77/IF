"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getUnreadNoticeCount } from "@/lib/noticesStorage";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const n = await getUnreadNoticeCount();
      setCount(n);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("latest-if-notices-updated", onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      window.removeEventListener("latest-if-notices-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [load]);

  return (
    <Link
      href="/notices#gmail-settings"
      className="relative inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-main/30 bg-main/10 px-3 py-1.5 text-sm font-medium text-main transition-colors hover:bg-main/20"
      aria-label="通知一覧・Gmail連携"
    >
      <span>通知</span>
      {count > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-main px-1.5 text-[11px] font-semibold text-background">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
