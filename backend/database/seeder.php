<?php
// backend/database/seeder.php

/**
 * Seeds sample dummy data into database tables.
 * @param PDO $pdo
 */
function seedDatabase(PDO $pdo): void {
    echo "🌱 Seeding sample data...\n";

    // Seed Users: Admin, Staff, Delivery Rider
    $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
    $driverPassword = password_hash('driver123', PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("INSERT IGNORE INTO users (id, name, phone, email, role, password) VALUES
        (1, 'Restaurant Admin', '012111222', 'admin@restaurant.com', 'admin', ?),
        (2, 'Vanna Delivery', '098333444', 'delivery1@restaurant.com', 'delivery', ?),
        (3, 'Sokha Delivery', '099555666', 'delivery2@restaurant.com', 'delivery', ?)");
    $stmt->execute([$adminPassword, $driverPassword, $driverPassword]);

    // Seed Categories
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

    // Seed Orders
    $pdo->exec("INSERT IGNORE INTO orders 
        (id, order_number, customer_name, customer_phone, fulfillment_type, delivery_address, delivery_fee, food_amount, total_amount, payment_method, payment_status, status, delivery_staff_id, notes) 
        VALUES
        (1, 'ORD-1001', 'Dara Roth', '012999888', 'delivery', 'House #12, St 210, Toul Kork, Phnom Penh', 2.00, 9.00, 11.00, 'cash_on_delivery', 'pending', 'ready_for_delivery', 2, 'Please ring bell upon arrival'),
        (2, 'ORD-1002', 'Kanha Seng', '088777666', 'pickup', NULL, 0.00, 4.50, 4.50, 'cash_at_counter', 'pending', 'preparing', NULL, 'Will pickup at 12:30 PM')");

    // Seed Order Items
    $pdo->exec("INSERT IGNORE INTO order_items (id, order_id, food_id, food_name, price, quantity, subtotal) VALUES
        (1, 1, 1, 'Classic Double Cheeseburger', 4.50, 2, 9.00),
        (2, 2, 1, 'Classic Double Cheeseburger', 4.50, 1, 4.50)");

    echo "  ✅ Sample data seeded successfully!\n";
}
