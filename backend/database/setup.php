<?php
// backend/database/setup.php
// Script to automatically create database, tables, and seed dummy data.
// Run via CLI: php database/setup.php
// Or via Browser: http://localhost:8000/database/setup.php

$isCli = php_sapi_name() === 'cli';
if (!$isCli) {
    header("Content-Type: text/plain; charset=UTF-8");
}

$host = '127.0.0.1';
$port = '3306';
$user = 'root';
$pass = '';

echo "===========================================\n";
echo "🚀 Restaurant System DB Migration & Seeder\n";
echo "===========================================\n\n";

try {
    // 1. Connect to MySQL server
    $pdo = new PDO("mysql:host=$host;port=$port", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Create Database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS restaurant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE restaurant_db");
    echo "✅ Database 'restaurant_db' checked/created.\n";

    // 3. Create Table: users (Admin, Staff, Delivery Rider, Customer)
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(100) NULL,
        role ENUM('admin', 'staff', 'delivery', 'customer') DEFAULT 'customer',
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "✅ Table 'users' ready.\n";

    // 4. Create Table: categories
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50) DEFAULT 'utensils',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "✅ Table 'categories' ready.\n";

    // 5. Create Table: foods
    $pdo->exec("CREATE TABLE IF NOT EXISTS foods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NULL,
        name VARCHAR(150) NOT NULL,
        price DECIMAL(8,2) NOT NULL,
        description TEXT NULL,
        image_url VARCHAR(255) NULL,
        is_available TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "✅ Table 'foods' ready.\n";

    // 6. Create Table: orders
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        fulfillment_type ENUM('delivery', 'pickup') NOT NULL,
        
        -- បើជា Delivery
        delivery_address TEXT NULL,
        delivery_fee DECIMAL(8,2) DEFAULT 0.00,
        delivery_staff_id INT NULL,
        
        -- បើជា Pickup
        pickup_time VARCHAR(50) NULL,

        -- គណនាតម្លៃ
        food_amount DECIMAL(8,2) NOT NULL,
        total_amount DECIMAL(8,2) NOT NULL,

        -- វិធីបង់ប្រាក់ (Cash Only: COD ឬ Pay at Counter)
        payment_method ENUM('cash_on_delivery', 'cash_at_counter') NOT NULL,
        payment_status ENUM('pending', 'paid') DEFAULT 'pending',

        -- ស្ថានភាព Order
        status ENUM(
            'pending',
            'accepted',
            'preparing',
            'ready_for_pickup',
            'ready_for_delivery',
            'on_the_way',
            'completed',
            'cancelled'
        ) DEFAULT 'pending',

        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (delivery_staff_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "✅ Table 'orders' ready.\n";

    // 7. Create Table: order_items
    $pdo->exec("CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        food_id INT NULL,
        food_name VARCHAR(150) NOT NULL,
        price DECIMAL(8,2) NOT NULL,
        quantity INT NOT NULL,
        subtotal DECIMAL(8,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "✅ Table 'order_items' ready.\n\n";

    // -------------------------------------------------------------
    // SEED DUMMY DATA
    // -------------------------------------------------------------
    echo "🌱 Seeding sample data...\n";

    // Seed Users: Admin, Staff, Delivery Rider
    $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
    $driverPassword = password_hash('driver123', PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("INSERT IGNORE INTO users (id, name, phone, email, role, password) VALUES
        (1, 'Restaurant Admin', '012111222', 'admin@restaurant.com', 'admin', ?),
        (2, 'Vanna Delivery', '098333444', 'delivery1@restaurant.com', 'delivery', ?),
        (3, 'Sokha Delivery', '099555666', 'delivery2@restaurant.com', 'delivery', ?)");
    $stmt->execute([$adminPassword, $driverPassword, $driverPassword]);

    // Seed Categories (Using Lucide Icon Names)
    $pdo->exec("INSERT IGNORE INTO categories (id, name, icon) VALUES
        (1, 'Burgers & Sandwiches', 'sandwich'),
        (2, 'Fried Chicken & Sides', 'drumstick'),
        (3, 'Beverages & Soft Drinks', 'cup-soda'),
        (4, 'Desserts & Sweets', 'cake')");

    // Seed Foods
    $pdo->exec("INSERT IGNORE INTO foods (id, category_id, name, price, description, image_url, is_available) VALUES
        (1, 1, 'Classic Double Cheeseburger', 4.50, 'សាច់គោ ២ បន្ទះ ឈីសក្រាស់ និងបន្លែស្រស់', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', 1),
        (2, 1, 'Crispy Chicken Burger', 3.80, 'សាច់មាន់បំពងស្រួយ ទឹកជ្រលក់ហឹរតិចៗ', 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500', 1),
        (3, 2, 'Spicy Fried Chicken Wings (6pcs)', 4.20, 'ស្លាបមាន់បំពងហឹរបែបកូរ៉េ', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500', 1),
        (4, 2, 'French Fries (Large)', 2.00, 'ដំឡូងបារាំងបំពងស្រួយជាមួយទឹកប៉េងប៉ោះ', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500', 1),
        (5, 3, 'Coca Cola Original (Can)', 1.00, 'កូកាកូឡាត្រជាក់ស្រស់ស្រាយ', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', 1),
        (6, 3, 'Iced Lemon Green Tea', 1.50, 'តែបៃតងក្រូចឆ្មាផ្អែមត្រជាក់', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', 1)");

    // Seed Orders: 1 Delivery order ready for delivery, 1 Pickup order preparing
    $pdo->exec("INSERT IGNORE INTO orders 
        (id, order_number, customer_name, customer_phone, fulfillment_type, delivery_address, delivery_fee, food_amount, total_amount, payment_method, payment_status, status, delivery_staff_id, notes) 
        VALUES
        (1, 'ORD-1001', 'Dara Roth', '012999888', 'delivery', 'House #12, St 210, Toul Kork, Phnom Penh', 2.00, 9.00, 11.00, 'cash_on_delivery', 'pending', 'ready_for_delivery', 2, 'Please ring bell upon arrival'),
        (2, 'ORD-1002', 'Kanha Seng', '088777666', 'pickup', NULL, 0.00, 4.50, 4.50, 'cash_at_counter', 'pending', 'preparing', NULL, 'Will pickup at 12:30 PM')");

    // Seed Order Items for Order #1
    $pdo->exec("INSERT IGNORE INTO order_items (id, order_id, food_id, food_name, price, quantity, subtotal) VALUES
        (1, 1, 1, 'Classic Double Cheeseburger', 4.50, 2, 9.00),
        (2, 2, 1, 'Classic Double Cheeseburger', 4.50, 1, 4.50)");

    echo "✅ Seed Data inserted successfully!\n";
    echo "\n🎉 ALL DONE! Your database is completely ready.\n";

} catch (PDOException $e) {
    echo "\n❌ Database Error: " . $e->getMessage() . "\n";
}
