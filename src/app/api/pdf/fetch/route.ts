import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** PDF URL をサーバー経由で取得（v1: さくら連絡網メール内リンク用） */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url が必要です" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "無効なURLです" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return NextResponse.json({ error: "http/https のみ対応" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/pdf,*/*" },
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `PDFの取得に失敗しました (${res.status})` },
        { status: 502 }
      );
    }

    const buffer = await res.arrayBuffer();
    const contentType =
      res.headers.get("content-type") ?? "application/pdf";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": 'inline; filename="schedule.pdf"',
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
