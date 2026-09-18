# 🔄 System Flow Architecture & User Journey Guide

**System:** Online Ordering System (Multi-Tenant Real-Time Platform)  
**Roles Supported:** Customer, Restaurant Admin / Kitchen Staff, Delivery Driver, Super Admin  
**Draw.io Diagram File:** 🎨 [`SYSTEM_FLOW_ARCHITECTURE.drawio`](file:///d:/learning/Sarana/Online-Ordering/SYSTEM_FLOW_ARCHITECTURE.drawio)  
**Last Updated:** September 18, 2026  

---

## 🗺️ 1. Master System Flow Diagram (Mermaid)

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    actor K as Kitchen / Restaurant Admin
    actor D as Delivery Staff
    actor SA as Super Admin
    participant FE as Frontend (Next.js 14)
    participant BE as Backend API (PHP REST)
    participant DB as Database (MySQL)
    participant RT as Real-time Broadcaster

    %% 1. Browse & Auth Flow
    rect rgb(240, 248, 255)
    Note over C, FE: Phase 1: Browse Catalog & Authentication
    C->>FE: 1. Browse Menu & Select Food Items
    C->>FE: 2. Click "Add to Cart" / "Checkout"
    FE->>FE: 3. Check Auth Token / Login Session
    alt Not Logged In
        FE-->>C: Prompt Login / Quick Registration Modal
        C->>FE: Input Phone Number & Password
        FE->>BE: POST /api/auth/login.php
        BE->>DB: Verify User Credentials & Role ('customer')
        BE-->>FE: Return JWT / Session Token
    end
    end

    %% 2. Checkout & Order Placement Flow
    rect rgb(245, 255, 250)
    Note over C, BE: Phase 2: Checkout & Order Placement
    C->>FE: 4. Select Delivery / Pickup & Payment Method (KHQR / COD)
    FE->>BE: 5. POST /api/orders.php (Order Payload)
    BE->>DB: 6. Insert Into 'orders' & 'order_items' (Transaction)
    BE->>RT: 7. Broadcast Event ('new-order')
    RT-->>FE: 8. Real-time Sound Alert & Banner on Kitchen App
    BE-->>FE: 9. Return Order Confirmation (#1001)
    end

    %% 3. Kitchen Processing Flow
    rect rgb(255, 250, 240)
    Note over K, RT: Phase 3: Kitchen Order Acceptance & Prep
    K->>FE: 10. Click [ Accept Order ]
    FE->>BE: 11. PATCH /api/order-status.php (Status: 'accepted')
    BE->>DB: Update orders.status = 'accepted'
    BE->>RT: Broadcast Event ('order-updated') -> Customer
    RT-->>FE: Update Progress Bar on Customer Screen
    K->>FE: 12. Mark [ Preparing ] -> [ Ready for Delivery ]
    FE->>BE: 13. PATCH /api/order-status.php (Status: 'ready_for_delivery')
    BE->>RT: Broadcast Event ('delivery-dispatch') -> Driver App
    end

    %% 4. Delivery & GPS Telemetry Flow
    rect rgb(255, 240, 245)
    Note over D, C: Phase 4: Delivery Dispatch & Live GPS Telemetry
    D->>FE: 14. View Available Orders & Tap [ Accept / Pickup ]
    FE->>BE: 15. POST /api/delivery.php (Assign Driver ID)
    D->>FE: 16. Tap [ Start Delivery ] (Status: 'on_the_way')
    loop Live Telemetry (Every 5 sec)
        D->>BE: POST /api/telemetry.php (Lat, Lng, Speed)
        BE->>DB: Update 'courier_telemetry' Table
        BE->>RT: Broadcast Live Coordinates -> Customer Map
    end
    D->>C: 17. Arrive at Customer Address & Collect COD Cash ($12.00)
    D->>FE: 18. Tap [ Confirm Delivered ]
    FE->>BE: 19. POST /api/delivery-confirm.php
    BE->>DB: Update orders.status = 'delivered', payment_status = 'paid'
    BE->>RT: Broadcast Event ('order-completed') -> Customer & Kitchen
    RT-->>FE: Customer Screen: "Order Completed! 🎉"
    end

    %% 5. Admin & Super Admin Monitoring
    rect rgb(248, 248, 255)
    Note over SA, DB: Phase 5: Super Admin Platform Oversight
    SA->>FE: 20. View Multi-tenant Dashboard, Telemetry & Audit Logs
    FE->>BE: GET /api/admin/system_logs.php & rate_limits.php
    BE-->>FE: Return Tenant Performance & Audit Reports
    end
```

---

## 👥 2. Detailed Role-by-Role User Flow Architecture

### 1. 👤 CUSTOMER USER FLOW

```txt
[ Enter Website / App ]
          │
          ▼
[ Browse Restaurants & Food Catalog ]
  - Filter by Category (Drinks, Burgers, Desserts)
  - View Price, Badges (Top Seller, Chef Special), Prep Time
          │
          ▼
[ Select Food Item & Options ]
  - Choose Custom Options (Spice level, Extra toppings JSON)
  - Click "Add to Cart" or "Buy Now"
          │
          ▼
[ 🔐 AUTHENTICATION CHECK ]
  ├── IF LOGGED IN: Proceed directly to Cart / Checkout
  └── IF NOT LOGGED IN:
        - Show Quick Login / Phone Registration Modal
        - Authenticate via POST /api/auth/login.php
        - Rate Limit Protection active via `rate_limits` table
          │
          ▼
[ Cart & Fulfillment Selection ]
  ├── 🛍️ PICKUP (Takeaway):
  │     - Select Pickup Time
  │     - Delivery Fee: $0.00
  │     - Payment: Cash at Counter / KHQR
  │
  └── 🚚 DELIVERY (Home Delivery):
        - Choose saved address from `user_addresses` or Pin Map (Lat/Lng)
        - Calculates Total: Food Amount + Delivery Fee (USD & KHR)
        - Payment: Cash on Delivery (COD) / Bakong KHQR Scan
          │
          ▼
[ Submit Order ] ──> System creates Order record in DB
          │
          ▼
[ 📊 Real-Time Order Tracker Screen ]
  - Live Animated Progress Bar:
    [Placing] ➔ [Accepted] ➔ [Preparing] ➔ [Ready] ➔ [On The Way 🛵] ➔ [Completed 🎉]
  - Interactive Map showing live Driver GPS location (powered by `courier_telemetry`)
```

---

### 2. 🏪 RESTAURANT KITCHEN & ADMIN FLOW

```txt
[ Kitchen Dashboard Active ] (Listening to WebSocket / SSE Channel)
          │
          ▼
[ 🔔 REAL-TIME ORDER ALERT ]
  - Loud Chime Audio Sound Alert + Visual Banner Modal
  - Shows: Items list, Custom Notes, Customer Name, Phone, Delivery/Pickup
          │
          ▼
[ Review Order Action ]
  ├── ❌ REJECT ORDER ──> Update status to 'cancelled' ➔ Refund/Notify Customer
  └── ✅ ACCEPT ORDER ──> Update status to 'accepted' ➔ Trigger Customer Notification
          │
          ▼
[ Kitchen Cooking Phase ]
  - Admin changes status to 'preparing'
  - Chef cooks food items
          │
          ▼
[ Food Preparation Ready ]
  ├── FOR PICKUP:
  │     - Mark status as 'ready_for_pickup'
  │     - Customer arrives at counter ➔ Pays cash ➔ Admin taps [ Complete Order ]
  │
  └── FOR DELIVERY:
        - Mark status as 'ready_for_delivery'
        - Triggers Broadcast Event 'delivery-dispatch' to Driver Dashboard
```

---

### 3. 🚚 DELIVERY DRIVER / COURIER FLOW

```txt
[ Driver Login ] ──> Role: `delivery`
          │
          ▼
[ Delivery Job Dashboard ]
  - Filters and displays orders with Status = `ready_for_delivery`
  - Shows Delivery Address, Customer Phone, Cash To Collect (COD Amount)
          │
          ▼
[ Tap: "Accept & Pickup Order" ]
  - Assigns `orders.delivery_staff_id = driver_id`
  - Driver picks up packed food from restaurant kitchen
          │
          ▼
[ Tap: "Start Delivery" ]
  - Updates `orders.status = 'on_the_way'`
  - Sets `courier_telemetry.status = 'on_delivery'`
  - Background GPS sends Lat/Lng updates to `courier_telemetry` table
          │
          ▼
[ Travel to Customer Address ]
  - Real-time GPS location streams to Customer's tracking map
          │
          ▼
[ Handover Food & Collect Cash (COD) ]
  - Hand over food package
  - Collect exact cash (e.g., $12.00 USD / 49,000 KHR)
          │
          ▼
[ Tap: "Confirm Delivered" ]
  - System sets `orders.status = 'delivered'`, `orders.payment_status = 'paid'`
  - Updates driver status to `active` / `idle`
  - System logs cash in driver's hand for daily shift settlement with store cashier
```

---

### 4. ⚙️ RESTAURANT ADMIN & 🛡️ SUPER ADMIN FLOW

#### A. 🏪 Restaurant Admin (Tenant Level)
1. **Catalog Management:** Add/Edit/Delete food items (`foods`), categories (`categories`), stock quantities, badges, options.
2. **Order Management:** Filter orders by status, view daily revenue (USD / KHR), review KHQR payment receipts.
3. **Driver Cash Settlement:** Verify Cash on Delivery (COD) collected by drivers at the end of each shift.
4. **Store Configuration:** Customize store logo, address, coordinates, and operating hours in `settings`.

#### B. 🛡️ Super Admin (Platform Level)
1. **Multi-Tenant Operations:** Register new restaurants (`restaurants`), assign tenant admin users (`users` with `role='admin'`).
2. **Fleet Telemetry Monitoring:** View live GPS tracking map of all delivery drivers on duty (`courier_telemetry`).
3. **Security & Rate Limits:** Monitor brute-force protection and IP locking logs (`rate_limits`).
4. **Audit Logs & Analytics:** Inspect full system audit logs (`system_logs`) for error diagnostics and administrative compliance.

---

## 💾 3. Database State Machine Transitions

| Order State | Triggered By | API Endpoint | DB Table Updated | Real-time Event |
| :--- | :--- | :--- | :--- | :--- |
| `pending` | Customer | `POST /api/orders.php` | `orders.status = 'pending'` | `new-order` |
| `accepted` | Kitchen Admin | `PATCH /api/order-status.php` | `orders.status = 'accepted'` | `order-updated` |
| `preparing` | Kitchen Chef | `PATCH /api/order-status.php` | `orders.status = 'preparing'` | `order-updated` |
| `ready_for_pickup` | Kitchen Staff | `PATCH /api/order-status.php` | `orders.status = 'ready_for_pickup'` | `order-updated` |
| `ready_for_delivery`| Kitchen Staff | `PATCH /api/order-status.php` | `orders.status = 'ready_for_delivery'`| `delivery-dispatch` |
| `on_the_way` | Delivery Driver | `POST /api/delivery.php` | `orders.status = 'on_the_way'` | `driver-location` |
| `delivered` | Delivery Driver | `POST /api/delivery-confirm.php`| `orders.status = 'delivered'` | `order-completed` |
| `completed` | Counter Cashier | `PATCH /api/order-status.php` | `orders.status = 'completed'` | `order-completed` |
| `cancelled` | Admin / Customer | `PATCH /api/order-status.php` | `orders.status = 'cancelled'` | `order-cancelled` |
