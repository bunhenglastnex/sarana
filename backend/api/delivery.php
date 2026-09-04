<?php
// backend/api/delivery.php
// In-House Delivery Staff Management & Cash In Hand Tracking

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    try {
        // Delivery staff ID (default rider ID 2 if not passed)
        $staffId = isset($_GET['staff_id']) ? (int)$_GET['staff_id'] : 2;

        // Fetch Orders:
        // 1. Ready for delivery (unassigned or assigned to this staff)
        // 2. Currently on the way by this staff
        // 3. Completed today by this staff
        $stmt = $pdo->prepare("
            SELECT o.*, u.name as delivery_staff_name
            FROM orders o
            LEFT JOIN users u ON o.delivery_staff_id = u.id
            WHERE o.fulfillment_type = 'delivery'
              AND (
                o.status = 'ready_for_delivery'
                OR (o.delivery_staff_id = ? AND o.status IN ('on_the_way', 'completed'))
              )
            ORDER BY FIELD(o.status, 'on_the_way', 'ready_for_delivery', 'completed'), o.id DESC
        ");
        $stmt->execute([$staffId]);
        $orders = $stmt->fetchAll();

        // Calculate Cash In Hand (total_amount of completed orders paid in cash to this rider)
        $cashStmt = $pdo->prepare("
            SELECT SUM(total_amount) as cash_in_hand
            FROM orders
            WHERE delivery_staff_id = ?
              AND fulfillment_type = 'delivery'
              AND payment_method = 'cash_on_delivery'
              AND payment_status = 'paid'
              AND status = 'completed'
        ");
        $cashStmt->execute([$staffId]);
        $cashRow = $cashStmt->fetch();
        $cashInHand = $cashRow['cash_in_hand'] ? (float)$cashRow['cash_in_hand'] : 0.00;

        foreach ($orders as &$order) {
            $order['id'] = (int)$order['id'];
            $itemStmt = $pdo->prepare("SELECT id, food_id, food_name, price, quantity, subtotal FROM order_items WHERE order_id = ?");
            $itemStmt->execute([$order['id']]);
            $order['items'] = $itemStmt->fetchAll();
        }

        jsonResponse(1, 'Delivery staff dashboard fetched successfully', [
            'staff_id'     => $staffId,
            'cash_in_hand' => $cashInHand,
            'orders'       => $orders
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch delivery dashboard: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST') {
    // Delivery Staff Action
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['order_id']) || empty($input['action'])) {
        jsonResponse(0, 'Validation Error: order_id and action are required', null, 400);
    }

    $orderId = (int)$input['order_id'];
    $action = $input['action'];
    $staffId = isset($input['staff_id']) ? (int)$input['staff_id'] : 2;

    try {
        if ($action === 'pickup_from_kitchen') {
            // Rider picks up order -> status becomes on_the_way
            $stmt = $pdo->prepare("
                UPDATE orders
                SET status = 'on_the_way', delivery_staff_id = ?
                WHERE id = ? AND fulfillment_type = 'delivery'
            ");
            $stmt->execute([$staffId, $orderId]);

            jsonResponse(1, 'Order picked up from kitchen. Status is now On The Way.', [
                'order_id' => $orderId,
                'status'   => 'on_the_way'
            ]);
        } elseif ($action === 'confirm_delivered') {
            // Rider delivers food & collects Cash on Delivery -> status completed, payment_status paid
            $stmt = $pdo->prepare("
                UPDATE orders
                SET status = 'completed', payment_status = 'paid', delivery_staff_id = ?
                WHERE id = ? AND fulfillment_type = 'delivery'
            ");
            $stmt->execute([$staffId, $orderId]);

            jsonResponse(1, 'Order completed and Cash on Delivery collected!', [
                'order_id'       => $orderId,
                'status'         => 'completed',
                'payment_status' => 'paid'
            ]);
        } else {
            jsonResponse(0, 'Invalid delivery action. Allowed: pickup_from_kitchen, confirm_delivered', null, 400);
        }
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to update delivery action: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
