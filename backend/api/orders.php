<?php
// backend/api/orders.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET: Fetch Orders (Admin, Customer tracking, or Delivery)
if ($method === 'GET') {
    try {
        $orderNumber = $_GET['order_number'] ?? null;
        $status = $_GET['status'] ?? null;
        $fulfillmentType = $_GET['fulfillment_type'] ?? null;

        $sql = "SELECT o.*, u.name AS driver_name, u.phone AS driver_phone 
                FROM orders o 
                LEFT JOIN users u ON o.delivery_staff_id = u.id 
                WHERE 1=1";
        $params = [];

        if ($orderNumber) {
            $sql .= " AND o.order_number = ?";
            $params[] = $orderNumber;
        }
        if ($status) {
            $sql .= " AND o.status = ?";
            $params[] = $status;
        }
        if ($fulfillmentType) {
            $sql .= " AND o.fulfillment_type = ?";
            $params[] = $fulfillmentType;
        }

        $sql .= " ORDER BY o.id DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $orders = $stmt->fetchAll();

        // Attach order items to each order
        foreach ($orders as &$order) {
            $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $itemStmt->execute([$order['id']]);
            $order['items'] = $itemStmt->fetchAll();
        }

        echo json_encode([
            'success' => true,
            'orders' => $orders
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

// 2. POST: Create New Order (Customer on Website)
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $customerName = trim($data['customer_name'] ?? '');
    $customerPhone = trim($data['customer_phone'] ?? '');
    $fulfillmentType = trim($data['fulfillment_type'] ?? 'delivery'); // 'delivery' or 'pickup'
    $deliveryAddress = trim($data['delivery_address'] ?? '');
    $pickupTime = trim($data['pickup_time'] ?? '');
    $notes = trim($data['notes'] ?? '');
    $items = $data['items'] ?? []; // Array of [{ food_id: 1, quantity: 2 }]

    // Validation
    if (empty($customerName) || empty($customerPhone)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Please provide customer name and phone number.']);
        exit;
    }

    if ($fulfillmentType === 'delivery' && empty($deliveryAddress)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Delivery address is required for delivery orders.']);
        exit;
    }

    if (empty($items) || !is_array($items)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Order must contain at least one food item.']);
        exit;
    }

    // Determine payment method based on fulfillment (Cash Only)
    $paymentMethod = ($fulfillmentType === 'delivery') ? 'cash_on_delivery' : 'cash_at_counter';
    $deliveryFee = ($fulfillmentType === 'delivery') ? 2.00 : 0.00; // Flat $2 for delivery, $0 for pickup

    try {
        $pdo->beginTransaction();

        // 1. Calculate food amount securely from database
        $foodAmount = 0.00;
        $processedItems = [];

        foreach ($items as $item) {
            $foodId = (int)($item['food_id'] ?? 0);
            $qty = max(1, (int)($item['quantity'] ?? 1));

            $foodStmt = $pdo->prepare("SELECT id, name, price FROM foods WHERE id = ? AND is_available = 1");
            $foodStmt->execute([$foodId]);
            $food = $foodStmt->fetch();

            if (!$food) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => "Food item ID {$foodId} is not available."]);
                exit;
            }

            $subtotal = $food['price'] * $qty;
            $foodAmount += $subtotal;

            $processedItems[] = [
                'food_id' => $food['id'],
                'food_name' => $food['name'],
                'price' => $food['price'],
                'quantity' => $qty,
                'subtotal' => $subtotal
            ];
        }

        $totalAmount = $foodAmount + $deliveryFee;

        // Generate unique order number (e.g. ORD-6821)
        $orderNumber = 'ORD-' . strtoupper(substr(uniqid(), -5));

        // 2. Insert into orders table
        $orderStmt = $pdo->prepare("INSERT INTO orders 
            (order_number, customer_name, customer_phone, fulfillment_type, delivery_address, delivery_fee, pickup_time, food_amount, total_amount, payment_method, payment_status, status, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)");
        
        $orderStmt->execute([
            $orderNumber,
            $customerName,
            $customerPhone,
            $fulfillmentType,
            ($fulfillmentType === 'delivery') ? $deliveryAddress : null,
            $deliveryFee,
            ($fulfillmentType === 'pickup') ? $pickupTime : null,
            $foodAmount,
            $totalAmount,
            $paymentMethod,
            $notes
        ]);

        $orderId = $pdo->lastInsertId();

        // 3. Insert order items
        $itemStmt = $pdo->prepare("INSERT INTO order_items (order_id, food_id, food_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($processedItems as $pItem) {
            $itemStmt->execute([
                $orderId,
                $pItem['food_id'],
                $pItem['food_name'],
                $pItem['price'],
                $pItem['quantity'],
                $pItem['subtotal']
            ]);
        }

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Order placed successfully.',
            'order' => [
                'id' => $orderId,
                'order_number' => $orderNumber,
                'customer_name' => $customerName,
                'fulfillment_type' => $fulfillmentType,
                'food_amount' => $foodAmount,
                'delivery_fee' => $deliveryFee,
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'status' => 'pending',
                'items' => $processedItems
            ]
        ]);
        exit;

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
