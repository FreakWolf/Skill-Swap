-- SkillSwap: buy credits (Razorpay).
--
-- Flow: the server creates a Razorpay order and a 'created' row here. After
-- Razorpay confirms the payment (checkout callback verified on the server,
-- and/or the signed webhook), the server calls fulfill_credit_purchase(),
-- which marks the row 'paid' and adds the credits to the ledger — exactly
-- once, even if both confirmations arrive.
--
-- Only the server (service role) can write purchases or fulfil them. Users
-- can only read their own purchase history.

alter type public.ledger_reason add value if not exists 'purchase';

create table if not exists public.credit_purchases (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  pack_id             text not null,
  credits             int  not null check (credits > 0 and credits <= 1000),
  amount_paise        int  not null check (amount_paise > 0),
  currency            text not null default 'INR',
  provider            text not null default 'razorpay',
  provider_order_id   text not null unique,
  provider_payment_id text unique,
  status              text not null default 'created'
                        check (status in ('created', 'paid', 'failed')),
  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);
create index if not exists credit_purchases_user_idx
  on public.credit_purchases (user_id, created_at desc);

alter table public.credit_purchases enable row level security;

drop policy if exists credit_purchases_read_own on public.credit_purchases;
create policy credit_purchases_read_own on public.credit_purchases
  for select using (auth.uid() = user_id);
-- No insert/update/delete policies: clients can't write this table.

-- Marks a purchase paid and grants its credits. Idempotent: returns true if
-- credits were granted by this call, false if the purchase was already paid.
-- p_amount_paise is the amount Razorpay says was captured; it must match.
create or replace function public.fulfill_credit_purchase(
  p_order_id     text,
  p_payment_id   text,
  p_amount_paise int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.credit_purchases%rowtype;
begin
  select * into v from public.credit_purchases
    where provider_order_id = p_order_id
    for update;

  if not found then
    raise exception 'unknown order';
  end if;
  if v.status = 'paid' then
    return false;
  end if;
  if p_amount_paise is distinct from v.amount_paise then
    raise exception 'amount mismatch';
  end if;

  update public.credit_purchases
    set status = 'paid', provider_payment_id = p_payment_id, paid_at = now()
    where id = v.id;

  insert into public.credit_transactions (user_id, amount, reason)
  values (v.user_id, v.credits, 'purchase');

  insert into public.notifications (user_id, kind, title, body)
  values (v.user_id, 'credit', 'Credits added',
          v.credits || ' credit' || case when v.credits = 1 then '' else 's' end
          || ' added to your balance. Thanks for your purchase!');

  return true;
end;
$$;

-- Server only. (Postgres grants EXECUTE to PUBLIC by default; Supabase also
-- grants it to anon/authenticated.)
revoke all on function public.fulfill_credit_purchase(text, text, int)
  from public, anon, authenticated;
grant execute on function public.fulfill_credit_purchase(text, text, int)
  to service_role;
