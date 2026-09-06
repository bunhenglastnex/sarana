<?php
// backend/database/tables/orders.php

/**
 * Creates the 'orders' table.
 * @param PDO $pdo
 */
function createOrdersTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        user_id INT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        telegram_chat_id VARCHAR(50) NULL,
        fulfillment_type ENUM('delivery', 'pickup') NOT NULL DEFAULT 'delivery',
        
        -- Delivery details
        delivery_address TEXT NULL,
        delivery_fee DECIMAL(8,2) DEFAULT 0.00,
        delivery_staff_id INT NULL,
        
        -- Pickup details
        pickup_time VARCHAR(50) NULL,

        -- Amounts
        food_amount DECIMAL(8,2) NOT NULL,
        total_amount DECIMAL(8,2) NOT NULL,
        amount_khr INT DEFAULT 0,

        -- Payment method & status
        payment_method ENUM('cash_on_delivery', 'cash_at_counter', 'khqr', 'cod', 'counter_cash') NOT NULL DEFAULT 'cash_on_delivery',
        payment_status ENUM('pending', 'pending_review', 'paid', 'verified', 'rejected', 'failed', 'flagged', 'refunded') DEFAULT 'pending',
        payment_proof_url VARCHAR(255) NULL,
        payment_txn_ref VARCHAR(100) NULL,

        -- Order status
        status ENUM(
            'pending',
            'accepted',
            'preparing',
            'ready_for_pickup',
            'ready_for_delivery',
            'on_the_way',
            'completed',
            'delivered',
            'cancelled'
        ) DEFAULT 'pending',

        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (delivery_staff_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Safely add columns if table already existed without them
    $alterQueries = [
        "ALTER TABLE orders ADD COLUMN user_id INT NULL AFTER order_number",
        "ALTER TABLE orders ADD COLUMN telegram_chat_id VARCHAR(50) NULL AFTER customer_phone",
        "ALTER TABLE orders ADD COLUMN amount_khr INT DEFAULT 0 AFTER total_amount",
        "ALTER TABLE orders ADD COLUMN payment_proof_url VARCHAR(255) NULL AFTER payment_status",
        "ALTER TABLE orders ADD COLUMN payment_txn_ref VARCHAR(100) NULL AFTER payment_proof_url",
        "ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cash_on_delivery', 'cash_at_counter', 'khqr', 'cod', 'counter_cash') NOT NULL DEFAULT 'cash_on_delivery'",
        "ALTER TABLE orders MODIFY COLUMN payment_status ENUM('pending', 'pending_review', 'paid', 'verified', 'rejected', 'failed', 'flagged', 'refunded') DEFAULT 'pending'",
        "ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'accepted', 'preparing', 'ready_for_pickup', 'ready_for_delivery', 'on_the_way', 'completed', 'delivered', 'cancelled') DEFAULT 'pending'"
    ];

    foreach ($alterQueries as $q) {
        try {
            $pdo->exec($q);
        } catch (PDOException $e) {
            // Ignore if column/enum value already exists
        }
    }

    echo "  ✅ Table 'orders' ready (with Payment, KHQR, Telegram & Driver support).\n";
}
