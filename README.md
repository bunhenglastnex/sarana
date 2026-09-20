# 🍔 Restaurant Online Ordering & Multi-Tenant Delivery System

A production-ready architecture and implementation for online menu ordering, kitchen management, multi-tenant restaurant catalog, shared delivery dispatch, live tracking, and cash settlement.

---

## ⚡ Quick Start

From the project root directory:

1. **Install dependencies once**:

   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Run both Backend (PHP) & Frontend (Next.js) together**:
   ```bash
   npm run dev
   ```

This launches:

- **Backend API**: `http://localhost:8000` (PHP Server)
- **Frontend App**: `http://localhost:3000` (Next.js App)
- **Telegram Bot Listener**: Local Long-Polling Service (`backend/telegram-poll.php`)

---

## 🗄️ Database Setup & Reset Data

### 1. Initial Database Setup & Migration
Creates all database tables and seeds initial data:
```bash
npm run setup:db
# or
php backend/database/setup.php
```

### 2. Reset & Re-Seed Database (Fresh Clean Data)
To completely wipe all existing tables and re-seed sample multi-tenant restaurants, categories, dishes, users, and couriers from scratch:
```bash
npm run db:reset
# or
php backend/database/setup.php --fresh
```

### 3. Reset via Browser (Web Interface)
While the PHP backend server is running (`http://localhost:8000`), open in browser:
- **Initial Setup**: `http://localhost:8000/database/setup.php`
- **Fresh Reset & Re-Seed**: `http://localhost:8000/database/setup.php?fresh=1`

---

## 🔐 Default Demo Accounts & Login Credentials

| Role | Email | Phone | Password | Access Route & Scope |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Super Platform Admin** | `superadmin@system.com` | `012000000` | `admin123` | Full Multi-Tenant Platform Admin (`/admin`) |
| 🏪 **Tenant Admin (Amber Bistro)** | `admin@restaurant.com` | `012111222` | `admin123` | Amber Bistro Kitchen & Orders (`/admin`) |
| 🏪 **Tenant Admin (Spice Route)** | `admin2@restaurant.com` | `012222333` | `admin123` | Spice Route Kitchen & Orders (`/admin`) |
| 🛵 **Delivery Courier #1** | `delivery1@restaurant.com` | `098333444` | `driver123` | Shared Fleet Dispatch & GPS Telemetry (`/delivery`) |
| 🛵 **Delivery Courier #2** | `delivery2@restaurant.com` | `099555666` | `driver123` | Shared Fleet Dispatch & GPS Telemetry (`/delivery`) |
| 👤 **Customer (VIP)** | `david.chen@example.com` | `+1 (555) 234-9912` | `customer123` | Customer Online Ordering & Tracking (`/login`) |

---

## 🏗️ Production Build & Run

To build and run the optimized production bundle for both Frontend and Backend:

```bash
npm run prod
# or
npm start
```

This performs:
1. Compiles and optimizes Next.js frontend assets (`npm run build:frontend`).
2. Launches both the **PHP Backend Server** and **Next.js Production Node Server**.

---

## 🛠️ CLI Commands Cheat Sheet

| Action | Command |
| :--- | :--- |
| **Run Fullstack Dev Servers** | `npm run dev` |
| **Run Fullstack Production (Build & Start)** | `npm run prod` _(or `npm start`)_ |
| **Build Frontend Only** | `npm run build:frontend` |
| **Setup & Seed Database** | `npm run setup:db` |
| **Reset & Re-Seed Database** | `npm run db:reset` |
| **Backend API Only** | `npm run backend` |
| **Frontend App Only** | `npm run frontend` |
| **Telegram Bot Polling** | `npm run telegram:poll` |
