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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);
    echo "  ✅ Table 'foods' ready.\n";
}
