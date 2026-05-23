"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { GmailSettingsPanel } from "@/components/GmailSettingsPanel";
import { PageHeader } from "@/components/PageHeader";
import type { NoticeItem } from "@/lib/sakura/types";
import { getNotices } from "@/lib/noticesStorage";

function formatNoticeDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function noticeExcerpt(notice: NoticeItem): string | null {
  const text = notice.summary?.trim() || notice.body?.trim();
  if (!text) return null;
  const oneLine = text.replace(/\s+/g, " ");
  return oneLine.length > 80 ? `${oneLine.slice(0, 80)}…` : oneLine;
}

export default function NoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotices();
      setNotices(data.filter((n) => n.category !== "unnecessary"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("latest-if-notices-updated", onUpdate);
    return () =>
      window.removeEventListener("latest-if-notices-updated", onUpdate);
  }, [load]);

  function handleNoticeClick(notice: NoticeItem) {
    if (!notice.pdfUrl) return;
    sessionStorage.setItem("latest-if-pdf-url", notice.pdfUrl);
    sessionStorage.setItem("latest-if-upload-filename", "sakura-schedule.pdf");
    router.push("/add/from-url");
  }

  return (
    <AppShell>
      <PageHeader title="通知" backHref="/" backLabel="ホーム" />

      <GmailSettingsPanel />

      {error && (
        <p className="mb-4 text-sm text-red-300">{error}</p>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-muted">読み込み中...</p>
      ) : notices.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">通知はありません</p>
      ) : (
        <ul className="divide-y divide-[#334155]/80">
          {notices.map((notice) => {
            const excerpt = noticeExcerpt(notice);
            const hasPdf = Boolean(notice.pdfUrl);

            return (
              <li key={notice.id}>
                <button
                  type="button"
                  onClick={() => handleNoticeClick(notice)}
                  disabled={!hasPdf}
                  className={`w-full py-4 text-left ${
                    hasPdf
                      ? "cursor-pointer active:opacity-80"
                      : "cursor-default"
                  }`}
                >
                  <h3 className="text-base font-medium text-foreground">
                    {notice.title}
                  </h3>
                  {excerpt && (
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {excerpt}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-muted/80">
                    {formatNoticeDate(notice.createdAt)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
