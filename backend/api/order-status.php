<?php
// backend/api/order-status.php
// Update Order Status (Kitchen / Admin workflow)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'PATCH' || $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['order_id']) || empty($input['status'])) {
        jsonResponse(0, 'Validation Error: order_id and status are required', null, 400);
    }

    $validStatuses = [
        'pending',
        'accepted',
        'preparing',
        'ready_for_pickup',
        'ready_for_delivery',
        'on_the_way',
        'completed',
        'cancelled'
    ];

    if (!in_array($input['status'], $validStatuses)) {
        jsonResponse(0, 'Invalid status parameter', null, 400);
    }

    try {
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$input['status'], $input['order_id']]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(0, 'Order not found or status unchanged', null, 404);
        }

        jsonResponse(1, "Order status updated to {$input['status']}", [
            'order_id' => (int)$input['order_id'],
            'status'   => $input['status']
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to update order status: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
