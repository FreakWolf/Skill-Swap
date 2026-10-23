-- SkillSwap: tighten session completion + cancellation rules.
--
-- Previously either participant could complete a booking at any time, which
-- let a teacher collect credits for a session that never happened, and either
-- party could cancel (refund) at any time, even after the session.
--
-- New rules (enforced here, mirrored in the UI):
--   * The LEARNER confirms completion, once the session has started.
--   * The TEACHER may complete only if the learner hasn't, at least
--     48 hours after the session's scheduled end (no-response fallback).
--   * Either party may cancel, but only BEFORE the session starts.
--
-- Function signatures are unchanged, so no app code depends on new params.

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

  if v_uid = v_booking.learner_id then
    if now() < v_booking.starts_at then
      raise exception 'you can confirm once the session has started';
    end if;
  else
    -- Teacher fallback when the learner never confirms.
    if now() < v_booking.ends_at + interval '48 hours' then
      raise exception 'the learner confirms completion; you can claim 48 hours after the session ends if they don''t';
    end if;
  end if;

  update public.bookings set status = 'completed' where id = p_booking_id;
  update public.sessions set ended_at = now() where booking_id = p_booking_id;

  insert into public.credit_transactions (user_id, amount, reason, booking_id)
  values (v_booking.teacher_id, v_booking.credit_cost, 'session_earning', p_booking_id);

  insert into public.notifications (user_id, kind, title, body)
  values (
    case when v_uid = v_booking.learner_id then v_booking.teacher_id else v_booking.learner_id end,
    'credit',
    'Session completed',
    v_booking.credit_cost || ' credit(s) released to the teacher.'
  );
end;
$$;

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
  if now() >= v_booking.starts_at then
    raise exception 'sessions can only be cancelled before they start';
  end if;

  update public.bookings set status = 'cancelled' where id = p_booking_id;
  update public.availability set is_booked = false where id = v_booking.slot_id;

  insert into public.credit_transactions (user_id, amount, reason, booking_id)
  values (v_booking.learner_id, v_booking.credit_cost, 'booking_refund', p_booking_id);

  insert into public.notifications (user_id, kind, title, body)
  values (
    case when v_uid = v_booking.learner_id then v_booking.teacher_id else v_booking.learner_id end,
    'booking',
    'Session cancelled',
    'A booked session was cancelled. Held credits were refunded to the learner.'
  );
end;
$$;
