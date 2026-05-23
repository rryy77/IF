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
      href="/notices"
      className="relative inline-flex min-h-[40px] items-center gap-1 rounded-full bg-card px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
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
