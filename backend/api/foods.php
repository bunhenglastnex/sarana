<?php
// backend/api/foods.php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET: Fetch list of foods (and categories)
if ($method === 'GET') {
    try {
        $categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;

        if ($categoryId) {
            $stmt = $pdo->prepare("SELECT f.*, c.name AS category_name FROM foods f LEFT JOIN categories c ON f.category_id = c.id WHERE f.category_id = ? AND f.is_available = 1 ORDER BY f.id DESC");
            $stmt->execute([$categoryId]);
        } else {
            $stmt = $pdo->query("SELECT f.*, c.name AS category_name FROM foods f LEFT JOIN categories c ON f.category_id = c.id WHERE f.is_available = 1 ORDER BY f.id DESC");
        }

        $foods = $stmt->fetchAll();

        // Also fetch all categories
        $catStmt = $pdo->query("SELECT * FROM categories ORDER BY id ASC");
        $categories = $catStmt->fetchAll();

        echo json_encode([
            'success' => true,
            'categories' => $categories,
            'foods' => $foods
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

// 2. POST: Add new food (Admin)
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $name = trim($data['name'] ?? '');
    $price = (float)($data['price'] ?? 0);
    $categoryId = !empty($data['category_id']) ? (int)$data['category_id'] : null;
    $description = trim($data['description'] ?? '');
    $imageUrl = trim($data['image_url'] ?? '');

    if (empty($name) || $price <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Name and valid price are required.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO foods (name, price, category_id, description, image_url, is_available) VALUES (?, ?, ?, ?, ?, 1)");
        $stmt->execute([$name, $price, $categoryId, $description, $imageUrl]);
        $newId = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'Food item added successfully.',
            'food_id' => $newId
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
