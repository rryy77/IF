/**
 * vercel.json の check-sakura-mails schedule と一致させる（UIには表示しない）
 * @see vercel.json
 *
 * Vercel Hobby は 1 日 1 回まで。5分間隔がデプロイできない場合は "0 0 * * *" に変更し、
 * フォアグラウンド自動確認（foregroundCheck.ts）で補完する。
 */
export const GMAIL_CRON_SCHEDULE = "*/5 * * * *";
