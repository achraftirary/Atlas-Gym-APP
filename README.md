# ATLAS/GYM — Gym Management System

A full-stack web application built to help gym businesses manage their operations end-to-end: members, subscriptions, payments, attendance, leads, staff, classes, and more — all from a clean, modern dashboard.

---

## What is Atlas Gym?

Atlas Gym is a professional gym management platform designed for fitness businesses of any size. It eliminates paper-based tracking and disconnected spreadsheets by providing a centralized system where gym administrators can control every aspect of their business, and members can manage their own profile , book session , track their hardwork through a self-service portal.

The app is built around two distinct portals:

- **Admin Portal** — full operational control for gym owners and staff
- **Member Portal** — self-service access for gym members

---
--> " 3 Screenshots of the UI in the Screnshots folder " 
## Features

### Admin Portal

| Module | What it does |
|---|---|
| **Overview / Dashboard** | Live KPIs — total members, active subscriptions, revenue, check-ins today |
| **Members** | Add, edit, delete members; set or reset passwords |
| **Memberships** | Create and assign membership plans with start/end dates and status |
| **Payments** | Track all payment records; mark payments as paid |
| **Attendance** | Log and view member check-ins with timestamps |
| **Leads / CRM** | Manage prospective members, track conversion status |
| **Trainers** | Manage trainer profiles and assignments |
| **Classes** | Schedule and manage group fitness classes |
| **Equipment** | Track gym equipment inventory |
| **Branches** | Manage multiple gym locations |
| **Staff** | Manage staff accounts and roles |
| **Reports** | Export data to Excel for financial and operational reporting |
| **Settings** | Gym-wide configuration and permissions |
| **Profile** | Update admin name, email, and password |

### Member Portal

| Feature | What it does |
|---|---|
| **Dashboard** | View subscription status, days remaining, plan details |
| **Profile** | Update personal information and change password |
| **Self-registration** | New members can sign up from the public-facing login page |

---

## How It Helps a Gym Business

- **Reduce member churn**: track attendance to spot members who stop coming before their subscription expires
- **Eliminate payment gaps**: every subscription has a payment record with a clear paid/unpaid status
- **Convert more leads**: the built-in CRM lets staff follow up on prospects without using a separate tool
- **Save admin time**: one screen to add a member, assign a plan, and record payment — no paperwork
- **Multi-role access**: separate admin and member logins keep sensitive data protected
- **Data export**: generate Excel reports for accounting or management review at any time
- **Self-service members**: members check their own subscription status without calling or visiting the desk

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, React Router v6 |
| **UI** | Custom dark design system (CSS variables), Recharts for charts |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (via `pg` Pool) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Export** | xlsx (Excel export) |
| **Dev tooling** | nodemon, react-scripts |

---

## Design & Branding

The visual identity was designed specifically for this project. Brand files are **not included in this repository** (excluded via `.gitignore`) and must be requested separately.

### Brand Colors

| Name | Hex | Usage |
|---|---|---|
| Ink | `#0A0B0F` | Background, primary surfaces |
| Lime | `#D4FF3D` | Primary accent, CTAs, active states |
| Magenta | `#FF3D7F` | Secondary accent, alerts, highlights |
| Cyan | `#4DE3D5` | Informational accents |
| Amber | `#FFB23D` | Warnings |
| Cream | `#F5F1E8` | Light surface backgrounds |

### Logo & Design Files

The logo source file is **`Atlas Gym Logo.html`** — open it in any browser to view the complete logo system rendered live with all variants:

- Icon only (dark background, light background, on lime, on magenta, transparent)
- Horizontal lockup — icon + "ATLAS/GYM" wordmark side by side
- Stacked lockup — icon above wordmark
- Wordmark only — text without icon

> These files are intentionally excluded from the public repository. Contact the project owner to receive them.

---

## Prerequisites

Make sure the following are installed before running the project:

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v14 or higher
- npm (bundled with Node.js)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/atlas-gym.git
cd atlas-gym
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Create the PostgreSQL database

```bash
psql -h localhost -U postgres -c "CREATE DATABASE gym_management;"
```

Then apply the schema:

```bash
psql -h localhost -U postgres -d gym_management -f database/schema.sql
```

### 5. Configure backend environment variables

Create the file **`server/.env`**:

```env
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGDATABASE=gym_management
PGPORT=5432
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
```

> Generate a strong `JWT_SECRET` with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Running the App

Open two terminals — one for the API, one for the frontend.

### Terminal 1 — Backend

```bash
cd server
npm run dev
```

Server starts at **http://localhost:5000**

### Terminal 2 — Frontend

```bash
npm start
```

App opens at **http://localhost:3000**

### Verify everything is working

```bash
# Check the API is alive
curl http://localhost:5000/api/

# Test admin login
curl -s -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@atlasgym.ma","password":"admin123"}' | head -c 200
```

A JSON response with a `token` field means auth is working.

---

## Default Admin Account

On first startup, the server automatically seeds a superadmin account:

| Field | Value |
|---|---|
| Email | `admin@atlasgym.ma` |
| Password | `admin123` |

**Change this password immediately** after your first login via Admin → Profile.

---

## Project Structure

```
atlas-gym/
├── database/
│   └── schema.sql                  # PostgreSQL schema — run once to initialize
│
├── public/                         # Static assets served by React
│   └── index.html
│
├── server/                         # Express.js backend
│   ├── config/
│   │   └── db.js                   # PostgreSQL pool + auto-init on startup
│   ├── controllers/
│   │   ├── adminDataController.js  # Admin data, profile, check-ins, leads
│   │   ├── authController.js       # Login (admin + member), registration
│   │   ├── memberController.js     # Member CRUD, profile update
│   │   └── membershipController.js # Subscriptions, payments
│   ├── middleware/
│   │   ├── adminAuth.js            # JWT guard for admin-only routes
│   │   └── auth.js                 # JWT guard for member routes
│   ├── routes/
│   │   └── api.js                  # All active routes (single router)
│   ├── .env                        # Not committed — create manually
│   ├── index.js                    # Express app entry point
│   └── package.json
│
├── src/                            # React + TypeScript frontend
│   ├── components/                 # Shared UI components
│   │   ├── AtlasLogo.tsx           # Reusable SVG logo component
│   │   ├── MemberForm.tsx          # Add/edit member form
│   │   ├── MembershipForm.tsx      # Subscription form
│   │   ├── RegisterForm.tsx        # Public member registration
│   │   └── ...
│   ├── layout/
│   │   ├── AdminLayout.tsx         # Sidebar + topbar for all admin pages
│   │   └── MemberLayout.tsx        # Header for member pages
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Overview.tsx        # Dashboard with KPIs and charts
│   │   │   ├── Memberships.tsx     # Subscription management
│   │   │   ├── Payments.tsx        # Payment tracking
│   │   │   ├── Attendance.tsx      # Check-in log
│   │   │   ├── Leads.tsx           # CRM / prospect management
│   │   │   ├── Trainers.tsx
│   │   │   ├── Classes.tsx
│   │   │   ├── Equipment.tsx
│   │   │   ├── Branches.tsx
│   │   │   ├── Staff.tsx
│   │   │   ├── Reports.tsx         # Excel export
│   │   │   ├── Settings.tsx
│   │   │   └── Profile.tsx
│   │   └── member/
│   │       └── Profile.tsx
│   ├── services/
│   │   └── api.js                  # All fetch calls to the backend API
│   └── App.tsx                     # Route definitions
│
├── .gitignore
├── package.json                    # Frontend dependencies
└── README.md
```

---

## API Reference

All routes are prefixed with `/api`. Protected routes require the header:
```
Authorization: Bearer <token>
```

### Authentication — public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Member login → returns JWT |
| `POST` | `/api/auth/admin/login` | Admin login → returns JWT |
| `POST` | `/api/auth/register` | Member self-registration |

### Members — admin-protected

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/members` | List all members |
| `POST` | `/api/members` | Create a new member |
| `PUT` | `/api/members/:id` | Update member details |
| `DELETE` | `/api/members/:id` | Delete a member |

### Member self-service — member-protected

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/members/profile` | Get own profile |
| `PUT` | `/api/members/profile` | Update profile / change password |
| `GET` | `/api/members/dashboard` | Subscription info and stats |

### Subscriptions & Payments — admin-protected

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/memberships` | List all subscriptions |
| `POST` | `/api/memberships` | Create a subscription |
| `GET` | `/api/payments` | List all payments |
| `PUT` | `/api/payments/:id/pay` | Mark a payment as paid |

### Attendance — admin-protected

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/checkins` | List all check-ins |
| `POST` | `/api/admin/checkin` | Log a member check-in |

### Admin — admin-protected

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/profile` | Get admin profile |
| `PUT` | `/api/admin/profile` | Update admin profile / password |
| `GET` | `/api/admin/leads` | List leads/CRM records |
| `POST` | `/api/admin/leads` | Create a lead |
| `GET` | `/api/admin/overview` | Dashboard KPI data |

---

## Environment Variables

### `server/.env`

| Variable | Required | Description |
|---|---|---|
| `PGHOST` | Yes | PostgreSQL host (usually `localhost`) |
| `PGUSER` | Yes | PostgreSQL username |
| `PGPASSWORD` | Yes | PostgreSQL password |
| `PGDATABASE` | Yes | Database name (`gym_management`) |
| `PGPORT` | Yes | PostgreSQL port (default `5432`) |
| `JWT_SECRET` | Yes | Secret key for signing tokens — keep private |
| `PORT` | No | API server port (default `5000`) |

---

## Developer Notes

- **Single router**: only `server/routes/api.js` is mounted in `server/index.js`. The files `routes/auth.js` and `routes/members.js` exist but are not active.
- **Auto-initialization**: the database tables and the default admin account are created automatically on the first backend startup via `server/config/db.js`.
- **Auth storage**: the frontend stores `token`, `userType`, `userId`, and `userName` in `localStorage` after login.
- **API service layer**: all frontend API calls are centralized in `src/services/api.js` — avoid calling `fetch` directly in components.

---

## License

Private project — all rights reserved. Contact the project owner for usage or licensing inquiries.
