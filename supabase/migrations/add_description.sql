-- 既存プロジェクトに description カラムを追加する場合
alter table events
add column if not exists description text;
