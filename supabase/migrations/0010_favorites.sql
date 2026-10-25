-- SkillSwap: saved offerings (favourites).
--
-- A member can bookmark offerings to come back to later. Rows are private to
-- the member who saved them and disappear when either side is deleted.
-- Suspended members cannot change their list (they cannot use the app).

create table if not exists public.favorites (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  offering_id uuid not null references public.offerings (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, offering_id)
);
create index if not exists favorites_offering_idx on public.favorites (offering_id);

alter table public.favorites enable row level security;

drop policy if exists favorites_read_own on public.favorites;
create policy favorites_read_own on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists favorites_insert_own on public.favorites;
create policy favorites_insert_own on public.favorites
  for insert with check (auth.uid() = user_id and not public.is_suspended(auth.uid()));

drop policy if exists favorites_delete_own on public.favorites;
create policy favorites_delete_own on public.favorites
  for delete using (auth.uid() = user_id and not public.is_suspended(auth.uid()));
