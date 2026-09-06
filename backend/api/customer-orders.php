<?php
// backend/api/customer-orders.php
// Dedicated Customer Orders API (/orders page)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['items']) || !is_array($input['items'])) {
        jsonResponse(0, 'Order items are required', null, 400);
    }

    $customerName = trim($input['customer_name'] ?? $input['customerName'] ?? 'Guest Customer');
    $customerPhone = trim($input['customer_phone'] ?? $input['customerPhone'] ?? '');
    $fulfillmentType = in_array($input['fulfillment_type'] ?? $input['fulfillmentType'] ?? '', ['pickup', 'delivery']) 
        ? ($input['fulfillment_type'] ?? $input['fulfillmentType']) 
        : 'delivery';
    
    $deliveryAddress = trim($input['delivery_address'] ?? $input['deliveryAddress'] ?? '');
    $notes = trim($input['notes'] ?? '');
    $paymentMethodInput = strtolower(trim($input['payment_method'] ?? $input['paymentMethod'] ?? 'khqr'));

    // Map payment method to DB enum
    $paymentMethod = 'khqr';
    if (in_array($paymentMethodInput, ['cod', 'cash_on_delivery'])) {
        $paymentMethod = 'cash_on_delivery';
    } elseif (in_array($paymentMethodInput, ['counter', 'counter_cash', 'cash_at_counter'])) {
        $paymentMethod = 'cash_at_counter';
    } elseif ($paymentMethodInput === 'khqr') {
        $paymentMethod = 'khqr';
    }

    $userId = !empty($input['user_id']) ? (int)$input['user_id'] : null;
    $telegramChatId = trim($input['telegram_chat_id'] ?? $input['telegramChatId'] ?? '');

    // Authenticate if token provided
    $authUser = null;
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!empty($authHeader) || !empty($_GET['token']) || !empty($input['token'])) {
        try {
            $authUser = AuthMiddleware::authenticate($pdo, ['customer', 'admin', 'staff', 'delivery']);
            if ($authUser) {
                $userId = (int)$authUser['id'];
                if (empty($customerName)) $customerName = $authUser['name'] ?? $customerName;
                if (empty($customerPhone)) $customerPhone = $authUser['phone'] ?? $customerPhone;
            }
        } catch (Throwable $e) {
            // Optional auth fallback
        }
    }

    if (empty($customerPhone)) {
        $customerPhone = '012345678'; // Default contact phone if not provided
    }

    // Calculate Subtotal & Totals
    $foodAmount = 0.0;
    $itemsToInsert = [];

    foreach ($input['items'] as $item) {
        $foodId = !empty($item['food_id']) ? (int)$item['food_id'] : (!empty($item['foodId']) ? (int)$item['foodId'] : null);
        $foodName = trim($item['food_name'] ?? $item['name'] ?? 'Menu Item');
        $price = (float)($item['price'] ?? 0);
        $quantity = max(1, (int)($item['quantity'] ?? 1));
        $subtotal = round($price * $quantity, 2);
        $imageUrl = trim($item['image_url'] ?? $item['imageUrl'] ?? '');
        $itemNotes = trim($item['notes'] ?? '');

        $foodAmount += $subtotal;
        $itemsToInsert[] = [
            'food_id' => $foodId,
            'food_name' => $foodName,
            'price' => $price,
            'quantity' => $quantity,
            'subtotal' => $subtotal,
            'image_url' => $imageUrl,
            'notes' => $itemNotes,
        ];
    }

    $deliveryFee = $fulfillmentType === 'delivery' ? 2.00 : 0.00;
    $packagingAndTax = 1.20;
    $tip = max(0.0, (float)($input['tip'] ?? 0));
    $totalAmount = round($foodAmount + $deliveryFee + $packagingAndTax + $tip, 2);
    $amountKhr = (int)round($totalAmount * 4100);

    // Generate Unique Order Number e.g. ORD-8942
    $orderNumInt = rand(10000, 99999);
    $orderNumber = 'ORD-' . $orderNumInt;

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            INSERT INTO orders (
                order_number, user_id, customer_name, customer_phone, telegram_chat_id,
                fulfillment_type, delivery_address, delivery_fee, food_amount, total_amount, amount_khr,
                payment_method, payment_status, status, notes, created_at
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, 'pending', 'pending', ?, NOW()
            )
        ");

        $stmt->execute([
            $orderNumber,
            $userId,
            $customerName,
            $customerPhone,
            $telegramChatId,
            $fulfillmentType,
            $deliveryAddress,
            $deliveryFee,
            $foodAmount,
            $totalAmount,
            $amountKhr,
            $paymentMethod,
            $notes
        ]);

        $orderId = (int)$pdo->lastInsertId();

        // Insert items
        $itemStmt = $pdo->prepare("
            INSERT INTO order_items (
                order_id, food_id, food_name, price, quantity, subtotal, image_url, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        foreach ($itemsToInsert as $it) {
            $itemStmt->execute([
                $orderId,
                $it['food_id'],
                $it['food_name'],
                $it['price'],
                $it['quantity'],
                $it['subtotal'],
                $it['image_url'],
                $it['notes']
            ]);
        }

        $pdo->commit();

        // Notify Telegram if library available
        try {
            if (file_exists(__DIR__ . '/../lib/telegram.php')) {
                require_once __DIR__ . '/../lib/telegram.php';
                $orderData = [
                    'order_number' => $orderNumber,
                    'customer_name' => $customerName,
                    'customer_phone' => $customerPhone,
                    'fulfillment_type' => $fulfillmentType,
                    'delivery_address' => $deliveryAddress,
                    'delivery_fee' => $deliveryFee,
                    'total_amount' => $totalAmount,
                    'payment_method' => $paymentMethod,
                    'notes' => $notes
                ];
                $msg = formatNewOrderGroupMessage($orderData, $itemsToInsert);
                notifyTelegramGroup($msg);
            }
        } catch (Throwable $t) {
            // Log telegram notification failure non-blockingly
        }

        jsonResponse(1, 'Order created successfully', [
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'total_amount' => $totalAmount,
            'amount_khr' => $amountKhr,
            'payment_method' => $paymentMethodInput,
            'status' => 'pending'
        ], 201);

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        jsonResponse(0, 'Failed to create order: ' . $e->getMessage(), null, 500);
    }
    return;
}

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
