<?php
// backend/database/seeder.php

/**
 * Seeds sample dummy data into database tables.
 * @param PDO $pdo
 */
function seedDatabase(PDO $pdo): void {
    echo "🌱 Seeding sample multi-tenant data...\n";

    // 1. Seed Multi-Tenant Restaurants
    $pdo->exec("INSERT IGNORE INTO restaurants (id, name, slug, logo_url, banner_url, address, lat, lng, phone, is_active) VALUES
        (1, 'Amber & Ember Woodfired Bistro', 'amber-ember-bistro', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600', '520 N Michigan Ave, Suite 14F, Siem Reap', 13.35227000, 103.95511600, '+855 23 888 999', 1),
        (2, 'Spice Route Artisan Grill', 'spice-route-grill', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=150', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', '188 Pub Street Promenade, Siem Reap', 13.35400000, 103.95800000, '+855 23 777 888', 1),
        (3, 'Phnom Penh Noodle House', 'phnom-penh-noodle-house', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=150', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', '42 Riverfront Boulevard, Siem Reap', 13.34800000, 103.95100000, '+855 23 666 555', 1)");

    // 2. Seed Users: Super Admin, Tenant Admins, Shared Delivery Riders, Customers
    $superPassword  = password_hash('admin123', PASSWORD_BCRYPT);
    $adminPassword  = password_hash('admin123', PASSWORD_BCRYPT);
    $driverPassword = password_hash('driver123', PASSWORD_BCRYPT);
    $custPassword   = password_hash('customer123', PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("INSERT IGNORE INTO users (id, name, phone, email, role, restaurant_id, password, avatar_url) VALUES
        (10, 'Super Platform Admin', '012000000', 'superadmin@system.com', 'super_admin', NULL, ?, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
        (1, 'Amber Bistro Owner (Admin)', '012111222', 'admin@restaurant.com', 'admin', 1, ?, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
        (5, 'Spice Route Owner (Admin)', '012222333', 'admin2@restaurant.com', 'admin', 2, ?, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'),
        (2, 'Liem Vance (Shared Courier)', '098333444', 'delivery1@restaurant.com', 'delivery', NULL, ?, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
        (3, 'David Chen (Shared Courier)', '099555666', 'delivery2@restaurant.com', 'delivery', NULL, ?, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
        (4, 'Sokha Seng (Shared Courier)', '099777888', 'delivery3@restaurant.com', 'delivery', NULL, ?, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150')");
    $stmt->execute([$superPassword, $adminPassword, $adminPassword, $driverPassword, $driverPassword, $driverPassword]);

    // Seed Courier Telemetry (Shared Fleet)
    $pdo->exec("INSERT IGNORE INTO courier_telemetry (id, user_id, vehicle_type, vehicle_label, lat, lng, speed_kmh, temp_celsius, status) VALUES
        (1, 2, 'motorbike', 'Motorbike #2 (CB150)', 13.35480000, 103.95850000, 28, 65, 'on_delivery'),
        (2, 3, 'motorbike', 'Motorbike #1', 13.34850000, 103.94800000, 24, 68, 'on_delivery'),
        (3, 4, 'e_scooter', 'E-Scooter #4', 13.35600000, 103.95200000, 22, 62, 'on_delivery')");

    // Seed Multi-Tenant Categories
    $pdo->exec("INSERT IGNORE INTO categories (id, restaurant_id, name, icon) VALUES
        (1, 1, 'Woodfired Burgers', 'sandwich'),
        (2, 1, 'Artisan Sides', 'drumstick'),
        (3, 2, 'Smoked BBQ & Wings', 'flame'),
        (4, 2, 'Craft Drinks', 'cup-soda'),
        (5, 3, 'Traditional Noodles', 'utensils'),
        (6, 3, 'Asian Sweets', 'cake')");

    // Seed Multi-Tenant Foods
    $pdo->exec("INSERT IGNORE INTO foods (id, restaurant_id, category_id, name, price, description, image_url, is_available, status) VALUES
        (1, 1, 1, 'Classic Double Cheeseburger', 4.50, 'Amber Bistro woodfired beef patties with extra cheddar', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', 1, 'public'),
        (2, 1, 1, 'Crispy Chicken Burger', 3.80, 'Crispy chicken fillet with spicy aioli', 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500', 1, 'public'),
        (3, 2, 3, 'Spicy Fried Chicken Wings (6pcs)', 4.20, 'Korean style spicy glaze wings from Spice Route', 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500', 1, 'public'),
        (4, 1, 2, 'French Fries (Large)', 2.00, 'Hand-cut russet fries with sea salt', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500', 1, 'public'),
        (5, 2, 4, 'Cold Craft Kola (Can)', 1.00, 'Ice cold handcrafted soda', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', 1, 'public'),
        (6, 3, 5, 'Phnom Penh Special Noodle Soup', 4.80, 'Rich pork broth with seafood and fresh herbs', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500', 1, 'public'),
        (7, 1, 1, 'Secret Chef Special Cake (Draft)', 5.00, 'Draft artisanal dessert', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', 1, 'draft')");

    // Seed Customers
    $custPassword = password_hash('customer123', PASSWORD_BCRYPT);
    $pdo->exec("INSERT IGNORE INTO users 
        (id, name, phone, email, role, password, customer_tag, primary_address, delivery_notes, preferred_channel, payment_preference) VALUES
        (101, 'David Chen', '+1 (555) 234-9912', 'david.chen@example.com', 'customer', '{$custPassword}', 'First Order', '520 N Michigan Ave, Apt 14F', 'Ring buzzer 14F on arrival. Prefers extra roasted aioli.', 'delivery', 'KHQR'),
        (102, 'Clara Oswald', '+1 (555) 604-3382', 'clara.oswald@example.com', 'customer', '{$custPassword}', 'Regular Guest', '182 W Superior St', 'Dressing on side for salads. Prefers express pickup.', 'pickup', 'Counter Cash'),
        (103, 'John Smith', '+1 (555) 382-9012', 'john.smith@example.com', 'customer', '{$custPassword}', '14th Order (VIP)', '742 Evergreen Terr, Apt 3B', 'Leave at front door, ring bell twice.', 'delivery', 'COD'),
        (104, 'Sophia Lin', '+1 (555) 492-1084', 'sophia.lin@example.com', 'customer', '{$custPassword}', 'Regular Guest', '101 E Ontario St', 'Allergic to peanuts.', 'pickup', 'Apple Pay'),
        (105, 'Marcus Vance', '+1 (555) 891-2240', 'marcus.vance@example.com', 'customer', '{$custPassword}', 'High Spend', '128 W Huron St, Suite 500', 'Leave with security guard.', 'delivery', 'Card'),
        (106, 'Amina Patel', '+1 (555) 773-4019', 'amina.patel@example.com', 'customer', '{$custPassword}', 'VIP', '401 N Wabash Ave, Apt 18A', 'Extra sauce.', 'delivery', 'Card'),
        (107, 'Elena Vance', '+1 (555) 301-4490', 'elena.vance@example.com', 'customer', '{$custPassword}', 'Guest', '333 N Dearborn St', 'Customer requested cancellation.', 'delivery', 'KHQR')");

    // Seed Orders
    $pdo->exec("INSERT IGNORE INTO orders 
        (id, order_number, user_id, customer_name, customer_phone, fulfillment_type, delivery_address, delivery_lat, delivery_lng, delivery_fee, food_amount, total_amount, amount_khr, payment_method, payment_status, payment_proof_url, payment_txn_ref, status, delivery_staff_id, notes, created_at) 
        VALUES
        (1, '#1024', 103, 'John Smith', '+1 (555) 382-9012', 'delivery', '742 Evergreen Terr, Apt 3B', 13.35950000, 103.96120000, 0.00, 34.50, 34.50, 138000, 'cod', 'pending', NULL, 'COD-PENDING-1', 'ready_for_delivery', 2, 'Door code #4910. Ring bell twice, leave on vestibule shelf if no answer.', DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
        (1026, '#1026', 101, 'David Chen', '+1 (555) 234-9912', 'delivery', '520 N Michigan Ave, Apt 14F', 13.35700000, 103.95900000, 0.00, 29.50, 29.50, 118000, 'khqr', 'verified', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW_nSl8ar5rgvxpgYec8c80SO7FC8JTpLhfNGATJtMEA&s=10', 'KHQR-889102', 'pending', NULL, 'Ring buzzer 14F on arrival', NOW()),
        (1025, '#1025', 102, 'Clara Oswald', '+1 (555) 604-3382', 'pickup', NULL, NULL, NULL, 0.00, 15.00, 15.00, 60000, 'counter_cash', 'pending', NULL, NULL, 'pending', NULL, 'Dressing on Side', NOW()),
        (1024, '#1024', 103, 'John Smith', '+1 (555) 382-9012', 'delivery', '742 Evergreen Terr, Apt 3B', 13.35950000, 103.96120000, 0.00, 34.50, 34.50, 138000, 'cod', 'pending', NULL, 'COD-PENDING-1', 'on_the_way', 2, 'Leave at front door, ring bell twice.', DATE_SUB(NOW(), INTERVAL 12 MINUTE)),
        (1027, '#1027', 107, 'Elena Vance', '+1 (555) 301-4490', 'delivery', '12 Riverside Promenade', 13.34520000, 103.94650000, 0.00, 62.00, 62.00, 248000, 'khqr', 'verified', NULL, 'KHQR-889127', 'on_the_way', 3, 'Crossing South Bridge', DATE_SUB(NOW(), INTERVAL 18 MINUTE)),
        (1023, '#1023', 104, 'Sophia Lin', '+1 (555) 492-1084', 'pickup', NULL, NULL, NULL, 0.00, 28.00, 28.00, 112000, 'khqr', 'verified', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop', 'APPLE-PAY-4401', 'ready_for_pickup', NULL, 'House BBQ Sauce', DATE_SUB(NOW(), INTERVAL 19 MINUTE)),
        (1022, '#1022', 105, 'Marcus Vance', '+1 (555) 891-2240', 'delivery', '128 W Huron St, Suite 500', 13.35500000, 103.95200000, 3.00, 38.20, 41.20, 164800, 'khqr', 'verified', 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500&auto=format&fit=crop', 'CARD-889105', 'on_the_way', 2, 'Leave at front desk', DATE_SUB(NOW(), INTERVAL 32 MINUTE)),
        (1021, '#1021', 106, 'Sophia Meng', '+1 (555) 773-4019', 'delivery', '88 Belmont St, Suite 12', 13.35820000, 103.95620000, 0.00, 69.00, 69.00, 276000, 'cod', 'pending', NULL, 'COD-889106', 'on_the_way', 4, 'At building entrance', DATE_SUB(NOW(), INTERVAL 8 MINUTE)),
        (1019, '#1019', 107, 'Elena Vance', '+1 (555) 301-4490', 'delivery', '333 N Dearborn St', 13.35000000, 103.95000000, 0.00, 38.50, 38.50, 154000, 'khqr', 'refunded', NULL, 'KHQR-REFUND-19', 'cancelled', NULL, 'Customer requested cancellation', DATE_SUB(NOW(), INTERVAL 72 MINUTE))");

    // Seed Order Items
    $pdo->exec("INSERT IGNORE INTO order_items (id, order_id, food_id, food_name, price, quantity, subtotal) VALUES
        (1, 1, 1, 'Smoked Bacon Truffle Burger', 11.25, 2, 22.50),
        (2, 1, 4, 'Artisan Rosemary Fries', 6.00, 1, 6.00),
        (3, 1, 5, 'Cold Craft Kola (Glass Bottles)', 3.00, 2, 6.00),
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

    // Seed User Saved Addresses
    $pdo->exec("INSERT IGNORE INTO user_addresses (id, user_id, label, address, lat, lng, tag, is_default) VALUES
        (1, 101, 'Home', '520 N Michigan Ave, Apt 14F', 13.354000, 103.956000, 'Default', 1),
        (2, 101, 'Work', '742 Evergreen Terrace, Suite 100', 13.358000, 103.960000, 'Office', 0),
        (3, 101, 'Partner\'s Place', '120 Broadway Ave, Apt 12', 13.349000, 103.951000, 'Home', 0)");

    // Seed Settings (General, Audio, Security, Telegram, Delivery)
    $pdo->exec("INSERT IGNORE INTO settings (setting_key, setting_value, setting_group) VALUES
        ('store_name', 'Bistro Kitchen HQ', 'general'),
        ('store_subtitle', 'Central Dispatch Hub', 'general'),
        ('store_phone', '+855 23 888 999', 'general'),
        ('store_address', '520 N Michigan Ave, Suite 14F', 'general'),
        ('store_latitude', '13.352270', 'delivery'),
        ('store_longitude', '103.955116', 'delivery'),
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