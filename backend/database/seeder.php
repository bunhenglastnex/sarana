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
        (101, 'David Chen', '+1 (555) 234-9912', 'david.chen@example.com', 'customer', '{$custPassword}', 'VIP', '520 N Michigan Ave, Apt 14F, Chicago, IL 60611', 'Ring buzzer 14F on arrival. Prefers extra roasted aioli.', 'delivery', 'KHQR'),
        (102, 'Clara Oswald', '+1 (555) 604-3382', 'clara.oswald@example.com', 'customer', '{$custPassword}', 'Regular', '182 W Superior St, Chicago, IL 60654', 'Dressing on side for salads. Prefers express pickup.', 'pickup', 'KHQR / Cash'),
        (103, 'Marcus Vance', '+1 (555) 891-2240', 'marcus.vance@example.com', 'customer', '{$custPassword}', 'High Spend', '128 W Huron St, Suite 500, Chicago, IL 60654', 'Leave at front desk with security guard.', 'delivery', 'KHQR'),
        (104, 'Sophia Lin', '+1 (555) 492-1084', 'sophia.lin@example.com', 'customer', '{$custPassword}', 'New', '742 Evergreen Terr, Apt 3B, Chicago, IL 60654', 'Allergic to peanuts.', 'pickup', 'KHQR'),
        (105, 'Alex Rivera', '+1 (555) 382-9012', 'alex.rivera@example.com', 'customer', '{$custPassword}', 'Regular', '401 N Wabash Ave, Apt 18A, Chicago, IL 60611', 'Extra spicy sauce on all burgers.', 'delivery', 'KHQR'),
        (106, 'Julian Thorne', '+1 (555) 773-4019', 'julian.thorne@example.com', 'customer', '{$custPassword}', 'VIP', '333 N Dearborn St, Chicago, IL 60654', 'Prefers well-done steak / ribeye slices.', 'pickup', 'KHQR')");

    // Seed Orders
    $pdo->exec("INSERT IGNORE INTO orders 
        (id, order_number, user_id, customer_name, customer_phone, fulfillment_type, delivery_address, delivery_fee, food_amount, total_amount, payment_method, payment_status, payment_proof_url, status, delivery_staff_id, notes, created_at) 
        VALUES
        (1082, '#1082', 101, 'David Chen', '+1 (555) 234-9912', 'delivery', '520 N Michigan Ave, Apt 14F, Chicago, IL 60611', 2.00, 39.50, 41.50, 'khqr', 'paid', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10', 'completed', 2, 'Ring buzzer 14F on arrival. Prefers extra roasted aioli.', NOW()),
        (1026, '#1026', 101, 'David Chen', '+1 (555) 234-9912', 'delivery', '520 N Michigan Ave, Apt 14F, Chicago, IL 60611', 2.00, 27.50, 29.50, 'khqr', 'paid', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500', 'completed', 2, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),
        (0998, '#0998', 101, 'David Chen', '+1 (555) 234-9912', 'delivery', '520 N Michigan Ave, Apt 14F, Chicago, IL 60611', 2.00, 36.00, 38.00, 'cod', 'paid', NULL, 'completed', 2, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
        (1081, '#1081', 102, 'Clara Oswald', '+1 (555) 604-3382', 'pickup', NULL, 0.00, 28.00, 28.00, 'counter_cash', 'paid', NULL, 'completed', NULL, 'Will pickup at 12:30 PM', NOW()),
        (1084, '#1084', 103, 'Marcus Vance', '+1 (555) 891-2240', 'delivery', '128 W Huron St, Suite 500, Chicago, IL 60654', 2.00, 21.00, 23.00, 'khqr', 'paid', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500', 'completed', 2, 'Leave at front desk', NOW()),
        (1079, '#1079', 104, 'Sophia Lin', '+1 (555) 492-1084', 'delivery', '742 Evergreen Terr, Apt 3B, Chicago, IL 60654', 2.00, 29.00, 31.00, 'khqr', 'pending', NULL, 'preparing', NULL, 'Allergic to peanuts', NOW()),
        (1080, '#1080', 105, 'Alex Rivera', '+1 (555) 382-9012', 'delivery', '401 N Wabash Ave, Apt 18A, Chicago, IL 60611', 2.00, 21.50, 23.50, 'khqr', 'paid', 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500', 'on_the_way', 2, 'Extra spicy', NOW()),
        (1078, '#1078', 106, 'Julian Thorne', '+1 (555) 773-4019', 'pickup', NULL, 0.00, 27.00, 27.00, 'khqr', 'paid', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10', 'completed', NULL, 'Well done', NOW())");

    // Seed Order Items
    $pdo->exec("INSERT IGNORE INTO order_items (id, order_id, food_id, food_name, price, quantity, subtotal) VALUES
        (10, 1082, 1, 'Smoked Angus Burger', 14.50, 2, 29.00),
        (11, 1082, 4, 'Truffle Fries', 12.50, 1, 12.50),
        (12, 1026, 2, 'Smoked Ribs Platter', 24.50, 1, 24.50),
        (13, 1026, 5, 'Kola', 3.00, 1, 3.00),
        (14, 0998, 1, 'Ember Smash Sliders', 12.00, 3, 36.00),
        (15, 1081, 2, 'Woodfire Crispy Chicken Platter', 14.00, 2, 28.00),
        (16, 1084, 1, 'Hearth Angus Burger', 14.50, 1, 14.50),
        (17, 1084, 4, 'Truffle Fries', 8.50, 1, 8.50),
        (18, 1079, 1, 'Hearth Bacon Burger', 18.00, 1, 18.00),
        (19, 1079, 4, 'Sweet Potato Chips', 11.00, 1, 11.00),
        (20, 1080, 1, 'Amber Signature Smoked Burger', 23.50, 1, 23.50),
        (21, 1078, 2, 'Charred Ribeye Slices', 27.00, 1, 27.00)");

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
