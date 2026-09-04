<?php
// backend/database/tables/categories.php

/**
 * Creates the 'categories' table.
 * @param PDO $pdo
 */
function createCategoriesTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50) DEFAULT 'utensils',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);
    echo "  ✅ Table 'categories' ready.\n";
}
