"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** ホームに統合したため、旧URLはリダイレクト */
export default function CalendarPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
