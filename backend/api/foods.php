<?php
// backend/api/foods.php
// Food Items & Categories Endpoint

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    try {
        // Fetch Categories
        $catStmt = $pdo->query("SELECT id, name, icon FROM categories ORDER BY id ASC");
        $categories = $catStmt->fetchAll();

        $statusFilter = $_GET['status'] ?? null;
        $includeAll = isset($_GET['all']) && $_GET['all'] === '1';

        $sql = "
            SELECT f.id, f.category_id, c.name as category_name, f.name, f.price, f.description, f.image_url, f.is_available, f.status
            FROM foods f
            LEFT JOIN categories c ON f.category_id = c.id
        ";

        $params = [];
        if ($statusFilter) {
            $sql .= " WHERE f.status = ?";
            $params[] = $statusFilter;
        } elseif (!$includeAll) {
            // Default to only public items for public catalog unless all=1 specified
            $sql .= " WHERE f.status = 'public'";
        }

        $sql .= " ORDER BY f.id DESC";

        $foodStmt = $pdo->prepare($sql);
        $foodStmt->execute($params);
        $foods = $foodStmt->fetchAll();

        // Cast numeric fields properly
        foreach ($foods as &$food) {
            $food['id'] = (int)$food['id'];
            $food['price'] = (float)$food['price'];
            $food['is_available'] = (bool)$food['is_available'];
            $food['status'] = $food['status'] ?? 'public';
        }

        jsonResponse(1, 'Fetch foods successfully', [
            'foods'      => $foods,
            'categories' => $categories
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch foods: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST') {
    // Add New Food Item (Admin action)
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['name']) || empty($input['price'])) {
        jsonResponse(0, 'Validation Error: Food name and price are required', null, 400);
    }

    $status = isset($input['status']) && in_array($input['status'], ['public', 'draft']) ? $input['status'] : 'public';

    try {
        $stmt = $pdo->prepare("
            INSERT INTO foods (category_id, name, price, description, image_url, is_available, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $input['category_id'] ?? null,
            $input['name'],
            $input['price'],
            $input['description'] ?? null,
            $input['image_url'] ?? null,
            isset($input['is_available']) ? (int)$input['is_available'] : 1,
            $status
        ]);

        $foodId = (int)$pdo->lastInsertId();

        // 📜 Log System Action
        logSystemAction(
            $pdo,
            'CREATE_FOOD',
            'FOOD',
            "New food item '{$input['name']}' (ID #{$foodId}) added with price \${$input['price']} ({$status}).",
            'info'
        );

        jsonResponse(1, 'Food item added successfully', [
            'food_id' => $foodId
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to create food item: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
