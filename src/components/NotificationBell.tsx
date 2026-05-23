"use client";

import Link from "next/link";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function NotificationBell() {
  return (
    <Link
      href="/notices"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-main/30 bg-main/10 text-main transition-colors hover:bg-main/20 active:scale-95"
      aria-label="通知"
    >
      <BellIcon className="h-5 w-5" />
    </Link>
  );
}
