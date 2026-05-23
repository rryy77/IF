"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function AddActionMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-main text-2xl font-light leading-none text-background shadow-lg shadow-main/30 transition-transform active:scale-95"
        aria-label="予定を追加"
        aria-expanded={open}
      >
        ＋
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-[#334155] bg-card shadow-xl">
            <button
              type="button"
              className="w-full px-4 py-3.5 text-left text-sm text-foreground hover:bg-background active:bg-background"
              onClick={() => {
                setOpen(false);
                router.push("/add");
              }}
            >
              PDFを追加
            </button>
            <div className="h-px bg-[#334155]" />
            <button
              type="button"
              className="w-full px-4 py-3.5 text-left text-sm text-foreground hover:bg-background active:bg-background"
              onClick={() => {
                setOpen(false);
                router.push("/events/new");
              }}
            >
              手動予定を作成
            </button>
          </div>
        </>
      )}
    </div>
  );
}
