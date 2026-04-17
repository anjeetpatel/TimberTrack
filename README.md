<div align="center">

# 🌲 TimberTrack

### Smart Rental & Ledger Management System

**A production-ready full-stack application for timber and construction equipment rental businesses**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Default Credentials](#-default-credentials)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Business Logic](#-business-logic)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)

---

## 🔍 Overview

TimberTrack is a **daily-use rental management tool** built for small business owners who rent timber, scaffolding, shuttering, props, and construction equipment. It handles the full rental lifecycle — from creating rentals to processing partial returns, collecting payments, and sending WhatsApp reminders — all in a clean, fast, and reliable interface.

This project was designed to behave like a **real rental business management platform**, not just a CRUD application, with accurate billing, data integrity guarantees, and real-world edge case handling.

---

## ✨ Features

### 🏗️ Core Business
| Feature | Description |
|---------|-------------|
| **Inventory Management** | Track total vs. available stock; prevent negative inventory |
| **Customer Management** | Add and search customers with pagination |
| **Rental Creation** | Atomic write — simultaneously creates rental and reserves stock |
| **Partial Returns** | Return some or all items incrementally across multiple sessions |
| **Accurate Billing** | `lastCalculatedDate` per item prevents double-billing on partial returns |
| **Damage & Lost Charges** | Capture damage fees and lost-item replacement costs |
| **Payment Recording** | Cash, UPI, Card, Bank Transfer with overflow protection |
| **Automatic Status Tracking** | Rental auto-completes when all items are returned |

### 📊 Dashboard & Analytics
- Live stats: Active Rentals, Overdue Rentals, Total Revenue, Pending Payments, Items Out
- Recent rentals table with overdue indicators
- CSV export for rental and payment history

### 📱 Communication
- **WhatsApp Integration** — one-click `wa.me` links with pre-filled messages:
  - Rental Created confirmation
  - Return Summary with balance breakdown
  - Payment Reminder for overdue accounts

### 🔒 Security & Auth
- Phone number + 4-digit PIN login
- JWT-based session (7-day token)
- All API routes protected by auth middleware
- Audit trail (`createdBy`) on rentals, returns, and payments

### 🎨 UI / UX
- **Alexandria design system** — Noto Serif headlines + Inter body + Public Sans labels
- Red pulsing badges for overdue rentals
- Confirmation dialogs before returns and payments
- Toast notifications for all actions
- Loading spinners on buttons and pages
- Lazy-loaded pages via `React.lazy`

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 4.x
- **Database:** MongoDB + Mongoose 8.x
- **Auth:** JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Logging:** Morgan
- **CORS:** `cors` middleware

### Frontend
- **Bundler:** Vite 8.x
- **UI Library:** React 19
- **Routing:** React Router DOM v7
- **Styling:** Vanilla CSS (custom design system, no framework)
- **Fonts:** Google Fonts (Noto Serif, Inter, Public Sans)
- **Icons:** Google Material Symbols

---

## 📁 Project Structure

```
TimberTrack/
│
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register & Login
│   │   ├── inventoryController.js   # Inventory CRUD
│   │   ├── customerController.js    # Customer CRUD
│   │   ├── rentalController.js      # Rental creation & listing
│   │   ├── returnController.js      # Return processing (atomic)
│   │   ├── paymentController.js     # Payment recording
│   │   ├── dashboardController.js   # Aggregated stats
│   │   ├── whatsappController.js    # Message link generation
│   │   └── exportController.js      # CSV downloads
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   └── errorHandler.js          # Global error handler
│   ├── models/
│   │   ├── User.js                  # Phone + PIN auth
│   │   ├── Inventory.js             # Stock with availableQuantity
│   │   ├── Customer.js              # Customer records
│   │   ├── Rental.js                # Core rental with per-item tracking
│   │   ├── ReturnTransaction.js     # Each return event
│   │   └── Payment.js               # Each payment event
│   ├── routes/                      # One file per resource
│   ├── utils/
│   │   ├── dateUtils.js             # daysBetween(), formatDate()
│   │   ├── costCalculator.js        # Billing engine
│   │   └── whatsappMessage.js       # Message templates + wa.me generator
│   ├── seed.js                      # Dev seed: user + inventory + customers
│   ├── server.js                    # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js               # Centralized fetch wrapper (all endpoints)
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT auth state (login/logout/register)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Navigation with overdue badge
│   │   │   ├── Toast.jsx            # Toast notification system
│   │   │   ├── ConfirmDialog.jsx    # Confirmation modal
│   │   │   ├── LoadingSpinner.jsx   # Spinner (page and button)
│   │   │   └── Pagination.jsx       # Smart pagination component
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Phone + PIN login/register
│   │   │   ├── Dashboard.jsx        # Stats + recent rentals
│   │   │   ├── Inventory.jsx        # Inventory table + Add modal
│   │   │   ├── Customers.jsx        # Customer list + Add modal
│   │   │   ├── Rentals.jsx          # Active/Completed with filters
│   │   │   ├── NewRental.jsx        # Create rental flow
│   │   │   ├── RentalDetail.jsx     # Full detail + payments + WhatsApp
│   │   │   └── ReturnItems.jsx      # Partial return interface
│   │   ├── App.jsx                  # Routing + lazy loading + layout
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Full design system CSS
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
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
JWT_SECRET=your_secret_key_here
OVERDUE_THRESHOLD_DAYS=30
NODE_ENV=development
```

Seed the database with sample data:

```bash
node seed.js
```

Start the backend server:

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

Start the frontend:

```bash
npm run dev
```

> Frontend runs at **http://localhost:5173**

---

## 🔑 Default Credentials

After running `node seed.js`, use these to log in:

| Field | Value |
|-------|-------|
| **Phone** | `9999999999` |
| **PIN** | `1234` |

The seed also creates **10 inventory items** and **5 sample customers**.

---

## 📡 API Reference

All routes (except `/api/auth/*`) require a Bearer token header:
```
Authorization: Bearer <token>
```

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register with phone + name + PIN |
| `POST` | `/api/auth/login` | Login → returns JWT token |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory?search=` | List all items (with optional search) |
| `POST` | `/api/inventory` | Add new inventory item |
| `PUT` | `/api/inventory/:id` | Update item (quantity-safe) |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/customers?search=&page=&limit=` | Paginated list |
| `POST` | `/api/customers` | Add new customer |

### Rentals
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/rentals?status=&filter=&search=&page=` | List (filterable: overdue, pending) |
| `GET` | `/api/rentals/:id` | Detail with overdue flag + running cost |
| `POST` | `/api/rentals` | Create rental (**atomic**) |

### Returns
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/returns` | Process return (**atomic**) |
| `GET` | `/api/returns?rentalId=` | Return history for a rental |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments` | Record payment (overflow-safe) |
| `GET` | `/api/payments?rentalId=` | Payment history for a rental |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Aggregated business metrics |

### WhatsApp
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/whatsapp/rental/:id` | Rental confirmation message + link |
| `GET` | `/api/whatsapp/return/:id` | Return summary message + link |
| `GET` | `/api/whatsapp/reminder/:id` | Payment reminder message + link |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/export/rentals` | Download rental history as CSV |
| `GET` | `/api/export/payments` | Download payment history as CSV |

---

## 🗄️ Data Models

### Inventory
```js
{
  name: String,               // "Wooden Balli (10ft)"
  category: String,           // "Scaffolding"
  pricePerDay: Number,        // ₹/day
  totalQuantity: Number,
  availableQuantity: Number,  // Tracked & guarded — never goes negative
  itemValue: Number,          // Replacement cost (used for lost charges)
}
```

### Rental
```js
{
  customerId: ObjectId,
  createdBy: ObjectId,        // Audit trail
  items: [{
    itemId: ObjectId,
    itemName: String,         // Denormalized
    issuedQty: Number,
    returnedQty: Number,      // Updated per return
    pricePerDay: Number,      // Snapshot at time of rental
    lastCalculatedDate: Date, // Key: advances with each partial return
  }],
  startDate: Date,
  status: 'ACTIVE' | 'COMPLETED',
  totalAmount: Number,        // Grows as returns are processed
  amountPaid: Number,
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID',
}
```

### ReturnTransaction
```js
{
  rentalId: ObjectId,
  returnedItems: [{
    itemId, quantityReturned, daysCharged, lineCost
  }],
  returnDate: Date,
  totalCost: Number,
  damageCharges: Number,
  lostCharges: Number,        // lostQty × itemValue
  finalAmount: Number,        // totalCost + damageCharges + lostCharges
  createdBy: ObjectId,
}
```

### Payment
```js
{
  rentalId: ObjectId,
  amount: Number,             // Validated: cannot exceed dueBalance
  paymentDate: Date,
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER',
  createdBy: ObjectId,
}
```

---

## ⚙️ Business Logic

### Partial Return Billing (Most Critical)

Each rental item tracks a `lastCalculatedDate`. When items are returned:

```
daysCharged = daysBetween(item.lastCalculatedDate, returnDate)   // min 1 day
lineCost    = quantityReturned × pricePerDay × daysCharged
item.lastCalculatedDate = returnDate   // Advanced to prevent re-billing
```

This means if you return 5 items on Day 10 and the remaining 5 on Day 20, each batch is correctly charged only for its own period.

### Atomic Operations

Both **rental creation** and **return processing** are wrapped in MongoDB transactions:

```
BEGIN TRANSACTION
  1. Validate stock / quantities
  2. Update Inventory.availableQuantity
  3. Create/update Rental
  4. Create ReturnTransaction record
COMMIT  (or ABORT on any failure)
```

No partial state is ever committed to the database.

### Payment Safety

```
dueAmount = rental.totalAmount - rental.amountPaid

if (payment.amount > dueAmount) → REJECT with clear error message
```

### Overdue Detection

Computed on every API response (not stored):
```
currentDays = daysBetween(rental.startDate, today)
isOverdue   = status === 'ACTIVE' && currentDays > OVERDUE_THRESHOLD_DAYS
```

Configurable via `OVERDUE_THRESHOLD_DAYS` env variable (default: 30 days).

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/timbertrack` | MongoDB connection string |
| `JWT_SECRET` | — | Secret key for JWT signing (set a strong value in production) |
| `OVERDUE_THRESHOLD_DAYS` | `30` | Days after which a rental is flagged as overdue |
| `NODE_ENV` | `development` | Controls error verbosity |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

---

## 🖼️ Screenshots

| Screen | Description |
|--------|-------------|
| **Login** | Phone + PIN authentication |
| **Dashboard** | Stats cards + overdue badges + recent rentals |
| **Inventory** | Searchable table with In Stock / Low Stock / Out of Stock badges |
| **Customers** | Paginated list with add-customer modal |
| **Rentals** | Active/Completed tabs, overdue filter, pending payment filter |
| **New Rental** | Customer picker + item catalog + quantity selector |
| **Rental Detail** | Financial summary, WhatsApp button, return history, payment history |
| **Return Items** | Per-item quantity inputs showing remaining stock, damage charges |

---

## 📄 License

This project is part of an academic comprehensive seminar submission.

---

<div align="center">
Made with ❤️ for small rental business owners
</div>
