/**
 * Supabase の events テーブルに description カラムを追加します。
 *
 * 使い方:
 * 1. Supabase → Project Settings → Database → Connection string (URI) をコピー
 * 2. .env.local に DATABASE_URL=... を追加
 * 3. npm run db:migrate
 *
 * または Supabase SQL Editor で supabase/migrations/add_description.sql を実行
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    [
      "DATABASE_URL が .env.local にありません。",
      "",
      "Supabase ダッシュボード → Project Settings → Database → Connection string (URI)",
      "をコピーして .env.local に追加してください。例:",
      "DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@...",
      "",
      "または SQL Editor で次を実行:",
      "alter table events add column if not exists description text;",
    ].join("\n")
  );
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1, ssl: "require" });

try {
  await sql.unsafe(
    "alter table events add column if not exists description text;"
  );
  console.log("OK: events.description カラムを追加しました。");
} catch (err) {
  console.error("マイグレーション失敗:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
