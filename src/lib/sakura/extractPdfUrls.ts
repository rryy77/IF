const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/gi;

const PDF_HINT =
  /pdf|予定表|行事予定|年間予定|学期予定|時間割|添付|ダウンロード/i;

/** メール本文から PDF らしき URL を抽出 */
export function extractPdfUrls(body: string): string[] {
  const text = body.replace(/\r\n/g, "\n");
  const urls = text.match(URL_PATTERN) ?? [];
  const found = new Set<string>();

  for (const raw of urls) {
    const url = raw.replace(/[.,;:!?）】]+$/, "");
    if (/\.pdf(\?|$)/i.test(url)) {
      found.add(url);
      continue;
    }

    const idx = text.indexOf(url);
    if (idx >= 0) {
      const context = text.slice(Math.max(0, idx - 40), idx + url.length + 40);
      if (PDF_HINT.test(context)) {
        found.add(url);
      }
    }
  }

  return [...found];
}
