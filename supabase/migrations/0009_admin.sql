-- SkillSwap: admin panel foundations.
--
-- Adds an admin flag on profiles, account suspension, featured offerings,
-- report triage fields, an admin audit log, site announcements and support
-- tickets (from the public contact form). Admin pages in the app run with the
-- service role after a server-side is_admin check; the RLS policies below make
-- the same data readable/updatable by admins through a normal session too.
--
-- Promote an account:
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');

-- profiles ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin         boolean not null default false,
  add column if not exists suspended_at     timestamptz,
  add column if not exists suspended_reason text not null default '';

create index if not exists profiles_admin_idx on public.profiles (is_admin) where is_admin;
create index if not exists profiles_suspended_idx on public.profiles (suspended_at) where suspended_at is not null;

-- True when the caller's profile is flagged as admin. SECURITY DEFINER so it
-- can be used inside policies on profiles itself without recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function public.is_suspended(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = p_user and suspended_at is not null
  );
$$;

-- offerings --------------------------------------------------------------------
alter table public.offerings
  add column if not exists is_featured boolean not null default false;
create index if not exists offerings_featured_idx on public.offerings (is_featured) where is_featured;

-- reports: triage fields -------------------------------------------------------
alter table public.reports
  add column if not exists updated_at  timestamptz not null default now(),
  add column if not exists resolved_by uuid references public.profiles (id) on delete set null,
  add column if not exists admin_notes text not null default '';

drop trigger if exists reports_touch on public.reports;
create trigger reports_touch before update on public.reports
  for each row execute function public.touch_updated_at();

-- admin audit log --------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  target_type text not null default '',
  target_id   text not null default '',
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_target_idx on public.admin_audit_log (target_type, target_id);

alter table public.admin_audit_log enable row level security;

drop policy if exists admin_audit_log_admin_read on public.admin_audit_log;
create policy admin_audit_log_admin_read on public.admin_audit_log
  for select using (public.is_admin());

drop policy if exists admin_audit_log_admin_insert on public.admin_audit_log;
create policy admin_audit_log_admin_insert on public.admin_audit_log
  for insert with check (public.is_admin() and admin_id = auth.uid());

-- announcements ----------------------------------------------------------------
create table if not exists public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) <= 120),
  body       text not null default '' check (char_length(body) <= 1000),
  is_active  boolean not null default true,
  starts_at  timestamptz not null default now(),
  ends_at    timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists announcements_active_idx on public.announcements (is_active, starts_at desc);

drop trigger if exists announcements_touch on public.announcements;
create trigger announcements_touch before update on public.announcements
  for each row execute function public.touch_updated_at();

alter table public.announcements enable row level security;

-- Members see live announcements; admins see and manage everything.
drop policy if exists announcements_read_live on public.announcements;
create policy announcements_read_live on public.announcements
  for select to authenticated using (
    public.is_admin()
    or (is_active and starts_at <= now() and (ends_at is null or ends_at > now()))
  );

drop policy if exists announcements_admin_write on public.announcements;
create policy announcements_admin_write on public.announcements
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- support tickets --------------------------------------------------------------
create table if not exists public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete set null,
  name        text not null check (char_length(name) <= 80),
  email       text not null check (char_length(email) <= 200),
  subject     text not null check (char_length(subject) <= 140),
  message     text not null check (char_length(message) <= 2000),
  status      text not null default 'open' check (status in ('open', 'answered', 'closed')),
  admin_reply text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists support_tickets_status_idx on public.support_tickets (status, created_at desc);

drop trigger if exists support_tickets_touch on public.support_tickets;
create trigger support_tickets_touch before update on public.support_tickets
  for each row execute function public.touch_updated_at();

alter table public.support_tickets enable row level security;

-- Inserted by the server (service role) from the contact form. Members can see
-- their own tickets; admins everything.
drop policy if exists support_tickets_read on public.support_tickets;
create policy support_tickets_read on public.support_tickets
  for select to authenticated using (public.is_admin() or auth.uid() = user_id);

drop policy if exists support_tickets_admin_update on public.support_tickets;
create policy support_tickets_admin_update on public.support_tickets
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- admin read/update policies on existing tables --------------------------------
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists offerings_admin_read on public.offerings;
create policy offerings_admin_read on public.offerings
  for select to authenticated using (public.is_admin());

drop policy if exists offerings_admin_update on public.offerings;
create policy offerings_admin_update on public.offerings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists bookings_admin_read on public.bookings;
create policy bookings_admin_read on public.bookings
  for select to authenticated using (public.is_admin());

drop policy if exists credit_transactions_admin_read on public.credit_transactions;
create policy credit_transactions_admin_read on public.credit_transactions
  for select to authenticated using (public.is_admin());

drop policy if exists credit_purchases_admin_read on public.credit_purchases;
create policy credit_purchases_admin_read on public.credit_purchases
  for select to authenticated using (public.is_admin());

drop policy if exists reports_admin_read on public.reports;
create policy reports_admin_read on public.reports
  for select to authenticated using (public.is_admin());

drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update on public.reports
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists skills_admin_update on public.skills;
create policy skills_admin_update on public.skills
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists skills_admin_delete on public.skills;
create policy skills_admin_delete on public.skills
  for delete to authenticated using (public.is_admin());

-- admin credit adjustments -----------------------------------------------------
-- Grants or removes credits as an admin. Writes an 'adjustment' ledger row, a
-- notification for the member and an audit entry, all in one transaction.
create or replace function public.admin_adjust_credits(
  p_user   uuid,
  p_amount int,
  p_note   text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin uuid := auth.uid();
begin
  if v_admin is null or not public.is_admin() then
    raise exception 'admin only';
  end if;
  if p_amount = 0 or p_amount < -1000 or p_amount > 1000 then
    raise exception 'amount must be between -1000 and 1000 and not zero';
  end if;
  if p_amount < 0 and public.current_balance(p_user) + p_amount < 0 then
    raise exception 'balance cannot go below zero';
  end if;

  insert into public.credit_transactions (user_id, amount, reason)
  values (p_user, p_amount, 'adjustment');

  insert into public.notifications (user_id, kind, title, body)
  values (
    p_user, 'credit',
    case when p_amount > 0 then 'Credits added' else 'Credits removed' end,
    abs(p_amount) || ' credit' || case when abs(p_amount) = 1 then '' else 's' end
      || case when p_amount > 0 then ' added to' else ' removed from' end
      || ' your balance by the SkillSwap team.'
      || case when coalesce(p_note, '') = '' then '' else ' Note: ' || p_note end
  );

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, details)
  values (v_admin, 'credits.adjust', 'user', p_user::text,
          jsonb_build_object('amount', p_amount, 'note', coalesce(p_note, '')));
end;
$$;

-- admin cancellation -----------------------------------------------------------
-- Cancels a confirmed booking regardless of participant or start time,
-- refunds the learner's hold and notifies both parties.
create or replace function public.admin_cancel_booking(
  p_booking_id uuid,
  p_note       text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin   uuid := auth.uid();
  v_booking public.bookings%rowtype;
begin
  if v_admin is null or not public.is_admin() then
    raise exception 'admin only';
  end if;

  select * into v_booking from public.bookings
    where id = p_booking_id for update;

  if not found then
    raise exception 'booking not found';
  end if;
  if v_booking.status <> 'confirmed' then
    raise exception 'only confirmed bookings can be cancelled';
  end if;

  update public.bookings set status = 'cancelled' where id = p_booking_id;
  update public.availability set is_booked = false where id = v_booking.slot_id;

  insert into public.credit_transactions (user_id, amount, reason, booking_id)
  values (v_booking.learner_id, v_booking.credit_cost, 'booking_refund', p_booking_id);

  insert into public.notifications (user_id, kind, title, body)
  select u, 'booking', 'Session cancelled by SkillSwap',
         'A booked session was cancelled by the SkillSwap team. Held credits were refunded to the learner.'
         || case when coalesce(p_note, '') = '' then '' else ' Note: ' || p_note end
  from unnest(array[v_booking.learner_id, v_booking.teacher_id]) as u;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, details)
  values (v_admin, 'booking.cancel', 'booking', p_booking_id::text,
          jsonb_build_object('note', coalesce(p_note, '')));
end;
$$;

-- booking guards ---------------------------------------------------------------
-- Same as 0007 book_slot, plus: the offering must be active, and neither party
-- may be suspended.
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
  if public.is_suspended(v_learner) then
    raise exception 'your account is suspended';
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

  if not v_offering.is_active then
    raise exception 'this offering is paused';
  end if;
  if v_offering.teacher_id = v_learner then
    raise exception 'cannot book your own offering';
  end if;
  if public.is_suspended(v_offering.teacher_id) then
    raise exception 'this teacher is not available';
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

-- Suspended members cannot start conversations either.
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
  if public.is_suspended(v_me) then
    raise exception 'your account is suspended';
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
