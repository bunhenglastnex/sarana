<?php
// backend/api/orders.php
// Orders REST API Endpoint (Admin & Customer Support)

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/telegram.php';
require_once __DIR__ . '/../lib/logger.php';

CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    try {
        $statusFilter       = $_GET['status'] ?? 'all';
        $fulfillmentFilter  = $_GET['channel'] ?? $_GET['fulfillment_type'] ?? 'all';
        $searchQuery        = trim($_GET['search'] ?? '');
        $page               = max(1, (int)($_GET['page'] ?? 1));
        $limit              = max(1, min(100, (int)($_GET['limit'] ?? 10)));

        $whereClause = " WHERE 1=1";
        $params = [];

        // Apply Status Filter
        if ($statusFilter !== 'all' && !empty($statusFilter)) {
            if ($statusFilter === 'pending') {
                $whereClause .= " AND o.status IN ('pending', 'accepted')";
            } elseif ($statusFilter === 'preparing') {
                $whereClause .= " AND o.status = 'preparing'";
            } elseif ($statusFilter === 'ready') {
                $whereClause .= " AND o.status IN ('ready_for_pickup', 'ready_for_delivery')";
            } elseif ($statusFilter === 'delivery') {
                $whereClause .= " AND o.fulfillment_type = 'delivery' AND o.status NOT IN ('delivered', 'completed', 'cancelled')";
            } elseif ($statusFilter === 'pickup') {
                $whereClause .= " AND o.fulfillment_type = 'pickup' AND o.status NOT IN ('delivered', 'completed', 'cancelled')";
            } elseif ($statusFilter === 'completed') {
                $whereClause .= " AND o.status IN ('delivered', 'completed', 'picked_up')";
            } elseif ($statusFilter === 'cancelled') {
                $whereClause .= " AND o.status = 'cancelled'";
            }
        }

        // Apply Fulfillment Channel Filter
        if ($fulfillmentFilter !== 'all' && !empty($fulfillmentFilter)) {
            $whereClause .= " AND o.fulfillment_type = ?";
            $params[] = $fulfillmentFilter;
        }

        // Apply Search Filter
        if ($searchQuery !== '') {
            $whereClause .= " AND (o.order_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?)";
            $searchTerm = '%' . $searchQuery . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Count total matching orders for pagination
        $countSql = "SELECT COUNT(*) as total FROM orders o" . $whereClause;
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $totalPages = max(1, (int)ceil($total / $limit));
        $hasMore = $page < $totalPages;
        $offset = ($page - 1) * $limit;

        // Fetch paginated raw orders
        $sql = "SELECT o.*, u.name as delivery_staff_name, c.customer_tag 
                FROM orders o 
                LEFT JOIN users u ON o.delivery_staff_id = u.id 
                LEFT JOIN users c ON o.user_id = c.id 
                " . $whereClause . " 
                ORDER BY o.created_at DESC, o.id DESC 
                LIMIT " . (int)$limit . " OFFSET " . (int)$offset;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rawOrders = $stmt->fetchAll();

        // Also fetch aggregate counts across ALL orders (unfiltered by status tab) for tab headers & metrics
        $aggSql = "SELECT 
                    COUNT(*) as count_all,
                    SUM(CASE WHEN status IN ('pending', 'accepted') THEN 1 ELSE 0 END) as count_pending,
                    SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as count_preparing,
                    SUM(CASE WHEN status IN ('ready_for_pickup', 'ready_for_delivery') THEN 1 ELSE 0 END) as count_ready,
                    SUM(CASE WHEN fulfillment_type = 'delivery' AND status NOT IN ('delivered', 'completed', 'cancelled') THEN 1 ELSE 0 END) as count_delivery,
                    SUM(CASE WHEN fulfillment_type = 'pickup' AND status NOT IN ('delivered', 'completed', 'cancelled') THEN 1 ELSE 0 END) as count_pickup,
                    SUM(CASE WHEN status IN ('delivered', 'completed', 'picked_up') THEN 1 ELSE 0 END) as count_completed,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as count_cancelled,
                    SUM(CASE WHEN payment_status NOT IN ('paid', 'verified') AND payment_method IN ('cod', 'cash_on_delivery') THEN total_amount ELSE 0 END) as cod_pending_total,
                    SUM(CASE WHEN fulfillment_type = 'delivery' AND status NOT IN ('delivered', 'completed', 'cancelled') THEN 1 ELSE 0 END) as active_dispatch_count
                FROM orders";
        $aggStmt = $pdo->query($aggSql);
        $agg = $aggStmt->fetch();

        $counts = [
            'all'       => (int)($agg['count_all'] ?? 0),
            'pending'   => (int)($agg['count_pending'] ?? 0),
            'preparing' => (int)($agg['count_preparing'] ?? 0),
            'ready'     => (int)($agg['count_ready'] ?? 0),
            'delivery'  => (int)($agg['count_delivery'] ?? 0),
            'pickup'    => (int)($agg['count_pickup'] ?? 0),
            'completed' => (int)($agg['count_completed'] ?? 0),
            'cancelled' => (int)($agg['count_cancelled'] ?? 0),
        ];

        $metrics = [
            'activeCount'     => (int)($agg['count_all'] ?? 0),
            'prepCount'       => (int)($agg['count_preparing'] ?? 0),
            'dispatchCount'   => (int)($agg['active_dispatch_count'] ?? 0),
            'codPendingTotal' => round((float)($agg['cod_pending_total'] ?? 0), 2),
        ];

        $formattedOrders = [];

        foreach ($rawOrders as $o) {
            $orderId = (int)$o['id'];

            // Fetch order items
            $itemStmt = $pdo->prepare("SELECT id, food_id, food_name, price, quantity, subtotal FROM order_items WHERE order_id = ?");
            $itemStmt->execute([$orderId]);
            $items = $itemStmt->fetchAll();

            $formattedItems = [];
            $itemSummaries = [];
            $totalCount = 0;

            foreach ($items as $it) {
                $qty = (int)$it['quantity'];
                $totalCount += $qty;
                $itemSummaries[] = "{$qty}x {$it['food_name']}";

                $formattedItems[] = [
                    'id'          => 'item-' . $it['id'],
                    'name'        => $it['food_name'],
                    'price'       => (float)$it['subtotal'],
                    'quantity'    => $qty,
                    'basePrice'   => (float)$it['price'],
                ];
            }

            // Map DB status to frontend OrderStatus & Labels
            $dbStatus = $o['status'];
            $frontendStatus = 'pending';
            $statusLabel = 'PENDING';
            $lifecycleStep = 1;

            if ($dbStatus === 'pending') {
                $frontendStatus = 'pending'; $statusLabel = 'PENDING'; $lifecycleStep = 1;
            } elseif ($dbStatus === 'accepted') {
                $frontendStatus = 'pending'; $statusLabel = 'ACCEPTED'; $lifecycleStep = 2;
            } elseif ($dbStatus === 'preparing') {
                $frontendStatus = 'preparing'; $statusLabel = 'PREPARING'; $lifecycleStep = 3;
            } elseif (in_array($dbStatus, ['ready_for_pickup', 'ready_for_delivery'])) {
                $frontendStatus = 'ready'; $statusLabel = 'READY (STAGE)'; $lifecycleStep = 4;
            } elseif ($dbStatus === 'on_the_way') {
                $frontendStatus = 'in_transit'; $statusLabel = 'IN TRANSIT'; $lifecycleStep = 5;
            } elseif (in_array($dbStatus, ['delivered', 'completed'])) {
                $frontendStatus = $o['fulfillment_type'] === 'pickup' ? 'picked_up' : 'delivered';
                $statusLabel = strtoupper($frontendStatus);
                $lifecycleStep = $o['fulfillment_type'] === 'pickup' ? 5 : 6;
            } elseif ($dbStatus === 'cancelled') {
                $frontendStatus = 'cancelled'; $statusLabel = 'CANCELLED'; $lifecycleStep = 1;
            }

            // Map Payment Details
            $paymentMethodRaw = $o['payment_method'];
            $paymentStatusRaw = $o['payment_status'];
            $isPaid = in_array($paymentStatusRaw, ['paid', 'verified']);
            
            $payMethod = 'khqr';
            $payBadge = 'PAID (KHQR)';

            if ($paymentStatusRaw === 'refunded') {
                $payBadge = 'REFUNDED KHQR';
                $isPaid = false;
            } elseif ($paymentMethodRaw === 'khqr') {
                $payMethod = 'khqr';
                $payBadge = $isPaid ? 'PAID (KHQR)' : 'KHQR Pending';
            } elseif (in_array($paymentMethodRaw, ['cod', 'cash_on_delivery'])) {
                $payMethod = 'cod';
                $payBadge = $isPaid ? 'COD Paid (Admin Verified)' : 'COD Unpaid';
            } elseif (in_array($paymentMethodRaw, ['counter_cash', 'cash_at_counter'])) {
                $payMethod = 'cash';
                $payBadge = $isPaid ? 'Paid Cash' : 'Unpaid Counter';
            } else {
                $payMethod = 'card';
                $payBadge = $isPaid ? 'Paid • Card' : 'Pending Card';
            }

            // Format placed time & relative time
            $createdTimestamp = strtotime($o['created_at']);
            $placedTimeLabel = date('H:i', $createdTimestamp);
            $diffMins = max(1, (int)round((time() - $createdTimestamp) / 60));
            $timeAgoLabel = $diffMins < 60 ? "{$diffMins}m ago" : (int)floor($diffMins / 60) . "h " . ($diffMins % 60) . "m ago";

            $formattedOrders[] = [
                'id'                   => '#' . ltrim($o['order_number'], '#'),
                'dbId'                 => (int)$o['id'],
                'customerName'         => $o['customer_name'],
                'customerPhone'        => $o['customer_phone'],
                'customerTag'          => $o['customer_tag'] ?? ($o['user_id'] ? 'Registered Guest' : 'First Order'),
                'channel'              => $o['fulfillment_type'],
                'channelLabel'         => $o['fulfillment_type'] === 'delivery' ? 'Direct Delivery' : 'Express Pickup',
                'placedTimeLabel'      => $placedTimeLabel,
                'timeAgoLabel'         => $timeAgoLabel,
                'status'               => $frontendStatus,
                'statusLabel'          => $statusLabel,
                'itemsSummary'         => implode(', ', $itemSummaries),
                'totalItemsCount'      => $totalCount,
                'items'                => $formattedItems,
                'totalPrice'           => (float)$o['total_amount'],
                'subtotal'             => (float)$o['food_amount'],
                'deliveryFee'          => (float)$o['delivery_fee'],
                'discount'             => 0.00,
                'tax'                  => round((float)$o['food_amount'] * 0.08, 2),
                'paymentMethod'        => $payMethod,
                'paymentBadgeLabel'    => $payBadge,
                'paymentIsPaid'        => $isPaid,
                'deliveryAddress'      => $o['delivery_address'] ?? null,
                'deliveryAddressCity'  => 'Chicago, IL 60611',
                'deliveryNote'         => $o['notes'] ?? null,
                'kitchenStation'       => 'Main Hearth',
                'estimatedPrepMinutes' => 15,
                'lifecycleStep'        => $lifecycleStep,
                'proofImageUrl'        => $o['payment_proof_url'] ?? null,
                'cancelReason'         => $o['notes'] ?? null,
            ];
        }

        jsonResponse(1, 'Orders retrieved successfully', [
            'orders'     => $formattedOrders,
            'pagination' => [
                'total'      => $total,
                'page'       => $page,
                'limit'      => $limit,
                'totalPages' => $totalPages,
                'hasMore'    => $hasMore,
            ],
            'counts'     => $counts,
            'metrics'    => $metrics,
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch orders: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
    // Action Handling: Update Order Status, Verify Payment, Refund, or Cancel
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? null;
    $orderNumber = $input['order_id'] ?? $input['order_number'] ?? null;

    if (!$orderNumber) {
        jsonResponse(0, 'Validation Error: order_id is required', null, 400);
    }

    try {
        $rawNum = (string)$orderNumber;
        $unhashed = ltrim($rawNum, '#');
        $numericId = (int)preg_replace('/[^0-9]/', '', $rawNum);
        $ordPrefixed = 'ORD-' . $numericId;
        $hashOrdPrefixed = '#ORD-' . $numericId;
        $hashNumeric = '#' . $numericId;

        $stmt = $pdo->prepare("
            SELECT id, order_number, status, payment_status, fulfillment_type 
            FROM orders 
            WHERE id = ? 
               OR order_number = ? 
               OR order_number = ? 
               OR order_number = ? 
               OR order_number = ? 
               OR order_number = ? 
               OR order_number = ?
            LIMIT 1
        ");
        $stmt->execute([
            $numericId,
            $rawNum,
            $unhashed,
            $ordPrefixed,
            $hashOrdPrefixed,
            $hashNumeric,
            (string)$numericId
        ]);
        $order = $stmt->fetch();

        if (!$order) {
            jsonResponse(0, "Order '{$orderNumber}' not found in database", null, 404);
        }

        $dbId = (int)$order['id'];

        if ($action === 'accept') {
            $upStmt = $pdo->prepare("UPDATE orders SET status = 'preparing' WHERE id = ?");
            $upStmt->execute([$dbId]);
            jsonResponse(1, "Order {$order['order_number']} ACCEPTED & PREPARING", [
                'order_id' => '#' . ltrim($order['order_number'], '#'),
                'status'   => 'preparing'
            ]);
        } elseif ($action === 'mark_ready') {
            $readyStatus = ($order['fulfillment_type'] === 'pickup') ? 'ready_for_pickup' : 'ready_for_delivery';
            $upStmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $upStmt->execute([$readyStatus, $dbId]);
            jsonResponse(1, "Order {$order['order_number']} marked as READY", [
                'order_id' => '#' . ltrim($order['order_number'], '#'),
                'status'   => 'ready'
            ]);
        } elseif ($action === 'start_delivery' || $action === 'dispatch') {
            $upStmt = $pdo->prepare("UPDATE orders SET status = 'on_the_way' WHERE id = ?");
            $upStmt->execute([$dbId]);
            jsonResponse(1, "Order {$order['order_number']} DISPATCHED for delivery", [
                'order_id' => '#' . ltrim($order['order_number'], '#'),
                'status'   => 'in_transit'
            ]);
        } elseif (in_array($action, ['complete', 'mark_picked_up', 'mark_delivered'])) {
            $upStmt = $pdo->prepare("UPDATE orders SET status = 'completed' WHERE id = ?");
            $upStmt->execute([$dbId]);
            jsonResponse(1, "Order {$order['order_number']} COMPLETED and cleared", [
                'order_id' => '#' . ltrim($order['order_number'], '#'),
                'status'   => 'completed'
            ]);
        } elseif ($action === 'cancel') {
            $reason = $input['cancel_reason'] ?? $input['reason'] ?? 'Cancelled by admin expediter';
            $upStmt = $pdo->prepare("UPDATE orders SET status = 'cancelled', notes = ? WHERE id = ?");
            $upStmt->execute([$reason, $dbId]);
            jsonResponse(1, "Order {$order['order_number']} CANCELLED", ['order_id' => $order['order_number'], 'status' => 'cancelled']);
        } elseif ($action === 'verify_admin' || $action === 'verify') {
            $upStmt = $pdo->prepare("UPDATE orders SET payment_status = 'verified' WHERE id = ?");
            $upStmt->execute([$dbId]);
            jsonResponse(1, "Order {$order['order_number']} payment verified by admin", ['order_id' => $order['order_number'], 'payment_status' => 'verified']);
        } elseif ($action === 'process_refund' || $action === 'refund') {
            $proofUrl = $input['refund_proof_url'] ?? $input['proofUrl'] ?? $input['proof_image_url'] ?? $input['proof'] ?? null;
            $reason   = $input['refund_reason'] ?? $input['cancel_reason'] ?? $input['reason'] ?? 'Customer requested refund / Item sold out';

            $upSql = "UPDATE orders SET payment_status = 'refunded', status = 'cancelled'";
            $queryParams = [];

            if ($proofUrl) {
                $upSql .= ", payment_proof_url = ?";
                $queryParams[] = $proofUrl;
            }

            if ($reason) {
                $upSql .= ", notes = ?";
                $queryParams[] = $reason;
            }

            $upSql .= " WHERE id = ?";
            $queryParams[] = $dbId;

            $upStmt = $pdo->prepare($upSql);
            $upStmt->execute($queryParams);

            logSystemAction(
                $pdo,
                'PROCESS_REFUND',
                'ORDER',
                "Refund processed for Order '{$order['order_number']}'. Reason: {$reason}",
                'info'
            );

            jsonResponse(1, "Refund processed successfully for Order {$order['order_number']}", [
                'order_id'         => '#' . ltrim($order['order_number'], '#'),
                'payment_status'   => 'refunded',
                'status'           => 'cancelled',
                'refund_proof_url' => $proofUrl,
            ]);
        } else {
            jsonResponse(0, 'Unknown order action', null, 400);
        }
    } catch (PDOException $e) {
        jsonResponse(0, 'Action failed: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}

