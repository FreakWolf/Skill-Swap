-- SkillSwap Phase 2: messaging realtime + notifications wiring.
-- The conversations / messages / notifications tables and their RLS policies
-- already exist (see 0001_init.sql + 0003_rls.sql). This migration adds:
--   * Realtime broadcast on new messages
--   * an updated_at on conversations so inboxes can sort by recency
--   * a notification created automatically when a message is sent
--   * a per-user last_read tracker so we can compute unread counts
--   * get_or_create_conversation() so either party can start a thread safely

-- Track conversation recency + per-user read state -------------------------
alter table public.conversations
  add column if not exists updated_at timestamptz not null default now();

-- last_read_at per (conversation, user): everything newer is "unread".
create table if not exists public.conversation_reads (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  last_read_at    timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table public.conversation_reads enable row level security;

drop policy if exists conversation_reads_rw on public.conversation_reads;
create policy conversation_reads_rw on public.conversation_reads
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- On a new message: bump conversation.updated_at + notify the OTHER member --
create or replace function public.on_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conv     public.conversations%rowtype;
  v_other    uuid;
  v_sender   text;
begin
  update public.conversations
    set updated_at = now()
    where id = new.conversation_id
    returning * into v_conv;

  v_other := case when v_conv.user_a = new.sender_id
                  then v_conv.user_b else v_conv.user_a end;

  select full_name into v_sender from public.profiles where id = new.sender_id;

  insert into public.notifications (user_id, kind, title, body)
  values (
    v_other,
    'message',
    coalesce(nullif(v_sender, ''), 'New message'),
    left(new.body, 120)
  );

  return new;
end;
$$;

drop trigger if exists messages_after_insert on public.messages;
create trigger messages_after_insert
  after insert on public.messages
  for each row execute function public.on_new_message();

-- Start (or fetch) a conversation between the current user and another ------
-- Normalizes the (user_a, user_b) pair so there's only ever one thread.
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
  if p_other is null or p_other = v_me then
    raise exception 'invalid conversation partner';
  end if;

  -- Deterministic ordering so (x,y) and (y,x) collapse to one row.
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

-- Enable Supabase Realtime on messages so chats update live -----------------
-- (Safe if already a member; wrapped to avoid erroring on re-run.)
do $$
begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null;
  when others then null;
  end;
end $$;
