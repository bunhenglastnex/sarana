<?php
// backend/database/tables/restaurants.php

/**
 * Creates the 'restaurants' table.
 * @param PDO $pdo
 */
function createRestaurantsTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS restaurants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        slug VARCHAR(150) NOT NULL UNIQUE,
        logo_url VARCHAR(255) NULL,
        banner_url VARCHAR(255) NULL,
        address TEXT NULL,
        lat DECIMAL(10,8) NULL,
        lng DECIMAL(11,8) NULL,
        phone VARCHAR(30) NULL,
        is_active TINYINT(1) DEFAULT 1,
        owner_admin_id INT NULL,
        delivery_radius_km DECIMAL(5,2) DEFAULT 5.00,
        allow_delivery TINYINT(1) DEFAULT 1,
        allow_pickup TINYINT(1) DEFAULT 1,
        min_order_amount DECIMAL(8,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Safely add columns if table already existed without them
    $alters = [
        "ALTER TABLE restaurants ADD COLUMN logo_url VARCHAR(255) NULL AFTER slug",
        "ALTER TABLE restaurants ADD COLUMN banner_url VARCHAR(255) NULL AFTER logo_url",
        "ALTER TABLE restaurants ADD COLUMN address TEXT NULL AFTER banner_url",
        "ALTER TABLE restaurants ADD COLUMN lat DECIMAL(10,8) NULL AFTER address",
        "ALTER TABLE restaurants ADD COLUMN lng DECIMAL(11,8) NULL AFTER lat",
        "ALTER TABLE restaurants ADD COLUMN phone VARCHAR(30) NULL AFTER lng",
        "ALTER TABLE restaurants ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER phone",
        "ALTER TABLE restaurants ADD COLUMN owner_admin_id INT NULL AFTER is_active",
        "ALTER TABLE restaurants ADD COLUMN delivery_radius_km DECIMAL(5,2) DEFAULT 5.00 AFTER owner_admin_id",
        "ALTER TABLE restaurants ADD COLUMN allow_delivery TINYINT(1) DEFAULT 1 AFTER delivery_radius_km",
        "ALTER TABLE restaurants ADD COLUMN allow_pickup TINYINT(1) DEFAULT 1 AFTER allow_delivery",
        "ALTER TABLE restaurants ADD COLUMN min_order_amount DECIMAL(8,2) DEFAULT 0.00 AFTER allow_pickup"
    ];

    foreach ($alters as $q) {
        try {
            $pdo->exec($q);
        } catch (PDOException $e) {}
    }

    echo "  ✅ Table 'restaurants' ready.\n";
}
