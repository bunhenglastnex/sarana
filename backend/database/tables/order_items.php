<?php
// backend/database/tables/order_items.php

/**
 * Creates the 'order_items' table.
 * @param PDO $pdo
 */
function createOrderItemsTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        food_id INT NULL,
        food_name VARCHAR(150) NOT NULL,
        price DECIMAL(8,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal DECIMAL(8,2) NOT NULL,
        image_url VARCHAR(255) NULL,
        notes TEXT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Migration helpers for existing tables
    $alters = [
        "ALTER TABLE order_items ADD COLUMN image_url VARCHAR(255) NULL AFTER subtotal",
        "ALTER TABLE order_items ADD COLUMN notes TEXT NULL AFTER image_url"
    ];

    foreach ($alters as $q) {
        try {
            $pdo->exec($q);
        } catch (PDOException $e) {}
    }

    echo "  ✅ Table 'order_items' ready (with Thumbnail & Notes support).\n";
}
