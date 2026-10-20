create table if not exists public.app_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.app_admins enable row level security;

drop policy if exists "Admins can read their own access" on public.app_admins;
create policy "Admins can read their own access"
  on public.app_admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.app_admins to authenticated;

create table if not exists public.app_state (
  id integer primary key check (id = 1),
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "Anyone can read shared app data" on public.app_state;
create policy "Anyone can read shared app data"
  on public.app_state
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Approved admins can create shared app data" on public.app_state;
create policy "Approved admins can create shared app data"
  on public.app_state
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.app_admins
      where user_id = (select auth.uid())
    )
  );

drop policy if exists "Approved admins can update shared app data" on public.app_state;
create policy "Approved admins can update shared app data"
  on public.app_state
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.app_admins
      where user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.app_admins
      where user_id = (select auth.uid())
    )
  );

grant select on public.app_state to anon, authenticated;
grant insert, update on public.app_state to authenticated;
