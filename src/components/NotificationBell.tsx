"use client";

import Link from "next/link";

export function NotificationBell() {
  return (
    <Link
      href="/notices"
      className="inline-flex min-h-[40px] items-center rounded-full border border-main/30 bg-main/10 px-3 py-1.5 text-sm font-medium text-main transition-colors hover:bg-main/20"
      aria-label="通知"
    >
      通知
    </Link>
  );
}
