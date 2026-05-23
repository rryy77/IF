import { classifySakuraMail } from "@/lib/sakura/classifySakuraMail";
import { extractPdfUrls } from "@/lib/sakura/extractPdfUrls";
import { createAdminClient } from "@/lib/supabase/admin";
import { noticeToInsertRow } from "@/lib/supabase/noticeMapper";
import { sendPushToAll } from "@/lib/push/webPushServer";
import { fetchGmailMessage, listSakuraMessageIds } from "./gmailClient";
import { getGmailToken } from "./tokenStore";
import { isMailProcessed, markMailProcessed } from "./processedMailStore";

export type SakuraMailCheckResult = {
  checked: number;
  processed: number;
  savedNotices: number;
  ignored: number;
  pushed: number;
  errors: string[];
};

async function saveNoticeFromGmail(params: {
  title: string;
  summary: string;
  body: string;
  category: string;
  importance: string;
  pdfUrl?: string;
  shouldNotify: boolean;
  shouldCreateEvent: boolean;
}): Promise<void> {
  const supabase = createAdminClient();
  const row = noticeToInsertRow({
    title: params.title,
    summary: params.summary,
    body: params.body,
    category: params.category as never,
    importance: params.importance as never,
    source: "gmail_sakura",
    pdfUrl: params.pdfUrl,
    shouldNotify: params.shouldNotify,
    shouldCreateEvent: params.shouldCreateEvent,
    isRead: false,
  });

  const { error } = await supabase.from("notices").insert(row);
  if (error) {
    throw new Error(`通知保存失敗: ${error.message}`);
  }
}

async function sendImmediateNoticePush(
  summary: string,
  title: string,
  category: string
): Promise<void> {
  const body =
    category === "schedule_pdf"
      ? "新しい予定表PDFを検出しました。確認してください。"
      : `さくら連絡網：${summary || title}`;

  await sendPushToAll({
    title: "latest IF",
    body,
    url: "/notices",
  });
}

/** さくら連絡網メールを Gmail から取得して処理 */
export async function processSakuraMails(
  maxMessages = 20
): Promise<SakuraMailCheckResult> {
  const token = await getGmailToken();
  if (!token) {
    throw new Error("Gmailが連携されていません");
  }

  const result: SakuraMailCheckResult = {
    checked: 0,
    processed: 0,
    savedNotices: 0,
    ignored: 0,
    pushed: 0,
    errors: [],
  };

  const ids = await listSakuraMessageIds(maxMessages);
  result.checked = ids.length;

  for (const mailId of ids) {
    try {
      if (await isMailProcessed(mailId)) {
        continue;
      }

      const message = await fetchGmailMessage(mailId);
      const bodyText = [message.subject, message.body, message.snippet]
        .filter(Boolean)
        .join("\n\n");
      const pdfUrls = extractPdfUrls(bodyText);

      const classification = classifySakuraMail({
        subject: message.subject,
        body: message.body || message.snippet,
        pdfUrls,
      });

      result.processed++;

      if (!classification.isNeeded) {
        result.ignored++;
        await markMailProcessed(mailId);
        continue;
      }

      const pdfUrl = pdfUrls[0];
      await saveNoticeFromGmail({
        title: classification.title,
        summary: classification.summary,
        body: message.body || message.snippet,
        category: classification.category,
        importance: classification.importance,
        pdfUrl,
        shouldNotify: classification.shouldNotifyNow,
        shouldCreateEvent: classification.shouldCreateEvent,
      });
      result.savedNotices++;

      if (classification.shouldNotifyNow) {
        try {
          await sendImmediateNoticePush(
            classification.summary,
            classification.title,
            classification.category
          );
          result.pushed++;
        } catch (pushErr) {
          result.errors.push(
            pushErr instanceof Error ? pushErr.message : "Push失敗"
          );
        }
      }

      await markMailProcessed(mailId);
    } catch (err) {
      result.errors.push(
        `${mailId}: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  }

  return result;
}
