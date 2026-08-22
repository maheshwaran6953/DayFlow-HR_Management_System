# Dayflow API Contract

Base URL: `http://localhost:3000/api`
Auth: JWT in httpOnly cookie `dayflow_token` (set on login, sent automatically by browsers).
All bodies are JSON. Errors: `{ "error": "message" }` with proper status code.

Roles: `ADMIN` | `EMPLOYEE`

## Auth

### POST /auth/signup
```json
{ "employeeId": "EMP0010", "email": "a@b.com", "password": "Abcdef12", "role": "EMPLOYEE", "firstName": "A", "lastName": "B" }
```
Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number.
→ `201 { message, user }` · verification email sent (link logged to server console when SMTP is not configured)

### GET /auth/verify?token=...
Redirects to `/login?verified=1`.

### POST /auth/login
```json
{ "email": "arjun@dayflow.com", "password": "Password123" }
```
→ `200 { user: { id, employeeId, email, role } }` + sets cookie
→ `403` if email not verified

### POST /auth/logout → `200 { message }`
### GET /auth/me
→ `200 { user: { id, employeeId, email, role, createdAt, profile: {..., salary} } }`

## Profiles

### GET /profiles *(admin)*
→ `200 { employees: [user+profile] }`

### GET /profiles/:userId *(self or admin)*
### PATCH /profiles/:userId
Employees may only change: `phone`, `address`, `profilePicture`.
Admin may also change: `firstName`, `lastName`, `position`, `department`, `joinedDate`, `documents`.

## Attendance

Statuses: `PRESENT | ABSENT | HALF_DAY | LEAVE`

### POST /attendance/check-in *(employee, once/day)* → `201/409`
### POST /attendance/check-out *(after check-in, once/day)* → `200/409`
### GET /attendance?view=daily|weekly&date=YYYY-MM-DD&userId=...
- Employee: own records only (`userId` param → 403)
- Admin: all employees by default, or filter with `userId`
- Weekly = Monday..Sunday of the given date's week

### PATCH /attendance/:recordId *(admin)* `{ "status": "ABSENT" }`

## Leaves

Types: `PAID | SICK | UNPAID` · Statuses: `PENDING | APPROVED | REJECTED`

### POST /leaves
```json
{ "type": "PAID", "startDate": "2026-09-01", "endDate": "2026-09-03", "remarks": "Trip" }
```
Overlapping pending/approved requests → `409`.

### GET /leaves?status=PENDING&userId=...
Employee sees own; admin sees all / filtered.

### PATCH /leaves/:id *(admin)*
```json
{ "status": "APPROVED", "reviewComment": "Enjoy!" }
```
Approval writes `LEAVE` attendance for each day in range.

## Payroll

### GET /payroll
- Employee: `{ salary }` (own)
- Admin: `{ salaries: [...all] }`

### PATCH /payroll/:userId *(admin)*
```json
{ "baseSalary": 95000, "allowances": 12000, "deductions": 6000 }
```

## Demo accounts (after `npm run db:seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@dayflow.com | Password123 |
| Employee | arjun@dayflow.com | Password123 |
| Employee | priya@dayflow.com | Password123 |
