# SkillSwap (web)

A peer-to-peer skill-exchange platform with a credit economy. Teach a skill to
earn credits; spend credits to learn from someone else. **1 credit = 1 hour.**

Built with **Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase**.

## The exchange loop (what the MVP does)

1. **Sign up** → you get 3 starter credits automatically.
2. **Onboard** → set your profile, then pick skills you can **teach** and skills
   you want to **learn** (with levels).
3. **Offer a skill** → publish a teachable session with time slots and a credit
   cost.
4. **Explore & book** → find a teacher, pick a slot, confirm. Your credits are
   **held** the moment you book.
5. **Complete the session** → the held credits transfer to the teacher as
   earnings. Cancel instead, and the learner is refunded.
6. **Rate** → leave a review that builds the other person's reputation.

Credits are money-like, so they live in an **append-only ledger**
(`credit_transactions`); a balance is the sum of that ledger. All credit
movement happens inside atomic Postgres functions (`book_slot`,
`complete_booking`, `cancel_booking`) so there's no way to double-spend.

## Getting it running

### 1. Create a Supabase project

At [supabase.com](https://supabase.com) create a project (free tier is fine).

### 2. Apply the database schema

In the Supabase Dashboard → **SQL Editor**, run these files in order (contents
are in `supabase/`):

1. `migrations/0001_init.sql`
2. `migrations/0002_functions.sql`
3. `migrations/0003_rls.sql`
4. `seed.sql`

See `supabase/README.md` for details on the schema and the credit model.

### 3. Add your credentials

Copy the three values from Supabase **Settings → API** into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

(There's a template in `.env.example`.)

> **Email confirmation:** by default Supabase requires email confirmation before
> login. For local testing, turn it off under **Authentication → Providers →
> Email → "Confirm email" = off**, or confirm via the link Supabase emails.

### 4. Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## End-to-end test (two accounts)

1. Sign up as **Teacher** → onboard → **Offer a skill** with a slot in the
   future → note it appears in **Explore**.
2. Sign up as **Learner** (different email) → onboard, listing that skill under
   "want to learn" → it shows under **Recommended** on the dashboard.
3. As the Learner, open the offering → **book a slot**. Balance drops by the
   cost.
4. Either party opens the session → **Mark complete**. The Teacher's balance
   rises by the cost; the Learner can leave a **rating**.
5. Check that a cancelled booking **refunds** the learner and frees the slot.

## Project layout

```
src/
  app/
    (auth)/        login, signup, auth server actions
    (app)/         authenticated shell: dashboard, marketplace, offer,
                   offerings/[id], sessions, u/[id], profile, settings
    onboarding/    profile + skills steps
  components/      UI kit + shared components
  lib/
    supabase/      browser / server / admin clients + session proxy
    data.ts        typed data-access helpers
    types.ts       shared domain types (reused by a future mobile app)
supabase/          SQL migrations + seed
```

## What's next (post-MVP)

Messaging, notifications, real video (Daily/Twilio/100ms), premium tiers +
credit top-ups (Stripe), analytics, and then a React Native (Expo) mobile app
that reuses `lib/types.ts` and the same Supabase backend.

## Deploying to the web (Vercel)

1. **Push to GitHub.** Create an empty repo, then from `skillswap-web/`:
   ```bash
   git add .
   git commit -m "SkillSwap web MVP"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

2. **Import into Vercel.** At [vercel.com](https://vercel.com) → New Project →
   import the repo. Framework is auto-detected as Next.js.

3. **Add environment variables** (Project Settings → Environment Variables) —
   the same three from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Deploy.** Vercel builds and gives you a URL like
   `https://your-app.vercel.app`.

5. **Point Supabase at the live URL.** In the Supabase Dashboard →
   **Authentication → URL Configuration**, set the **Site URL** to your Vercel
   URL and add it to **Redirect URLs**. Otherwise auth emails/redirects point at
   localhost.

> If you use Vercel's Deployment Protection, note it can block public access
> with an SSO redirect — turn it off under Project Settings → Deployment
> Protection if the site appears inaccessible to logged-out visitors.
