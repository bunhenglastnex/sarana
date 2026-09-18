# 🗄️ Database Schema & Entity Relationship Analysis

**System:** Online Ordering System (Multi-Tenant Architecture)  
**Database Engine:** MySQL / InnoDB (utf8mb4)  
**Generated Date:** September 18, 2026  

---

## 📋 1. Database Overview & Summary Table

The database consists of **11 core tables** supporting multi-tenant food ordering, real-time driver telemetry, customer address books, line-item order tracking, settings, and audit logging.

| Table Name | Primary Key | Foreign Keys | Role / Purpose | Dependency Tier |
| :--- | :--- | :--- | :--- | :--- |
| [`restaurants`](#1-restaurants) | `id` | None | Multi-tenant restaurant entity profile | Tier 1 (Root Parent) |
| [`users`](#2-users) | `id` | `restaurant_id` | User accounts (Super Admin, Admin, Staff, Driver, Customer) | Tier 2 (Parent / Child) |
| [`categories`](#3-categories) | `id` | `restaurant_id` | Menu catalog categories per restaurant | Tier 2 (Child of Restaurants) |
| [`foods`](#4-foods) | `id` | `restaurant_id`, `category_id` | Food items / menu catalog items | Tier 3 (Child of Categories & Restaurants) |
| [`orders`](#5-orders) | `id` | `restaurant_id`, `user_id`, `delivery_staff_id` | Customer purchase orders & status state machine | Tier 3 (Child of Restaurants & Users) |
| [`order_items`](#6-order_items) | `id` | `order_id`, `food_id` | Line items snapshot inside an order | Tier 4 (Child of Orders & Foods) |
| [`user_addresses`](#7-user_addresses) | `id` | `user_id` | Saved delivery addresses per customer | Tier 3 (Child of Users) |
| [`courier_telemetry`](#8-courier_telemetry) | `id` | `user_id` (UNIQUE) | Real-time GPS & telemetry per delivery driver | Tier 3 (Child of Users - 1:1) |
| [`settings`](#9-settings) | `id` | `restaurant_id` (Logical) | Global & tenant key-value config | Independent / Tenant |
| [`system_logs`](#10-system_logs) | `id` | `user_id` (Logical) | Audit & error log trail | Independent / Audit |
| [`rate_limits`](#11-rate_limits) | `id` | None | Anti-spam & brute-force IP rate limiting | Independent / Security |

---

## 🔗 2. Full Entity Relationship (ER) Table

This table maps all Foreign Key relationships, cardinalities, constraints, and business logic across the database schema.

| Source Table (Child) | FK Field | Target Table (Parent) | PK Field | Relationship | Cardinality | On Delete Action | Business Logic & Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `users` | `restaurant_id` | `restaurants` | `id` | Many-to-One | `0..* : 0..1` | `SET NULL` | Associates admins & staff with their restaurant tenant. NULL for Super Admins & Customers. |
| `categories` | `restaurant_id` | `restaurants` | `id` | Many-to-One | `1..* : 1` | `CASCADE` | Groups categories under a specific restaurant tenant. Deleting restaurant wipes categories. |
| `foods` | `restaurant_id` | `restaurants` | `id` | Many-to-One | `1..* : 1` | `CASCADE` | Multi-tenant isolation for food catalog items. |
| `foods` | `category_id` | `categories` | `id` | Many-to-One | `0..* : 0..1` | `SET NULL` | Categorizes food items. Unassigned items set to NULL if category is deleted. |
| `orders` | `restaurant_id` | `restaurants` | `id` | Many-to-One | `0..* : 0..1` | `SET NULL` | Links order to target restaurant. Retains order history if restaurant record is removed. |
| `orders` | `user_id` | `users` | `id` | Many-to-One | `0..* : 0..1` | `SET NULL` | Links order to registered customer account. NULL for guest checkout orders. |
| `orders` | `delivery_staff_id` | `users` | `id` | Many-to-One | `0..* : 0..1` | `SET NULL` | Assigns courier/driver (`role='delivery'`) to deliver the order. |
| `order_items` | `order_id` | `orders` | `id` | Many-to-One | `1..* : 1` | `CASCADE` | Line items composing an order. Wiped when parent order is deleted. |
| `order_items` | `food_id` | `foods` | `id` | Many-to-One | `0..* : 0..1` | `SET NULL` | References catalog food. Keeps historical item snapshots (`food_name`, `price`) intact. |
| `user_addresses` | `user_id` | `users` | `id` | Many-to-One | `1..* : 1` | `CASCADE` | Saved customer delivery locations. Wiped when customer account is deleted. |
| `courier_telemetry` | `user_id` | `users` | `id` | One-to-One | `0..1 : 1` | `CASCADE` | Live GPS location, speed, temperature & vehicle data per active driver. |
| `settings` | `restaurant_id` | `restaurants` | `id` | Logical | `0..* : 0..1` | None | Key-value system config (`restaurant_id` NULL = Global system setting). |
| `system_logs` | `user_id` | `users` | `id` | Logical | `0..* : 0..1` | None | Audit log actor tracking. Preserved even if user accounts change. |

---

## 🎨 3. Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    restaurants ||--o{ users : "staff/admins"
    restaurants ||--{ categories : "owns"
    restaurants ||--{ foods : "offers"
    restaurants ||--o{ orders : "receives"

    categories ||--o{ foods : "classifies"

    users ||--o{ orders : "places (customer)"
    users ||--o{ orders : "delivers (courier)"
    users ||--{ user_addresses : "saves"
    users ||--o| courier_telemetry : "tracks (1:1)"

    orders ||--|{ order_items : "contains"
    foods ||--o{ order_items : "referenced in"
```

---

## 📑 4. Detailed Table Definitions & Structure

### 1. `restaurants`
- **Purpose:** Central entity for multi-tenant support.
- **Columns:**
  - `id` (INT, PK, AUTO_INCREMENT)
  - `name` (VARCHAR 150, NOT NULL)
  - `slug` (VARCHAR 150, NOT NULL, UNIQUE)
  - `logo_url` (VARCHAR 255, NULL)
  - `banner_url` (VARCHAR 255, NULL)
  - `address` (TEXT, NULL)
  - `lat` (DECIMAL 10,8, NULL)
  - `lng` (DECIMAL 11,8, NULL)
  - `phone` (VARCHAR 30, NULL)
  - `is_active` (TINYINT 1, DEFAULT 1)
  - `owner_admin_id` (INT, NULL)
  - `created_at` / `updated_at` (TIMESTAMP)

### 2. `users`
- **Purpose:** User management for system roles (`super_admin`, `admin`, `staff`, `delivery`, `customer`).
- **Columns:**
  - `id` (INT, PK, AUTO_INCREMENT)
  - `name` (VARCHAR 100, NOT NULL)
  - `phone` (VARCHAR 20, NOT NULL, UNIQUE)
  - `email` (VARCHAR 100, NULL)
  - `avatar_url` (VARCHAR 255, NULL)
  - `role` (ENUM: `super_admin`, `admin`, `staff`, `delivery`, `customer`)
  - `restaurant_id` (INT, FK -> `restaurants.id` ON DELETE SET NULL)
  - `created_by` (INT, NULL)
  - `password` (VARCHAR 255, NOT NULL)
  - `telegram_chat_id` / `telegram_username` (VARCHAR)
  - `status` (ENUM: `active`, `inactive`)
  - `customer_tag` (ENUM: `VIP`, `Regular`, `High Spend`, `New`)
  - `primary_address` (TEXT, NULL)
  - `delivery_notes` (TEXT, NULL)
  - `preferred_channel` (ENUM: `delivery`, `pickup`)
  - `payment_preference` (VARCHAR 50)
  - `created_at` / `updated_at` (TIMESTAMP)

### 3. `categories`
- **Purpose:** Organization of menu items by category (e.g. Drinks, Burgers, Desserts).
- **Columns:**
  - `id` (INT, PK, AUTO_INCREMENT)
  - `restaurant_id` (INT, NOT NULL, FK -> `restaurants.id` ON DELETE CASCADE)
  - `name` (VARCHAR 100, NOT NULL)
  - `slug` (VARCHAR 100, NULL)
  - `icon` (VARCHAR 50, DEFAULT 'utensils')
  - `image_url` (VARCHAR 255, NULL)
  - `description` (TEXT, NULL)
  - `sort_order` (INT, DEFAULT 0)
  - `created_at` (TIMESTAMP)

### 4. `foods`
- **Purpose:** Food items catalog with price, inventory stock, options JSON, badges, and prep time.
- **Columns:**
  - `id` (INT, PK, AUTO_INCREMENT)
  - `restaurant_id` (INT, NOT NULL, FK -> `restaurants.id` ON DELETE CASCADE)
  - `category_id` (INT, NULL, FK -> `categories.id` ON DELETE SET NULL)
  - `name` (VARCHAR 150, NOT NULL)
  - `slug` (VARCHAR 150, NULL)
  - `price` (DECIMAL 8,2, NOT NULL)
  - `description` (TEXT, NULL)
  - `image_url` (VARCHAR 255, NULL)
  - `badge_text` (VARCHAR 50, NULL)
  - `badge_type` (VARCHAR 20, DEFAULT 'chef')
  - `is_top_seller` (TINYINT 1, DEFAULT 0)
  - `prep_time_minutes` (INT, DEFAULT 15)
  - `options` (JSON, NULL)
  - `stock_quantity` (INT, DEFAULT 50)
  - `is_featured` (TINYINT 1, DEFAULT 0)
  - `is_available` (TINYINT 1, DEFAULT 1)
  - `status` (ENUM: `public`, `draft`)
  - `created_at` (TIMESTAMP)

### 5. `orders`
- **Purpose:** Customer purchase order lifecycle, fulfillment type, amounts (USD & KHR), KHQR payment status, driver assignment.
- **Columns:**
  - `id` (INT, PK, AUTO_INCREMENT)
  - `restaurant_id` (INT, NULL, FK -> `restaurants.id` ON DELETE SET NULL)
  - `order_number` (VARCHAR 50, NOT NULL, UNIQUE)
  - `user_id` (INT, NULL, FK -> `users.id` ON DELETE SET NULL)
  - `customer_name` (VARCHAR 100, NOT NULL)
  - `customer_phone` (VARCHAR 20, NOT NULL)
  - `telegram_chat_id` (VARCHAR 50, NULL)
  - `fulfillment_type` (ENUM: `delivery`, `pickup`)
  - `delivery_address` (TEXT, NULL)
  - `delivery_lat` / `delivery_lng` (DECIMAL)
  - `delivery_fee` (DECIMAL 8,2, DEFAULT 0.00)
  - `delivery_staff_id` (INT, NULL, FK -> `users.id` ON DELETE SET NULL)
  - `pickup_time` (VARCHAR 50, NULL)
  - `food_amount` (DECIMAL 8,2, NOT NULL)
  - `total_amount` (DECIMAL 8,2, NOT NULL)
  - `amount_khr` (INT, DEFAULT 0)
  - `payment_method` (ENUM: `cash_on_delivery`, `cash_at_counter`, `khqr`, `cod`, `counter_cash`)
  - `payment_status` (ENUM: `pending`, `pending_review`, `paid`, `verified`, `rejected`, `failed`, `flagged`, `refunded`)
  - `payment_proof_url` (VARCHAR 255, NULL)
  - `payment_txn_ref` (VARCHAR 100, NULL)
  - `status` (ENUM: `pending`, `accepted`, `preparing`, `ready_for_pickup`, `ready_for_delivery`, `on_the_way`, `completed`, `delivered`, `cancelled`)
  - `notes` (TEXT, NULL)
  - `created_at` / `updated_at` (TIMESTAMP)

### 6. `order_items`
- **Purpose:** Specific items breakdown purchased inside an order with custom notes and price snapshots.
- **Columns:**
  - `id` (INT, PK, AUTO_INCREMENT)
  - `order_id` (INT, NOT NULL, FK -> `orders.id` ON DELETE CASCADE)
  - `food_id` (INT, NULL, FK -> `foods.id` ON DELETE SET NULL)
  - `food_name` (VARCHAR 150, NOT NULL)
  - `price` (DECIMAL 8,2, NOT NULL)
  - `quantity` (INT, NOT NULL)
  - `subtotal` (DECIMAL 8,2, NOT NULL)
  - `image_url` (VARCHAR 255, NULL)
  - `notes` (TEXT, NULL)

### 7. `user_addresses`
- **Purpose:** Saved address book entries per customer for quick delivery checkout.
- **Columns:**
  - `id` (INT, PK, AUTO_INCREMENT)
  - `user_id` (INT, NOT NULL, FK -> `users.id` ON DELETE CASCADE)
  - `label` (VARCHAR 100, NOT NULL)
  - `address` (TEXT, NOT NULL)
  - `lat` / `lng` (DECIMAL, NULL)
  - `tag` (VARCHAR 50, DEFAULT 'Home')
  - `is_default` (TINYINT 1, DEFAULT 0)
  - `created_at` / `updated_at` (DATETIME)

### 8. `courier_telemetry`
- **Purpose:** Real-time driver location, vehicle info, speed, temperature, and delivery availability.
- **Columns:**
  - `id` (INT, PK, AUTO_INCREMENT)
  - `user_id` (INT, NOT NULL, UNIQUE, FK -> `users.id` ON DELETE CASCADE)
  - `vehicle_type` (VARCHAR 50, DEFAULT 'motorbike')
  - `vehicle_label` (VARCHAR 100, DEFAULT 'Motorbike #1')
  - `lat` / `lng` (DECIMAL 10,8 / 11,8)
  - `speed_kmh` (INT, DEFAULT 0)
  - `temp_celsius` (INT, DEFAULT 65)
  - `status` (ENUM: `active`, `on_delivery`, `idle`, `offline`)
  - `created_at` / `updated_at` (TIMESTAMP)

### 9. `settings`
- **Purpose:** System parameters, KHQR payment keys, store configuration.
- **Columns:** `id`, `restaurant_id` (Indexed), `setting_key`, `setting_value`, `setting_group`, `updated_at`.

### 10. `system_logs`
- **Purpose:** Audit logging for system activity, login attempts, security events.
- **Columns:** `id`, `action`, `category`, `level`, `description`, `user_id`, `user_name`, `ip_address`, `user_agent`, `created_at`.

### 11. `rate_limits`
- **Purpose:** Rate limiting & brute-force IP locking.
- **Columns:** `id`, `ip_address`, `action`, `attempts`, `last_attempt_at`, `locked_until`. (UNIQUE INDEX: `ip_address`, `action`).

---

## ⚡ 5. Execution & Migration Dependency Order

To satisfy foreign key constraint dependencies, database tables must be created and migrated in the following strict order:

```txt
1. restaurants           (Root Parent)
2. users                 (Parent of Addresses, Telemetry, Orders; Child of Restaurants)
3. categories            (Child of Restaurants)
4. foods                 (Child of Restaurants & Categories)
5. orders                (Child of Restaurants & Users)
6. order_items           (Child of Orders & Foods)
7. user_addresses        (Child of Users)
8. courier_telemetry     (Child of Users)
9. system_logs           (Independent / Audit)
10. rate_limits          (Independent / Security)
11. settings             (Independent / Config)
```
