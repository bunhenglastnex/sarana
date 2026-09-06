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
        slug VARCHAR(100) NULL,
        icon VARCHAR(50) DEFAULT 'utensils',
        image_url VARCHAR(255) NULL,
        description TEXT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Migration helper for existing tables
    $alters = [
        "ALTER TABLE categories ADD COLUMN slug VARCHAR(100) NULL AFTER name",
        "ALTER TABLE categories ADD COLUMN image_url VARCHAR(255) NULL AFTER icon",
        "ALTER TABLE categories ADD COLUMN description TEXT NULL AFTER image_url",
        "ALTER TABLE categories ADD COLUMN sort_order INT DEFAULT 0 AFTER description"
    ];

    foreach ($alters as $q) {
        try {
            $pdo->exec($q);
        } catch (PDOException $e) {}
    }

    echo "  ✅ Table 'categories' ready (with Slug, Image & Sort Order).\n";
}
