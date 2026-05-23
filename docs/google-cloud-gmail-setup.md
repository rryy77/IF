# Google Cloud / Gmail API 設定手順

## 1. プロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. **新しいプロジェクト** を作成（例: `latest-if`）

## 2. Gmail API を有効化

1. **APIとサービス** → **ライブラリ**
2. **Gmail API** を検索
3. **有効にする**

## 3. OAuth 同意画面

1. **APIとサービス** → **OAuth 同意画面**
2. ユーザータイプ: **外部**（テスト中は自分のGoogleアカウントをテストユーザーに追加）
3. アプリ名: `latest IF`
4. スコープ: `https://www.googleapis.com/auth/gmail.readonly` を追加
5. テストユーザーに自分の Gmail を追加

## 4. OAuth クライアント ID

1. **認証情報** → **認証情報を作成** → **OAuth クライアント ID**
2. アプリケーションの種類: **ウェブアプリケーション**
3. **承認済みのリダイレクト URI**（本番 Vercel のみ登録）:

```
https://あなたのVercelドメイン/api/gmail/callback
```

> **重要:** `redirect_uri` はコード内で固定されません。必ず `GOOGLE_REDIRECT_URI` 環境変数と Google Console の登録値を **完全一致** させてください。  
> OAuth 開始時とトークン交換時で同じ URI が使われます。

## 5. 本番環境変数（Vercel）

Vercel の **Environment Variables** に以下を設定し、**Redeploy** してください。

```env
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
GOOGLE_REDIRECT_URI=https://あなたのVercelドメイン/api/gmail/callback

NEXT_PUBLIC_SITE_URL=https://あなたのVercelドメイン
# または NEXT_PUBLIC_APP_URL=https://あなたのVercelドメイン

GMAIL_SEARCH_QUERY=subject:(さくら連絡網 OR 学校連絡 OR 連絡網)
```

### 優先順位

| 用途 | 環境変数 |
|------|----------|
| OAuth `redirect_uri` | **GOOGLE_REDIRECT_URI のみ**（localhost フォールバックなし） |
| 認証後のリダイレクト先 | `NEXT_PUBLIC_SITE_URL` → なければ `NEXT_PUBLIC_APP_URL` |

### 未設定時のエラー

`GOOGLE_REDIRECT_URI` が無い場合、API は次を返します:

```json
{ "error": "GOOGLE_REDIRECT_URI is missing" }
```

## 6. redirect_uri_mismatch を防ぐチェックリスト

1. Google Console の URI = `GOOGLE_REDIRECT_URI`（末尾スラッシュなし、パス含む）
2. Vercel 環境変数変更後は **必ず Redeploy**
3. 本番 URL で `/api/gmail/auth` にアクセスして連携（localhost は使わない）

## 7. Supabase マイグレーション

SQL Editor で実行:

- `supabase/migrations/add_notices.sql`
- `supabase/migrations/add_gmail_tokens.sql`

## 8. 動作確認

1. Vercel 本番 URL を開く
2. **通知** → **Gmail連携する**
3. Google 認証
4. **確認する** でメール取り込みテスト

## 9. Cron（本番）

`vercel.json` で 5 分ごと（`*/5 * * * *`）`/api/cron/check-sakura-mails` を試行します。

> Vercel **Hobby** は Cron が 1 日 1 回までのため、デプロイできない場合は `vercel.json` を `"0 0 * * *"` にし、`cronSchedule.ts` の `GMAIL_CRON_SCHEDULE` も同じ値に変更してください。  
> その場合も、アプリ起動時・通知画面表示時のフォアグラウンド確認（5 分間隔）でメールを取り込みます。

`CRON_SECRET` を Vercel に設定してください。

## 注意

- さくら連絡網アプリのスクレイピングは行いません
- Gmail **読み取り専用** スコープのみ使用
- 個人用のため `gmail_tokens` は1ユーザー前提
- コールバック API のパスは `/api/gmail/callback` です
