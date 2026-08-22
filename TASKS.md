# Contributor Tasks — quick wins (pick one at a time, commit when done)

Rules:
- One task = one branch = one commit (`git checkout -b task/<name>` then PR or direct push).
- Commit message format: `type: what it does` (e.g. `docs: rewrite README setup guide`).
- Keep it small. Done is better than big.

## Member 3 (docs & tooling)

1. **README.md rewrite** — project intro (from `dayflow_summary.txt`), prerequisites
   (Node 18+, npm), setup steps (npm install → copy .env.example to .env → npm run db:push
   → npm run db:seed → npm run dev), script table, link to docs/API.md.
2. **`scripts/smoke.sh`** — bash script that curls through the whole API: login as admin,
   login as employee, check-in, weekly attendance, apply leave, approve leave, payroll
   read/update. Print PASS/FAIL per step. Document usage in README (task 1).
3. **CONTRIBUTING.md** — branch naming, commit message format above, DECISIONS.md etiquette,
   "ask before touching prisma/schema.prisma".

## Member 4 (code, isolated files)

1. **Expand seed data** in `prisma/seed.ts` — add 3 more employees across 2 departments,
   give them varied attendance for the last 10 days (some ABSENT / HALF_DAY) and one
   REJECTED leave request each. Keep existing accounts untouched.
2. **`src/types/index.ts`** — TypeScript types mirroring docs/API.md responses
   (SessionUser, ProfileView, AttendanceRecordView, LeaveRequestView, SalaryView).
   Export from one file so Dev B's frontend imports match exactly.
3. **`scripts/dates.test.ts`** — tests for src/lib/dates.ts using node:test + tsx
   (`npx tsx --test scripts/dates.test.ts`). Cover: startOfWeek on Mon/Wed/Sat/Sun,
   startOfDay resets time, endOfDay keeps date. Add npm script `test:dates`.

## Do NOT touch

- `prisma/schema.prisma`, `src/lib/*`, `src/app/api/*` (owned by Dev A)
- Anything Dev B claims in the frontend
