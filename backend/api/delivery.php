<?php
// backend/api/delivery.php
// In-House Delivery Staff Management & Cash In Hand Tracking

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/telegram.php';
require_once __DIR__ . '/../lib/logger.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

// Helper function to calculate distance between two coordinates in kilometers
function calculateHaversineKm($lat1, $lng1, $lat2, $lng2) {
    if (!$lat1 || !$lng1 || !$lat2 || !$lng2) return 1.2;
    $earthRadiusKm = 6371;
    $dLat = deg2rad($lat2 - $lat1);
    $dLng = deg2rad($lng2 - $lng1);
    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLng / 2) * sin($dLng / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return round($earthRadiusKm * $c, 1);
}

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'staff_dashboard';

    if ($action === 'fleet_radar') {
        try {
            // Fetch All Store & System Configuration
            $settingsStmt = $pdo->prepare("SELECT setting_key, setting_value FROM settings");
            $settingsStmt->execute();
            $rawSettings = $settingsStmt->fetchAll(PDO::FETCH_KEY_PAIR);

            $storeLat = isset($rawSettings['store_latitude'])
                ? (float)$rawSettings['store_latitude']
                : (isset($rawSettings['store_lat'])
                    ? (float)$rawSettings['store_lat']
                    : (isset($rawSettings['storeLatitude'])
                        ? (float)$rawSettings['storeLatitude']
                        : 11.556400));

            $storeLng = isset($rawSettings['store_longitude'])
                ? (float)$rawSettings['store_longitude']
                : (isset($rawSettings['store_lng'])
                    ? (float)$rawSettings['store_lng']
                    : (isset($rawSettings['storeLongitude'])
                        ? (float)$rawSettings['storeLongitude']
                        : 104.928200));

            $storeConfig = [
                'name'     => $rawSettings['store_name'] ?? $rawSettings['storeName'] ?? 'Bistro Kitchen HQ',
                'subtitle' => $rawSettings['store_subtitle'] ?? 'Central Dispatch Hub',
                'address'  => $rawSettings['store_address'] ?? $rawSettings['storeAddress'] ?? 'Main Store Address',
                'lat'      => $storeLat,
                'lng'      => $storeLng,
            ];

            // Fetch all active delivery staff + telemetry + active order
            $stmt = $pdo->prepare("
                SELECT 
                    u.id,
                    u.name,
                    u.avatar_url,
                    u.role,
                    t.vehicle_type,
                    t.vehicle_label,
                    t.lat,
                    t.lng,
                    t.speed_kmh,
                    t.temp_celsius,
                    t.status as courier_status
                FROM users u
                LEFT JOIN courier_telemetry t ON u.id = t.user_id
                WHERE u.role = 'delivery' AND u.status = 'active'
                ORDER BY u.id ASC
            ");
            $stmt->execute();
            $staffList = $stmt->fetchAll();

            $couriers = [];
            foreach ($staffList as $staff) {
                $staffId = (int)$staff['id'];

                // Find active in-transit order assigned to this staff
                $orderStmt = $pdo->prepare("
                    SELECT 
                        id, order_number, customer_name, delivery_address,
                        delivery_lat, delivery_lng, payment_method, total_amount,
                        status, notes
                    FROM orders
                    WHERE delivery_staff_id = ?
                      AND status IN ('on_the_way', 'preparing', 'ready_for_delivery')
                    ORDER BY id DESC
                    LIMIT 1
                ");
                $orderStmt->execute([$staffId]);
                $activeOrder = $orderStmt->fetch();

                // Lat/Lng Fallbacks if telemetry missing
                $lat = $staff['lat'] ? (float)$staff['lat'] : $storeConfig['lat'];
                $lng = $staff['lng'] ? (float)$staff['lng'] : $storeConfig['lng'];

                $destLat = $activeOrder && $activeOrder['delivery_lat'] ? (float)$activeOrder['delivery_lat'] : ($lat + 0.005);
                $destLng = $activeOrder && $activeOrder['delivery_lng'] ? (float)$activeOrder['delivery_lng'] : ($lng + 0.006);

                $remainingKm = calculateHaversineKm($lat, $lng, $destLat, $destLng);
                $speedKmH = $staff['speed_kmh'] ? (int)$staff['speed_kmh'] : 25;
                $remainingMins = max(2, (int)ceil(($remainingKm / max(10, $speedKmH)) * 60));

                $paymentMethod = $activeOrder ? ($activeOrder['payment_method'] === 'cod' || $activeOrder['payment_method'] === 'cash_on_delivery' ? 'cod' : 'khqr') : 'khqr';

                $couriers[] = [
                    'id'                 => 'AE-DRV-' . (4790 + $staffId),
                    'code'               => 'AE-DRV-' . (4790 + $staffId),
                    'name'               => $staff['name'],
                    'avatarUrl'          => $staff['avatar_url'] ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                    'vehicleType'        => $staff['vehicle_type'] ?: 'motorbike',
                    'vehicleLabel'       => $staff['vehicle_label'] ?: 'Motorbike #' . $staffId,
                    'orderId'            => $activeOrder ? $activeOrder['order_number'] : '#NONE',
                    'customerName'       => $activeOrder ? $activeOrder['customer_name'] : 'No active order',
                    'destinationAddress' => $activeOrder ? $activeOrder['delivery_address'] : 'Stationed at HQ',
                    'speedKmH'           => $speedKmH,
                    'tempCelsius'        => $staff['temp_celsius'] ? (int)$staff['temp_celsius'] : 65,
                    'remainingKm'        => $remainingKm,
                    'remainingMinutes'   => $remainingMins,
                    'etaLabel'           => date('H:i', strtotime("+{$remainingMins} minutes")),
                    'statusText'         => $activeOrder ? ($activeOrder['notes'] ?: "En route to drop-off") : "Available for dispatch",
                    'paymentMethod'      => $paymentMethod,
                    'paymentBadgeLabel'  => $paymentMethod === 'cod' ? 'COD CASH' : 'KHQR PAID',
                    'amount'             => $activeOrder ? (float)$activeOrder['total_amount'] : 0.00,
                    'isFocused'          => $staffId === 2,
                    'coordinates'        => ['x' => 520, 'y' => 210],
                    'lat'                => $lat,
                    'lng'                => $lng,
                    'destLat'            => $destLat,
                    'destLng'            => $destLng,
                    'destName'           => $activeOrder ? $activeOrder['customer_name'] : $storeConfig['name'],
                ];
            }
            $totalCodOnRoad = 0.00;
            $codStmt = $pdo->prepare("
                SELECT COALESCE(SUM(total_amount), 0) as total_cod
                FROM orders
                WHERE fulfillment_type = 'delivery'
                  AND status IN ('on_the_way', 'preparing', 'ready_for_delivery')
                  AND payment_method IN ('cod', 'cash_on_delivery')
            ");
            if ($codStmt && $codStmt->execute()) {
                $codRow = $codStmt->fetch();
                if ($codRow && isset($codRow['total_cod'])) {
                    $totalCodOnRoad = (float)$codRow['total_cod'];
                }
            }

            $avgFulfillmentMinutes = 18.4;
            $avgFulfillStmt = $pdo->prepare("
                SELECT COALESCE(ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, NOW())), 1), 18.4) as avg_mins
                FROM orders
                WHERE fulfillment_type = 'delivery'
                  AND status IN ('on_the_way', 'completed', 'delivered')
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ");
            if ($avgFulfillStmt && $avgFulfillStmt->execute()) {
                $avgFulfillRow = $avgFulfillStmt->fetch();
                if ($avgFulfillRow && !empty($avgFulfillRow['avg_mins'])) {
                    $avgFulfillmentMinutes = (float)$avgFulfillRow['avg_mins'];
                }
            }
            $activeOnRoute = count(array_filter($couriers, function($c) {
                return $c['orderId'] !== '#NONE';
            }));

            $stats = [
                'activeCourierCount'    => $activeOnRoute > 0 ? $activeOnRoute : count($couriers),
                'avgFulfillmentMinutes' => $avgFulfillmentMinutes,
                'totalCodOnRoad'        => $totalCodOnRoad,
            ];

            jsonResponse(1, 'Fleet radar live telemetry fetched successfully', [
                'store'    => $storeConfig,
                'stats'    => $stats,
                'couriers' => $couriers,
            ]);
        } catch (PDOException $e) {
            jsonResponse(0, 'Failed to fetch fleet radar telemetry: ' . $e->getMessage(), null, 500);
        }
        return;
    }

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
                o.status IN ('pending', 'preparing', 'ready_for_delivery')
                OR (o.delivery_staff_id = ? AND o.status IN ('on_the_way', 'completed'))
                OR o.delivery_staff_id IS NULL
              )
            ORDER BY FIELD(o.status, 'on_the_way', 'ready_for_delivery', 'preparing', 'pending', 'completed'), o.id DESC
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

        // Fetch Courier Duty Status from courier_telemetry
        $dutyStmt = $pdo->prepare("SELECT status FROM courier_telemetry WHERE user_id = ?");
        $dutyStmt->execute([$staffId]);
        $dutyRow = $dutyStmt->fetch();
        $dutyStatus = $dutyRow['status'] ?? 'active';
        $isOnline = ($dutyStatus !== 'offline');

        foreach ($orders as &$order) {
            $order['id'] = (int)$order['id'];
            $itemStmt = $pdo->prepare("SELECT id, food_id, food_name, price, quantity, subtotal FROM order_items WHERE order_id = ?");
            $itemStmt->execute([$order['id']]);
            $order['items'] = $itemStmt->fetchAll();
        }

        jsonResponse(1, 'Delivery staff dashboard fetched successfully', [
            'staff_id'     => $staffId,
            'duty_status'  => $dutyStatus,
            'is_online'    => $isOnline,
            'cash_in_hand' => $cashInHand,
            'orders'       => $orders
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch delivery dashboard: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST') {
    // Delivery Staff Action
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['action'])) {
        jsonResponse(0, 'Validation Error: action is required', null, 400);
    }

    $action = $input['action'];
    $staffId = isset($input['staff_id']) ? (int)$input['staff_id'] : 2;

    try {
        if ($action === 'update_duty_status' || $action === 'toggle_shift') {
            $isOnline = !empty($input['is_online']) || (isset($input['status']) && in_array($input['status'], ['active', 'available', 'online']));
            $statusStr = $isOnline ? 'active' : 'offline';

            $stmt = $pdo->prepare("
                INSERT INTO courier_telemetry (user_id, status)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE status = VALUES(status)
            ");
            $stmt->execute([$staffId, $statusStr]);

            logSystemAction(
                $pdo,
                'COURIER_SHIFT_TOGGLE',
                'DELIVERY',
                "Courier #{$staffId} shift status updated to '{$statusStr}'.",
                'info',
                $staffId
            );

            jsonResponse(1, "Shift status updated to {$statusStr}", [
                'staff_id'  => $staffId,
                'status'    => $statusStr,
                'is_online' => $isOnline
            ]);
            return;
        }

        if (empty($input['order_id'])) {
            jsonResponse(0, 'Validation Error: order_id is required for this action', null, 400);
        }

        $orderId = (int)$input['order_id'];
        // Fetch order details & rider details
        $orderStmt = $pdo->prepare("SELECT id, order_number, customer_name, customer_phone, telegram_chat_id, status FROM orders WHERE id = ?");
        $orderStmt->execute([$orderId]);
        $order = $orderStmt->fetch();

        $staffStmt = $pdo->prepare("SELECT name FROM users WHERE id = ?");
        $staffStmt->execute([$staffId]);
        $staff = $staffStmt->fetch();
        $riderName = $staff['name'] ?? 'Delivery Rider';

        if ($action === 'accept_order') {
            $stmt = $pdo->prepare("
                UPDATE orders
                SET delivery_staff_id = ?
                WHERE id = ? AND fulfillment_type = 'delivery'
            ");
            $stmt->execute([$staffId, $orderId]);

            logSystemAction(
                $pdo,
                'DELIVERY_ACCEPT',
                'DELIVERY',
                "Rider '{$riderName}' accepted order '{$order['order_number']}'.",
                'info',
                $staffId,
                $riderName
            );

            jsonResponse(1, 'Order accepted by delivery rider.', [
                'order_id'          => $orderId,
                'delivery_staff_id' => $staffId
            ]);
        } elseif ($action === 'pickup_from_kitchen') {
            // Rider picks up order -> status becomes on_the_way
            $stmt = $pdo->prepare("
                UPDATE orders
                SET status = 'on_the_way', delivery_staff_id = ?
                WHERE id = ? AND fulfillment_type = 'delivery'
            ");
            $stmt->execute([$staffId, $orderId]);

            // 📲 TELEGRAM ALERT
            $statusMsg = formatOrderStatusUpdateMessage($order, 'on_the_way', "Assigned Rider: {$riderName}");
            notifyTelegramGroup($statusMsg);
            if (!empty($order['telegram_chat_id'])) {
                notifyCustomerTelegram($order['telegram_chat_id'], $statusMsg);
            }

            // 📜 Log System Action
            logSystemAction(
                $pdo,
                'DELIVERY_PICKUP',
                'DELIVERY',
                "Rider '{$riderName}' picked up order '{$order['order_number']}' from kitchen (Status: On The Way).",
                'info',
                $staffId,
                $riderName
            );

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

            // 📲 TELEGRAM ALERT
            $statusMsg = formatOrderStatusUpdateMessage($order, 'completed', "Delivered by {$riderName}. Cash Collected!");
            notifyTelegramGroup($statusMsg);
            if (!empty($order['telegram_chat_id'])) {
                notifyCustomerTelegram($order['telegram_chat_id'], $statusMsg);
            }

            // 📜 Log System Action
            logSystemAction(
                $pdo,
                'DELIVERY_COMPLETED',
                'DELIVERY',
                "Order '{$order['order_number']}' successfully delivered by rider '{$riderName}'. Cash on Delivery collected.",
                'info',
                $staffId,
                $riderName
            );

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
