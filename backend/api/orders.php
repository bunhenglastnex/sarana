<?php
// backend/api/orders.php
// Orders Endpoint (Fetch all orders or place new order)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    try {
        $statusFilter = $_GET['status'] ?? null;
        $fulfillmentFilter = $_GET['fulfillment_type'] ?? null;

        $sql = "SELECT o.*, u.name as delivery_staff_name 
                FROM orders o 
                LEFT JOIN users u ON o.delivery_staff_id = u.id 
                WHERE 1=1";
        $params = [];

        if ($statusFilter) {
            $sql .= " AND o.status = ?";
            $params[] = $statusFilter;
        }

        if ($fulfillmentFilter) {
            $sql .= " AND o.fulfillment_type = ?";
            $params[] = $fulfillmentFilter;
        }

        $sql .= " ORDER BY o.id DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $orders = $stmt->fetchAll();

        // Fetch Order Items for each order
        foreach ($orders as &$order) {
            $order['id'] = (int)$order['id'];
            $itemStmt = $pdo->prepare("SELECT id, food_id, food_name, price, quantity, subtotal FROM order_items WHERE order_id = ?");
            $itemStmt->execute([$order['id']]);
            $order['items'] = $itemStmt->fetchAll();
        }

        jsonResponse(1, 'Fetch orders successfully', [
            'orders' => $orders
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch orders: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST') {
    // Create New Order
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['customer_name']) || empty($input['customer_phone']) || empty($input['fulfillment_type']) || empty($input['items'])) {
        jsonResponse(0, 'Validation Error: Customer info, fulfillment type, and items are required', null, 400);
    }

    $fulfillmentType = $input['fulfillment_type']; // 'delivery' or 'pickup'
    if (!in_array($fulfillmentType, ['delivery', 'pickup'])) {
        jsonResponse(0, 'Invalid fulfillment type. Must be delivery or pickup', null, 400);
    }

    $deliveryAddress = ($fulfillmentType === 'delivery') ? ($input['delivery_address'] ?? '') : null;
    $deliveryFee = ($fulfillmentType === 'delivery') ? 2.00 : 0.00;
    $paymentMethod = ($fulfillmentType === 'delivery') ? 'cash_on_delivery' : 'cash_at_counter';

    $orderNumber = 'ORD-' . strtoupper(substr(uniqid(), -6));

    try {
        $pdo->beginTransaction();

        // Calculate Food Subtotal from items
        $foodAmount = 0.00;
        $itemsToInsert = [];

        foreach ($input['items'] as $item) {
            $foodId = $item['food_id'] ?? null;
            $quantity = max(1, (int)($item['quantity'] ?? 1));

            // Fetch actual food price from DB
            $foodStmt = $pdo->prepare("SELECT name, price FROM foods WHERE id = ?");
            $foodStmt->execute([$foodId]);
            $food = $foodStmt->fetch();

            if (!$food) {
                throw new Exception("Food item with ID {$foodId} not found.");
            }

            $price = (float)$food['price'];
            $subtotal = $price * $quantity;
            $foodAmount += $subtotal;

            $itemsToInsert[] = [
                'food_id'   => $foodId,
                'food_name' => $food['name'],
                'price'     => $price,
                'quantity'  => $quantity,
                'subtotal'  => $subtotal
            ];
        }

        $totalAmount = $foodAmount + $deliveryFee;

        // Insert Order Record
        $orderStmt = $pdo->prepare("
            INSERT INTO orders (
                order_number, customer_name, customer_phone, fulfillment_type,
                delivery_address, delivery_fee, food_amount, total_amount,
                payment_method, payment_status, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)
        ");
        $orderStmt->execute([
            $orderNumber,
            $input['customer_name'],
            $input['customer_phone'],
            $fulfillmentType,
            $deliveryAddress,
            $deliveryFee,
            $foodAmount,
            $totalAmount,
            $paymentMethod,
            $input['notes'] ?? null
        ]);

        $orderId = (int)$pdo->lastInsertId();

        // Insert Order Items
        $itemInsertStmt = $pdo->prepare("
            INSERT INTO order_items (order_id, food_id, food_name, price, quantity, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        foreach ($itemsToInsert as $item) {
            $itemInsertStmt->execute([
                $orderId,
                $item['food_id'],
                $item['food_name'],
                $item['price'],
                $item['quantity'],
                $item['subtotal']
            ]);
        }

        $pdo->commit();

        jsonResponse(1, 'Order created successfully (Cash Payment)', [
            'order_id'       => $orderId,
            'order_number'   => $orderNumber,
            'total_amount'   => $totalAmount,
            'payment_method' => $paymentMethod,
            'status'         => 'pending'
        ], 201);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        jsonResponse(0, 'Failed to create order: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
