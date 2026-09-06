<?php
// backend/api/favorites.php
// Customer Favorites REST API (Get, Toggle, Remove)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

// Resolve customer authentication if available
$authUser = null;
try {
    $authUser = AuthMiddleware::authenticate($pdo);
} catch (Exception $e) {
    // Unauthenticated user
}

$userId = $authUser ? (int)$authUser['id'] : (int)($_GET['user_id'] ?? $_POST['user_id'] ?? 0);
$phone  = trim($_GET['phone'] ?? $_POST['phone'] ?? ($authUser['phone'] ?? ''));

if ($method === 'GET') {
    try {
        if ($userId <= 0 && empty($phone)) {
            jsonResponse(1, 'No user identifier provided', []);
            return;
        }

        $query = "
            SELECT f.id as favorite_id, f.created_at as saved_at,
                   b.id, b.name, b.slug, b.price, b.description, b.image_url, b.category_id,
                   c.name as category_name, c.slug as category_slug
            FROM favorites f
            JOIN foods b ON f.food_id = b.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE 1=1
        ";
        $params = [];

        if ($userId > 0 && !empty($phone)) {
            $query .= " AND (f.user_id = ? OR f.phone = ?)";
            $params[] = $userId;
            $params[] = $phone;
        } elseif ($userId > 0) {
            $query .= " AND f.user_id = ?";
            $params[] = $userId;
        } else {
            $query .= " AND f.phone = ?";
            $params[] = $phone;
        }

        $query .= " ORDER BY f.id DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $favorites = $stmt->fetchAll();

        foreach ($favorites as &$item) {
            $item['id'] = (int)$item['id'];
            $item['favorite_id'] = (int)$item['favorite_id'];
            $item['price'] = (float)$item['price'];
            $item['category'] = $item['category_slug'] ?? 'mains';
            $item['imageUrl'] = $item['image_url'];
        }

        jsonResponse(1, 'Favorites retrieved successfully', $favorites);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to retrieve favorites: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST') {
    // Toggle favorite item (add if absent, remove if present)
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $foodId = (int)($input['food_id'] ?? 0);

    if ($foodId <= 0) {
        jsonResponse(0, 'Validation Error: food_id is required', null, 400);
    }

    if ($userId <= 0 && empty($phone)) {
        jsonResponse(0, 'Unauthorized: User authentication or phone required to save favorites', null, 401);
    }

    try {
        // Check if favorite exists
        $checkStmt = $pdo->prepare("SELECT id FROM favorites WHERE food_id = ? AND (user_id = ? OR phone = ?)");
        $checkStmt->execute([$foodId, $userId, $phone]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            // Remove from favorites
            $delStmt = $pdo->prepare("DELETE FROM favorites WHERE id = ?");
            $delStmt->execute([$existing['id']]);
            jsonResponse(1, 'Item removed from favorites', ['is_favorite' => false, 'food_id' => $foodId]);
        } else {
            // Insert into favorites
            $insStmt = $pdo->prepare("INSERT INTO favorites (user_id, phone, food_id) VALUES (?, ?, ?)");
            $insStmt->execute([$userId > 0 ? $userId : null, !empty($phone) ? $phone : null, $foodId]);
            jsonResponse(1, 'Item added to favorites!', ['is_favorite' => true, 'food_id' => $foodId]);
        }
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to update favorites: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'DELETE') {
    $foodId = (int)($_GET['food_id'] ?? 0);
    if ($foodId <= 0) {
        jsonResponse(0, 'Validation Error: food_id is required', null, 400);
    }

    try {
        $delStmt = $pdo->prepare("DELETE FROM favorites WHERE food_id = ? AND (user_id = ? OR phone = ?)");
        $delStmt->execute([$foodId, $userId, $phone]);
        jsonResponse(1, 'Item removed from favorites', ['is_favorite' => false, 'food_id' => $foodId]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to delete favorite: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
