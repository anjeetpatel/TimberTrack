<div align="center">

# 🌲 TimberTrack SaaS

### Smart Multi-Tenant Rental & Ledger Management System

**A production-ready full-stack SaaS platform for timber and construction equipment rental businesses**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Default Credentials](#-default-credentials)
- [Multi-Tenant Architecture](#-multi-tenant-architecture)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Business Logic](#-business-logic)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)

---

## 🔍 Overview

TimberTrack is a **multi-user SaaS rental management platform** built for small to mid-sized businesses renting timber, scaffolding, shuttering, props, and construction equipment. It handles the full rental lifecycle — from creating rentals and tracking inventory to processing partial returns and capturing payments.

It is designed as a secure, strict-isolation SaaS platform where multiple distinct businesses (Organizations) can operate simultaneously on the same backend infrastructure, strictly isolated from each other.

---

## ✨ Key Features

### 🏢 Multi-Tenancy & SaaS
| Feature | Description |
|---------|-------------|
| **Strict Data Isolation** | Every entity maps to an `organizationId`. Multi-tenant requests are guaranteed secure through strict context scoping. |
| **Invite System** | Owners can generate limits-based invite codes for Workers to join their organization. |
| **Subscription Limits** | Free tiers vs. Paid tiers. Enforces monthly limits on rentals and customer creation via `checkSubscription` middleware. Auto monthly resets. |
| **Ownership Transfer** | Secure capability to transfer ownership to another member in an organization via transactions. |

### 🏗️ Core Business Logic
| Feature | Description |
|---------|-------------|
| **Atomic Rental & Return Flow** | Creates rental + reserves stock synchronously. Partial/Full Returns restore stock synchronously (Wrapped securely in MongoDB sessions). |
| **Sophisticated Billing Engine** | `lastCalculatedDate` prevents double-billing for incremental/partial returns of items across different days. |
| **Payment Overflow Guard** | Robust backend checks to prevent logging payments that exceed the total outstanding balance. |
| **Soft & Hard Delete Guards** | Prevents deletion of items or customers currently involved in an active rental. Implements `isDeleted` flags. |

### 🔒 Security, Trust & Ops
- **RBAC:** Owner vs. Worker access controls (workers can't delete data, approve payments, view revenue, or transfer ownership).
- **JWT Rotation:** 7-day refresh tokens mapped by the backend with rotation and auto-expiration on sign-in.
- **Activity Log Audit Trail:** Immutable system logs every system action (who, what, when, against which entity). 
- **Production Hardening:** Express strict rate-limiting, Helmet CSP injection, Mongo express-sanitizer for NoSql injections.
- **Winston Centralized Context Logging:** High-accuracy logs.
- **Automated DB Backups:** Included Unix `bash` shell scripts to perform daily automated MongoDB dumps with a rolling 30-day retention curve.

### 📱 Communications & Insights
- **WhatsApp Integration:** Generates WhatsApp `wa.me` strings mapping to overdue accounts, new rentals, and partial returns natively.
- **Live Stats Dashboard:** Organization-scoped aggregated data for revenue, delayed payments, and total active elements out in the wild.
- **Data Export:** Generate `.CSV` exports of financials safely bounded by date.

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 4.x
- **Database:** MongoDB + Mongoose 8.x
- **Auth:** JSON Web Tokens (`jsonwebtoken`) + Refresh Tokens
- **Security:** Helmet, express-rate-limit, express-mongo-sanitize
- **Logging:** Winston + Morgan
- **CORS & Config:** cors, dotenv

### Frontend
- **Bundler:** Vite 8.x
- **UI Architecture:** React 19 + Context API
- **Routing:** React Router DOM v7
- **Styling:** Custom Vanilla CSS Token-based Design System
- **Fonts & Symbols:** Google Fonts (Inter, Noto Serif), Google Material Symbols

---

## 📁 Project Structure

```
TimberTrack/
│
├── backend/
│   ├── config/                  # DB and Winston logger Configurations
│   ├── controllers/             # Core logic endpoints (Multi-tenant scoped)
│   ├── middleware/
│   │   ├── auth.js              # Token & Session context validation
│   │   ├── requireRole.js       # RBAC guards (OWNER vs WORKER)
│   │   ├── checkSubscription.js # Usage & threshold limiting
│   │   ├── rateLimiter.js       # Endpoint throttling 
│   │   └── errorHandler.js      # Formatted Error boundary
│   ├── models/
│   │   ├── Organization.js      # Tenancy, Subscription limits, Invite Codes
│   │   ├── ActivityLog.js       # Immutable Audit Trails
│   │   ├── User.js              # Secure Role Accounts
│   │   ├── Rental, ReturnTransaction, Payment, Customer, Inventory
│   ├── routes/                  # Express REST routes
│   ├── scripts/
│   │   └── backup.sh            # Cron-runnable mongodump backup policy
│   ├── utils/                   # Cost Calculators, WhatsApp Templates
│   ├── migrate.js               # Dev tool to port single-user data to multi-tenant 
│   ├── seed.js                  # Fresh Org / Sample Data creation
│   └── server.js                # Bootstrap Express instance
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js           # Generic Fetch wrapper mapping endpoints & errors
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Token + User + Org state distribution
│   │   ├── components/          # Reusable dumb views (Nav, Inputs, UI Lists)
│   │   ├── pages/               # Feature-Level Routable Views (Lazy Loaded)
│   │   │   ├── Dashboard, Login, Rentals, NewRental, Settings, Inventory, etc.
│   │   ├── App.jsx              # Protected route architecture
│   │   ├── main.jsx             # React DOM root
│   │   └── index.css            # System tokens
│   ├── index.html
│   └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`
- Git

### 1. Clone the repository

```bash
git clone https://github.com/anjeetpatel/TimberTrack.git
cd TimberTrack
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/timbertrack
JWT_SECRET=super_strong_secret_key_v2
JWT_REFRESH_SECRET=super_strong_refresh_key_v2
OVERDUE_THRESHOLD_DAYS=30
NODE_ENV=development
```

**Seed the database with sample data:**

```bash
node seed.js
```
*(This creates an Organization, Owner Account, Customers, and drops dummy inventory.)*

**Start the backend server:**

```bash
npm run dev
```

> Backend runs at **http://localhost:5000**

### 3. Set up the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

**Start the frontend:**

```bash
npm run dev
```

> Frontend runs at **http://localhost:5173**

---

## 🔑 Default Credentials

If you ran `node seed.js`, TimberTrack initializes an Owner and gives an Invite Code.
Check the terminal output of `seed.js` for the **invite code**.

| Field | Value |
|-------|-------|
| **Phone** | `9999999999` |
| **PIN** | `1234` |
| **Role** | `OWNER` |

---

## 🏢 Multi-Tenant Architecture

All API calls from an authenticated client include a `req.user.organizationId` appended by the `auth` middleware. 

In every controller operation, queries mandate the `organizationId`:
```javascript
const inventory = await Inventory.find({ 
    organizationId: req.user.organizationId,
    isDeleted: false 
});
```
This isolates companies entirely. There is no super-admin dashboard included; every access requires joining an organization.

---

## 🛡️ Role-Based Access Control (RBAC)

Two core roles define operations: `OWNER` and `WORKER`.

| Capability | OWNER | WORKER |
|------------|-------|--------|
| Create Rentals & Customers | ✅ | ✅ |
| Manage Inventory Items | ✅ | ✅ |
| Process Partial/Full Returns | ✅ | ✅ |
| Change Organization Settings | ✅ | ❌ |
| Invite Members to Organization| ✅ | ❌ |
| Generate Subscription Reports | ✅ | ❌ |
| Process Financial Payments | ✅ | ❌ |
| See Dashboard Revenues | ✅ | ❌ |
| Send Payment WhatsApp Reminders | ✅ | ❌ |
| Hard/Soft Delete Entities | ✅ | ❌ |

---

## ⚙️ Business Logic Highlights

### Partial Return Billing 
The system does not charge a flat rate. Each rental item tracks a `lastCalculatedDate`. When items are returned:
```javascript
daysCharged = Math.max(1, daysBetween(item.lastCalculatedDate, returnDate));
lineCost = quantityReturned * pricePerDay * daysCharged;
item.lastCalculatedDate = returnDate; // Advanced to prevent re-billing
```
If you return 5 items on Day 10 and 5 on Day 20, both batches calculate costs independently based on their exact return footprint.

### MongoDB Sessions & Atomic Operations
**Rental creation** and **return processing** run fully mapped inside `mongoose.startSession()` and `.withTransaction()`.
If the process fails midway (e.g. creating the rental finishes but Inventory item decrement fails in DB), the system fully rolls back to the immediate previous state assuring accurate real-world item accounting.

### Subscription Limits
Companies on the `FREE` plan hit maximum caps `(100 customers max)` and `(50 rentals via rolling 30 day periods)`. Middleware automatically detects crossover dates, flushes usage back to zero on new billing periods, and returns graceful `403` HTTP errors stopping usage past limits until shifted to Paid tiers.

---

## 🔧 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server TCP Listening port |
| `MONGODB_URI` | `mongodb://localhost:27017/timbertrack` | MongoDB connection URI |
| `JWT_SECRET` | — | Session signing key |
| `JWT_REFRESH_SECRET` | — | Long-lived JWT key to re-issue sessions without relogging |
| `OVERDUE_THRESHOLD_DAYS` | `30` | Day marker to flag rentals as Overdue contextually |
| `NODE_ENV` | `development` | Dictates strict error handling or verbose stacks |

---

<div align="center">
Made with ❤️ for modern rental business organizations
</div>
