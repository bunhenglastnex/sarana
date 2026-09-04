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
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);
    echo "  ✅ Table 'order_items' ready.\n";
}
