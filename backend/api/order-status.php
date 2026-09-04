<?php
// backend/api/order-status.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'PATCH' || $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $orderId = isset($data['order_id']) ? (int)$data['order_id'] : null;
    $newStatus = trim($data['status'] ?? '');

    $allowedStatuses = [
        'pending', 
        'accepted', 
        'preparing', 
        'ready_for_pickup', 
        'ready_for_delivery', 
        'on_the_way', 
        'completed', 
        'cancelled'
    ];

    if (!$orderId || !in_array($newStatus, $allowedStatuses)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Valid order_id and status are required.']);
        exit;
    }

    try {
        // If marking completed for pickup, also mark payment_status = paid
        if ($newStatus === 'completed') {
            $stmt = $pdo->prepare("UPDATE orders SET status = ?, payment_status = 'paid' WHERE id = ?");
            $stmt->execute([$newStatus, $orderId]);
        } else {
            $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $orderId]);
        }

        echo json_encode([
            'success' => true,
            'message' => "Order #{$orderId} status updated to '{$newStatus}'.",
            'order_id' => $orderId,
            'status' => $newStatus
        ]);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
