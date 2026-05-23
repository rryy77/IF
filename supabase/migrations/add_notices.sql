-- さくら連絡網メール取り込み（v1: 通知欄 / v2: 自動監視）

create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  body text,
  category text not null,
  importance text default 'normal',
  source text default 'sakura_mail',
  pdf_url text,
  should_notify boolean default false,
  should_create_event boolean default false,
  is_read boolean default false,
  created_at timestamptz default now()
);

create table if not exists processed_mail_ids (
  id uuid primary key default gen_random_uuid(),
  mail_id text not null unique,
  processed_at timestamptz default now()
);

create index if not exists notices_created_idx on notices (created_at desc);
create index if not exists notices_unread_idx on notices (is_read) where is_read = false;

alter table notices enable row level security;
alter table processed_mail_ids enable row level security;

drop policy if exists "allow all notices" on notices;
create policy "allow all notices" on notices
  for all using (true) with check (true);

drop policy if exists "allow all processed_mail_ids" on processed_mail_ids;
create policy "allow all processed_mail_ids" on processed_mail_ids
  for all using (true) with check (true);
