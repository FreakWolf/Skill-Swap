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
  `announcements`, `support_tickets`, `is_admin()`, `is_suspended()`,
  `admin_adjust_credits`, `admin_cancel_booking`, and admin RLS policies.
  `book_slot` now refuses paused offerings and suspended members.
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

## Admin model

`profiles.is_admin` marks admins. `public.is_admin()` reads it for the current
session and is used in the admin RLS policies. The web app's `/admin` pages
check the flag server-side and then use the service role, writing every
change to `admin_audit_log`. Suspended members have `profiles.suspended_at`
set; `book_slot` and `get_or_create_conversation` refuse them.

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
