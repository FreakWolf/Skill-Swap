# SkillSwap database

The schema for SkillSwap's Supabase (Postgres) backend.

## Files

- `migrations/0001_init.sql` — tables, enums, indexes.
- `migrations/0002_functions.sql` — triggers (new-user profile + starter credits),
  the `credit_balances` view, and the atomic credit functions
  (`book_slot`, `complete_booking`, `cancel_booking`).
- `migrations/0003_rls.sql` — Row-Level Security policies for every table.
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

New users get a starter grant (see `starter_credit_grant()`, currently 3).

## Applying it

Easiest for now: open the Supabase Dashboard → SQL Editor, and run each file in
order: `0001`, `0002`, `0003`, then `seed.sql`.

Or, with the Supabase CLI linked to your project:

```bash
supabase db push        # applies migrations/
psql "$DATABASE_URL" -f supabase/seed.sql
```
