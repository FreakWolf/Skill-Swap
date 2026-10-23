-- SkillSwap: safety tools — block and report users.
--
-- Blocking is two-way in effect: once A blocks B, neither can message or book
-- the other, and they're hidden from each other in discovery. Only the blocker
-- can see (and undo) the block row itself.
--
-- Reports are private to the reporter and reviewed by the team in the Supabase
-- dashboard (service role). Reported users are never notified.

-- blocks ---------------------------------------------------------------------
create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index if not exists blocks_blocked_idx on public.blocks (blocked_id);

alter table public.blocks enable row level security;

drop policy if exists blocks_read_own on public.blocks;
create policy blocks_read_own on public.blocks
  for select using (auth.uid() = blocker_id);

drop policy if exists blocks_insert_own on public.blocks;
create policy blocks_insert_own on public.blocks
  for insert with check (auth.uid() = blocker_id);

drop policy if exists blocks_delete_own on public.blocks;
create policy blocks_delete_own on public.blocks
  for delete using (auth.uid() = blocker_id);

-- True if either user has blocked the other. SECURITY DEFINER so it can see
-- blocks in both directions (RLS only shows a user the blocks they created).
create or replace function public.is_blocked(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = p_a and blocked_id = p_b)
       or (blocker_id = p_b and blocked_id = p_a)
  );
$$;

-- Everyone the current user should not see: people they blocked AND people
-- who blocked them (without revealing which is which).
create or replace function public.my_hidden_user_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select blocked_id from public.blocks where blocker_id = auth.uid()
  union
  select blocker_id from public.blocks where blocked_id = auth.uid();
$$;

-- reports --------------------------------------------------------------------
create table if not exists public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid not null references public.profiles (id) on delete cascade,
  reason           text not null check (reason in (
                     'harassment', 'spam_scam', 'inappropriate',
                     'no_show', 'fake_profile', 'safety', 'other')),
  details          text not null default '' check (char_length(details) <= 2000),
  context_type     text not null default 'profile'
                     check (context_type in ('profile', 'message', 'session', 'offering')),
  context_id       uuid,
  status           text not null default 'open'
                     check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at       timestamptz not null default now(),
  check (reporter_id <> reported_user_id)
);
create index if not exists reports_status_idx on public.reports (status, created_at);
create index if not exists reports_reported_idx on public.reports (reported_user_id);

alter table public.reports enable row level security;

-- Reporters can file reports and see their own; nobody else (except the
-- service role in the dashboard) can read them. No client updates/deletes.
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports
  for insert with check (auth.uid() = reporter_id and status = 'open');

drop policy if exists reports_read_own on public.reports;
create policy reports_read_own on public.reports
  for select using (auth.uid() = reporter_id);

-- Enforcement: messaging -----------------------------------------------------
-- Recreate the message insert policy with a block check.
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
        and not public.is_blocked(c.user_a, c.user_b)
    )
  );

-- Starting a conversation with someone you've blocked (or who blocked you) fails.
create or replace function public.get_or_create_conversation(p_other uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me   uuid := auth.uid();
  v_a    uuid;
  v_b    uuid;
  v_id   uuid;
begin
  if v_me is null then
    raise exception 'not authenticated';
  end if;
  if p_other is null or p_other = v_me then
    raise exception 'invalid conversation partner';
  end if;
  if public.is_blocked(v_me, p_other) then
    raise exception 'you can''t message this member';
  end if;

  if v_me < p_other then
    v_a := v_me; v_b := p_other;
  else
    v_a := p_other; v_b := v_me;
  end if;

  select id into v_id from public.conversations
    where user_a = v_a and user_b = v_b;

  if v_id is null then
    insert into public.conversations (user_a, user_b)
    values (v_a, v_b)
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

-- Enforcement: booking -------------------------------------------------------
-- Same as 0002 book_slot, plus a block check.
create or replace function public.book_slot(
  p_slot_id uuid,
  p_notes   text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_learner   uuid := auth.uid();
  v_slot      public.availability%rowtype;
  v_offering  public.offerings%rowtype;
  v_balance   int;
  v_booking   uuid;
begin
  if v_learner is null then
    raise exception 'not authenticated';
  end if;

  select * into v_slot from public.availability
    where id = p_slot_id for update;

  if not found then
    raise exception 'slot not found';
  end if;
  if v_slot.is_booked then
    raise exception 'slot already booked';
  end if;

  select * into v_offering from public.offerings
    where id = v_slot.offering_id;

  if v_offering.teacher_id = v_learner then
    raise exception 'cannot book your own offering';
  end if;
  if public.is_blocked(v_learner, v_offering.teacher_id) then
    raise exception 'you can''t book with this member';
  end if;

  v_balance := public.current_balance(v_learner);
  if v_balance < v_offering.credit_cost then
    raise exception 'insufficient credits: have %, need %', v_balance, v_offering.credit_cost;
  end if;

  update public.availability set is_booked = true where id = p_slot_id;

  insert into public.bookings (
    offering_id, slot_id, learner_id, teacher_id, status,
    credit_cost, notes, starts_at, ends_at
  ) values (
    v_offering.id, p_slot_id, v_learner, v_offering.teacher_id, 'confirmed',
    v_offering.credit_cost, coalesce(p_notes, ''), v_slot.starts_at, v_slot.ends_at
  )
  returning id into v_booking;

  insert into public.sessions (booking_id) values (v_booking);

  insert into public.credit_transactions (user_id, amount, reason, booking_id)
  values (v_learner, -v_offering.credit_cost, 'booking_hold', v_booking);

  insert into public.notifications (user_id, kind, title, body)
  values (v_offering.teacher_id, 'booking',
          'New booking',
          'Someone booked "' || v_offering.title || '".');

  return v_booking;
end;
$$;
