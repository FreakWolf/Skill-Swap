# SkillSwap database

The schema for SkillSwap's Supabase (Postgres) backend.

## Files

Apply the migrations in order. 0001 to 0003 are not idempotent; 0004 onward
can be re-run safely.

- `migrations/0001_init.sql` — tables, enums, indexes.
- `migrations/0002_functions.sql` — triggers (new-user profile + starter credits),
  the `credit_balances` view, and the atomic credit functions
  (`book_slot`, `complete_booking`, `cancel_booking`).
- `migrations/0003_rls.sql` — Row-Level Security policies for every table.
- `migrations/0004_messaging.sql` — conversations, messages, read markers,
  message notifications, realtime.
- `migrations/0005_completion_rules.sql` — who may complete or cancel a
  session, and when.
- `migrations/0006_avatars.sql` — the `avatars` storage bucket and policies.
- `migrations/0007_safety.sql` — blocks, reports, and block checks in
  messaging and booking.
- `migrations/0008_credit_purchases.sql` — Razorpay purchases and the
  idempotent `fulfill_credit_purchase` function.
- `migrations/0009_admin.sql` — admin flag and suspension on profiles,
  featured offerings, report triage columns, `admin_audit_log`,
  `announcements`, `support_tickets`, plus `is_admin()`, `is_suspended()`,
  `my_account_status()`, `admin_adjust_credits`, `admin_cancel_booking`,
  `admin_suspend_user` (cancels and refunds future bookings),
  `admin_unsuspend_user`, `admin_overview_stats`, `admin_skill_usage`.
  Column privileges protect the moderation columns (see below). `book_slot`
  refuses paused offerings and suspended members and serialises balance
  checks per user; every write policy refuses suspended members.
- `migrations/0010_favorites.sql` — saved offerings (`favorites`).
- `seed.sql` — a starter skill catalog.

## How the credit economy works

Credits are money-like, so they are never stored as a mutable balance column.
Instead `credit_transactions` is an **append-only ledger** and a user's balance
is the SUM of their rows (exposed via the `credit_balances` view). All credit
movement runs inside `SECURITY DEFINER` functions in a single transaction:

- `book_slot(slot_id, notes)` — locks the slot, checks the learner has enough
  credits, creates the booking + session, and writes a negative `booking_hold`
  entry. Concurrency-safe via `SELECT ... FOR UPDATE`.
- `complete_booking(booking_id)` — marks complete and credits the teacher
  (`session_earning`).
- `cancel_booking(booking_id)` — frees the slot and refunds the learner
  (`booking_refund`).
- `fulfill_credit_purchase(order_id, payment_id, amount)` — adds bought
  credits (`purchase`) exactly once. Service role only.
- `admin_adjust_credits(user, amount, note)` — admin grant or removal
  (`adjustment`), with a notification and an audit row.
- `admin_cancel_booking(booking_id, note)` — admin cancellation with refund.

New users get a starter grant (see `starter_credit_grant()`, currently 3).

## Admin model and column privileges

`profiles.is_admin` marks admins (a suspended admin loses admin powers).
`public.is_admin()` reads it for the current session and is used in the admin
RLS policies. The web app's `/admin` pages check the flag server-side and then
use the service role, writing every change to `admin_audit_log`.

RLS cannot restrict individual columns, so 0009 uses column privileges:

- `profiles`: members may update only `full_name, bio, avatar_url, location,
  languages, onboarded` and may read only the public columns. `is_admin`,
  `suspended_at`, `suspended_reason` and `birthdate` are service-role only;
  a member reads their own status through `my_account_status()`. A trigger
  restores the moderation columns on any non-admin update as a backstop.
- `offerings`: members may insert/update only the content columns;
  `is_featured` is service-role only and a trigger clears it when an offering
  is paused.
- `reports`: reporters can read their own report but not `admin_notes` or
  `resolved_by`.

The app's own queries therefore use explicit column lists (`select *` on
`profiles` fails for a member session).

Suspended members have `profiles.suspended_at` set. Every write policy
(offerings, availability, reviews, conversations, messages, reports,
favorites) refuses them, as do `book_slot` and `get_or_create_conversation`,
and `admin_suspend_user` cancels and refunds their future bookings.

Promote an account:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

## Applying it

Easiest for now: open the Supabase Dashboard → SQL Editor, and run each file in
order: `0001` through `0010`, then `seed.sql`.

Or, with the Supabase CLI linked to your project:

```bash
supabase db push        # applies migrations/
psql "$DATABASE_URL" -f supabase/seed.sql
```
