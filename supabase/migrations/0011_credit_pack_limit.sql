-- SkillSwap: allow bigger credit packs.
--
-- 0008 limited a single purchase to 1000 credits. The new packs are
-- 100 (₹99), 525 (₹499) and 1100 (₹999) credits, so the 1100 pack needs a
-- higher limit. This only changes the check on credit_purchases.credits;
-- prices still come from src/lib/credit-packs.ts on the server.
--
-- Safe to run more than once.

do $$
declare
  c record;
begin
  -- Drop the existing check on the credits column, whatever it is named.
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.credit_purchases'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%credits%'
  loop
    execute format('alter table public.credit_purchases drop constraint %I', c.conname);
  end loop;
end
$$;

alter table public.credit_purchases
  add constraint credit_purchases_credits_check check (credits > 0 and credits <= 10000);
