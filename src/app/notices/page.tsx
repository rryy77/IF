"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  CATEGORY_LABELS,
  IMPORTANCE_COLORS,
  IMPORTANCE_LABELS,
} from "@/lib/sakura/noticeLabels";
import type { NoticeItem } from "@/lib/sakura/types";
import { GmailSettingsPanel } from "@/components/GmailSettingsPanel";
import { getNotices, setNoticeRead } from "@/lib/noticesStorage";

function formatNoticeDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

  async function handleMarkRead(id: string) {
    await setNoticeRead(id);
    await load();
  }

  function handlePdfParse(url: string) {
    sessionStorage.setItem("latest-if-pdf-url", url);
    sessionStorage.setItem("latest-if-upload-filename", "sakura-schedule.pdf");
    router.push("/add/from-url");
  }

  return (
    <AppShell>
      <PageHeader title="通知" backHref="/" backLabel="ホーム" />

      <GmailSettingsPanel />

      <div className="mb-4">
        <Link href="/mail/import">
          <Button type="button" variant="secondary">
            さくら連絡網メールを貼り付け（v1）
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
          <p className="mt-2 text-xs">
            Supabase で notices テーブルを作成してください（supabase/migrations/add_notices.sql）
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-muted">読み込み中...</p>
      ) : notices.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-muted/30 p-8 text-center text-sm text-muted">
          通知はまだありません。
        </p>
      ) : (
        <ul className="space-y-3">
          {notices.map((notice) => (
            <li
              key={notice.id}
              className={`rounded-2xl border p-4 ${
                notice.isRead
                  ? "border-[#334155] bg-card/60"
                  : "border-main/30 bg-card"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-semibold text-foreground">{notice.title}</h2>
                {!notice.isRead && (
                  <span className="rounded-full bg-main/20 px-2 py-0.5 text-[10px] text-main">
                    未読
                  </span>
                )}
              </div>

              {notice.summary && (
                <p className="mt-2 text-sm text-muted">{notice.summary}</p>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-[10px] text-slate-300">
                  {CATEGORY_LABELS[notice.category]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${IMPORTANCE_COLORS[notice.importance]}`}
                >
                  {IMPORTANCE_LABELS[notice.importance]}
                </span>
                {notice.shouldCreateEvent && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                    予定候補
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-muted">
                {formatNoticeDate(notice.createdAt)}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {!notice.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(notice.id)}
                    className="rounded-lg border border-main/30 px-3 py-1.5 text-xs text-main"
                  >
                    既読にする
                  </button>
                )}
                {notice.pdfUrl && (
                  <button
                    type="button"
                    onClick={() => handlePdfParse(notice.pdfUrl!)}
                    className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200"
                  >
                    PDF解析へ
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
