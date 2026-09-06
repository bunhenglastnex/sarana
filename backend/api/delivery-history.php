<?php
// backend/api/delivery-history.php
// Authenticated Delivery History & Cash Remittance API (/delivery/history)

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

    $period = $_GET['period'] ?? 'today';
    $dateCondition = "";
    if ($period === 'today') {
        $dateCondition = " AND DATE(o.created_at) = CURDATE()";
    } elseif ($period === 'week') {
        $dateCondition = " AND YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1)";
    } elseif ($period === 'month') {
        $dateCondition = " AND YEAR(o.created_at) = YEAR(CURDATE()) AND MONTH(o.created_at) = MONTH(CURDATE())";
    }

    // Select completed orders delivered by this courier
    $stmt = $pdo->prepare("
        SELECT o.*, u.name as delivery_staff_name
        FROM orders o
        LEFT JOIN users u ON o.delivery_staff_id = u.id
        WHERE o.fulfillment_type = 'delivery'
          AND o.delivery_staff_id = ?
          AND o.status IN ('completed', 'delivered')
          {$dateCondition}
        ORDER BY o.id DESC
    ");
    $stmt->execute([$staffId]);
    $orders = $stmt->fetchAll();

    $cashCollectedTotal = 0.00;
    foreach ($orders as &$order) {
        $order['id'] = (int)$order['id'];
        $order['total_amount'] = (float)$order['total_amount'];

        if (in_array($order['payment_method'], ['cod', 'cash_on_delivery'], true) && $order['payment_status'] === 'paid') {
            $cashCollectedTotal += $order['total_amount'];
        }

        $itemStmt = $pdo->prepare("
            SELECT oi.id, oi.food_id, oi.food_name, oi.price, oi.quantity, oi.subtotal, f.image_url 
            FROM order_items oi
            LEFT JOIN foods f ON oi.food_id = f.id
            WHERE oi.order_id = ?
        ");
        $itemStmt->execute([$order['id']]);
        $order['items'] = $itemStmt->fetchAll();
    }

    jsonResponse(1, 'Delivery history fetched successfully', [
        'staff_id'           => $staffId,
        'completed_count'    => count($orders),
        'cash_collected_total' => $cashCollectedTotal,
        'tips_total'         => 0.00,
        'orders'             => $orders,
    ]);
} catch (PDOException $e) {
    jsonResponse(0, 'Failed to fetch delivery history: ' . $e->getMessage(), null, 500);
}
