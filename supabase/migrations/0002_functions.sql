-- SkillSwap: functions, triggers, and the balance view.
-- All credit movement is centralized here so it is atomic and auditable.

-- Starter credits granted to every new user so the economy can bootstrap.
-- 1 credit == 1 hour of a session.
create or replace function public.starter_credit_grant()
returns int language sql immutable as $$ select 3 $$;

-- updated_at maintenance -----------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch  before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger offerings_touch before update on public.offerings
  for each row execute function public.touch_updated_at();
create trigger bookings_touch  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- New auth user -> profile row + starter credit grant ------------------------
-- Runs as SECURITY DEFINER so it can write to profiles + the locked-down ledger.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, birthdate)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    (new.raw_user_meta_data ->> 'birthdate')::date
  )
  on conflict (id) do nothing;

  insert into public.credit_transactions (user_id, amount, reason)
  values (new.id, public.starter_credit_grant(), 'signup_grant');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Balance view ---------------------------------------------------------------
-- Balance = sum of a user's ledger rows. Single source of truth.
create view public.credit_balances
with (security_invoker = true)
as
  select p.id as user_id,
         coalesce(sum(t.amount), 0)::int as balance
  from public.profiles p
  left join public.credit_transactions t on t.user_id = p.id
  group by p.id;

-- Helper: current balance for a user (used inside the booking function).
create or replace function public.current_balance(p_user uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount), 0)::int
  from public.credit_transactions
  where user_id = p_user;
$$;

-- book_slot: atomically reserve a slot and move credits from learner to a hold.
-- Returns the new booking id. Raises on insufficient credits or taken slot.
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

  -- Lock the slot row so two learners cannot grab it concurrently.
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

  -- Hold the learner's credits (negative entry).
  insert into public.credit_transactions (user_id, amount, reason, booking_id)
  values (v_learner, -v_offering.credit_cost, 'booking_hold', v_booking);

  -- Notify the teacher.
  insert into public.notifications (user_id, kind, title, body)
  values (v_offering.teacher_id, 'booking',
          'New booking',
          'Someone booked "' || v_offering.title || '".');

  return v_booking;
end;
$$;

-- complete_session: teacher (or learner) marks a booking complete; credits are
-- released from the hold to the teacher as earnings. Idempotent-ish: only a
-- confirmed booking can be completed.
create or replace function public.complete_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_booking public.bookings%rowtype;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select * into v_booking from public.bookings
    where id = p_booking_id for update;

  if not found then
    raise exception 'booking not found';
  end if;
  if v_uid <> v_booking.teacher_id and v_uid <> v_booking.learner_id then
    raise exception 'not a participant';
  end if;
  if v_booking.status <> 'confirmed' then
    raise exception 'booking is not confirmed';
  end if;

  update public.bookings set status = 'completed' where id = p_booking_id;
  update public.sessions set ended_at = now() where booking_id = p_booking_id;

  -- Teacher earns the held credits.
  insert into public.credit_transactions (user_id, amount, reason, booking_id)
  values (v_booking.teacher_id, v_booking.credit_cost, 'session_earning', p_booking_id);
end;
$$;

-- cancel_booking: refund the learner's held credits and free the slot.
create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_booking public.bookings%rowtype;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select * into v_booking from public.bookings
    where id = p_booking_id for update;

  if not found then
    raise exception 'booking not found';
  end if;
  if v_uid <> v_booking.teacher_id and v_uid <> v_booking.learner_id then
    raise exception 'not a participant';
  end if;
  if v_booking.status <> 'confirmed' then
    raise exception 'only confirmed bookings can be cancelled';
  end if;

  update public.bookings set status = 'cancelled' where id = p_booking_id;
  update public.availability set is_booked = false where id = v_booking.slot_id;

  -- Refund the learner.
  insert into public.credit_transactions (user_id, amount, reason, booking_id)
  values (v_booking.learner_id, v_booking.credit_cost, 'booking_refund', p_booking_id);
end;
$$;
