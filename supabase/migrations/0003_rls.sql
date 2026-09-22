-- SkillSwap: Row-Level Security. Every table has RLS enabled.
-- Principle of least privilege: clients can only read/write their own data.
-- The credit ledger is READ-ONLY to clients; only the SECURITY DEFINER
-- functions in 0002_functions.sql may insert into it.

alter table public.profiles            enable row level security;
alter table public.skills              enable row level security;
alter table public.user_skills         enable row level security;
alter table public.offerings           enable row level security;
alter table public.availability        enable row level security;
alter table public.bookings            enable row level security;
alter table public.sessions            enable row level security;
alter table public.reviews             enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.conversations       enable row level security;
alter table public.messages            enable row level security;
alter table public.notifications       enable row level security;

-- profiles: anyone signed in can read profiles (public discovery);
-- you can only insert/update your own.
create policy profiles_read   on public.profiles for select using (true);
create policy profiles_insert on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- skills: catalog is readable by all; any authenticated user may add a skill
-- (custom skills). No update/delete from clients.
create policy skills_read   on public.skills for select using (true);
create policy skills_insert on public.skills for insert to authenticated with check (true);

-- user_skills: readable by all (part of a public profile); writable only by owner.
create policy user_skills_read   on public.user_skills for select using (true);
create policy user_skills_insert on public.user_skills for insert with check (auth.uid() = user_id);
create policy user_skills_update on public.user_skills for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy user_skills_delete on public.user_skills for delete using (auth.uid() = user_id);

-- offerings: active ones are publicly readable; teacher manages their own.
create policy offerings_read   on public.offerings for select using (is_active or auth.uid() = teacher_id);
create policy offerings_insert on public.offerings for insert with check (auth.uid() = teacher_id);
create policy offerings_update on public.offerings for update using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
create policy offerings_delete on public.offerings for delete using (auth.uid() = teacher_id);

-- availability: readable by all; teacher manages their own slots.
-- (is_booked flips are also done by book_slot/cancel_booking as definer.)
create policy availability_read   on public.availability for select using (true);
create policy availability_insert on public.availability for insert with check (auth.uid() = teacher_id);
create policy availability_update on public.availability for update using (auth.uid() = teacher_id) with check (auth.uid() = teacher_id);
create policy availability_delete on public.availability for delete using (auth.uid() = teacher_id and not is_booked);

-- bookings: visible to the two participants only. Inserts happen via book_slot
-- (definer), so no client insert policy. Status changes go through functions.
create policy bookings_read on public.bookings for select
  using (auth.uid() = learner_id or auth.uid() = teacher_id);

-- sessions: visible to participants of the parent booking.
create policy sessions_read on public.sessions for select
  using (exists (
    select 1 from public.bookings b
    where b.id = sessions.booking_id
      and (auth.uid() = b.learner_id or auth.uid() = b.teacher_id)
  ));

-- reviews: publicly readable (they build reputation); a reviewer may write a
-- review for a booking they took part in and only about the other participant.
create policy reviews_read   on public.reviews for select using (true);
create policy reviews_insert on public.reviews for insert with check (
  auth.uid() = reviewer_id
  and exists (
    select 1 from public.bookings b
    where b.id = reviews.booking_id
      and b.status = 'completed'
      and (auth.uid() = b.learner_id or auth.uid() = b.teacher_id)
      and reviews.reviewee_id in (b.learner_id, b.teacher_id)
      and reviews.reviewee_id <> auth.uid()
  )
);

-- credit_transactions: you may READ your own rows. No client writes at all;
-- inserts happen exclusively via the SECURITY DEFINER credit functions.
create policy credit_tx_read on public.credit_transactions for select
  using (auth.uid() = user_id);

-- conversations: visible to the two members; either member can create one.
create policy conversations_read on public.conversations for select
  using (auth.uid() = user_a or auth.uid() = user_b);
create policy conversations_insert on public.conversations for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);

-- messages: visible to conversation members; sender must be a member.
create policy messages_read on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (auth.uid() = c.user_a or auth.uid() = c.user_b)
  ));
create policy messages_insert on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.user_a or auth.uid() = c.user_b)
    )
  );

-- notifications: you can read and mark-read your own; inserts done server-side.
create policy notifications_read   on public.notifications for select using (auth.uid() = user_id);
create policy notifications_update on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
