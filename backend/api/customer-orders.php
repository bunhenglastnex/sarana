<?php
// backend/api/customer-orders.php
// Dedicated Customer Orders API (/orders page)

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

    // Authenticate user token or accept phone / customer_id parameter
    $authUser = null;
    try {
        $authUser = AuthMiddleware::authenticate($pdo, ['customer', 'admin', 'staff', 'delivery']);
    } catch (Exception $e) {
        // Fallback to query params if auth token not passed
    }

    $customerPhone = trim($_GET['phone'] ?? ($authUser['phone'] ?? ''));
    $userId = $authUser ? (int)$authUser['id'] : (int)($_GET['user_id'] ?? 0);

    if (empty($customerPhone) && $userId <= 0) {
        jsonResponse(1, 'Customer orders fetched successfully', [], 200);
        return;
    }

    // Build SQL Query matching phone or user ID
    $query = "
        SELECT o.*, u.name as delivery_staff_name
        FROM orders o
        LEFT JOIN users u ON o.delivery_staff_id = u.id
        WHERE 1=1
    ";
    $params = [];

    if (!empty($customerPhone) && $userId > 0) {
        $query .= " AND (o.customer_phone = ? OR o.user_id = ?)";
        $params[] = $customerPhone;
        $params[] = $userId;
    } elseif (!empty($customerPhone)) {
        $query .= " AND o.customer_phone = ?";
        $params[] = $customerPhone;
    } else {
        $query .= " AND o.user_id = ?";
        $params[] = $userId;
    }

    $query .= " ORDER BY o.id DESC LIMIT 50";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();

    foreach ($orders as &$order) {
        $order['id'] = (int)$order['id'];
        $order['total_amount'] = (float)$order['total_amount'];

        $itemStmt = $pdo->prepare("
            SELECT oi.id, oi.food_id, oi.food_name, oi.price, oi.quantity, oi.subtotal, f.image_url 
            FROM order_items oi
            LEFT JOIN foods f ON oi.food_id = f.id
            WHERE oi.order_id = ?
        ");
        $itemStmt->execute([$order['id']]);
        $order['items'] = $itemStmt->fetchAll();
    }

    jsonResponse(1, 'Customer orders fetched successfully', $orders);
} catch (PDOException $e) {
    jsonResponse(0, 'Failed to fetch customer orders: ' . $e->getMessage(), null, 500);
}
