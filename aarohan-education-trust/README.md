# Aarohan Education Trust — website

A public website, donation flow, and administrator CMS for an Indian educational charitable trust.

**This copy ships with demonstration content.** Names, photographs, stories, and impact figures are placeholders. They must be replaced before the site is used as a real organisation.

Donors never need an account.

---

## Run it on your computer

You need [Node.js 20+](https://nodejs.org/) (LTS) and npm (it ships with Node).

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/aarohan-education-trust.git
cd aarohan-education-trust
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

That is enough. There is no Docker, no extra database install, and no API keys required for a local demo.

| What | Local default |
|---|---|
| Site | http://localhost:8080 |
| Admin | http://localhost:8080/login then http://localhost:8080/admin |
| Database | Embedded in the Node process (see below). Resets when you stop `npm run dev`. |
| Payments | Labelled **demonstration checkout**. No real money moves. |
| Email | Logged, not sent, unless you add Resend keys. |

### Where the database is stored

There is **no separate database server** and **no database file on disk** in the default local setup.

- **On your computer (`npm run dev`, no `DATABASE_URL`):** the app starts an embedded Postgres (PGLite) **inside the same Node process**. Programmes, campaigns, stories, donations, admin users, and form submissions all live in that process memory. Stopping the terminal / restarting the server **wipes it** and the seed demonstration content is loaded again on the next start.
- **This live preview:** same thing — in-memory, not a file you can copy.
- **Production:** set `DATABASE_URL` to a real Postgres (typically [Neon](https://neon.tech)). Then everything is stored in that hosted database and survives restarts.

Schema and seed data are SQL files in `migrations/` (`0001_auth.sql`, `0002_schema.sql`, `0003_seed.sql`). They run automatically when the app starts.

To keep data between restarts locally, create a Neon (or any Postgres) database and put the connection string in `.env`:

```bash
cp .env.example .env
# set DATABASE_URL=postgres://...
npm run dev
```

### If you downloaded the zip instead of cloning

```bash
unzip aarohan-education-trust.zip
cd aarohan-education-trust
npm install
npm run dev
```

Then open [http://localhost:8080](http://localhost:8080).

### Useful commands

```bash
npm run dev          # local site at http://localhost:8080
npm test             # unit tests
npm run typecheck    # TypeScript
npm run build        # production build + database migrations
```

### Optional: real Postgres, Razorpay, or email

```bash
cp .env.example .env
```

Edit `.env` and restart `npm run dev`. See the environment table below.

Without Razorpay keys the site keeps the demonstration checkout. That path turns off automatically once live keys are present.

---

## Put this on your GitHub

This project is not published to GitHub from the builder. Create the repository on your account, then push.

1. Open [https://github.com/new](https://github.com/new).
2. Repository name: `aarohan-education-trust`.
3. Leave it **public** or **private**. Do not add a README (you already have one).
4. Create the repository.
5. In a terminal, from the project folder:

```bash
git init
git add .
git commit -m "Aarohan Education Trust website"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/aarohan-education-trust.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub username. GitHub will ask you to sign in (browser or a personal access token).

After the first push, the clone command at the top of this file will work for anyone you share the repo with.

---

## What you can do once it is running

- Browse Home, About, Our Work, Impact, Stories, Campaigns, Volunteer, Partner, Transparency, Contact
- Complete a **demonstration donation** (no real money)
- Download a demonstration acknowledgement PDF
- Submit contact and volunteer forms
- Sign in at `/login` (email and password works locally) and open `/admin`

The **first** person to sign in becomes the administrator.

---

## Architecture

| Layer | Choice |
|---|---|
| App | TanStack Start (React) |
| Database | Postgres — Neon in production, embedded Postgres locally |
| Admin sign-in | Better Auth: email/password locally; Google / X when those keys are configured |
| Payments | Razorpay Standard Checkout. Orders are created on the server. A donation is **PAID** only after signature verification or a verified webhook. |
| Email | Resend (optional). A failed email never marks a paid donation as failed. |
| Receipts | HTML page + PDF acknowledgement. This is **not** Form 10BE. |

Money is stored as **integer paise**. Campaign totals are `SUM` of donations with status `PAID` only.

80G claims and foreign donations are **off** until an administrator turns them on and enters the matching details.

---

## Environment variables (production)

Do not put secrets in the repository. Configure them in the hosting dashboard, or in a local `.env` that is gitignored.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Injected on deploy | Postgres connection |
| `RAZORPAY_KEY_ID` | For live or test payments | Checkout key id |
| `RAZORPAY_KEY_SECRET` | For live or test payments | Server-only. Never expose to the browser. |
| `RAZORPAY_WEBHOOK_SECRET` | For live webhooks | Verifies `POST /api/webhooks/razorpay` |
| `RESEND_API_KEY` | For email | Transactional email |
| `EMAIL_FROM` | For email | e.g. `Aarohan <hello@yourdomain.org>` |
| `ADMIN_NOTIFICATION_EMAIL` | Optional | Ping on donations and forms |
| `BETTER_AUTH_URL` | Production | Public site URL, e.g. `https://yourdomain.org` |
| `BETTER_AUTH_SECRET` | Production | Random 32+ character secret |

Without Razorpay keys the site uses a **labelled demonstration checkout**. That path is disabled automatically once live keys are present.

---

## Admin setup

1. Open `/login`.
2. Sign in with email and password (or Google / X when configured).
3. The **first** signed-in user is written into the administrators table.
4. Later sign-ins that are not in that table receive “Forbidden”. Add further staff in the database (`admins`) if you need more than one person.
5. Open `/admin` to edit programmes, campaigns, stories, homepage copy, impact metrics, documents, and trust settings.

---

## Razorpay (test, then live)

1. Create a Razorpay account in the trust’s legal name. Copy the **test** key id and secret.
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. Webhook URL: `https://YOUR_DOMAIN/api/webhooks/razorpay`
   - Events: `payment.captured`, `payment.failed`, `payment.authorized`
   - Copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`
4. Test with UPI / cards in Razorpay test mode. Confirm:
   - a pending donation is created
   - only a verified signature marks it `PAID`
   - repeating the webhook does not create a second receipt
5. Switch to **live** keys only after the trust, 80G, and FCRA settings are correct.

Manual test without keys: Donate → proceed → confirm demonstration payment → open the thank-you page → download PDF.

Never mark a donation successful from a frontend “success” callback alone. Amounts from the browser are ignored; the server uses the stored paise amount.

---

## Email (Resend)

1. Create a Resend account and verify the sending domain.
2. Set `RESEND_API_KEY` and `EMAIL_FROM`.
3. Optionally set `ADMIN_NOTIFICATION_EMAIL`.
4. Send a demonstration donation and confirm the acknowledgement email arrives.
5. If email fails, the donation stays `PAID`. The receipt page still works.

Without these keys, emails are logged as `demo` and skipped.

---

## Production deployment

This app is intended for **Vercel** with a **Neon** Postgres database.

1. Create a Neon project. Copy the pooled connection string into `DATABASE_URL`.
2. Deploy the repository to Vercel. Migrations run as part of `npm run build`.
3. Set the environment variables above on the Vercel project.
4. Attach a custom domain and wait for HTTPS.
5. Point Razorpay’s webhook at `https://YOUR_DOMAIN/api/webhooks/razorpay`.
6. Authenticate the sending domain in Resend (SPF / DKIM).
7. Turn off the demonstration banner in Admin → Settings once real copy is in place.

Do not enable live Razorpay on a preview URL.

---

## Testing

```
npm test
npm run typecheck
npm run build
```

---

## Admin CMS

Path: `/admin`

- Overview of donations and campaigns
- Donation search + CSV export (authorised only)
- Programmes, campaigns, stories, homepage blocks, impact metrics
- Volunteer pipeline (NEW → CONTACTED → APPROVED / REJECTED / COMPLETED)
- Contact and partnership enquiries
- Transparency documents
- Trust settings, including **80G off** and **foreign donations off** until you enable them

Donations cannot be deleted in the normal interface.

Sensitive donor fields (PAN, full address) are for authorised administrators only. PAN is masked in list views.

---

## What you must replace before launch

1. Trust name, founder, address, email, phone
2. Founder photograph and biography (the current portrait is demonstration art)
3. Programme copy
4. Impact numbers (leave as “—” until verified)
5. Stories — only with consent; keep names anonymised
6. Registration numbers, 12A, 80G, FCRA — only if they exist
7. Legal pages (Privacy, Terms, Donation policy) after adviser review
8. Turn **off** the demonstration banner in Admin → Settings
9. Partner logos — add none until they are real
