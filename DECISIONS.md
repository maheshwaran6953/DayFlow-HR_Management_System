# Decisions Log

Append-only. Newest at bottom. Anyone can add; nobody edits old entries.

- **Stack**: Next.js 14 (App Router) + TypeScript + Tailwind, single shared repo. Backend = API routes in the same app so Dev B's mock swap is trivial.
- **DB**: SQLite + Prisma 6 (Node 18 compatible; Prisma 7 needs Node 20+). File: `prisma/dev.db`. Migrate to Postgres later = change `provider` + url.
- **Auth**: custom JWT (`jose`) in httpOnly cookie `dayflow_token`, 7-day expiry. Role checks via `requireUser` / `requireAdmin` helpers — never check role inside route logic by hand.
- **Email verification**: real SMTP wired via Nodemailer reading `.env` (SMTP_*). If SMTP_HOST is empty, the verification link is printed to the server console instead of being sent — dev is never blocked.
- **SQLite has no enums**: role/type/status fields are validated strings enforced with Zod at the API boundary.
- **Attendance status on check-in** defaults to PRESENT. HALF_DAY / ABSENT are set manually by admin (PATCH /attendance/:id). No auto half-day rules for MVP.
- **Leave approval writes attendance**: approving a leave upserts LEAVE records for each day of the range.
- **Employees cannot review own leaves**, even if admin.
- **Weekly view** = Monday–Sunday window containing `date` (or today).
