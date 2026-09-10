<?php
// backend/database/tables/foods.php

/**
 * Creates the 'foods' table with full UI attribute support.
 * @param PDO $pdo
 */
function createFoodsTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS foods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT NOT NULL DEFAULT 1,
        category_id INT NULL,
        name VARCHAR(150) NOT NULL,
        slug VARCHAR(150) NULL,
        price DECIMAL(8,2) NOT NULL,
        description TEXT NULL,
        image_url VARCHAR(255) NULL,
        badge_text VARCHAR(50) NULL,
        badge_type VARCHAR(20) DEFAULT 'chef',
        is_top_seller TINYINT(1) DEFAULT 0,
        prep_time_minutes INT DEFAULT 15,
        options JSON NULL,
        stock_quantity INT DEFAULT 50,
        is_featured TINYINT(1) DEFAULT 0,
        is_available TINYINT(1) DEFAULT 1,
        status ENUM('public', 'draft') DEFAULT 'public',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Migration helpers for existing database tables
    $alters = [
        "ALTER TABLE foods ADD COLUMN restaurant_id INT NOT NULL DEFAULT 1 AFTER id",
        "ALTER TABLE foods ADD COLUMN slug VARCHAR(150) NULL AFTER name",
        "ALTER TABLE foods ADD COLUMN badge_text VARCHAR(50) NULL AFTER image_url",
        "ALTER TABLE foods ADD COLUMN badge_type VARCHAR(20) DEFAULT 'chef' AFTER badge_text",
        "ALTER TABLE foods ADD COLUMN is_top_seller TINYINT(1) DEFAULT 0 AFTER badge_type",
        "ALTER TABLE foods ADD COLUMN prep_time_minutes INT DEFAULT 15 AFTER is_top_seller",
        "ALTER TABLE foods ADD COLUMN options JSON NULL AFTER prep_time_minutes",
        "ALTER TABLE foods ADD COLUMN stock_quantity INT DEFAULT 50 AFTER options",
        "ALTER TABLE foods ADD COLUMN is_featured TINYINT(1) DEFAULT 0 AFTER stock_quantity",
        "ALTER TABLE foods ADD COLUMN status ENUM('public', 'draft') DEFAULT 'public' AFTER is_available"
    ];

    foreach ($alters as $q) {
        try {
            $pdo->exec($q);
        } catch (PDOException $e) {}
    }

    echo "  ✅ Table 'foods' ready (with Multi-Tenant, Badges, Prep Time, Options JSON & Stock Control).\n";
}
