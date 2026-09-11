<?php
// backend/api/customers.php
// REST API Endpoint for Customer Management (Admin Protected)

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';
require_once __DIR__ . '/../lib/paginator.php';

CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

// Require Admin Role Authentication
$adminUser = AuthMiddleware::authenticate($pdo, ['admin']);

if ($method === 'GET') {
    try {
        $targetId = $_GET['id'] ?? null;
        if ($targetId && strpos($targetId, 'CUST-') === 0) {
            $targetId = (int)str_replace('CUST-', '', $targetId);
        }

        $tenantId = AuthMiddleware::getTenantFilter($pdo, ['admin']);
        $orderTenantJoin = $tenantId !== null ? " AND o.restaurant_id = " . (int)$tenantId : "";

        // Helper to format order history for a user
        $fetchUserOrders = function(PDO $pdo, int $userId, ?int $tenantId): array {
            $sql = "
                SELECT o.id, o.order_number, o.created_at, o.fulfillment_type as channel,
                       o.total_amount as totalPrice, o.payment_method, o.payment_status,
                       o.payment_proof_url as proofImageUrl,
                       (
                           SELECT GROUP_CONCAT(CONCAT(oi.quantity, 'x ', oi.food_name) SEPARATOR ', ')
                           FROM order_items oi
                           WHERE oi.order_id = o.id
                       ) as itemsSummary
                FROM orders o
                WHERE o.user_id = ?
            ";
            $params = [$userId];

            if ($tenantId !== null) {
                $sql .= " AND o.restaurant_id = ?";
                $params[] = $tenantId;
            }

            $sql .= " ORDER BY o.id DESC LIMIT 10";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rawOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return array_map(function($ord) {
                $isPaid = in_array($ord['payment_status'], ['paid', 'verified']);
                $methodName = strtoupper(str_replace('_', ' ', $ord['payment_method']));
                
                if ($ord['payment_method'] === 'khqr') {
                    $badge = $isPaid ? 'KHQR PAID' : 'KHQR Pending';
                } elseif ($ord['payment_method'] === 'counter_cash' || $ord['payment_method'] === 'cash_at_counter') {
                    $badge = $isPaid ? 'PAID (COUNTER)' : 'Unpaid Counter';
                } else {
                    $badge = $isPaid ? "PAID ({$methodName})" : "Unpaid ({$methodName})";
                }

                $timeAgo = 'Recently';
                if (!empty($ord['created_at'])) {
                    $timestamp = strtotime($ord['created_at']);
                    $diffSeconds = time() - $timestamp;
                    if ($diffSeconds >= 0 && $diffSeconds < 86400 && date('Y-m-d', $timestamp) === date('Y-m-d')) {
                        $timeAgo = 'Today, ' . date('H:i', $timestamp);
                    } elseif (date('Y-m-d', $timestamp) === date('Y-m-d', strtotime('-1 day'))) {
                        $timeAgo = 'Yesterday';
                    } else {
                        $diffDays = max(1, (int)round(abs($diffSeconds) / 86400));
                        $timeAgo = "{$diffDays} days ago";
                    }
                }

                return [
                    'id' => "#" . sprintf('%04d', $ord['id']),
                    'numericId' => (int)$ord['id'],
                    'dateLabel' => $timeAgo,
                    'itemsSummary' => $ord['itemsSummary'] ?: 'Food Order',
                    'totalPrice' => (float)$ord['totalPrice'],
                    'channel' => strtolower($ord['channel']),
                    'paymentBadge' => $badge,
                    'paymentIsPaid' => $isPaid,
                    'proofImageUrl' => $ord['proofImageUrl'] ?? null
                ];
            }, $rawOrders);
        };

        // 1. Fetch Single Customer Detail by ID
        if (!empty($targetId)) {
            $stmt = $pdo->prepare("
                SELECT u.id, u.name, u.phone, u.email, u.avatar_url,
                       COALESCE(u.customer_tag, 'New') as tag,
                       u.primary_address as address,
                       u.delivery_notes as notes,
                       COALESCE(u.preferred_channel, 'delivery') as preferredChannel,
                       COALESCE(u.payment_preference, 'KHQR') as paymentPreference,
                       u.status,
                       u.created_at,
                       COUNT(o.id) as totalOrders,
                       COALESCE(SUM(CASE WHEN o.payment_status IN ('paid', 'verified') THEN o.total_amount ELSE 0 END), 0.00) as totalSpend,
                       MAX(o.created_at) as lastOrderDateRaw
                FROM users u
                LEFT JOIN orders o ON o.user_id = u.id {$orderTenantJoin}
                WHERE u.id = ? AND u.role = 'customer'
                GROUP BY u.id
                LIMIT 1
            ");
            $stmt->execute([(int)$targetId]);
            $cust = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$cust) {
                jsonResponse(0, 'Customer not found', null, 404);
            }

            $formattedId = "CUST-" . sprintf('%03d', $cust['id']);
            $orders = $fetchUserOrders($pdo, (int)$cust['id'], $tenantId);

            $custData = [
                'id' => $formattedId,
                'numericId' => (int)$cust['id'],
                'name' => $cust['name'],
                'phone' => $cust['phone'],
                'email' => $cust['email'] ?? '',
                'tag' => $cust['tag'],
                'totalOrders' => (int)$cust['totalOrders'],
                'totalSpend' => (float)$cust['totalSpend'],
                'preferredChannel' => $cust['preferredChannel'],
                'paymentPreference' => $cust['paymentPreference'],
                'lastOrderDate' => !empty($cust['lastOrderDateRaw']) ? date('M d, Y', strtotime($cust['lastOrderDateRaw'])) : 'No orders yet',
                'address' => $cust['address'] ?? '',
                'notes' => $cust['notes'] ?? '',
                'orders' => $orders
            ];

            jsonResponse(1, 'Fetch customer detail successfully', $custData);
        }

        // 2. Fetch Customers Catalog List (Paginated & Filtered)
        $tagParam = $_GET['tag'] ?? null;
        $searchParam = trim($_GET['search'] ?? $_GET['q'] ?? '');
        $pageParam = isset($_GET['page']) ? max(1, (int)$_GET['page']) : null;
        $limitParam = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : null;

        $whereConditions = ["u.role = 'customer'"];
        $params = [];

        if (!empty($tagParam) && $tagParam !== 'all') {
            if ($tagParam === 'vip') {
                $whereConditions[] = "u.customer_tag = 'VIP'";
            } elseif ($tagParam === 'regular') {
                $whereConditions[] = "u.customer_tag = 'Regular'";
            } elseif ($tagParam === 'high_spend') {
                $whereConditions[] = "u.customer_tag = 'High Spend'";
            } elseif ($tagParam === 'new') {
                $whereConditions[] = "u.customer_tag = 'New'";
            }
        }

        if (!empty($searchParam)) {
            $whereConditions[] = "(u.name LIKE ? OR u.phone LIKE ? OR u.email LIKE ? OR u.primary_address LIKE ?)";
            $searchTerm = "%{$searchParam}%";
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }

        // Filter customers for restaurant admin to only those who have ordered at their restaurant
        $tenantCustomerCondition = "";
        if ($tenantId !== null) {
            $tenantCustomerCondition = " AND EXISTS (SELECT 1 FROM orders o_sub WHERE o_sub.user_id = u.id AND o_sub.restaurant_id = " . (int)$tenantId . ")";
            $whereConditions[] = "EXISTS (SELECT 1 FROM orders o_sub WHERE o_sub.user_id = u.id AND o_sub.restaurant_id = " . (int)$tenantId . ")";
        }

        $whereClause = " WHERE " . implode(" AND ", $whereConditions);

        // Calculate Stats Counts across customers
        $statsSql = "
            SELECT 
                COUNT(*) as totalAll,
                SUM(CASE WHEN u.customer_tag = 'VIP' THEN 1 ELSE 0 END) as totalVip,
                SUM(CASE WHEN u.customer_tag = 'Regular' THEN 1 ELSE 0 END) as totalRegular,
                SUM(CASE WHEN u.customer_tag = 'High Spend' THEN 1 ELSE 0 END) as totalHighSpend,
                SUM(CASE WHEN u.customer_tag = 'New' THEN 1 ELSE 0 END) as totalNew
            FROM users u
            WHERE u.role = 'customer' {$tenantCustomerCondition}
        ";
        $statsStmt = $pdo->query($statsSql);
        $statsData = $statsStmt->fetch(PDO::FETCH_ASSOC);

        $counts = [
            'all'       => (int)($statsData['totalAll'] ?? 0),
            'vip'       => (int)($statsData['totalVip'] ?? 0),
            'regular'   => (int)($statsData['totalRegular'] ?? 0),
            'highSpend' => (int)($statsData['totalHighSpend'] ?? 0),
            'new'       => (int)($statsData['totalNew'] ?? 0)
        ];

        // Main SQL Query
        $baseSql = "
            SELECT u.id, u.name, u.phone, u.email, u.avatar_url,
                   COALESCE(u.customer_tag, 'New') as tag,
                   u.primary_address as address,
                   u.delivery_notes as notes,
                   COALESCE(u.preferred_channel, 'delivery') as preferredChannel,
                   COALESCE(u.payment_preference, 'KHQR') as paymentPreference,
                   u.status,
                   u.created_at,
                   COUNT(o.id) as totalOrders,
                   COALESCE(SUM(CASE WHEN o.payment_status IN ('paid', 'verified') THEN o.total_amount ELSE 0 END), 0.00) as totalSpend,
                   MAX(o.created_at) as lastOrderDateRaw
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id {$orderTenantJoin}
            {$whereClause}
            GROUP BY u.id
            ORDER BY u.id DESC
        ";

        $result = paginateQuery($pdo, $baseSql, $params, $pageParam, $limitParam);
        $rawCustomers = $result['data'];

        $formattedCustomers = array_map(function($cust) use ($pdo, $fetchUserOrders, $tenantId) {
            $formattedId = "CUST-" . sprintf('%03d', $cust['id']);
            $orders = $fetchUserOrders($pdo, (int)$cust['id'], $tenantId);

            $lastDate = 'No orders yet';
            if (!empty($cust['lastOrderDateRaw'])) {
                $timestamp = strtotime($cust['lastOrderDateRaw']);
                $diffSeconds = time() - $timestamp;
                if ($diffSeconds >= 0 && $diffSeconds < 86400 && date('Y-m-d', $timestamp) === date('Y-m-d')) {
                    $lastDate = 'Today, ' . date('H:i', $timestamp);
                } elseif (date('Y-m-d', $timestamp) === date('Y-m-d', strtotime('-1 day'))) {
                    $lastDate = 'Yesterday';
                } else {
                    $diffDays = max(1, (int)round(abs($diffSeconds) / 86400));
                    $lastDate = "{$diffDays} days ago";
                }
            }

            return [
                'id' => $formattedId,
                'numericId' => (int)$cust['id'],
                'name' => $cust['name'],
                'phone' => $cust['phone'],
                'email' => $cust['email'] ?? '',
                'tag' => $cust['tag'],
                'totalOrders' => (int)$cust['totalOrders'],
                'totalSpend' => (float)$cust['totalSpend'],
                'preferredChannel' => $cust['preferredChannel'],
                'paymentPreference' => $cust['paymentPreference'],
                'lastOrderDate' => $lastDate,
                'address' => $cust['address'] ?? '',
                'notes' => $cust['notes'] ?? '',
                'orders' => $orders
            ];
        }, $rawCustomers);

        jsonResponse(1, 'Fetch customers successfully', [
            'customers' => $formattedCustomers,
            'counts' => $counts,
            'pagination' => $result['pagination']
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch customers: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST') {
    // Requires Admin Role
    $admin = AuthMiddleware::authenticate($pdo, ['admin']);
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if (empty($input['name']) || empty($input['phone'])) {
        jsonResponse(0, 'Validation Error: Customer name and phone are required.', null, 400);
    }

    try {
        $name = trim($input['name']);
        $phone = trim($input['phone']);
        $email = !empty($input['email']) ? trim($input['email']) : null;
        $tag = !empty($input['tag']) && in_array($input['tag'], ['VIP', 'Regular', 'High Spend', 'New']) ? $input['tag'] : 'New';
        $address = $input['address'] ?? $input['primary_address'] ?? null;
        $notes = $input['notes'] ?? $input['delivery_notes'] ?? null;
        $channel = !empty($input['preferredChannel']) ? $input['preferredChannel'] : (!empty($input['preferred_channel']) ? $input['preferred_channel'] : 'delivery');
        $paymentPref = !empty($input['paymentPreference']) ? $input['paymentPreference'] : (!empty($input['payment_preference']) ? $input['payment_preference'] : 'KHQR');
        $defaultPassword = password_hash('customer123', PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("
            INSERT INTO users (name, phone, email, role, password, customer_tag, primary_address, delivery_notes, preferred_channel, payment_preference)
            VALUES (?, ?, ?, 'customer', ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $phone, $email, $defaultPassword, $tag, $address, $notes, $channel, $paymentPref]);
        $newId = (int)$pdo->lastInsertId();

        logSystemAction($pdo, 'CREATE_CUSTOMER', 'CUSTOMER', "Customer '{$name}' (ID #{$newId}) created by Admin.", 'info', $admin['id'], $admin['name']);

        jsonResponse(1, 'Customer created successfully', [
            'id' => "CUST-" . sprintf('%03d', $newId),
            'numericId' => $newId,
            'name' => $name,
            'phone' => $phone,
            'email' => $email ?? '',
            'tag' => $tag,
            'totalOrders' => 0,
            'totalSpend' => 0.00,
            'preferredChannel' => $channel,
            'paymentPreference' => $paymentPref,
            'lastOrderDate' => 'No orders yet',
            'address' => $address ?? '',
            'notes' => $notes ?? '',
            'orders' => []
        ], 201);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            jsonResponse(0, 'Validation Error: A customer with this phone number already exists.', null, 400);
        }
        jsonResponse(0, 'Failed to create customer: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'PUT' || $method === 'PATCH') {
    // Requires Admin Role
    $admin = AuthMiddleware::authenticate($pdo, ['admin']);
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $idStr = $_GET['id'] ?? $input['id'] ?? null;

    if (empty($idStr)) {
        jsonResponse(0, 'Validation Error: Customer ID is required.', null, 400);
    }

    $numericId = (int)str_replace('CUST-', '', $idStr);

    try {
        $fields = [];
        $params = [];

        if (isset($input['name'])) { $fields[] = "name = ?"; $params[] = trim($input['name']); }
        if (isset($input['phone'])) { $fields[] = "phone = ?"; $params[] = trim($input['phone']); }
        if (array_key_exists('email', $input)) { $fields[] = "email = ?"; $params[] = $input['email']; }
        if (isset($input['tag']) || isset($input['customer_tag'])) {
            $val = $input['tag'] ?? $input['customer_tag'];
            if (in_array($val, ['VIP', 'Regular', 'High Spend', 'New'])) {
                $fields[] = "customer_tag = ?"; $params[] = $val;
            }
        }
        if (array_key_exists('address', $input) || array_key_exists('primary_address', $input)) {
            $fields[] = "primary_address = ?"; $params[] = $input['address'] ?? $input['primary_address'];
        }
        if (array_key_exists('notes', $input) || array_key_exists('delivery_notes', $input)) {
            $fields[] = "delivery_notes = ?"; $params[] = $input['notes'] ?? $input['delivery_notes'];
        }
        if (isset($input['preferredChannel']) || isset($input['preferred_channel'])) {
            $fields[] = "preferred_channel = ?"; $params[] = $input['preferredChannel'] ?? $input['preferred_channel'];
        }
        if (isset($input['paymentPreference']) || isset($input['payment_preference'])) {
            $fields[] = "payment_preference = ?"; $params[] = $input['paymentPreference'] ?? $input['payment_preference'];
        }

        if (empty($fields)) {
            jsonResponse(0, 'No fields provided for update.', null, 400);
        }

        $params[] = $numericId;
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ? AND role = 'customer'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        logSystemAction($pdo, 'UPDATE_CUSTOMER', 'CUSTOMER', "Customer ID #{$numericId} updated by Admin.", 'info', $admin['id'], $admin['name']);

        jsonResponse(1, 'Customer updated successfully', ['id' => "CUST-" . sprintf('%03d', $numericId)]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to update customer: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'DELETE') {
    // Requires Admin Role
    $admin = AuthMiddleware::authenticate($pdo, ['admin']);
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $idStr = $_GET['id'] ?? $input['id'] ?? null;

    if (empty($idStr)) {
        jsonResponse(0, 'Validation Error: Customer ID is required for deletion.', null, 400);
    }

    $numericId = (int)str_replace('CUST-', '', $idStr);

    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'customer'");
        $stmt->execute([$numericId]);

        logSystemAction($pdo, 'DELETE_CUSTOMER', 'CUSTOMER', "Customer ID #{$numericId} deleted by Admin.", 'warning', $admin['id'], $admin['name']);

        jsonResponse(1, 'Customer deleted successfully', ['id' => "CUST-" . sprintf('%03d', $numericId)]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to delete customer: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
