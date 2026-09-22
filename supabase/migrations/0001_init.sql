-- SkillSwap initial schema
-- Peer-to-peer skill exchange with a credit economy.
--
-- Design principles:
--  * Credits are money-like, so the source of truth is an APPEND-ONLY ledger
--    (credit_transactions). A user's balance is the SUM of their ledger rows.
--    There is no mutable "balance" column a client could tamper with.
--  * Credit movement (spend on booking, refund, earn on completion) happens
--    inside SECURITY DEFINER functions in a single transaction so it is atomic
--    and cannot double-spend.
--  * Row-Level Security is ON for every table. Policies live in 0002_rls.sql.

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "citext";         -- case-insensitive text

-- Enums ----------------------------------------------------------------------
create type skill_direction as enum ('teach', 'learn');
create type skill_level      as enum ('beginner', 'intermediate', 'expert');
create type booking_status   as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type session_mode     as enum ('virtual', 'in_person');
create type ledger_reason    as enum ('signup_grant', 'booking_hold', 'booking_refund', 'session_earning', 'adjustment');

-- profiles -------------------------------------------------------------------
-- One row per auth user. id == auth.users.id.
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text        not null default '',
  bio           text        not null default '',
  avatar_url    text,
  location      text        not null default '',
  languages     text[]      not null default '{}',
  birthdate     date,
  onboarded     boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- skills ---------------------------------------------------------------------
-- Canonical, shared catalog of skills. Custom skills entered by users are
-- inserted here too (is_custom = true) so they become searchable for everyone.
create table public.skills (
  id         uuid primary key default gen_random_uuid(),
  name       citext not null unique,
  category   text   not null default 'Other',
  is_custom  boolean not null default false,
  created_at timestamptz not null default now()
);

-- user_skills ----------------------------------------------------------------
-- Links a user to a skill in a given direction (teach/learn) with a level.
create table public.user_skills (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  skill_id   uuid not null references public.skills (id) on delete cascade,
  direction  skill_direction not null,
  level      skill_level not null default 'beginner',
  created_at timestamptz not null default now(),
  unique (user_id, skill_id, direction)
);
create index user_skills_user_idx  on public.user_skills (user_id);
create index user_skills_skill_idx on public.user_skills (skill_id);

-- offerings ------------------------------------------------------------------
-- A concrete teachable listing a user publishes for a skill they teach.
create table public.offerings (
  id             uuid primary key default gen_random_uuid(),
  teacher_id     uuid not null references public.profiles (id) on delete cascade,
  skill_id       uuid not null references public.skills (id) on delete restrict,
  title          text not null,
  description    text not null default '',
  level          skill_level not null default 'beginner',
  duration_min   int  not null default 60 check (duration_min between 15 and 480),
  credit_cost    int  not null default 1  check (credit_cost between 0 and 100),
  mode           session_mode not null default 'virtual',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index offerings_teacher_idx on public.offerings (teacher_id);
create index offerings_skill_idx   on public.offerings (skill_id);
create index offerings_active_idx  on public.offerings (is_active);

-- availability ---------------------------------------------------------------
-- Discrete bookable time slots a teacher opens for an offering.
create table public.availability (
  id          uuid primary key default gen_random_uuid(),
  offering_id uuid not null references public.offerings (id) on delete cascade,
  teacher_id  uuid not null references public.profiles (id) on delete cascade,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  is_booked   boolean not null default false,
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index availability_offering_idx on public.availability (offering_id);
create index availability_open_idx     on public.availability (offering_id, is_booked, starts_at);

-- bookings -------------------------------------------------------------------
create table public.bookings (
  id            uuid primary key default gen_random_uuid(),
  offering_id   uuid not null references public.offerings (id) on delete restrict,
  slot_id       uuid not null references public.availability (id) on delete restrict,
  learner_id    uuid not null references public.profiles (id) on delete cascade,
  teacher_id    uuid not null references public.profiles (id) on delete cascade,
  status        booking_status not null default 'confirmed',
  credit_cost   int  not null check (credit_cost >= 0),
  notes         text not null default '',
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index bookings_learner_idx on public.bookings (learner_id);
create index bookings_teacher_idx on public.bookings (teacher_id);
create unique index bookings_slot_unique on public.bookings (slot_id)
  where status <> 'cancelled';

-- sessions -------------------------------------------------------------------
-- The actual meeting tied to a booking.
create table public.sessions (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null unique references public.bookings (id) on delete cascade,
  join_url     text,
  started_at   timestamptz,
  ended_at     timestamptz,
  created_at   timestamptz not null default now()
);

-- reviews --------------------------------------------------------------------
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  rating      int  not null check (rating between 1 and 5),
  comment     text not null default '',
  created_at  timestamptz not null default now(),
  unique (booking_id, reviewer_id)
);
create index reviews_reviewee_idx on public.reviews (reviewee_id);

-- credit_transactions --------------------------------------------------------
-- APPEND-ONLY ledger. Positive amount = credits in, negative = credits out.
-- Balance for a user = sum(amount) over their rows. Never updated or deleted
-- by application code; RLS forbids write access entirely (only the
-- SECURITY DEFINER functions below may insert).
create table public.credit_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  amount      int  not null,
  reason      ledger_reason not null,
  booking_id  uuid references public.bookings (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index credit_tx_user_idx on public.credit_transactions (user_id);

-- conversations / messages ---------------------------------------------------
create table public.conversations (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.profiles (id) on delete cascade,
  user_b     uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null,
  created_at      timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- notifications --------------------------------------------------------------
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       text not null,
  title      text not null,
  body       text not null default '',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, read, created_at);
