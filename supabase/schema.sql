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

-- 個人用のため全操作を許可（将来ログイン時はポリシーを差し替え）
alter table events enable row level security;
alter table push_subscriptions enable row level security;

drop policy if exists "allow all events" on events;
create policy "allow all events" on events
  for all using (true) with check (true);

drop policy if exists "allow all push_subscriptions" on push_subscriptions;
create policy "allow all push_subscriptions" on push_subscriptions
  for all using (true) with check (true);
