/** PostgREST / Postgres エラーをユーザー向けメッセージに変換 */
export function formatSupabaseError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("description") &&
    (lower.includes("does not exist") ||
      lower.includes("could not find") ||
      lower.includes("schema cache"))
  ) {
    return [
      "メモ機能に必要な Supabase のカラム（description）がまだ追加されていません。",
      "",
      "【対処】Supabase ダッシュボード → SQL Editor で次を実行してください：",
      "",
      "alter table events add column if not exists description text;",
      "",
      "実行後、ページを再読み込みして再度保存してください。",
      "（または DATABASE_URL を .env.local に設定して npm run db:migrate）",
    ].join("\n");
  }

  return message;
}
