# さくら連絡網メール自動取り込み v2 設計メモ

## 方針

- さくら連絡網アプリのスクレイピングは行わない（規約・認証情報のリスク）
- Gmail 経由で「さくら連絡網から届くメール」のみを対象にする

## 推奨フロー

1. Gmail でさくら連絡網メールにラベル `latest-if` を付与（フィルタ自動化可）
2. Vercel Cron（5〜15分間隔）が `/api/cron/sync-sakura-mail` を実行
3. Gmail API で `label:latest-if is:unread` を取得
4. 各メールについて `classifySakuraMail` を実行
5. `isNeeded === false` → スキップ（notices に保存しない）
6. `isNeeded === true` → `notices` に insert
7. `shouldNotifyNow` → 既存 `sendPushToAll` で即時 PWA 通知
8. `schedule_pdf` + PDF URL → `/api/pdf/fetch` → 既存 PDF 解析 → `events` は確認待ち（preview）
9. `processed_mail_ids` に Gmail `message.id` を保存し二重処理を防止
10. Gmail 側は既読化またはラベル除去

## 必要な環境変数（v2）

- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- `GMAIL_LABEL`（例: `latest-if`）
- 既存 `CRON_SECRET`

## API 案

| エンドポイント | 役割 |
|----------------|------|
| `GET /api/cron/sync-sakura-mail` | Cron から Gmail 同期 |
| `POST /api/gmail/oauth/callback` | 初回 OAuth（手動セットアップ） |

## DB

- `notices` … v1 で作成済み
- `processed_mail_ids` … v1 で作成済み

## 通知方針（維持）

即時通知のみ:

- 休校・時間変更・延期・中止
- 今日/明日に関係する重要連絡
- 予定表 PDF 検出時

募金・PTA・アンケート等は `unnecessary` で除外。
