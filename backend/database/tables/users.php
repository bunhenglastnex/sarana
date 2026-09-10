<?php
// backend/database/tables/users.php

/**
 * Creates the 'users' table.
 * @param PDO $pdo
 */
function createUsersTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(100) NULL,
        avatar_url VARCHAR(255) NULL,
        role ENUM('super_admin', 'admin', 'staff', 'delivery', 'customer') DEFAULT 'customer',
        restaurant_id INT NULL,
        created_by INT NULL,
        password VARCHAR(255) NOT NULL,
        telegram_chat_id VARCHAR(50) NULL,
        telegram_username VARCHAR(100) NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Migration alters
    $alters = [
        "ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'staff', 'delivery', 'customer') DEFAULT 'customer'",
        "ALTER TABLE users ADD COLUMN restaurant_id INT NULL AFTER role",
        "ALTER TABLE users ADD COLUMN created_by INT NULL AFTER restaurant_id",
        "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL AFTER email",
        "ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR(50) NULL",
        "ALTER TABLE users ADD COLUMN telegram_username VARCHAR(100) NULL",
        "ALTER TABLE users ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'",
        "ALTER TABLE users ADD COLUMN customer_tag ENUM('VIP', 'Regular', 'High Spend', 'New') DEFAULT 'New'",
        "ALTER TABLE users ADD COLUMN primary_address TEXT NULL",
        "ALTER TABLE users ADD COLUMN delivery_notes TEXT NULL",
        "ALTER TABLE users ADD COLUMN preferred_channel ENUM('delivery', 'pickup') DEFAULT 'delivery'",
        "ALTER TABLE users ADD COLUMN payment_preference VARCHAR(50) DEFAULT 'KHQR'"
    ];

    foreach ($alters as $q) {
        try {
            $pdo->exec($q);
        } catch (PDOException $e) {}
    }

    echo "  ✅ Table 'users' ready (with Super Admin, Multi-Tenant & Customer Profile support).\n";
}

