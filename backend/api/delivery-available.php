<?php
// backend/api/delivery-available.php
// Public Feed Endpoint for Available Kitchen Dispatch Orders (/delivery)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}

try {
    $pdo = getDB();

    // Fetch Store HQ coordinates & info
    $settingsStmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
    $rawSettings = $settingsStmt ? $settingsStmt->fetchAll(PDO::FETCH_KEY_PAIR) : [];

    $storeConfig = [
        'name'     => $rawSettings['store_name'] ?? $rawSettings['storeName'] ?? 'Store HQ',
        'subtitle' => str_replace(' · Phnom Penh', '', $rawSettings['store_subtitle'] ?? 'Central Dispatch Hub'),
        'address'  => str_replace(', Phnom Penh', '', $rawSettings['store_address'] ?? $rawSettings['storeAddress'] ?? 'Main Store Address'),
        'lat'      => isset($rawSettings['store_latitude']) && $rawSettings['store_latitude'] !== ''
            ? (float)$rawSettings['store_latitude']
            : (isset($rawSettings['store_lat']) && $rawSettings['store_lat'] !== ''
                ? (float)$rawSettings['store_lat']
                : 13.352270),
        'lng'      => isset($rawSettings['store_longitude']) && $rawSettings['store_longitude'] !== ''
            ? (float)$rawSettings['store_longitude']
            : (isset($rawSettings['store_lng']) && $rawSettings['store_lng'] !== ''
                ? (float)$rawSettings['store_lng']
                : 103.955116),
    ];

    // Select available unassigned delivery tickets
    $stmt = $pdo->prepare("
        SELECT o.*
        FROM orders o
        WHERE o.fulfillment_type = 'delivery'
          AND o.delivery_staff_id IS NULL
          AND o.status IN ('pending', 'preparing', 'ready_for_delivery')
        ORDER BY FIELD(o.status, 'ready_for_delivery', 'preparing', 'pending'), o.id DESC
    ");
    $stmt->execute();
    $orders = $stmt->fetchAll();

    foreach ($orders as &$order) {
        $order['id'] = (int)$order['id'];
        $order['total_amount'] = (float)$order['total_amount'];
        $order['store'] = $storeConfig;

        $itemStmt = $pdo->prepare("
            SELECT oi.id, oi.food_id, oi.food_name, oi.price, oi.quantity, oi.subtotal, f.image_url 
            FROM order_items oi
            LEFT JOIN foods f ON oi.food_id = f.id
            WHERE oi.order_id = ?
        ");
        $itemStmt->execute([$order['id']]);
        $order['items'] = $itemStmt->fetchAll();
    }

    jsonResponse(1, 'Available delivery orders fetched successfully', [
        'store'  => $storeConfig,
        'count'  => count($orders),
        'orders' => $orders,
    ]);
} catch (PDOException $e) {
    jsonResponse(0, 'Failed to fetch available delivery orders: ' . $e->getMessage(), null, 500);
}
