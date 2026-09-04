<?php
// backend/index.php
// API Welcome & Documentation Route

require_once __DIR__ . '/config/response.php';

jsonResponse(1, 'Single Restaurant Online Ordering API (Cash Only)', [
    'project' => 'Single Restaurant Online Ordering API (Cash Only)',
    'version' => '1.0.0',
    'status' => 'running',
    'endpoints' => [
        'GET  /database/setup.php'    => 'Initialize MySQL database, tables & seed initial data',
        'GET  /api/foods.php'         => 'Fetch food items and categories',
        'POST /api/foods.php'         => 'Add new food item (Admin)',
        'GET  /api/orders.php'        => 'List all orders (filter by status, fulfillment_type)',
        'POST /api/orders.php'        => 'Create new order (supports delivery & pickup, cash only)',
        'PATCH /api/order-status.php' => 'Update order status',
        'GET  /api/delivery.php'      => 'List orders assigned/ready for delivery staff',
        'POST /api/delivery.php'      => 'Delivery actions (pickup, confirm delivered)',
        'POST /api/telegram-link.php'  => 'Link customer phone to Telegram Bot chat_id',
        'POST /api/telegram-webhook.php' => 'Telegram Bot Webhook endpoint'
    ]
]);

