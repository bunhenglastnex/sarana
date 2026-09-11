<?php
// backend/api/categories.php
// REST API Endpoint for Menu Categories (Public Read, Admin Write/Update/Delete)

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';
require_once __DIR__ . '/../lib/paginator.php';
require_once __DIR__ . '/../lib/upload.php';

CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    try {
        $targetId = $_GET['id'] ?? null;
        $targetSlug = $_GET['slug'] ?? null;

        // 1. Single Category Detail by ID or Slug
        if (!empty($targetId) || !empty($targetSlug)) {
            $detailSql = "
                SELECT c.id, c.name, c.slug, c.icon, c.image_url, c.description, 
                       COALESCE(c.sort_order, 0) as displayOrder,
                       COUNT(f.id) as itemCount
                FROM categories c
                LEFT JOIN foods f ON f.category_id = c.id
                WHERE " . (!empty($targetId) ? "c.id = ?" : "(c.slug = ? OR c.id = ?)") . "
                GROUP BY c.id
                LIMIT 1
            ";
            $stmt = $pdo->prepare($detailSql);
            if (!empty($targetId)) {
                $stmt->execute([(int)$targetId]);
            } else {
                $stmt->execute([$targetSlug, $targetSlug]);
            }
            $cat = $stmt->fetch();
            if (!$cat) {
                jsonResponse(0, 'Category not found', null, 404);
            }
            $cat['id'] = (int)$cat['id'];
            $cat['itemCount'] = (int)$cat['itemCount'];
            $cat['displayOrder'] = (int)$cat['displayOrder'];
            $cat['isActive'] = true;

            jsonResponse(1, 'Fetch category detail successfully', $cat);
        }

        // 2. Paginated or Catalog List of Categories
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : null;
        $limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : null;

        $authUser = AuthMiddleware::getOptionalUser($pdo);
        $tenantCond = "";
        $queryParams = [];
        if ($authUser && $authUser['role'] === 'admin' && !empty($authUser['restaurant_id'])) {
            $tenantCond = " WHERE (c.restaurant_id IS NULL OR c.restaurant_id = ?) ";
            $queryParams[] = (int)$authUser['restaurant_id'];
        } elseif (isset($_GET['restaurant_id']) && is_numeric($_GET['restaurant_id'])) {
            $tenantCond = " WHERE (c.restaurant_id IS NULL OR c.restaurant_id = ?) ";
            $queryParams[] = (int)$_GET['restaurant_id'];
        }

        $baseSql = "
            SELECT c.id, c.restaurant_id, c.name, c.slug, c.icon, c.image_url, c.description, 
                   COALESCE(c.sort_order, 0) as displayOrder,
                   COUNT(f.id) as itemCount
            FROM categories c
            LEFT JOIN foods f ON f.category_id = c.id
            {$tenantCond}
            GROUP BY c.id
            ORDER BY displayOrder ASC, c.id ASC
        ";

        $result = paginateQuery($pdo, $baseSql, $queryParams, $page, $limit);
        $categories = $result['data'];

        foreach ($categories as &$cat) {
            $cat['id'] = (int)$cat['id'];
            $cat['itemCount'] = (int)$cat['itemCount'];
            $cat['displayOrder'] = (int)$cat['displayOrder'];
            $cat['imageUrl'] = $cat['image_url'] ?? null;
            $cat['isActive'] = true; // Categories default to active
        }

        jsonResponse(1, 'Fetch categories successfully', [
            'categories' => $categories,
            'pagination' => $result['pagination']
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch categories: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST') {
    // Requires Admin Role
    $admin = AuthMiddleware::authenticate($pdo, ['admin']);
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if (empty($input['name'])) {
        jsonResponse(0, 'Validation Error: Category name is required.', null, 400);
    }

    try {
        $name = trim($input['name']);
        $icon = !empty($input['icon']) ? $input['icon'] : '🍔';
        $slug = !empty($input['slug']) ? $input['slug'] : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
        $displayOrder = isset($input['displayOrder']) ? (int)$input['displayOrder'] : (isset($input['sort_order']) ? (int)$input['sort_order'] : 0);
        $description = $input['description'] ?? null;
        $rawImage = $input['image_url'] ?? $input['imageUrl'] ?? null;
        $imageUrl = saveBase64Image($rawImage, 'categories');
        $tenantId = !empty($admin['restaurant_id']) ? (int)$admin['restaurant_id'] : null;

        $stmt = $pdo->prepare("
            INSERT INTO categories (restaurant_id, name, slug, icon, image_url, description, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$tenantId, $name, $slug, $icon, $imageUrl, $description, $displayOrder]);
        $newId = (int)$pdo->lastInsertId();

        logSystemAction($pdo, 'CREATE_CATEGORY', 'CATEGORY', "Category '{$name}' (ID #{$newId}) created by Admin.", 'info', $admin['id'], $admin['name']);

        jsonResponse(1, 'Category created successfully', [
            'id' => $newId,
            'name' => $name,
            'slug' => $slug,
            'icon' => $icon,
            'image_url' => $imageUrl,
            'imageUrl' => $imageUrl,
            'description' => $description,
            'displayOrder' => $displayOrder,
            'itemCount' => 0,
            'isActive' => true
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to create category: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'PUT' || $method === 'PATCH') {
    // Requires Admin Role
    $admin = AuthMiddleware::authenticate($pdo, ['admin']);
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = $_GET['id'] ?? $input['id'] ?? null;

    if (empty($id) || empty($input['name'])) {
        jsonResponse(0, 'Validation Error: Category ID and name are required.', null, 400);
    }

    try {
        // Fetch existing category
        $stmtExist = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
        $stmtExist->execute([(int)$id]);
        $existing = $stmtExist->fetch();

        $name = trim($input['name']);
        $icon = !empty($input['icon']) ? $input['icon'] : ($existing['icon'] ?? '🍔');
        $slug = !empty($input['slug']) ? $input['slug'] : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
        $displayOrder = isset($input['displayOrder']) ? (int)$input['displayOrder'] : (isset($input['sort_order']) ? (int)$input['sort_order'] : ($existing['sort_order'] ?? 0));
        $description = array_key_exists('description', $input) ? $input['description'] : ($existing['description'] ?? null);

        $rawImage = $input['image_url'] ?? $input['imageUrl'] ?? null;
        if ($rawImage !== null) {
            $imageUrl = saveBase64Image($rawImage, 'categories');
        } else {
            $imageUrl = $existing['image_url'] ?? null;
        }

        $stmt = $pdo->prepare("
            UPDATE categories 
            SET name = ?, slug = ?, icon = ?, image_url = ?, description = ?, sort_order = ?
            WHERE id = ?
        ");
        $stmt->execute([$name, $slug, $icon, $imageUrl, $description, $displayOrder, (int)$id]);

        logSystemAction($pdo, 'UPDATE_CATEGORY', 'CATEGORY', "Category '{$name}' (ID #{$id}) updated by Admin.", 'info', $admin['id'], $admin['name']);

        jsonResponse(1, 'Category updated successfully', [
            'id' => (int)$id,
            'name' => $name,
            'slug' => $slug,
            'icon' => $icon,
            'image_url' => $imageUrl,
            'imageUrl' => $imageUrl,
            'description' => $description,
            'displayOrder' => $displayOrder,
            'isActive' => true
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to update category: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'DELETE') {
    // Requires Admin Role
    $admin = AuthMiddleware::authenticate($pdo, ['admin']);
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = $_GET['id'] ?? $input['id'] ?? null;

    if (empty($id)) {
        jsonResponse(0, 'Validation Error: Category ID is required for deletion.', null, 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([(int)$id]);

        logSystemAction($pdo, 'DELETE_CATEGORY', 'CATEGORY', "Category ID #{$id} deleted by Admin.", 'warning', $admin['id'], $admin['name']);

        jsonResponse(1, 'Category deleted successfully', ['id' => (int)$id]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to delete category: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
