# latest IF

学校から配布されるPDF形式の予定表をアップロードし、AI（モック）で予定を抽出してカレンダーに追加。前日20時にPWAプッシュ通知します。

## セットアップ

### 1. 依存関係

```bash
cd /Users/fujitan./dev/Latest_IF
npm install
node scripts/generate-icons.mjs   # icon-192.png / icon-512.png 生成
```

### 2. Supabase

1. [Supabase](https://supabase.com) でプロジェクト作成
2. SQL Editor で `supabase/schema.sql` を実行
3. Project Settings > API から URL とキーをコピー

### 3. VAPID キー

```bash
npx web-push generate-vapid-keys
```

公開鍵 → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`  
秘密鍵 → `VAPID_PRIVATE_KEY`

### 4. 環境変数

`.env.local.example` を `.env.local` にコピーして値を入れる。

```bash
cp .env.local.example .env.local
```

### 5. 起動

```bash
npm run dev
```

https://localhost:3000 または Vercel の HTTPS で開く（プッシュ通知は HTTPS 必須）。

---

## ファイル構成（追加分）

```
public/
  manifest.json
  sw.js
  icon-192.png
  icon-512.png
supabase/
  schema.sql
src/
  app/api/
    push/subscribe/route.ts
    push/test/route.ts
    cron/send-reminders/route.ts
  lib/
    supabase/          # DB 接続・予定 CRUD
    push/              # VAPID・送信・リマインド文
    dates/japan.ts     # 日本時間の明日
  components/
    ServiceWorkerRegister.tsx
    NotificationSettings.tsx
vercel.json            # Cron（UTC 11:00 = JST 20:00）
```

---

## Vercel デプロイ手順

1. GitHub に push して Vercel にインポート
2. Environment Variables に `.env.local` と同じ値をすべて設定
3. `CRON_SECRET` はランダムな長い文字列
4. Deploy 後、Vercel が `vercel.json` の Cron を自動登録（Pro プランで Cron 利用可）
5. Cron は `GET /api/cron/send-reminders` に `Authorization: Bearer CRON_SECRET` を付与して呼ぶ

---

## iPhone での使い方

1. Safari でサイトを開く（HTTPS）
2. 共有 → **ホーム画面に追加**
3. ホーム画面のアイコンから起動
4. **通知をオンにする** をタップ → 許可
5. **テスト通知を送る** で届くか確認
6. PDF を追加して予定を Supabase に保存
7. 毎日20時（日本時間）に「明日の予定」が通知される

---

## 通知の仕組み

| 処理 | 説明 |
|------|------|
| 予定保存 | `events` テーブル（Supabase） |
| 購読保存 | `push_subscriptions` テーブル |
| 前日判定 | 日本時間の「明日」 |
| 期間予定 | `date <= 明日 <= end_date` なら対象 |
| 二重防止 | `reminder_sent_at` を送信後に更新 |

---

## 次に追加すべき機能

- ユーザー認証（Supabase Auth）
- 通知時刻のカスタマイズ
- 複数端末・複数ユーザー対応
