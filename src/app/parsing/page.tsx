"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { extractEventsFromPdf } from "@/lib/extractEventsFromPdf";
import { savePendingEvents } from "@/lib/storage";
import { detectExtractionGaps } from "@/lib/detectExtractionGaps";

export default function ParsingPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const fileName = sessionStorage.getItem("latest-if-upload-filename");
      const dummyFile = new File([], fileName ?? "schedule.pdf", {
        type: "application/pdf",
      });

      try {
        const result = await extractEventsFromPdf(dummyFile);
        if (cancelled) return;
        savePendingEvents(result.events);
        if (result.warnings.length > 0) {
          console.warn("[latest IF] 抽出漏れの可能性:", result.warnings);
        }
        router.replace("/preview");
      } catch {
        if (!cancelled) {
          alert("読み取りに失敗しました。もう一度お試しください。");
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
        <div className="mb-6 h-14 w-14 rounded-full border-4 border-card border-t-main animate-spin-slow" />
        <h1 className="text-xl font-semibold text-foreground">
          PDFを解析中...
        </h1>
        <p className="mt-2 text-sm text-muted">予定を読み取っています</p>
        <p className="mt-4 rounded-full bg-card px-4 py-1.5 text-xs text-main">
          月ごとに表を読み取り中
        </p>
      </div>
    </AppShell>
  );
}
