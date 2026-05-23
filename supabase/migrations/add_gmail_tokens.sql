-- Gmail OAuth トークン（個人用・1ユーザー前提）

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

alter table gmail_tokens enable row level security;

drop policy if exists "allow all gmail_tokens" on gmail_tokens;
create policy "allow all gmail_tokens" on gmail_tokens
  for all using (true) with check (true);
