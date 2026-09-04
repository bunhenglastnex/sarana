<?php
// backend/api/delivery.php
// Dedicated API for Delivery Staff (Pickup from kitchen & Confirm Delivered with cash collection)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET: List delivery tasks for rider
if ($method === 'GET') {
    try {
        $driverId = isset($_GET['driver_id']) ? (int)$_GET['driver_id'] : null;

        // Fetch active delivery orders
        $stmt = $pdo->prepare("SELECT o.*, u.name AS driver_name 
            FROM orders o 
            LEFT JOIN users u ON o.delivery_staff_id = u.id 
            WHERE o.fulfillment_type = 'delivery' 
              AND o.status IN ('ready_for_delivery', 'on_the_way') 
            ORDER BY o.id DESC");
        $stmt->execute();
        $activeOrders = $stmt->fetchAll();

        // Attach items
        foreach ($activeOrders as &$ord) {
            $iStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $iStmt->execute([$ord['id']]);
            $ord['items'] = $iStmt->fetchAll();
        }

        // Also fetch total cash collected today by delivery staff (for End of Shift settlement)
        $cashStmt = $pdo->prepare("SELECT COALESCE(SUM(total_amount), 0) AS cash_in_hand, COUNT(*) AS deliveries_completed 
            FROM orders 
            WHERE fulfillment_type = 'delivery' 
              AND payment_method = 'cash_on_delivery' 
              AND status = 'completed' 
              AND DATE(created_at) = CURDATE()");
        $cashStmt->execute();
        $cashSummary = $cashStmt->fetch();

        echo json_encode([
            'success' => true,
            'orders' => $activeOrders,
            'cash_summary' => $cashSummary
        ]);
        exit;

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

// 2. POST / PATCH: Delivery Actions (Start Delivery / Confirm Delivered)
if ($method === 'POST' || $method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);

    $orderId = isset($data['order_id']) ? (int)$data['order_id'] : null;
    $action = trim($data['action'] ?? ''); // 'pickup_from_kitchen' OR 'confirm_delivered'
    $driverId = isset($data['driver_id']) ? (int)$data['driver_id'] : 2; // Default to rider ID 2

    if (!$orderId || empty($action)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'order_id and action are required.']);
        exit;
    }

    try {
        if ($action === 'pickup_from_kitchen') {
            // Driver picks up food from restaurant kitchen -> status becomes 'on_the_way'
            $stmt = $pdo->prepare("UPDATE orders SET status = 'on_the_way', delivery_staff_id = ? WHERE id = ? AND fulfillment_type = 'delivery'");
            $stmt->execute([$driverId, $orderId]);

            echo json_encode([
                'success' => true,
                'message' => "Order #{$orderId} is now On the Way to customer.",
                'status' => 'on_the_way'
            ]);
            exit;

        } elseif ($action === 'confirm_delivered') {
            // Driver reaches customer, collects cash, and confirms delivery
            $stmt = $pdo->prepare("UPDATE orders SET status = 'completed', payment_status = 'paid' WHERE id = ? AND fulfillment_type = 'delivery'");
            $stmt->execute([$orderId]);

            // Fetch order total for cash in hand confirmation
            $ordStmt = $pdo->prepare("SELECT order_number, total_amount FROM orders WHERE id = ?");
            $ordStmt->execute([$orderId]);
            $ord = $ordStmt->fetch();

            echo json_encode([
                'success' => true,
                'message' => "Order {$ord['order_number']} delivered successfully! Cash collected: \${$ord['total_amount']}.",
                'status' => 'completed',
                'cash_collected' => $ord['total_amount']
            ]);
            exit;

        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action. Allowed: pickup_from_kitchen, confirm_delivered.']);
            exit;
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
