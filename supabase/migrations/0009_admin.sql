-- SkillSwap: admin panel foundations.
--
-- Adds an admin flag on profiles, account suspension, featured offerings,
-- report triage fields, an admin audit log, site announcements and support
-- tickets (from the public contact form).
--
-- Security model:
--   * Moderation columns (profiles.is_admin / suspended_*, offerings.is_featured,
--     reports.admin_notes / resolved_by) are protected with COLUMN privileges:
--     authenticated users can only read/update the columns listed below. RLS
--     cannot restrict individual columns, so this is the real guard. Triggers
--     back it up.
--   * Admin pages in the app run with the service role after a server-side
--     is_admin check. Admin-only data (reports, profiles' moderation columns)
--     is therefore service-role only; RLS "admin" policies exist for tables
--     without column restrictions so an admin session can also read them.
--   * Suspended members are refused by every write policy and by the booking
--     and messaging functions.
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

-- Column privileges. Members may update only their own editable fields (RLS
-- still limits them to their own row) and may read only public columns.
-- birthdate stays unreadable/unwritable: it backs the 18+ gate at signup.
revoke insert, update on public.profiles from anon, authenticated;
grant update (full_name, bio, avatar_url, location, languages, onboarded)
  on public.profiles to authenticated;

revoke select on public.profiles from anon, authenticated;
grant select (id, full_name, bio, avatar_url, location, languages, onboarded, created_at, updated_at)
  on public.profiles to authenticated;

-- Admin writes to profiles go through the service role; no admin RLS needed.
drop policy if exists profiles_admin_update on public.profiles;

-- True when the caller is an admin who is not suspended. SECURITY DEFINER so
-- it can be used inside policies on profiles itself without recursion.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin and p.suspended_at is null
       from public.profiles p where p.id = auth.uid()),
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

-- The caller's own moderation status (these columns are not selectable by
-- members directly). Used by the app shell for the admin link and the
-- suspended-account screen.
create or replace function public.my_account_status()
returns table (is_admin boolean, suspended_at timestamptz, suspended_reason text)
language sql
stable
security definer
set search_path = public
as $$
  select p.is_admin, p.suspended_at, p.suspended_reason
  from public.profiles p
  where p.id = auth.uid();
$$;

-- Backstop for the column grants: a non-admin session can never change the
-- moderation columns, whatever privileges are granted later.
create or replace function public.guard_profile_moderation_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.is_admin := old.is_admin;
    new.suspended_at := old.suspended_at;
    new.suspended_reason := old.suspended_reason;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_moderation on public.profiles;
create trigger profiles_guard_moderation before update on public.profiles
  for each row execute function public.guard_profile_moderation_columns();

-- offerings --------------------------------------------------------------------
alter table public.offerings
  add column if not exists is_featured boolean not null default false;
create index if not exists offerings_featured_idx on public.offerings (is_featured) where is_featured;

-- Teachers manage their own offerings but can never set is_featured (admin,
-- service role only) or move an offering to another teacher.
revoke insert, update on public.offerings from anon, authenticated;
grant insert (teacher_id, skill_id, title, description, level, duration_min, credit_cost, mode, is_active)
  on public.offerings to authenticated;
grant update (skill_id, title, description, level, duration_min, credit_cost, mode, is_active)
  on public.offerings to authenticated;

-- A paused offering is never featured.
create or replace function public.unfeature_paused_offering()
returns trigger
language plpgsql
as $$
begin
  if not new.is_active then
    new.is_featured := false;
  end if;
  return new;
end;
$$;

drop trigger if exists offerings_unfeature_on_pause on public.offerings;
create trigger offerings_unfeature_on_pause before insert or update on public.offerings
  for each row execute function public.unfeature_paused_offering();

-- Suspended members cannot create, edit or remove offerings.
drop policy if exists offerings_insert on public.offerings;
create policy offerings_insert on public.offerings
  for insert with check (auth.uid() = teacher_id and not public.is_suspended(auth.uid()));

drop policy if exists offerings_update on public.offerings;
create policy offerings_update on public.offerings
  for update using (auth.uid() = teacher_id and not public.is_suspended(auth.uid()))
  with check (auth.uid() = teacher_id and not public.is_suspended(auth.uid()));

drop policy if exists offerings_delete on public.offerings;
create policy offerings_delete on public.offerings
  for delete using (auth.uid() = teacher_id and not public.is_suspended(auth.uid()));

drop policy if exists offerings_admin_read on public.offerings;
create policy offerings_admin_read on public.offerings
  for select to authenticated using (public.is_admin());

-- Admin writes use the service role (is_featured is not grantable to sessions).
drop policy if exists offerings_admin_update on public.offerings;

-- availability, reviews, conversations, messages, reports: suspended members
-- cannot write --------------------------------------------------------------
drop policy if exists availability_insert on public.availability;
create policy availability_insert on public.availability
  for insert with check (auth.uid() = teacher_id and not public.is_suspended(auth.uid()));

drop policy if exists availability_update on public.availability;
create policy availability_update on public.availability
  for update using (auth.uid() = teacher_id and not public.is_suspended(auth.uid()))
  with check (auth.uid() = teacher_id and not public.is_suspended(auth.uid()));

drop policy if exists availability_delete on public.availability;
create policy availability_delete on public.availability
  for delete using (auth.uid() = teacher_id and not is_booked and not public.is_suspended(auth.uid()));

drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert with check (
  auth.uid() = reviewer_id
  and not public.is_suspended(auth.uid())
  and exists (
    select 1 from public.bookings b
    where b.id = reviews.booking_id
      and b.status = 'completed'
      and (auth.uid() = b.learner_id or auth.uid() = b.teacher_id)
      and reviews.reviewee_id in (b.learner_id, b.teacher_id)
      and reviews.reviewee_id <> auth.uid()
  )
);

drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations for insert
  with check ((auth.uid() = user_a or auth.uid() = user_b) and not public.is_suspended(auth.uid()));

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (
    auth.uid() = sender_id
    and not public.is_suspended(auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
        and not public.is_blocked(c.user_a, c.user_b)
    )
  );

-- reports: triage fields -------------------------------------------------------
alter table public.reports
  add column if not exists updated_at  timestamptz not null default now(),
  add column if not exists resolved_by uuid references public.profiles (id) on delete set null,
  add column if not exists admin_notes text not null default '';

drop trigger if exists reports_touch on public.reports;
create trigger reports_touch before update on public.reports
  for each row execute function public.touch_updated_at();

-- Reporters see their own report but never the moderation columns.
revoke select on public.reports from anon, authenticated;
grant select (id, reporter_id, reported_user_id, reason, details, context_type, context_id, status, created_at)
  on public.reports to authenticated;

drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports
  for insert with check (auth.uid() = reporter_id and status = 'open' and not public.is_suspended(auth.uid()));

-- Admin access to reports is service-role only (column grants above).
drop policy if exists reports_admin_read on public.reports;
drop policy if exists reports_admin_update on public.reports;

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
  -- Salted hash of the sender's IP, used only for rate limiting.
  ip_hash     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.support_tickets add column if not exists ip_hash text not null default '';
create index if not exists support_tickets_status_idx on public.support_tickets (status, created_at desc);
create index if not exists support_tickets_ip_idx on public.support_tickets (ip_hash, created_at desc);
create index if not exists support_tickets_email_idx on public.support_tickets (lower(email), created_at desc);

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

-- admin read policies on tables without column restrictions -------------------
drop policy if exists bookings_admin_read on public.bookings;
create policy bookings_admin_read on public.bookings
  for select to authenticated using (public.is_admin());

drop policy if exists credit_transactions_admin_read on public.credit_transactions;
create policy credit_transactions_admin_read on public.credit_transactions
  for select to authenticated using (public.is_admin());

drop policy if exists credit_purchases_admin_read on public.credit_purchases;
create policy credit_purchases_admin_read on public.credit_purchases
  for select to authenticated using (public.is_admin());

drop policy if exists skills_admin_update on public.skills;
create policy skills_admin_update on public.skills
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists skills_admin_delete on public.skills;
create policy skills_admin_delete on public.skills
  for delete to authenticated using (public.is_admin());

-- Helper used by the admin functions below: allow an admin session or the
-- server's service role.
create or replace function public.is_admin_or_service()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or auth.role() = 'service_role';
$$;

-- admin credit adjustments -----------------------------------------------------
-- Grants or removes credits as an admin. Writes an 'adjustment' ledger row, a
-- notification for the member and an audit entry, all in one transaction.
-- The per-user advisory lock serialises balance checks with book_slot.
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

  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));

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

-- Cancels one confirmed booking on behalf of the team: refunds the learner's
-- hold, frees the slot, notifies both parties. Shared by admin_cancel_booking
-- and admin_suspend_user.
create or replace function public.admin_cancel_booking_row(
  p_booking public.bookings,
  p_note    text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings set status = 'cancelled' where id = p_booking.id;
  update public.availability set is_booked = false where id = p_booking.slot_id;

  insert into public.credit_transactions (user_id, amount, reason, booking_id)
  values (p_booking.learner_id, p_booking.credit_cost, 'booking_refund', p_booking.id);

  insert into public.notifications (user_id, kind, title, body)
  select u, 'booking', 'Session cancelled by SkillSwap',
         'A booked session was cancelled by the SkillSwap team. Held credits were refunded to the learner.'
         || case when coalesce(p_note, '') = '' then '' else ' Note: ' || p_note end
  from unnest(array[p_booking.learner_id, p_booking.teacher_id]) as u;
end;
$$;

-- admin cancellation -----------------------------------------------------------
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

  perform public.admin_cancel_booking_row(v_booking, p_note);

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, details)
  values (v_admin, 'booking.cancel', 'booking', p_booking_id::text,
          jsonb_build_object('note', coalesce(p_note, '')));
end;
$$;

-- suspension -------------------------------------------------------------------
-- Suspends a member and cancels (with refunds) every future confirmed booking
-- they are part of, in one transaction.
create or replace function public.admin_suspend_user(
  p_user   uuid,
  p_reason text default ''
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin   uuid := auth.uid();
  v_booking public.bookings%rowtype;
  v_count   int := 0;
begin
  if v_admin is null or not public.is_admin() then
    raise exception 'admin only';
  end if;
  if p_user = v_admin then
    raise exception 'you cannot suspend yourself';
  end if;

  update public.profiles
    set suspended_at = coalesce(suspended_at, now()),
        suspended_reason = coalesce(p_reason, '')
    where id = p_user;
  if not found then
    raise exception 'user not found';
  end if;

  for v_booking in
    select * from public.bookings
    where (learner_id = p_user or teacher_id = p_user)
      and status = 'confirmed'
      and starts_at > now()
    order by starts_at
    for update
  loop
    perform public.admin_cancel_booking_row(v_booking, 'The other member''s account was suspended.');
    v_count := v_count + 1;
  end loop;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, details)
  values (v_admin, 'user.suspend', 'user', p_user::text,
          jsonb_build_object('reason', coalesce(p_reason, ''), 'cancelled_bookings', v_count));

  return v_count;
end;
$$;

create or replace function public.admin_unsuspend_user(p_user uuid)
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

  update public.profiles
    set suspended_at = null, suspended_reason = ''
    where id = p_user;
  if not found then
    raise exception 'user not found';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id)
  values (v_admin, 'user.unsuspend', 'user', p_user::text);
end;
$$;

-- admin aggregates -------------------------------------------------------------
-- Site-wide counts for the admin overview, computed in SQL.
create or replace function public.admin_overview_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when public.is_admin_or_service() then jsonb_build_object(
    'users',               (select count(*) from public.profiles),
    'new_users_30d',       (select count(*) from public.profiles where created_at >= now() - interval '30 days'),
    'suspended',           (select count(*) from public.profiles where suspended_at is not null),
    'offerings',           (select count(*) from public.offerings),
    'active_offerings',    (select count(*) from public.offerings where is_active),
    'bookings',            (select count(*) from public.bookings),
    'bookings_by_status',  (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
                              from (select status, count(*) n from public.bookings group by status) s),
    'credits_in_circulation', (select coalesce(sum(amount), 0) from public.credit_transactions),
    'revenue_paise',       (select coalesce(sum(amount_paise), 0) from public.credit_purchases where status = 'paid'),
    'paid_purchases',      (select count(*) from public.credit_purchases where status = 'paid'),
    'open_reports',        (select count(*) from public.reports where status in ('open', 'reviewing')),
    'open_tickets',        (select count(*) from public.support_tickets where status = 'open'),
    'signups_by_week',     (select coalesce(jsonb_agg(jsonb_build_object('week', w, 'count', n) order by w), '[]'::jsonb)
                              from (select date_trunc('week', created_at) w, count(*) n
                                      from public.profiles
                                     where created_at >= date_trunc('week', now()) - interval '7 weeks'
                                     group by 1) s),
    'bookings_by_week',    (select coalesce(jsonb_agg(jsonb_build_object('week', w, 'count', n) order by w), '[]'::jsonb)
                              from (select date_trunc('week', created_at) w, count(*) n
                                      from public.bookings
                                     where created_at >= date_trunc('week', now()) - interval '7 weeks'
                                     group by 1) s),
    'top_skills',          (select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', n) order by n desc), '[]'::jsonb)
                              from (select sk.name, count(*) n
                                      from public.offerings o join public.skills sk on sk.id = o.skill_id
                                     where o.is_active
                                     group by sk.name
                                     order by n desc
                                     limit 8) s)
  ) else null end;
$$;

-- Usage counts per skill for the catalogue page.
create or replace function public.admin_skill_usage()
returns table (skill_id uuid, offering_count bigint, member_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select s.id,
         (select count(*) from public.offerings o where o.skill_id = s.id),
         (select count(*) from public.user_skills u where u.skill_id = s.id)
  from public.skills s
  where public.is_admin_or_service();
$$;

-- booking guards ---------------------------------------------------------------
-- Same as 0007 book_slot, plus: the offering must be active, neither party may
-- be suspended, and the learner's balance check is serialised per user.
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

  perform pg_advisory_xact_lock(hashtextextended(v_learner::text, 0));

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

-- function grants --------------------------------------------------------------
-- Postgres grants EXECUTE to PUBLIC by default. Keep these to signed-in
-- sessions (they self-check is_admin) and the server.
do $$
declare
  f text;
begin
  foreach f in array array[
    'public.is_admin()',
    'public.is_suspended(uuid)',
    'public.is_admin_or_service()',
    'public.my_account_status()',
    'public.admin_adjust_credits(uuid, int, text)',
    'public.admin_cancel_booking(uuid, text)',
    'public.admin_suspend_user(uuid, text)',
    'public.admin_unsuspend_user(uuid)',
    'public.admin_overview_stats()',
    'public.admin_skill_usage()'
  ] loop
    execute format('revoke all on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
end;
$$;

-- Internal helper: only callable from the functions above.
revoke all on function public.admin_cancel_booking_row(public.bookings, text) from public, anon, authenticated;
grant execute on function public.admin_cancel_booking_row(public.bookings, text) to service_role;
