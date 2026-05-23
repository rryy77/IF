-- latest IF: Supabase スキーマ（個人用・ログインなし）

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  end_date date,
  start_time text,
  end_time text,
  type text default 'other',
  status text default 'confirmed',
  source text default 'pdf',
  raw_text text,
  confidence numeric,
  description text,
  reminder_sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists events_date_idx on events (date);
create index if not exists events_reminder_idx on events (reminder_sent_at);

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

create table if not exists gmail_tokens (
  id uuid primary key default gen_random_uuid(),
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  user_email text,
  auto_monitor_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 個人用のため全操作を許可（将来ログイン時はポリシーを差し替え）
alter table events enable row level security;
alter table push_subscriptions enable row level security;
alter table notices enable row level security;
alter table processed_mail_ids enable row level security;
alter table gmail_tokens enable row level security;

drop policy if exists "allow all events" on events;
create policy "allow all events" on events
  for all using (true) with check (true);

drop policy if exists "allow all push_subscriptions" on push_subscriptions;
create policy "allow all push_subscriptions" on push_subscriptions
  for all using (true) with check (true);

drop policy if exists "allow all notices" on notices;
create policy "allow all notices" on notices
  for all using (true) with check (true);

drop policy if exists "allow all processed_mail_ids" on processed_mail_ids;
create policy "allow all processed_mail_ids" on processed_mail_ids
  for all using (true) with check (true);

drop policy if exists "allow all gmail_tokens" on gmail_tokens;
create policy "allow all gmail_tokens" on gmail_tokens
  for all using (true) with check (true);
