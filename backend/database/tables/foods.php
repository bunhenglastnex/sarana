<?php
// backend/database/tables/foods.php

/**
 * Creates the 'foods' table.
 * @param PDO $pdo
 */
function createFoodsTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS foods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NULL,
        name VARCHAR(150) NOT NULL,
        price DECIMAL(8,2) NOT NULL,
        description TEXT NULL,
        image_url VARCHAR(255) NULL,
        is_available TINYINT(1) DEFAULT 1,
        status ENUM('public', 'draft') DEFAULT 'public',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Migration helper: add 'status' column if table already exists without it
    try {
        $pdo->exec("ALTER TABLE foods ADD COLUMN status ENUM('public', 'draft') DEFAULT 'public' AFTER is_available;");
    } catch (PDOException $e) {
        // Column likely already exists, ignore
    }

    echo "  ✅ Table 'foods' ready.\n";
}
