<?php
// backend/api/foods.php
// REST API Endpoint for Menu Foods (Public Read, Admin Write/Update/Delete)

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';
require_once __DIR__ . '/../lib/upload.php';

CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    try {
        $targetId = $_GET['id'] ?? null;
        $targetSlug = $_GET['slug'] ?? null;

        // 1. Fetch Single Food Detail by ID or Slug
        if (!empty($targetId) || !empty($targetSlug)) {
            $baseSql = "
                SELECT f.id, f.category_id, c.name as category_name, c.slug as category_slug, 
                       f.name, f.slug, f.price, f.description, f.image_url, 
                       f.badge_text, f.badge_type,
                       COALESCE(f.is_top_seller, 0) as is_top_seller,
                       COALESCE(f.prep_time_minutes, 15) as prep_time_minutes,
                       f.options,
                       f.is_available, 
                       COALESCE(f.stock_quantity, 50) as stock_quantity,
                       COALESCE(f.is_featured, 0) as is_featured,
                       f.status
                FROM foods f
                LEFT JOIN categories c ON f.category_id = c.id
            ";

            $food = null;

            // Priority 1: Match by exact slug
            $searchSlug = !empty($targetSlug) ? $targetSlug : $targetId;
            if (!empty($searchSlug)) {
                $stmt = $pdo->prepare($baseSql . " WHERE f.slug = ? LIMIT 1");
                $stmt->execute([$searchSlug]);
                $food = $stmt->fetch();
            }

            // Priority 2: Match by exact numeric ID if targetId is numeric
            if (!$food && !empty($targetId) && is_numeric($targetId)) {
                $stmt = $pdo->prepare($baseSql . " WHERE f.id = ? LIMIT 1");
                $stmt->execute([(int)$targetId]);
                $food = $stmt->fetch();
            }

            // Priority 3: Fallback match by numeric ID if targetSlug is numeric
            if (!$food && !empty($targetSlug) && is_numeric($targetSlug)) {
                $stmt = $pdo->prepare($baseSql . " WHERE f.id = ? LIMIT 1");
                $stmt->execute([(int)$targetSlug]);
                $food = $stmt->fetch();
            }

            if (!$food) {
                jsonResponse(0, 'Food item not found', null, 404);
            }

            // Format single food detail object
            $food['id'] = (int)$food['id'];
            $food['category_id'] = $food['category_id'] ? (int)$food['category_id'] : null;
            $food['category'] = $food['category_slug'] ?? ($food['category_name'] ? strtolower(str_replace(' ', '-', $food['category_name'])) : 'general');
            $food['price'] = (float)$food['price'];
            $food['is_available'] = (bool)$food['is_available'];
            $food['isAvailable'] = (bool)$food['is_available'];
            $food['stockQuantity'] = (int)$food['stock_quantity'];
            $food['imageUrl'] = $food['image_url'] ?? '';
            $food['isTopSeller'] = (bool)$food['is_top_seller'];
            $food['prepTimeMinutes'] = (int)$food['prep_time_minutes'];
            $food['status'] = $food['status'] ?? 'public';

            if (!empty($food['badge_text'])) {
                $food['badge'] = [
                    'text' => $food['badge_text'],
                    'type' => $food['badge_type'] ?? 'chef'
                ];
            } else {
                $food['badge'] = null;
            }

            if (!empty($food['options'])) {
                $decoded = is_string($food['options']) ? json_decode($food['options'], true) : $food['options'];
                $food['options'] = is_array($decoded) ? $decoded : [];
            } else {
                $food['options'] = [];
            }

            jsonResponse(1, 'Fetch food detail successfully', $food);
        }

        // 2. Fetch Foods Catalog List with Server-Side Filtering
        $catStmt = $pdo->query("SELECT id, name, icon, slug, image_url FROM categories ORDER BY sort_order ASC, id ASC");
        $categories = $catStmt->fetchAll();

        // Extract Filter Query Parameters
        $categoryParam = $_GET['category'] ?? $_GET['category_id'] ?? null;
        $filterParam = $_GET['filter'] ?? $_GET['filterStatus'] ?? null;
        $searchParam = trim($_GET['search'] ?? $_GET['q'] ?? '');
        $statusParam = $_GET['status'] ?? null;
        $includeAll = isset($_GET['all']) && $_GET['all'] === '1';

        $whereConditions = [];
        $params = [];

        // 1. Status Filter (Public vs Draft)
        if ($statusParam) {
            $whereConditions[] = "f.status = ?";
            $params[] = $statusParam;
        } elseif (!$includeAll) {
            $whereConditions[] = "f.status = 'public' AND f.is_available = 1";
        }

        // 2. Category Filter
        if (!empty($categoryParam) && $categoryParam !== 'all') {
            if (is_numeric($categoryParam)) {
                $whereConditions[] = "f.category_id = ?";
                $params[] = (int)$categoryParam;
            } else {
                $whereConditions[] = "(c.slug = ? OR c.name = ?)";
                $params[] = $categoryParam;
                $params[] = $categoryParam;
            }
        }

        // 3. Preset Status Filter (Top Sellers, In Stock, Sold Out)
        if (!empty($filterParam) && $filterParam !== 'all') {
            if (in_array($filterParam, ['topseller', 'top_seller', 'bestseller'])) {
                $whereConditions[] = "(f.is_top_seller = 1 OR f.badge_type = 'chef')";
            } elseif (in_array($filterParam, ['available', 'in_stock', 'instock'])) {
                $whereConditions[] = "(f.is_available = 1 AND COALESCE(f.stock_quantity, 50) > 0)";
            } elseif (in_array($filterParam, ['soldout', 'sold_out'])) {
                $whereConditions[] = "(f.is_available = 0 OR COALESCE(f.stock_quantity, 50) <= 0)";
            }
        }

        // 4. Search Keyword Filter
        if ($searchParam !== '') {
            $whereConditions[] = "(f.name LIKE ? OR f.description LIKE ? OR c.name LIKE ?)";
            $searchTerm = "%{$searchParam}%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $whereClause = !empty($whereConditions) ? " WHERE " . implode(" AND ", $whereConditions) : "";

        // Count total matching items for pagination
        $countSql = "
            SELECT COUNT(*) 
            FROM foods f
            LEFT JOIN categories c ON f.category_id = c.id
            {$whereClause}
        ";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $totalCount = (int)$countStmt->fetchColumn();

        // Calculate filter summary counts across store
        $statsSql = "
            SELECT 
                COUNT(*) as totalAll,
                SUM(CASE WHEN f.is_top_seller = 1 OR f.badge_type = 'chef' THEN 1 ELSE 0 END) as totalTopSellers,
                SUM(CASE WHEN f.is_available = 1 AND COALESCE(f.stock_quantity, 50) > 0 THEN 1 ELSE 0 END) as totalInStock,
                SUM(CASE WHEN f.is_available = 0 OR COALESCE(f.stock_quantity, 50) <= 0 THEN 1 ELSE 0 END) as totalSoldOut
            FROM foods f
            LEFT JOIN categories c ON f.category_id = c.id
        ";
        $statsStmt = $pdo->query($statsSql);
        $statsData = $statsStmt->fetch(PDO::FETCH_ASSOC);

        $counts = [
            'all'        => (int)($statsData['totalAll'] ?? 0),
            'topSellers' => (int)($statsData['totalTopSellers'] ?? 0),
            'inStock'    => (int)($statsData['totalInStock'] ?? 0),
            'soldOut'    => (int)($statsData['totalSoldOut'] ?? 0)
        ];

        // Check if pagination (page / limit) parameters requested
        $pageParam = isset($_GET['page']) ? max(1, (int)$_GET['page']) : null;
        $limitParam = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : null;

        $sql = "
            SELECT f.id, f.category_id, c.name as category_name, c.slug as category_slug, 
                   f.name, f.slug, f.price, f.description, f.image_url, 
                   f.badge_text, f.badge_type,
                   COALESCE(f.is_top_seller, 0) as is_top_seller,
                   COALESCE(f.prep_time_minutes, 15) as prep_time_minutes,
                   f.options,
                   f.is_available, 
                   COALESCE(f.stock_quantity, 50) as stock_quantity,
                   COALESCE(f.is_featured, 0) as is_featured,
                   f.status
            FROM foods f
            LEFT JOIN categories c ON f.category_id = c.id
            {$whereClause}
            ORDER BY f.id DESC
        ";

        $paginationInfo = null;
        if ($limitParam !== null) {
            $currentPage = $pageParam ?? 1;
            $offset = ($currentPage - 1) * $limitParam;
            $sql .= " LIMIT {$limitParam} OFFSET {$offset}";

            $totalPages = max(1, (int)ceil($totalCount / $limitParam));
            $paginationInfo = [
                'total'       => $totalCount,
                'page'        => $currentPage,
                'limit'       => $limitParam,
                'totalPages'  => $totalPages,
                'hasMore'     => ($currentPage < $totalPages)
            ];
        }

        $foodStmt = $pdo->prepare($sql);
        $foodStmt->execute($params);
        $foods = $foodStmt->fetchAll();

        // Format fields for frontend consumption
        foreach ($foods as &$food) {
            $food['id'] = (int)$food['id'];
            $food['category_id'] = $food['category_id'] ? (int)$food['category_id'] : null;
            $food['category'] = $food['category_slug'] ?? ($food['category_name'] ? strtolower(str_replace(' ', '-', $food['category_name'])) : 'general');
            $food['price'] = (float)$food['price'];
            $food['is_available'] = (bool)$food['is_available'];
            $food['isAvailable'] = (bool)$food['is_available'];
            $food['stockQuantity'] = (int)$food['stock_quantity'];
            $food['imageUrl'] = $food['image_url'] ?? '';
            $food['isTopSeller'] = (bool)$food['is_top_seller'];
            $food['prepTimeMinutes'] = (int)$food['prep_time_minutes'];
            $food['status'] = $food['status'] ?? 'public';

            // Format badge object if present
            if (!empty($food['badge_text'])) {
                $food['badge'] = [
                    'text' => $food['badge_text'],
                    'type' => $food['badge_type'] ?? 'chef'
                ];
            } else {
                $food['badge'] = null;
            }

            // Decode options JSON
            if (!empty($food['options'])) {
                $decoded = is_string($food['options']) ? json_decode($food['options'], true) : $food['options'];
                $food['options'] = is_array($decoded) ? $decoded : [];
            } else {
                $food['options'] = [];
            }
        }

        jsonResponse(1, 'Fetch foods successfully', [
            'foods'      => $foods,
            'categories' => $categories,
            'counts'     => $counts,
            'pagination' => $paginationInfo
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch foods: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST') {
    // Requires Admin Role
    $admin = AuthMiddleware::authenticate($pdo, ['admin']);
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    if (empty($input['name']) || !isset($input['price'])) {
        jsonResponse(0, 'Validation Error: Food name and price are required.', null, 400);
    }

    $status = isset($input['status']) && in_array($input['status'], ['public', 'draft']) ? $input['status'] : 'public';
    $categoryId = !empty($input['category_id']) ? (int)$input['category_id'] : (!empty($input['categoryId']) ? (int)$input['categoryId'] : null);
    
    // Resolve category_id if slug or string passed
    if (!$categoryId && !empty($input['category'])) {
        $findCat = $pdo->prepare("SELECT id FROM categories WHERE slug = ? OR name = ? LIMIT 1");
        $findCat->execute([$input['category'], $input['category']]);
        $categoryId = $findCat->fetchColumn() ?: null;
    }

    $badgeText = $input['badge']['text'] ?? $input['badge_text'] ?? null;
    $badgeType = $input['badge']['type'] ?? $input['badge_type'] ?? 'chef';
    $isTopSeller = isset($input['isTopSeller']) ? ($input['isTopSeller'] ? 1 : 0) : (isset($input['is_top_seller']) ? ($input['is_top_seller'] ? 1 : 0) : 0);
    $prepTimeMinutes = isset($input['prepTimeMinutes']) ? (int)$input['prepTimeMinutes'] : (isset($input['prep_time_minutes']) ? (int)$input['prep_time_minutes'] : 15);
    $optionsJson = isset($input['options']) ? json_encode($input['options'], JSON_UNESCAPED_UNICODE) : null;
    $slug = !empty($input['slug']) ? $input['slug'] : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['name'])));

    // Process Base64 image payload to prevent MySQL max_allowed_packet error
    $rawImage = $input['imageUrl'] ?? $input['image_url'] ?? null;
    $imageUrl = saveBase64Image($rawImage, 'foods');

    try {
        $stmt = $pdo->prepare("
            INSERT INTO foods (category_id, name, slug, price, description, image_url, badge_text, badge_type, is_top_seller, prep_time_minutes, options, is_available, stock_quantity, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $categoryId,
            trim($input['name']),
            $slug,
            (float)$input['price'],
            $input['description'] ?? null,
            $imageUrl,
            $badgeText,
            $badgeType,
            $isTopSeller,
            $prepTimeMinutes,
            $optionsJson,
            isset($input['isAvailable']) ? ($input['isAvailable'] ? 1 : 0) : (isset($input['is_available']) ? ($input['is_available'] ? 1 : 0) : 1),
            isset($input['stockQuantity']) ? (int)$input['stockQuantity'] : (isset($input['stock_quantity']) ? (int)$input['stock_quantity'] : 50),
            $status
        ]);

        $foodId = (int)$pdo->lastInsertId();

        logSystemAction($pdo, 'CREATE_FOOD', 'FOOD', "Food item '{$input['name']}' (ID #{$foodId}) created by Admin.", 'info', $admin['id'], $admin['name']);

        jsonResponse(1, 'Food item added successfully', [
            'id' => $foodId,
            'name' => $input['name'],
            'price' => (float)$input['price'],
            'image_url' => $imageUrl,
            'imageUrl' => $imageUrl,
            'is_available' => true,
            'isAvailable' => true,
            'status' => $status
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to create food item: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'PUT' || $method === 'PATCH') {
    // Requires Admin Role
    $admin = AuthMiddleware::authenticate($pdo, ['admin']);
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $id = $_GET['id'] ?? $input['id'] ?? null;

    if (empty($id)) {
        jsonResponse(0, 'Validation Error: Food ID is required for update.', null, 400);
    }

    try {
        // Build dynamic update
        $fields = [];
        $params = [];

        if (isset($input['name'])) { 
            $fields[] = "name = ?"; $params[] = trim($input['name']); 
            $fields[] = "slug = ?"; $params[] = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['name'])));
        }
        if (isset($input['price'])) { $fields[] = "price = ?"; $params[] = (float)$input['price']; }
        if (array_key_exists('description', $input)) { $fields[] = "description = ?"; $params[] = $input['description']; }
        if (isset($input['imageUrl']) || isset($input['image_url'])) { 
            $rawImage = $input['imageUrl'] ?? $input['image_url'];
            $imageUrl = saveBase64Image($rawImage, 'foods');
            $fields[] = "image_url = ?"; 
            $params[] = $imageUrl; 
        }
        if (isset($input['badge'])) {
            $fields[] = "badge_text = ?"; $params[] = $input['badge']['text'] ?? null;
            $fields[] = "badge_type = ?"; $params[] = $input['badge']['type'] ?? 'chef';
        }
        if (isset($input['isTopSeller']) || isset($input['is_top_seller'])) {
            $val = isset($input['isTopSeller']) ? ($input['isTopSeller'] ? 1 : 0) : ($input['is_top_seller'] ? 1 : 0);
            $fields[] = "is_top_seller = ?"; $params[] = $val;
        }
        if (isset($input['prepTimeMinutes']) || isset($input['prep_time_minutes'])) {
            $val = isset($input['prepTimeMinutes']) ? (int)$input['prepTimeMinutes'] : (int)$input['prep_time_minutes'];
            $fields[] = "prep_time_minutes = ?"; $params[] = $val;
        }
        if (isset($input['options'])) {
            $fields[] = "options = ?"; $params[] = json_encode($input['options'], JSON_UNESCAPED_UNICODE);
        }
        if (isset($input['isAvailable']) || isset($input['is_available'])) { 
            $val = isset($input['isAvailable']) ? ($input['isAvailable'] ? 1 : 0) : ($input['is_available'] ? 1 : 0);
            $fields[] = "is_available = ?"; 
            $params[] = $val; 
        }
        if (isset($input['stockQuantity']) || isset($input['stock_quantity'])) { 
            $val = isset($input['stockQuantity']) ? (int)$input['stockQuantity'] : (int)$input['stock_quantity'];
            $fields[] = "stock_quantity = ?"; 
            $params[] = $val; 
        }
        if (isset($input['status']) && in_array($input['status'], ['public', 'draft'])) {
            $fields[] = "status = ?";
            $params[] = $input['status'];
        }
        if (isset($input['category_id']) || isset($input['categoryId'])) {
            $fields[] = "category_id = ?";
            $params[] = $input['category_id'] ?? $input['categoryId'];
        }

        if (empty($fields)) {
            jsonResponse(0, 'No fields provided for update.', null, 400);
        }

        $params[] = (int)$id;
        $sql = "UPDATE foods SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        logSystemAction($pdo, 'UPDATE_FOOD', 'FOOD', "Food item ID #{$id} updated by Admin.", 'info', $admin['id'], $admin['name']);

        jsonResponse(1, 'Food item updated successfully', ['id' => (int)$id]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to update food item: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'DELETE') {
    // Requires Admin Role
    $admin = AuthMiddleware::authenticate($pdo, ['admin']);
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = $_GET['id'] ?? $input['id'] ?? null;

    if (empty($id)) {
        jsonResponse(0, 'Validation Error: Food ID is required for deletion.', null, 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM foods WHERE id = ?");
        $stmt->execute([(int)$id]);

        logSystemAction($pdo, 'DELETE_FOOD', 'FOOD', "Food item ID #{$id} deleted by Admin.", 'warning', $admin['id'], $admin['name']);

        jsonResponse(1, 'Food item deleted successfully', ['id' => (int)$id]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to delete food item: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
