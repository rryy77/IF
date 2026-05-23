"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { classifySakuraMail } from "@/lib/sakura/classifySakuraMail";
import { extractPdfUrls } from "@/lib/sakura/extractPdfUrls";
import {
  CATEGORY_LABELS,
  IMPORTANCE_LABELS,
} from "@/lib/sakura/noticeLabels";
import type { SakuraMailClassification } from "@/lib/sakura/types";
import { saveNotice } from "@/lib/noticesStorage";

const inputClass =
  "mt-1 w-full rounded-xl border border-[#334155] bg-background px-3 py-3 text-foreground";

export default function MailImportPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [pdfUrlManual, setPdfUrlManual] = useState("");
  const [result, setResult] = useState<SakuraMailClassification | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const pdfUrls = useMemo(() => {
    const fromBody = extractPdfUrls(body);
    const manual = pdfUrlManual.trim();
    if (manual && !fromBody.includes(manual)) {
      return [...fromBody, manual];
    }
    return fromBody;
  }, [body, pdfUrlManual]);

  function handleAnalyze() {
    if (!subject.trim() && !body.trim()) {
      alert("件名または本文を入力してください。");
      return;
    }
    setAnalyzing(true);
    try {
      const classification = classifySakuraMail({
        subject: subject.trim(),
        body: body.trim(),
        pdfUrls,
      });
      setResult(classification);
    } finally {
      setAnalyzing(false);
    }
  }

  async function sendImmediatePush(summary: string, title: string) {
    const pushBody =
      result?.category === "schedule_pdf"
        ? "新しい予定表PDFを検出しました。確認してください。"
        : `さくら連絡網：${summary || title}`;

    await fetch("/api/notices/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "latest IF",
        body: pushBody,
        url: "/notices",
      }),
    });
  }

  async function handleSave() {
    if (!result?.isNeeded) {
      alert("取り込み不要と判定されたため、保存しません。");
      return;
    }

    setSaving(true);
    try {
      const pdfUrl = pdfUrls[0];
      await saveNotice({
        title: result.title,
        summary: result.summary,
        body: body.trim() || undefined,
        category: result.category,
        importance: result.importance,
        source: "sakura_mail",
        pdfUrl,
        shouldNotify: result.shouldNotifyNow,
        shouldCreateEvent: result.shouldCreateEvent,
        isRead: false,
      });

      if (result.shouldNotifyNow) {
        await sendImmediatePush(result.summary, result.title);
      }

      alert("通知欄に保存しました。");
      router.push("/notices");
    } catch (e) {
      alert(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  function handleGoPdfParse() {
    const url = pdfUrls[0];
    if (!url) {
      alert("PDFリンクがありません。");
      return;
    }
    sessionStorage.setItem("latest-if-pdf-url", url);
    sessionStorage.setItem(
      "latest-if-upload-filename",
      "sakura-schedule.pdf"
    );
    router.push("/add/from-url");
  }

  return (
    <AppShell>
      <PageHeader
        title="さくら連絡網メール"
        subtitle="本文を貼り付けてAI判定（v1）"
        backHref="/notices"
        backLabel="通知欄"
      />

      <div className="space-y-4">
        <div className="rounded-2xl border border-[#334155] bg-card p-4">
          <label className="block">
            <span className="text-xs text-muted">件名</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="例：遠足のお知らせ"
              className={inputClass}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs text-muted">本文</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="さくら連絡網メールの本文を貼り付け"
              className={`${inputClass} resize-y`}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs text-muted">PDFリンク（任意）</span>
            <input
              type="url"
              value={pdfUrlManual}
              onChange={(e) => setPdfUrlManual(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </label>

          {pdfUrls.length > 0 && (
            <p className="mt-2 text-xs text-main">
              検出PDF: {pdfUrls.length}件
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={analyzing}
          onClick={handleAnalyze}
        >
          {analyzing ? "判定中..." : "AI判定"}
        </Button>

        {result && (
          <div
            className={`rounded-2xl border p-4 ${
              result.isNeeded
                ? "border-main/40 bg-main/5"
                : "border-slate-600/50 bg-slate-800/30"
            }`}
          >
            <p className="text-sm font-semibold text-foreground">
              {result.isNeeded ? "取り込み推奨" : "取り込み不要"}
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted">種類</dt>
                <dd>{CATEGORY_LABELS[result.category]}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">重要度</dt>
                <dd>{IMPORTANCE_LABELS[result.importance]}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">タイトル</dt>
                <dd>{result.title}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">要約</dt>
                <dd className="text-muted">{result.summary}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">理由</dt>
                <dd className="text-xs text-muted">{result.reason}</dd>
              </div>
            </dl>

            {result.isNeeded && (
              <div className="mt-4 space-y-2">
                <Button disabled={saving} onClick={handleSave}>
                  {saving ? "保存中..." : "通知欄に保存"}
                </Button>
                {pdfUrls.length > 0 && result.category === "schedule_pdf" && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleGoPdfParse}
                  >
                    PDF解析へ進む
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
