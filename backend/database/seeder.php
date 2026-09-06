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
    $pdo->exec("INSERT IGNORE INTO foods (id, category_id, name, price, description, image_url, is_available, status) VALUES
        (1, 1, 'Classic Double Cheeseburger', 4.50, 'សាច់គោ ២ បន្ទះ ឈីសក្រាស់ និងបន្លែស្រស់', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', 1, 'public'),
        (2, 1, 'Crispy Chicken Burger', 3.80, 'សាច់មាន់បំពងស្រួយ ទឹកជ្រលក់ហឹរតិចៗ', 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500', 1, 'public'),
        (3, 2, 'Spicy Fried Chicken Wings (6pcs)', 4.20, 'ស្លាបមាន់បំពងហឹរបែបកូរ៉េ', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500', 1, 'public'),
        (4, 2, 'French Fries (Large)', 2.00, 'ដំឡូងបារាំងបំពងស្រួយជាមួយទឹកប៉េងប៉ោះ', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500', 1, 'public'),
        (5, 3, 'Coca Cola Original (Can)', 1.00, 'កូកាកូឡាត្រជាក់ស្រស់ស្រាយ', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', 1, 'public'),
        (6, 3, 'Iced Lemon Green Tea', 1.50, 'តែបៃតងក្រូចឆ្មាផ្អែមត្រជាក់', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', 1, 'public'),
        (7, 4, 'Secret Chef Special Cake (Draft)', 5.00, 'នំខេកពិសេសលួចធ្វើថ្មី', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', 1, 'draft')");

    // Seed Customers
    $custPassword = password_hash('customer123', PASSWORD_BCRYPT);
    $pdo->exec("INSERT IGNORE INTO users 
        (id, name, phone, email, role, password, customer_tag, primary_address, delivery_notes, preferred_channel, payment_preference) VALUES
        (101, 'David Chen', '+1 (555) 234-9912', 'david.chen@example.com', 'customer', '{$custPassword}', 'First Order', '520 N Michigan Ave, Apt 14F, Chicago, IL 60611', 'Ring buzzer 14F on arrival. Prefers extra roasted aioli.', 'delivery', 'KHQR'),
        (102, 'Clara Oswald', '+1 (555) 604-3382', 'clara.oswald@example.com', 'customer', '{$custPassword}', 'Regular Guest', '182 W Superior St, Chicago, IL 60654', 'Dressing on side for salads. Prefers express pickup.', 'pickup', 'Counter Cash'),
        (103, 'John Smith', '+1 (555) 382-9012', 'john.smith@example.com', 'customer', '{$custPassword}', '14th Order (VIP)', '742 Evergreen Terr, Apt 3B, River North, Chicago, IL 60654', 'Leave at front door, ring bell twice.', 'delivery', 'COD'),
        (104, 'Sophia Lin', '+1 (555) 492-1084', 'sophia.lin@example.com', 'customer', '{$custPassword}', 'Regular Guest', '101 E Ontario St, Chicago, IL 60611', 'Allergic to peanuts.', 'pickup', 'Apple Pay'),
        (105, 'Marcus Vance', '+1 (555) 891-2240', 'marcus.vance@example.com', 'customer', '{$custPassword}', 'High Spend', '128 W Huron St, Suite 500, Chicago, IL 60654', 'Leave with security guard.', 'delivery', 'Card'),
        (106, 'Amina Patel', '+1 (555) 773-4019', 'amina.patel@example.com', 'customer', '{$custPassword}', 'VIP', '401 N Wabash Ave, Apt 18A, Chicago, IL 60611', 'Extra sauce.', 'delivery', 'Card'),
        (107, 'Elena Vance', '+1 (555) 301-4490', 'elena.vance@example.com', 'customer', '{$custPassword}', 'Guest', '333 N Dearborn St, Chicago, IL 60654', 'Customer requested cancellation.', 'delivery', 'KHQR')");

    // Seed Orders
    $pdo->exec("INSERT IGNORE INTO orders 
        (id, order_number, user_id, customer_name, customer_phone, fulfillment_type, delivery_address, delivery_fee, food_amount, total_amount, amount_khr, payment_method, payment_status, payment_proof_url, payment_txn_ref, status, delivery_staff_id, notes, created_at) 
        VALUES
        (1026, '#1026', 101, 'David Chen', '+1 (555) 234-9912', 'delivery', '520 N Michigan Ave, Apt 14F, Chicago, IL 60611', 0.00, 29.50, 29.50, 118000, 'khqr', 'verified', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10', 'KHQR-889102', 'pending', NULL, 'Ring buzzer 14F on arrival', NOW()),
        (1025, '#1025', 102, 'Clara Oswald', '+1 (555) 604-3382', 'pickup', NULL, 0.00, 15.00, 15.00, 60000, 'counter_cash', 'pending', NULL, NULL, 'pending', NULL, 'Dressing on Side', NOW()),
        (1024, '#1024', 103, 'John Smith', '+1 (555) 382-9012', 'delivery', '742 Evergreen Terr, Apt 3B, River North, Chicago, IL 60654', 0.00, 34.50, 34.50, 138000, 'cod', 'pending', NULL, 'COD-PENDING-1', 'preparing', 2, 'Leave at front door, ring bell twice.', DATE_SUB(NOW(), INTERVAL 12 MINUTE)),
        (1023, '#1023', 104, 'Sophia Lin', '+1 (555) 492-1084', 'pickup', NULL, 0.00, 28.00, 28.00, 112000, 'khqr', 'verified', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop', 'APPLE-PAY-4401', 'ready_for_pickup', NULL, 'House BBQ Sauce', DATE_SUB(NOW(), INTERVAL 19 MINUTE)),
        (1022, '#1022', 105, 'Marcus Vance', '+1 (555) 891-2240', 'delivery', '128 W Huron St, Suite 500, Chicago, IL 60654', 3.00, 38.20, 41.20, 164800, 'khqr', 'verified', 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500&auto=format&fit=crop', 'CARD-889105', 'on_the_way', 2, 'Leave at front desk', DATE_SUB(NOW(), INTERVAL 32 MINUTE)),
        (1021, '#1021', 106, 'Amina Patel', '+1 (555) 773-4019', 'delivery', '401 N Wabash Ave, Apt 18A, Chicago, IL 60611', 0.00, 24.00, 24.00, 96000, 'khqr', 'verified', NULL, 'CARD-889106', 'delivered', 2, 'Delivered to front desk', DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
        (1019, '#1019', 107, 'Elena Vance', '+1 (555) 301-4490', 'delivery', '333 N Dearborn St, Chicago, IL 60654', 0.00, 38.50, 38.50, 154000, 'khqr', 'refunded', NULL, 'KHQR-REFUND-19', 'cancelled', NULL, 'Customer requested cancellation due to address change & item sold out.', DATE_SUB(NOW(), INTERVAL 72 MINUTE))");

    // Seed Order Items
    $pdo->exec("INSERT IGNORE INTO order_items (id, order_id, food_id, food_name, price, quantity, subtotal) VALUES
        (101, 1026, 1, 'Smoked Angus Burger', 11.50, 2, 23.00),
        (102, 1026, 4, 'Truffle Parmesan Fries', 6.50, 1, 6.50),
        (103, 1025, 2, 'Woodfire Burrata Salad', 15.00, 1, 15.00),
        (104, 1024, 1, 'Smoked Bacon Truffle Burger', 11.25, 2, 22.50),
        (105, 1024, 4, 'Artisan Rosemary Fries', 6.00, 1, 6.00),
        (106, 1024, 5, 'Cold Craft Kola (Glass Bottles)', 3.00, 2, 6.00),
        (107, 1023, 2, 'Woodfire Smoked Ribs Platter', 28.00, 1, 28.00),
        (108, 1022, 1, 'Ember Smash Sliders', 11.00, 3, 33.00),
        (109, 1022, 4, 'Sweet Potato Chips', 5.20, 1, 5.20),
        (110, 1021, 3, 'Charred Ember Wings', 12.00, 2, 24.00),
        (111, 1019, 2, 'Hearth-Smoked Angus Ribs', 32.00, 1, 32.00),
        (112, 1019, 4, 'Truffle Parmesan Fries', 6.50, 1, 6.50)");

    // Seed Settings (General, Audio, Security, Telegram, Delivery)
    $pdo->exec("INSERT IGNORE INTO settings (setting_key, setting_value, setting_group) VALUES
        ('store_name', 'Amber & Ember Bistro', 'general'),
        ('store_phone', '+855 23 888 999', 'general'),
        ('store_address', '520 N Michigan Ave, Suite 14F, Phnom Penh', 'general'),
        ('opening_time', '10:00', 'general'),
        ('closing_time', '22:00', 'general'),
        ('tax_rate', '9.25', 'general'),
        ('enable_audio_chimes', 'true', 'audio'),
        ('chime_tone', 'Classic Bistro Bell', 'audio'),
        ('chime_repeat_count', '5', 'audio'),
        ('volume_level', '100%', 'audio'),
        ('telegram_bot_username', 'bunheng1dev_bot', 'telegram'),
        ('telegram_notify_new_order', 'true', 'telegram'),
        ('max_delivery_radius_km', '7.5', 'delivery'),
        ('base_delivery_fee', '1.5', 'delivery'),
        ('base_included_km', '3.0', 'delivery'),
        ('extra_fee_per_km', '0.5', 'delivery'),
        ('free_delivery_min_subtotal', '25.0', 'delivery')");

    echo "  ✅ Sample data seeded successfully!\n";
}
