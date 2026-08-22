# 🌐 Dayflow HRMS

> **Every workday, perfectly aligned.**

**Dayflow HRMS** is a modern Human Resource Management System designed to simplify everyday workforce operations—from employee onboarding and attendance to leave management and payroll visibility.

Built with a modern full-stack architecture, Dayflow provides separate experiences for **Admin/HR Officers** and **Employees**, ensuring that everyone gets access to the tools and information they need.

---

## ✨ What is Dayflow?

Dayflow brings essential HR operations into one centralized platform.

### 👥 Employee Management

* Employee onboarding
* Employee profile management
* Role-based user access
* Employee information management

### 🕐 Attendance

* Track employee attendance
* View attendance records
* Monitor workday activity

### 🏖️ Leave Management

* Submit leave requests
* Review leave information
* HR/Admin leave management

### 💰 Payroll Visibility

* Access payroll-related information
* Provide employees with visibility into their compensation details

### 🔐 Role-Based Access

Dayflow provides different capabilities based on the user's role:

| Role           | Access                                                      |
| -------------- | ----------------------------------------------------------- |
| 🛡️ Admin / HR | Employee management, attendance, leave & payroll visibility |
| 👤 Employee    | Profile, attendance, leave & personal payroll information   |

---

## 🧩 Technology Stack

### Frontend

* **Next.js** — App Router
* **Tailwind CSS** — Styling
* **shadcn/ui** — UI components
* **Lucide Icons** — Icons
* Interactive mock state

### Backend

* **REST API**
* **Prisma ORM**
* **SQLite**
* Role-based authorization

### Architecture

```text
┌─────────────────────────────┐
│        Dayflow UI           │
│   Next.js + Tailwind CSS    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         REST API            │
│     Authentication / RBAC   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Prisma ORM            │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        SQLite DB            │
└─────────────────────────────┘
```

---

## 🚀 Getting Started

### Setup Workflow

Follow these steps in order to set up your local development environment:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Push database schema & seed initial data**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Access

Use the following accounts after running `npm run db:seed`:

| Role | Email | Password |
|---|---|---|
| 🛡️ Admin / HR | `admin@dayflow.com` | `Password123` |
| 👤 Employee | `arjun@dayflow.com` | `Password123` |
| 👤 Employee | `priya@dayflow.com` | `Password123` |

---

## 📜 Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |
| `npm run test:dates` | Run date utility tests via `node:test` + `tsx` |
| `npm run db:push` | Apply Prisma schema & generate client |
| `npm run db:seed` | Populate database with demo records |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## 📚 Project Documentation

- 📄 **API Contract** → [`docs/API.md`](docs/API.md) — REST endpoints, payloads, and response interfaces.
- 📐 **Architecture Decisions** → [`DECISIONS.md`](DECISIONS.md) — Append-only architecture log.
- 🤝 **Contributing Guidelines** → [`CONTRIBUTING.md`](CONTRIBUTING.md) — Branch naming, commit formatting, and testing rules.

---

## 🗂️ Project Structure

```text
dayflow/
├── app/                  # Next.js application
├── components/           # Reusable UI components
├── prisma/               # Database schema & seed
├── docs/                 # API documentation
├── public/               # Static assets
├── DECISIONS.md          # Architecture decisions
├── TASKS.md              # Project backlog
├── .env.example          # Environment configuration
└── package.json          # Project scripts & dependencies
```

---

## 🔒 Security & Access

Dayflow follows a role-based approach to application access.

```text
                    DAYFLOW
                       │
             ┌─────────┴─────────┐
             │                   │
        ADMIN / HR           EMPLOYEE
             │                   │
       ┌─────┼─────┐       ┌─────┼─────┐
       │     │     │       │     │     │
    Users  Leave Payroll  Profile Leave Attendance
    Manage  Mgmt  View     View    Mgmt    View
```

Users only interact with functionality appropriate to their assigned role.

---

## 🛣️ Future Improvements

Potential extensions for Dayflow include:

* 📊 HR analytics dashboard
* 📱 Mobile-friendly employee portal
* 🔔 Real-time notifications
* 📧 Automated HR emails
* 📅 Advanced attendance reports
* 💳 Detailed payroll processing
* 🧾 Payslip generation
* 🔐 Enhanced authentication
* ☁️ Production cloud deployment

---

## 🤝 Contributing

Contributions are welcome.

1. Create a feature branch.
2. Make your changes.
3. Test the application locally.
4. Run the lint checks.
5. Submit a pull request.

```bash
npm run lint
npm run build
```

---

## 📄 License

This project is intended for learning, development, and demonstration purposes.

---

<p align="center">

**Dayflow HRMS**
*Every workday, perfectly aligned.*

</p>
