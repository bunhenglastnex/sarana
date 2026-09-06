---
name: backend-db-management
description: Detailed workflow for analyzing entity relationships, creating PHP PDO table migration files, updating setup.php in dependency order, seeding test data, and syncing system documentation. Use whenever working on backend database tables or entity schemas.
---

# 🗄️ Backend Database & Entity Relationship Workflow

This skill guides AI agents and developers when analyzing entity relationships and creating/modifying database tables in the **Online Ordering System** (`backend/database/`).

---

## 1. Entity & Relationship Analysis Guidelines

Before writing SQL or PHP migration files, analyze the target entity using this process:

### A. Identify Fields & Data Types
- Primary key: `id INT AUTO_INCREMENT PRIMARY KEY`
- Foreign keys: `<entity>_id INT NULL` or `NOT NULL`
- Enums / Statuses: `ENUM(...) DEFAULT '...'`
- Timestamps: `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

### B. Foreign Key Constraint Rules
- **`ON DELETE CASCADE`**: Use when child items cannot exist without parent (e.g., `order_items.order_id -> orders.id`).
- **`ON DELETE SET NULL`**: Use when historical records should remain intact if a user/staff is deleted (e.g., `orders.user_id -> users.id` or `orders.delivery_staff_id -> users.id`).

### C. Execution Dependency Rules
- Always create **Parent Tables** before **Child Tables** that reference them:
  1. `users`, `categories` (Independent parents)
  2. `foods` (Depends on `categories`)
  3. `orders` (Depends on `users`)
  4. `order_items` (Depends on `orders` and `foods`)

---

## 2. Table Creation Standard (`backend/database/tables/`)

Each database table must be defined in its own file under `backend/database/tables/<table_name>.php`.

### File Template:
```php
<?php
// backend/database/tables/<table_name>.php

/**
 * Creates the '<table_name>' table.
 * @param PDO $pdo
 */
function create<TableName>Table(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS <table_name> (
        id INT AUTO_INCREMENT PRIMARY KEY,
        -- fields...
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Add columns safely if table already exists
    try {
        $pdo->exec("ALTER TABLE <table_name> ADD COLUMN new_column VARCHAR(100) NULL");
    } catch (PDOException $e) {}

    echo "  ✅ Table '<table_name>' ready.\n";
}
```

---

## 3. Registering in `backend/database/setup.php`

1. Require the new table file at the top of `backend/database/setup.php`:
   ```php
   require_once __DIR__ . '/tables/<table_name>.php';
   ```
2. Call the creation function inside the `try` block in correct dependency order:
   ```php
   createUsersTable($pdo);
   createCategoriesTable($pdo);
   createFoodsTable($pdo);
   createOrdersTable($pdo);
   createOrderItemsTable($pdo);
   create<TableName>Table($pdo); // Parent tables first, child tables after
   ```

---

## 4. Seeding Test Data (`backend/database/seeder.php`)

Add dummy records for testing to `seedDatabase(PDO $pdo)` in `backend/database/seeder.php` to enable instant testing upon execution.

---

## 5. Verification & Execution Command

Run the database setup script in your shell or browser:
```bash
php backend/database/setup.php
```

---

## 6. Sync Documentation (`flow-my-system/`)

After updating database schemas:
1. Update entity specifications in relevant `flow-my-system/*.md` files (e.g., `Order.md`, `Customer.md`, `Delivery.md`, `Money.md`).
2. Mark completed tasks in `flow-my-system/Agent-Tasks.md`.
