# SkillSwap features

A map of everything the app does today, by area, with the routes, tables and
settings involved. The roadmap at the bottom lists what comes next.

Stack: Next.js 16 (App Router, server components and server actions),
React 19, TypeScript, Tailwind v4, Supabase (Postgres, Auth, Storage,
Realtime), Razorpay for payments, Sentry for errors (off until a DSN is set).

## Public marketing site

Full-width pages with a shared sticky header and footer
(`src/app/(marketing)/`, `src/components/marketing/`). Animations are CSS
only (`globals.css`) and respect `prefers-reduced-motion`.

| Route | What it is |
|---|---|
| `/` | Landing: animated hero, stats strip, how it works, skills marquee, feature grid, example swaps, call to action |
| `/about` | Mission, the credit model with an example ledger, safety |
| `/pricing` | Free membership plus the credit packs from `src/lib/credit-packs.ts` |
| `/faq` | Grouped accordions; content lives in `src/lib/marketing/faq.ts` |
| `/contact` | Contact form; messages become `support_tickets` reviewed in `/admin/support`. Honeypot, per-IP burst limit, per-email daily cap, and Cloudflare Turnstile for signed-out visitors when configured |
| `/terms`, `/privacy` | Legal pages, same header and footer |

Signed-in visitors see a "Go to dashboard" button instead of login/signup.
New public routes must be added to `PUBLIC_PATHS` in
`src/lib/supabase/middleware.ts`, `src/app/sitemap.ts` and `src/app/robots.ts`.

## Accounts and onboarding

- Email and password signup with age check (18+) and terms consent, email
  confirmation, password reset (`src/app/(auth)/`).
- A database trigger creates the profile and grants 3 starter credits.
- Two-step onboarding: profile (name, bio, location, languages, avatar) then
  skills to teach and learn with levels.
- Settings: edit profile, avatar upload to the `avatars` bucket, manage
  skills and availability, blocked members list, sign out.
- Suspended accounts (set by an admin) see a full-screen notice with the
  reason and a sign-out button instead of the app. Suspension is enforced in
  the database (write policies, booking and messaging functions) and in every
  mutating server action (`requireActiveUser`), and it cancels and refunds the
  member's upcoming bookings.

## Appearance (dark mode)

Light, Dark or System (default), chosen from the marketing header, the member
sidebar or Settings → Appearance. The choice is kept in `localStorage`
(`skillswap.theme`); an inline script in the root layout applies the `dark`
class before first paint so there is no flash, and `color-scheme` plus the
`theme-color` meta follow the active theme.

Colours are driven by CSS variables in `src/app/globals.css`: semantic tokens
(`--background`, `--foreground`, `--card`, `--border`, `--muted`,
`--input-bg`, `--primary`, `--brand-fg`, `--ring`) and, under `.dark`, a remap
of the Tailwind palette variables the components already use (gray/slate
scales invert, light tints become dark tints, text shades lighten). Components
do not use `dark:` classes. Purple text uses `text-brand-fg` (brand-700 in
light, brand-300 in dark) so it passes WCAG AA on both canvases; brand
buttons keep `bg-brand-600` with white text. The audit script used before
each release runs axe-core (WCAG 2.1 A/AA) in both themes at 360, 390 and
1440 px on the public pages.

## Member app shell

`src/app/(app)/layout.tsx` renders the sidebar (`src/components/Sidebar.tsx`)
and a full-width content area. Live announcements appear above every page and
can be dismissed per browser. Admins get an extra Admin link.

## Marketplace and offerings

- `/marketplace`: skills view (offering cards) or people view (teacher cards).
  Text search, category chips, and a filter bar for level, format, maximum
  credits and sort (newest, credits low/high, shortest/longest). Filters live
  in the URL. Featured offerings sort first and carry a badge.
- `/offer`: publish an offering (skill, title, description, level, duration,
  credit cost, format, initial time slots). Unknown skills are created as
  member-added skills.
- `/offerings/[id]`: details, teacher card with rating, reviews, booking
  panel with open slots. Owners see Edit and Manage slots instead.
- `/offerings/[id]/edit`: edit every field, pause/resume, delete. Pausing
  hides the offering and keeps its open slots on hold; the database refuses
  bookings on paused offerings and clears any featured flag. Delete is
  permanent only when the offering was never booked, otherwise it is paused
  so history is kept.
- `/availability`: add and remove time slots per offering; paused offerings
  are listed with a Resume link.
- `/saved`: bookmarked offerings. The bookmark toggle is on every card and on
  the offering page (`favorites` table).

## Credits

- Append-only ledger (`credit_transactions`), balance = sum. All movement
  happens inside database functions.
- `/credits`: buy packs through Razorpay (checkout callback verified on the
  server, webhook as backup, idempotent fulfilment), purchase history, and a
  full credit history with running balance, filterable by reason.
- Sidebar shows the live balance.

## Booking and sessions

- Booking holds the credits immediately; a slot can be booked once.
- Learner marks the session complete once it has started; the teacher can
  claim after 48 hours. Completion pays the teacher. Either side can cancel
  before start for a full refund.
- `/sessions` upcoming and history, `/sessions/[id]` detail with actions,
  review form after completion, message and report buttons.
- `/calendar` month grid of bookings and open slots in the member's time zone.

## Messaging and notifications

- One conversation per pair, realtime thread, unread counts in the sidebar.
- Notifications for bookings, cancellations, completions, credits and
  messages, created by database functions and triggers.

## Safety

- Block a member from their profile or a chat: hides both from each other
  and prevents booking and messaging.
- Report from profile, conversation or session with a reason and details.
  Reports go to the admin queue.

## Analytics

`/analytics`: balance, credits earned and spent, sessions taught and learned,
average rating, six-month earned/spent chart, top taught skills.

## Admin panel (`/admin`)

Requires `profiles.is_admin` (a suspended admin loses access). Every data
helper under `src/lib/admin` obtains its service-role client through
`adminDb()`, which re-checks the session first; every mutation is written to
`admin_audit_log` and admin actions report database errors instead of
succeeding silently. Moderation columns are protected by column privileges
in the database (see `supabase/README.md`).

| Page | What you can do |
|---|---|
| Overview | Members, offerings, bookings, credits in circulation, revenue, open reports and tickets, suspended count; weekly signup and booking charts; most offered skills |
| Users | Search, filter admins/suspended; detail view with email, balance, ledger, bookings, offerings, reports; suspend/unsuspend with a reason, grant/revoke admin, adjust credits (`admin_adjust_credits`) |
| Offerings | Search and filter; feature/unfeature, pause/activate |
| Bookings | Filter by status; cancel a confirmed booking with a refund (`admin_cancel_booking`) |
| Reports | Queue by status; set open/reviewing/resolved/dismissed with internal notes; jump to the reported member or context |
| Support | Contact-form tickets; reply text and status |
| Purchases | Razorpay purchases with totals |
| Skills | Catalogue with usage counts; add, rename, re-categorise, promote member-added skills, delete unused |
| Announcements | Create, schedule (start/end), activate, edit, delete |
| Audit log | Every admin action with target and details |

## Database

Migrations in `supabase/migrations/`, applied in order in the Supabase SQL
editor. `0009_admin.sql` (admin, suspension, featured, reports triage, audit
log, announcements, support tickets, booking guards) and `0010_favorites.sql`
(saved offerings) are new in this branch. Details in `supabase/README.md`.

Promote an account to admin:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

## Environment

See `.env.example`. Required: Supabase URL, anon key, service role key.
Optional: Razorpay keys (credits purchase), Sentry DSN and upload token,
Cloudflare Turnstile keys and `CONTACT_HASH_KEY` for the contact form,
`NEXT_PUBLIC_SITE_URL` for canonical links.

## Roadmap

Next features to build, roughly in order:

1. **Email notifications** for bookings, cancellations, messages and support
   replies (Resend or Supabase SMTP), with per-member preferences.
2. **Review moderation**: admins can hide or remove abusive reviews; members
   can flag a review.
3. **Teacher payouts**: convert earned credits to money for verified teachers
   (KYC, payout ledger, Razorpay Payouts).
4. **Group sessions**: offerings with a seat count, several learners per slot,
   shared chat.
5. **Recurring availability**: weekly slot templates instead of one-off slots.
6. **Search upgrades**: full-text search, pagination, saved searches, skill
   suggestions from the catalogue.
7. **Referrals**: invite links that grant credits to both sides.
8. **Localisation**: Hindi first, then other Indian languages; INR-aware
   number and date formatting throughout.
9. **PWA polish**: offline shell, push notifications, install prompt.
10. **Mobile app** (Expo) reusing `src/lib/types.ts` and the same backend.
