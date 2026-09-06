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
        stock_quantity INT DEFAULT 50,
        is_featured TINYINT(1) DEFAULT 0,
        is_available TINYINT(1) DEFAULT 1,
        status ENUM('public', 'draft') DEFAULT 'public',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Migration helpers for existing tables
    $alters = [
        "ALTER TABLE foods ADD COLUMN stock_quantity INT DEFAULT 50 AFTER image_url",
        "ALTER TABLE foods ADD COLUMN is_featured TINYINT(1) DEFAULT 0 AFTER stock_quantity",
        "ALTER TABLE foods ADD COLUMN status ENUM('public', 'draft') DEFAULT 'public' AFTER is_available"
    ];

    foreach ($alters as $q) {
        try {
            $pdo->exec($q);
        } catch (PDOException $e) {}
    }

    echo "  ✅ Table 'foods' ready (with Stock Quantity & Category linking).\n";
}
