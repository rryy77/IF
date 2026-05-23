export type GmailPart = {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailPart[];
};

function decodeBase64Url(data: string): string {
  const padded = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString("utf-8");
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function collectBodies(
  part: GmailPart,
  plain: string[],
  html: string[]
): void {
  const mime = part.mimeType ?? "";
  const data = part.body?.data;

  if (data) {
    const decoded = decodeBase64Url(data);
    if (mime === "text/plain") plain.push(decoded);
    else if (mime === "text/html") html.push(decoded);
  }

  if (part.parts) {
    for (const child of part.parts) {
      collectBodies(child, plain, html);
    }
  }
}

export function extractBodyFromPayload(payload: GmailPart): {
  plainText: string;
  htmlText: string;
  bodyForAnalysis: string;
} {
  const plain: string[] = [];
  const html: string[] = [];
  collectBodies(payload, plain, html);

  const plainText = plain.join("\n").trim();
  const htmlText = html.join("\n").trim();
  const bodyForAnalysis =
    plainText || (htmlText ? htmlToPlainText(htmlText) : "");

  return { plainText, htmlText, bodyForAnalysis };
}

export function getHeader(
  headers: { name: string; value: string }[] | undefined,
  name: string
): string {
  const h = headers?.find(
    (x) => x.name.toLowerCase() === name.toLowerCase()
  );
  return h?.value ?? "";
}
