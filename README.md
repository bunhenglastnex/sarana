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

## 🚀 Running Frontend & Backend with ONE Command

### ⚡ Quick Start (Single Command)

From the project root directory (`D:\learning\Sarana\Online-Ordering`):

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

---

### 🛠️ Individual Commands

- **Setup Database**: `npm run setup:db` *(or `php backend/database/setup.php`)*
- **Start Backend Only**: `npm run backend` *(or `php -S localhost:8000 -t backend`)*
- **Start Frontend Only**: `npm run frontend` *(or `npm run dev --prefix frontend`)*
- **Start Telegram Bot Listener**: `npm run telegram:poll` *(or `php backend/telegram-poll.php`)*
