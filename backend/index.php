<?php
// backend/index.php
// API Welcome & Documentation Route

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    'project' => 'Single Restaurant Online Ordering API (Cash Only)',
    'version' => '1.0.0',
    'status' => 'running',
    'database_setup' => 'Run `php database/setup.php` or visit http://localhost:8000/database/setup.php',
    'endpoints' => [
        'GET  /database/setup.php' => 'Initialize MySQL database, tables & seed initial data',
        'GET  /api/foods.php'       => 'Fetch food items and categories',
        'POST /api/foods.php'       => 'Add new food item (Admin)',
        'GET  /api/orders.php'      => 'List all orders (filter by status, fulfillment_type)',
        'POST /api/orders.php'      => 'Create new order (supports delivery & pickup, cash only)',
        'PATCH /api/order-status.php'=> 'Update order status (accepted, preparing, ready_for_pickup, ready_for_delivery, completed)',
        'GET  /api/delivery.php'    => 'List orders assigned/ready for delivery staff + Cash in hand summary',
        'POST /api/delivery.php'    => 'Delivery actions: pickup_from_kitchen or confirm_delivered'
    ],
    'fulfillment_types' => [
        'delivery' => 'Delivery fee: $2.00 | Payment: cash_on_delivery',
        'pickup'   => 'Delivery fee: $0.00 | Payment: cash_at_counter'
    ]
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
