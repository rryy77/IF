-- さくら連絡網メールの最終確認時刻（手動・Cron 共通）

alter table gmail_tokens
  add column if not exists last_mail_check_at timestamptz;
