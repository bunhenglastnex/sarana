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
        role ENUM('admin', 'staff', 'delivery', 'customer') DEFAULT 'customer',
        password VARCHAR(255) NOT NULL,
        telegram_chat_id VARCHAR(50) NULL,
        telegram_username VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Safely add columns if table already existed
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR(50) NULL");
    } catch (PDOException $e) {}

    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN telegram_username VARCHAR(100) NULL");
    } catch (PDOException $e) {}

    echo "  ✅ Table 'users' ready (with Telegram integration).\n";
}
