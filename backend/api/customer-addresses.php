<?php
// backend/api/customer-addresses.php
// Dedicated Customer Saved Addresses REST API

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

// Handle GET: Fetch user's saved addresses
if ($method === 'GET') {
    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

    // Optional Token auth fallback
    if (!$userId) {
        $currentUser = AuthMiddleware::getAuthenticatedUser();
        if ($currentUser) {
            $userId = (int)$currentUser['id'];
        }
    }

    if (!$userId) {
        jsonResponse(0, 'user_id is required to fetch saved addresses', [], 400);
    }

    $stmt = $pdo->prepare("SELECT id, user_id, label, address, lat, lng, tag, is_default, created_at, updated_at FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC");
    $stmt->execute([$userId]);
    $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format response types
    $formatted = array_map(function($a) {
        return [
            'id' => (int)$a['id'],
            'userId' => (int)$a['user_id'],
            'label' => $a['label'],
            'address' => $a['address'],
            'lat' => $a['lat'] !== null ? (float)$a['lat'] : null,
            'lng' => $a['lng'] !== null ? (float)$a['lng'] : null,
            'tag' => $a['tag'] ?? 'Home',
            'isDefault' => (bool)$a['is_default'],
            'createdAt' => $a['created_at'],
        ];
    }, $addresses);

    jsonResponse(1, 'Saved addresses retrieved successfully', $formatted, 200);
}

// Handle POST: Create new address or bulk-sync addresses
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $userId = isset($input['user_id']) ? (int)$input['user_id'] : (isset($input['userId']) ? (int)$input['userId'] : null);

    if (!$userId) {
        $currentUser = AuthMiddleware::getAuthenticatedUser();
        if ($currentUser) {
            $userId = (int)$currentUser['id'];
        }
    }

    if (!$userId) {
        jsonResponse(0, 'user_id is required', null, 400);
    }

    // Bulk Sync Mode
    if (isset($input['addresses']) && is_array($input['addresses'])) {
        $pdo->beginTransaction();
        try {
            foreach ($input['addresses'] as $item) {
                $label = trim($item['label'] ?? 'Saved Location');
                $address = trim($item['address'] ?? '');
                if (empty($address)) continue;

                $lat = isset($item['lat']) ? (float)$item['lat'] : null;
                $lng = isset($item['lng']) ? (float)$item['lng'] : null;
                $tag = trim($item['tag'] ?? 'Home');
                $isDefault = !empty($item['isDefault']) || !empty($item['is_default']) ? 1 : 0;

                // Check if identical address already exists for user
                $check = $pdo->prepare("SELECT id FROM user_addresses WHERE user_id = ? AND label = ? AND address = ?");
                $check->execute([$userId, $label, $address]);
                if (!$check->fetch()) {
                    if ($isDefault) {
                        $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?")->execute([$userId]);
                    }
                    $ins = $pdo->prepare("INSERT INTO user_addresses (user_id, label, address, lat, lng, tag, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $ins->execute([$userId, $label, $address, $lat, $lng, $tag, $isDefault]);
                }
            }
            $pdo->commit();

            $stmt = $pdo->prepare("SELECT id, user_id, label, address, lat, lng, tag, is_default, created_at FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC");
            $stmt->execute([$userId]);
            $updated = $stmt->fetchAll(PDO::FETCH_ASSOC);

            jsonResponse(1, 'Addresses synced successfully', $updated, 200);
        } catch (\Exception $e) {
            $pdo->rollBack();
            jsonResponse(0, 'Bulk sync failed: ' . $e->getMessage(), null, 500);
        }
    }

    // Single Create Mode
    $label = trim($input['label'] ?? 'Saved Location');
    $address = trim($input['address'] ?? '');
    $lat = isset($input['lat']) ? (float)$input['lat'] : null;
    $lng = isset($input['lng']) ? (float)$input['lng'] : null;
    $tag = trim($input['tag'] ?? 'Home');
    $isDefault = !empty($input['isDefault']) || !empty($input['is_default']) ? 1 : 0;

    if (empty($address)) {
        jsonResponse(0, 'Address is required', null, 400);
    }

    if ($isDefault) {
        $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?")->execute([$userId]);
    }

    $ins = $pdo->prepare("INSERT INTO user_addresses (user_id, label, address, lat, lng, tag, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $ins->execute([$userId, $label, $address, $lat, $lng, $tag, $isDefault]);
    $newId = (int)$pdo->lastInsertId();

    jsonResponse(1, 'Address saved successfully', [
        'id' => $newId,
        'userId' => $userId,
        'label' => $label,
        'address' => $address,
        'lat' => $lat,
        'lng' => $lng,
        'tag' => $tag,
        'isDefault' => (bool)$isDefault
    ], 201);
}

// Handle PUT: Update an address or toggle default
if ($method === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = isset($input['id']) ? (int)$input['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : null);
    $userId = isset($input['user_id']) ? (int)$input['user_id'] : (isset($input['userId']) ? (int)$input['userId'] : null);

    if (!$id || !$userId) {
        jsonResponse(0, 'Address ID and user_id are required for update', null, 400);
    }

    $label = isset($input['label']) ? trim($input['label']) : null;
    $address = isset($input['address']) ? trim($input['address']) : null;
    $lat = isset($input['lat']) ? (float)$input['lat'] : null;
    $lng = isset($input['lng']) ? (float)$input['lng'] : null;
    $tag = isset($input['tag']) ? trim($input['tag']) : null;
    $isDefault = isset($input['isDefault']) || isset($input['is_default']) ? (!empty($input['isDefault']) || !empty($input['is_default']) ? 1 : 0) : null;

    if ($isDefault === 1) {
        $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?")->execute([$userId]);
    }

    $updates = [];
    $params = [];
    if ($label !== null) { $updates[] = "label = ?"; $params[] = $label; }
    if ($address !== null) { $updates[] = "address = ?"; $params[] = $address; }
    if ($lat !== null) { $updates[] = "lat = ?"; $params[] = $lat; }
    if ($lng !== null) { $updates[] = "lng = ?"; $params[] = $lng; }
    if ($tag !== null) { $updates[] = "tag = ?"; $params[] = $tag; }
    if ($isDefault !== null) { $updates[] = "is_default = ?"; $params[] = $isDefault; }

    if (!empty($updates)) {
        $params[] = $id;
        $params[] = $userId;
        $sql = "UPDATE user_addresses SET " . implode(', ', $updates) . " WHERE id = ? AND user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    jsonResponse(1, 'Address updated successfully', null, 200);
}

// Handle DELETE: Remove a saved address
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

    if (!$id) {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = isset($input['id']) ? (int)$input['id'] : null;
        $userId = isset($input['user_id']) ? (int)$input['user_id'] : $userId;
    }

    if (!$id) {
        jsonResponse(0, 'Address ID is required', null, 400);
    }

    if ($userId) {
        $stmt = $pdo->prepare("DELETE FROM user_addresses WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $userId]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM user_addresses WHERE id = ?");
        $stmt->execute([$id]);
    }

    jsonResponse(1, 'Address deleted successfully', null, 200);
}

jsonResponse(0, 'Method Not Allowed', null, 405);
