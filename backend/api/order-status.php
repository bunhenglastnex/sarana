<?php
// backend/api/order-status.php
// Update Order Status (Kitchen / Admin workflow)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/telegram.php';
require_once __DIR__ . '/../lib/logger.php';

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
        // Fetch order details before update
        $orderStmt = $pdo->prepare("SELECT id, order_number, customer_name, customer_phone, telegram_chat_id, status FROM orders WHERE id = ?");
        $orderStmt->execute([$input['order_id']]);
        $order = $orderStmt->fetch();

        if (!$order) {
            jsonResponse(0, 'Order not found', null, 404);
        }

        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$input['status'], $input['order_id']]);

        // 📲 SEND TELEGRAM NOTIFICATION TO CUSTOMER ONLY
        if (function_exists('sendStatusUpdateToCustomer')) {
            sendStatusUpdateToCustomer($pdo, $order, $input['status']);
        }

        // 📜 Log System Action
        $oldStatus = $order['status'];
        $newStatus = $input['status'];
        logSystemAction(
            $pdo,
            'UPDATE_ORDER_STATUS',
            'ORDER',
            "Order '{$order['order_number']}' status updated from '{$oldStatus}' to '{$newStatus}'.",
            'info'
        );

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
