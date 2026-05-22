"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";

export default function AddPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type !== "application/pdf") {
      alert("PDFファイルを選択してください。");
      return;
    }
    setFile(selected);
  }

  function handleRead() {
    if (!file) {
      alert("PDFファイルを選択してください。");
      return;
    }
    sessionStorage.setItem("latest-if-upload-filename", file.name);
    router.push("/parsing");
  }

  return (
    <AppShell>
      <PageHeader title="PDFを追加" backHref="/" backLabel="戻る" />

      <div className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button onClick={() => inputRef.current?.click()}>
          PDFを追加
        </Button>

        {file && (
          <div className="rounded-xl bg-card px-4 py-3 text-sm">
            <p className="text-xs text-muted">選択中：</p>
            <p className="mt-1 break-all text-foreground">{file.name}</p>
          </div>
        )}

        <Button disabled={!file} onClick={handleRead}>
          AIで読み取る
        </Button>
      </div>
    </AppShell>
  );
}
