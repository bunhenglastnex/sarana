<?php
// backend/api/delivery-my-deliveries.php
// Authenticated Active Deliveries API for Logged-In Courier (/delivery/my-deliveries)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}

try {
    $pdo = getDB();
    $authUser = AuthMiddleware::authenticate($pdo, ['delivery', 'admin']);

    $staffId = (int)$authUser['id'];

    // Fetch Store Config
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

    // Fetch duty status from courier_telemetry
    $dutyStmt = $pdo->prepare("SELECT status, lat, lng, speed_kmh FROM courier_telemetry WHERE user_id = ?");
    $dutyStmt->execute([$staffId]);
    $dutyRow = $dutyStmt->fetch();
    $dutyStatus = $dutyRow['status'] ?? 'active';
    $isOnline = ($dutyStatus !== 'offline');

    // Fetch active orders assigned to this authenticated courier
    $stmt = $pdo->prepare("
        SELECT o.*, u.name as delivery_staff_name
        FROM orders o
        LEFT JOIN users u ON o.delivery_staff_id = u.id
        WHERE o.fulfillment_type = 'delivery'
          AND o.delivery_staff_id = ?
          AND o.status IN ('on_the_way', 'ready_for_delivery', 'preparing', 'pending')
        ORDER BY FIELD(o.status, 'on_the_way', 'ready_for_delivery', 'preparing', 'pending'), o.id DESC
    ");
    $stmt->execute([$staffId]);
    $orders = $stmt->fetchAll();

    foreach ($orders as &$order) {
        $order['id'] = (int)$order['id'];
        $order['total_amount'] = (float)$order['total_amount'];
        $order['store'] = $storeConfig;
        $order['driver_lat'] = $dutyRow && $dutyRow['lat'] ? (float)$dutyRow['lat'] : null;
        $order['driver_lng'] = $dutyRow && $dutyRow['lng'] ? (float)$dutyRow['lng'] : null;

        $itemStmt = $pdo->prepare("
            SELECT oi.id, oi.food_id, oi.food_name, oi.price, oi.quantity, oi.subtotal, f.image_url 
            FROM order_items oi
            LEFT JOIN foods f ON oi.food_id = f.id
            WHERE oi.order_id = ?
        ");
        $itemStmt->execute([$order['id']]);
        $order['items'] = $itemStmt->fetchAll();
    }

    jsonResponse(1, 'My active deliveries fetched successfully', [
        'staff_id'    => $staffId,
        'driver'      => [
            'id'    => $authUser['id'],
            'name'  => $authUser['name'],
            'phone' => $authUser['phone'],
            'email' => $authUser['email'],
            'avatar_url' => $authUser['avatar_url'],
        ],
        'duty_status' => $dutyStatus,
        'is_online'   => $isOnline,
        'count'       => count($orders),
        'orders'      => $orders,
    ]);
} catch (PDOException $e) {
    jsonResponse(0, 'Failed to fetch my active deliveries: ' . $e->getMessage(), null, 500);
}
