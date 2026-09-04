# 🍔 Restaurant Online Ordering & In-House Delivery System (Cash Only)

A production-ready architecture and implementation for a single-brand restaurant with online menu ordering, in-house delivery dispatch, in-store pickup, and cash settlement.

---

## 📁 System Architecture

```
restaurant-ordering-system/
  ├── flow-my-system/        # Business logic specifications & architecture diagrams
  │     ├── Actors.md        # Roles: Restaurant Admin, Customer, Delivery Staff
  │     ├── Order.md         # Order flow & pricing (Delivery vs Pickup)
  │     ├── Restaurant.md    # Kitchen preparation lifecycle
  │     ├── Delivery.md      # In-house delivery dispatch & cash collection (COD)
  │     ├── Customer.md      # Customer tracking progression
  │     ├── Money.md         # 100% direct revenue model (Zero 3rd-party commission)
  │     └── importain-cash.md# End-of-shift COD remittance & cash settlement
  │
  ├── backend/               # Pure PHP REST API (Runs via: php -S localhost:8000)
  │     ├── database/
  │     │     └── setup.php  # Self-contained MySQL migration & seed script
  │     ├── config/          # DB connection (PDO) & CORS configuration
  │     └── api/             # Endpoints: foods.php, orders.php, delivery.php, order-status.php
  │
  └── frontend/              # Next.js 14 + React + TypeScript + Tailwind CSS
        ├── app/page.tsx     # Customer menu browsing & checkout example
        ├── app/admin/       # Kitchen admin order management example
        ├── app/delivery/    # Delivery staff dispatch & cash collection example
        └── app/track/       # Live order timeline tracking example
```

---

## 🚀 Running on a Development Machine

### 1. Backend (PHP + MySQL)
1. Start **MySQL** in your environment (Port 3306).
2. In the `backend/` directory:
   ```bash
   cd backend
   # Setup database tables and seed initial data (Run once)
   php database/setup.php

   # Start built-in PHP server
   php -S localhost:8000
   ```

### 2. Frontend (Next.js)
In the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.
