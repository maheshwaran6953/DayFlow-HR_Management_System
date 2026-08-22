# Dayflow HRMS

> Every workday, perfectly aligned.

Dayflow Human Resource Management System: employee onboarding, profile management, attendance tracking, leave management, and payroll visibility with role-based access for Admin/HR officers and Employees.

**Status**: backend API complete (see [docs/API.md](docs/API.md)) · frontend in progress

## Quick start

```bash
npm install
cp .env.example .env        # fill SMTP_* to send real verification emails
npm run db:push             # create SQLite database
npm run db:seed             # demo users + data
npm run dev                 # http://localhost:3000
```

Demo logins: `admin@dayflow.com` / `Password123` · `arjun@dayflow.com` / `Password123`

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server |
| `npm run db:push` | apply schema + regenerate client |
| `npm run db:seed` | reset-free demo data seeding |
| `npm run db:studio` | browse the DB in Prisma Studio |

## Docs

- [API contract](docs/API.md) â€” every endpoint, request/response shapes
- [Decisions log](DECISIONS.md) â€” why things are the way they are
- [Contributor tasks](TASKS.md) â€” pick a quick win
