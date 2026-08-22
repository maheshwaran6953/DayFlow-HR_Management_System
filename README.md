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

### 1. Clone the project

```bash
git clone <your-repository-url>
cd dayflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create your local environment file:

```bash
cp .env.example .env
```

Configure the required `SMTP_*` values if email verification is enabled.

### 4. Initialize the database

```bash
npm run db:push
npm run db:seed
```

This creates the SQLite database and loads the demo data.

### 5. Start Dayflow

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔑 Demo Access

Use the following accounts to explore different roles.

### 🛡️ Admin

```text
Email: admin@dayflow.com
Password: Password123
```

Alternative:

```text
Email: alice@dayflow.com
Password: Admin@1234
```

### 👤 Employee

```text
Email: arjun@dayflow.com
Password: Password123
```

Alternative:

```text
Email: rahul@dayflow.com
Password: Emp@1234
```

> ⚠️ Demo credentials are intended only for local development and testing.

---

## 📜 Available Commands

| Command             | Purpose                      |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Create a production build    |
| `npm run start`     | Start the production server  |
| `npm run lint`      | Run ESLint                   |
| `npm run db:push`   | Apply Prisma schema changes  |
| `npm run db:seed`   | Populate demo data           |
| `npm run db:studio` | Launch Prisma Studio         |

---

## 📚 Project Documentation

Additional project documentation is available inside the repository:

* **API Contract** → `docs/API.md`
  REST endpoints, request payloads, and response structures.

* **Architecture Decisions** → `DECISIONS.md`
  Important technical and product decisions made during development.

* **Contributor Tasks** → `TASKS.md`
  Current backlog, development tasks, and future improvements.

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
