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

    // Action: Upload Payment Proof Slip
    if (($input['action'] ?? '') === 'upload_proof' || !empty($input['payment_proof_url'])) {
        $orderIdInput = trim($input['order_id'] ?? $input['order_number'] ?? '');
        $proofUrl = $input['payment_proof_url'] ?? '';

        if (empty($orderIdInput)) {
            jsonResponse(0, 'order_id is required', null, 400);
        }

        require_once __DIR__ . '/../lib/upload.php';
        $savedPath = saveBase64Image($proofUrl, 'proofs') ?? $proofUrl;

        $upStmt = $pdo->prepare("
            UPDATE orders 
            SET payment_proof_url = ?, payment_status = 'pending_review', updated_at = NOW() 
            WHERE order_number = ? OR id = ?
        ");
        $upStmt->execute([$savedPath, $orderIdInput, is_numeric($orderIdInput) ? (int)$orderIdInput : 0]);

        jsonResponse(1, 'Payment proof uploaded successfully. Awaiting admin review.', [
            'order_id' => $orderIdInput,
            'payment_proof_url' => $savedPath,
            'payment_status' => 'pending_review'
        ], 200);
        return;
    }

    if (empty($input['items']) || !is_array($input['items'])) {
        jsonResponse(0, 'Order items are required', null, 400);
    }

    $customerName = trim($input['customer_name'] ?? $input['customerName'] ?? 'Guest Customer');
    $customerPhone = trim($input['customer_phone'] ?? $input['customerPhone'] ?? '');
    $fulfillmentType = in_array($input['fulfillment_type'] ?? $input['fulfillmentType'] ?? '', ['pickup', 'delivery']) 
        ? ($input['fulfillment_type'] ?? $input['fulfillmentType']) 
        : 'delivery';
    
    $deliveryAddress = trim($input['delivery_address'] ?? $input['deliveryAddress'] ?? '');
    $deliveryLat = isset($input['delivery_lat']) ? (float)$input['delivery_lat'] : (isset($input['deliveryLat']) ? (float)$input['deliveryLat'] : null);
    $deliveryLng = isset($input['delivery_lng']) ? (float)$input['delivery_lng'] : (isset($input['deliveryLng']) ? (float)$input['deliveryLng'] : null);
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
    $authUser = AuthMiddleware::getOptionalUser($pdo);
    if ($authUser) {
        $userId = (int)$authUser['id'];
        if (empty($customerName)) $customerName = $authUser['name'] ?? $customerName;
        if (empty($customerPhone)) $customerPhone = $authUser['phone'] ?? $customerPhone;
    }

    if (empty($customerPhone) && $authUser) {
        $customerPhone = $authUser['phone'] ?? '';
    }

    if (empty($customerPhone)) {
        jsonResponse(0, 'Validation Error: Customer phone number is required', null, 400);
    }

    if ($fulfillmentType === 'delivery' && empty($deliveryAddress)) {
        jsonResponse(0, 'Validation Error: Delivery address is required for delivery orders', null, 400);
    }

    // Calculate Subtotal & Totals with DB Price Verification & Stock Availability Checks
    $foodAmount = 0.0;
    $itemsToInsert = [];

    // Calculate Subtotal & Totals with DB Price Verification & Stock Availability Checks
    $foodAmount = 0.0;
    $itemsToInsert = [];
    $orderRestaurantId = !empty($input['restaurant_id']) ? (int)$input['restaurant_id'] : null;

    $foodCheckStmt = $pdo->prepare("SELECT id, restaurant_id, name, price, is_available, image_url FROM foods WHERE id = ? LIMIT 1");

    foreach ($input['items'] as $item) {
        $foodId = !empty($item['food_id']) ? (int)$item['food_id'] : (!empty($item['foodId']) ? (int)$item['foodId'] : null);
        $clientFoodName = trim($item['food_name'] ?? $item['name'] ?? 'Menu Item');
        $quantity = max(1, (int)($item['quantity'] ?? 1));
        $itemNotes = trim($item['notes'] ?? '');
        $imageUrl = trim($item['image_url'] ?? $item['imageUrl'] ?? '');

        $realPrice = (float)($item['price'] ?? 0);
        $realFoodName = $clientFoodName;

        if ($foodId) {
            $foodCheckStmt->execute([$foodId]);
            $dbFood = $foodCheckStmt->fetch();
            if ($dbFood) {
                if (isset($dbFood['is_available']) && (int)$dbFood['is_available'] === 0) {
                    jsonResponse(0, "Item '{$dbFood['name']}' is currently out of stock", null, 400);
                }
                $realPrice = (float)$dbFood['price'];
                $realFoodName = $dbFood['name'];
                if (empty($imageUrl) && !empty($dbFood['image_url'])) {
                    $imageUrl = $dbFood['image_url'];
                }
                if (!$orderRestaurantId && !empty($dbFood['restaurant_id'])) {
                    $orderRestaurantId = (int)$dbFood['restaurant_id'];
                }
            }
        }

        $subtotal = round($realPrice * $quantity, 2);
        $foodAmount += $subtotal;

        $itemsToInsert[] = [
            'food_id' => $foodId,
            'food_name' => $realFoodName,
            'price' => $realPrice,
            'quantity' => $quantity,
            'subtotal' => $subtotal,
            'image_url' => $imageUrl,
            'notes' => $itemNotes,
        ];
    }

    if (!$orderRestaurantId) {
        $orderRestaurantId = 1; // Default to Restaurant HQ
    }

    // Fetch Settings from database for dynamic fee & tax calculations
    require_once __DIR__ . '/../services/SettingsService.php';
    $settingsService = new SettingsService($pdo);
    $settings = $settingsService->getSettings();

    $taxRate = isset($settings['tax_rate']) ? (float)$settings['tax_rate'] : 9.03;
    $baseDeliveryFee = isset($settings['base_delivery_fee']) ? (float)$settings['base_delivery_fee'] : 1.50;
    $baseIncludedKm = isset($settings['base_included_km']) ? (float)$settings['base_included_km'] : 3.0;
    $extraFeePerKm = isset($settings['extra_fee_per_km']) ? (float)$settings['extra_fee_per_km'] : 0.50;
    $freeDeliveryMinSubtotal = isset($settings['free_delivery_min_subtotal']) ? (float)$settings['free_delivery_min_subtotal'] : 25.00;
    
    // Fetch Restaurant Origin Coordinates
    $storeLat = isset($settings['store_latitude']) ? (float)$settings['store_latitude'] : 13.352270;
    $storeLng = isset($settings['store_longitude']) ? (float)$settings['store_longitude'] : 103.955116;

    if ($orderRestaurantId) {
        $restoStmt = $pdo->prepare("SELECT lat, lng FROM restaurants WHERE id = ? LIMIT 1");
        $restoStmt->execute([$orderRestaurantId]);
        $restoRow = $restoStmt->fetch();
        if ($restoRow && !empty($restoRow['lat']) && !empty($restoRow['lng'])) {
            $storeLat = (float)$restoRow['lat'];
            $storeLng = (float)$restoRow['lng'];
        }
    }

    // Delivery fee calculation
    if (isset($input['delivery_fee']) && is_numeric($input['delivery_fee'])) {
        $deliveryFee = (float)$input['delivery_fee'];
    } elseif ($fulfillmentType === 'delivery') {
        if ($foodAmount >= $freeDeliveryMinSubtotal) {
            $deliveryFee = 0.00;
        } elseif ($deliveryLat !== null && $deliveryLng !== null) {
            $rad = M_PI / 180;
            $dlat = ($deliveryLat - $storeLat) * $rad;
            $dlng = ($deliveryLng - $storeLng) * $rad;
            $a = sin($dlat / 2) * sin($dlat / 2) + cos($storeLat * $rad) * cos($deliveryLat * $rad) * sin($dlng / 2) * sin($dlng / 2);
            $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
            $distKm = 6371 * $c;

            $deliveryFee = round($distKm * $extraFeePerKm, 2);
        } else {
            $deliveryFee = 0.00;
        }
    } else {
        $deliveryFee = 0.00;
    }

    // Packaging & Tax calculation
    if (isset($input['tax_amount']) && is_numeric($input['tax_amount'])) {
        $packagingAndTax = (float)$input['tax_amount'];
    } elseif (isset($input['packaging_and_tax']) && is_numeric($input['packaging_and_tax'])) {
        $packagingAndTax = (float)$input['packaging_and_tax'];
    } else {
        $packagingAndTax = round(($foodAmount * $taxRate) / 100.0, 2);
    }

    $tip = max(0.0, (float)($input['tip'] ?? 0));
    $totalAmount = round($foodAmount + $deliveryFee + $packagingAndTax + $tip, 2);
    $amountKhr = (int)round($totalAmount * 4100);

    // Collision-Safe Unique Order Number Generation e.g. ORD-8942
    $orderNumber = '';
    for ($attempt = 0; $attempt < 10; $attempt++) {
        $candidateNum = 'ORD-' . rand(10000, 99999);
        $chkStmt = $pdo->prepare("SELECT id FROM orders WHERE order_number = ? LIMIT 1");
        $chkStmt->execute([$candidateNum]);
        if (!$chkStmt->fetch()) {
            $orderNumber = $candidateNum;
            break;
        }
    }
    if (empty($orderNumber)) {
        $orderNumber = 'ORD-' . time() . rand(10, 99);
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            INSERT INTO orders (
                restaurant_id, order_number, user_id, customer_name, customer_phone, telegram_chat_id,
                fulfillment_type, delivery_address, delivery_lat, delivery_lng, delivery_fee, food_amount, total_amount, amount_khr,
                payment_method, payment_status, status, notes, created_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, 'pending', 'pending', ?, NOW()
            )
        ");

        $stmt->execute([
            $orderRestaurantId,
            $orderNumber,
            $userId,
            $customerName,
            $customerPhone,
            $telegramChatId,
            $fulfillmentType,
            $deliveryAddress,
            $deliveryLat,
            $deliveryLng,
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
    $authUser = AuthMiddleware::getOptionalUser($pdo);

    $customerPhone = trim($_GET['phone'] ?? ($authUser['phone'] ?? ''));
    $userId = $authUser ? (int)$authUser['id'] : (int)($_GET['user_id'] ?? 0);
    $orderIdQuery = trim($_GET['order_id'] ?? $_GET['order_number'] ?? '');

    if (!empty($orderIdQuery)) {
        $query = "
            SELECT o.*, u.name as delivery_staff_name, u.phone as delivery_staff_phone
            FROM orders o
            LEFT JOIN users u ON o.delivery_staff_id = u.id
            WHERE o.order_number = ? OR o.id = ?
            ORDER BY o.id DESC LIMIT 1
        ";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$orderIdQuery, is_numeric($orderIdQuery) ? (int)$orderIdQuery : 0]);
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

        jsonResponse(1, 'Customer order fetched successfully', $orders);
        return;
    }

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
