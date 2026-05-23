"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { extractEventsFromPdf } from "@/lib/extractEventsFromPdf";
import { savePendingEvents } from "@/lib/storage";

export default function AddFromUrlPage() {
  const router = useRouter();
  const [status, setStatus] = useState("PDFを取得しています...");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const url = sessionStorage.getItem("latest-if-pdf-url");
      if (!url) {
        alert("PDFのURLがありません。");
        router.replace("/notices");
        return;
      }

      try {
        setStatus("PDFをダウンロード中...");
        const res = await fetch(
          `/api/pdf/fetch?url=${encodeURIComponent(url)}`
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            (err as { error?: string }).error ?? "PDFの取得に失敗しました"
          );
        }

        const blob = await res.blob();
        const fileName =
          sessionStorage.getItem("latest-if-upload-filename") ??
          "schedule.pdf";
        const file = new File([blob], fileName, { type: "application/pdf" });

        if (cancelled) return;

        setStatus("予定を解析中...");
        const result = await extractEventsFromPdf(file);
        if (cancelled) return;

        savePendingEvents(result.events);
        sessionStorage.removeItem("latest-if-pdf-url");
        router.replace("/preview");
      } catch (e) {
        if (!cancelled) {
          alert(
            e instanceof Error
              ? e.message
              : "PDFの読み取りに失敗しました。手動でPDFを追加してください。"
          );
          router.replace("/add");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <AppShell>
      <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
        <div className="mb-6 h-14 w-14 animate-spin-slow rounded-full border-4 border-card border-t-main" />
        <h1 className="text-xl font-semibold text-foreground">{status}</h1>
        <p className="mt-2 text-sm text-muted">さくら連絡網のPDFリンクから読み取り</p>
      </div>
    </AppShell>
  );
}
