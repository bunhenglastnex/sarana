<?php
// backend/api/customer-menu.php
// Public Customer Menu & Categories API with 12-item batch pagination (status = 'public' and is_available = 1)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/upload.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}

try {
    $pdo = getDB();

    $categoryParam = $_GET['category'] ?? $_GET['category_id'] ?? null;
    $searchQuery   = trim($_GET['search'] ?? $_GET['q'] ?? '');
    
    // Pagination parameters
    $page  = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 12;
    $offset = ($page - 1) * $limit;

    // 1. Fetch Active Public Categories
    $catStmt = $pdo->query("
        SELECT DISTINCT c.id, c.name, c.slug, c.icon, c.image_url
        FROM categories c
        JOIN foods f ON f.category_id = c.id
        LEFT JOIN restaurants r ON f.restaurant_id = r.id
        WHERE f.status = 'public' AND f.is_available = 1 AND (f.stock_quantity IS NULL OR f.stock_quantity > 0) AND (r.is_active = 1 OR r.is_active IS NULL)
        ORDER BY c.sort_order ASC, c.id ASC
    ");
    $rawCategories = $catStmt ? $catStmt->fetchAll() : [];

    $categories = array_map(function($c) {
        return [
            'id'    => (int)$c['id'],
            'name'  => $c['name'],
            'slug'  => $c['slug'] ?? strtolower(str_replace(' ', '-', $c['name'])),
            'icon'  => $c['icon'] ?? null,
            'image' => $c['image_url'] ?? null,
        ];
    }, $rawCategories);

    $restaurantParam = $_GET['restaurant_id'] ?? $_GET['restaurant'] ?? null;

    // Build base WHERE clauses & parameters
    $whereSql = " WHERE f.status = 'public' AND f.is_available = 1 AND (f.stock_quantity IS NULL OR f.stock_quantity > 0) AND (r.is_active = 1 OR r.is_active IS NULL)";
    $params   = [];

    if (!empty($restaurantParam) && $restaurantParam !== 'all') {
        if (is_numeric($restaurantParam)) {
            $whereSql .= " AND f.restaurant_id = ?";
            $params[]  = (int)$restaurantParam;
        } else {
            $whereSql .= " AND (r.slug = ? OR r.name = ?)";
            $params[]  = $restaurantParam;
            $params[]  = $restaurantParam;
        }
    }

    if (!empty($categoryParam) && $categoryParam !== 'all') {
        if (is_numeric($categoryParam)) {
            $whereSql .= " AND (f.category_id = ? OR c.id = ?)";
            $params[]  = (int)$categoryParam;
            $params[]  = (int)$categoryParam;
        } else {
            $cleanCat = strtolower(trim($categoryParam));
            $slugCat = str_replace([' ', '_', '&'], ['-', '-', 'and'], $cleanCat);
            $spaceCat = str_replace(['-', '_', '&'], [' ', ' ', 'and'], $cleanCat);

            $whereSql .= " AND (
                c.slug = ? 
                OR LOWER(c.name) = ? 
                OR LOWER(c.name) LIKE ? 
                OR LOWER(REPLACE(REPLACE(c.name, '&', 'and'), ' ', '-')) = ?
                OR LOWER(c.slug) LIKE ?
            )";
            $params[] = $categoryParam;
            $params[] = $cleanCat;
            $params[] = "%{$spaceCat}%";
            $params[] = $slugCat;
            $params[] = "%{$slugCat}%";
        }
    }

    if (!empty($searchQuery)) {
        $whereSql .= " AND (f.name LIKE ? OR f.description LIKE ?)";
        $searchTerm = "%{$searchQuery}%";
        $params[]   = $searchTerm;
        $params[]   = $searchTerm;
    }

    // 2. Fetch Total Matching Items Count
    $countQuery = "
        SELECT COUNT(*) as total
        FROM foods f
        LEFT JOIN restaurants r ON f.restaurant_id = r.id
        LEFT JOIN categories c ON f.category_id = c.id
        {$whereSql}
    ";
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $totalItems = (int)$countStmt->fetchColumn();

    // 3. Fetch Paginated Public Foods with Restaurant Joining
    $query = "
        SELECT f.id, f.restaurant_id, r.name as restaurant_name, r.logo_url as restaurant_logo,
               f.category_id, c.name as category_name, c.slug as category_slug,
               f.name, f.slug, f.price, f.description, f.image_url,
               f.badge_text, f.badge_type, f.is_top_seller, f.prep_time_minutes,
               f.options, f.is_available, f.stock_quantity, f.is_featured, f.status
        FROM foods f
        LEFT JOIN restaurants r ON f.restaurant_id = r.id
        LEFT JOIN categories c ON f.category_id = c.id
        {$whereSql}
        ORDER BY f.is_top_seller DESC, f.is_featured DESC, f.id DESC
        LIMIT {$limit} OFFSET {$offset}
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $foods = $stmt->fetchAll();

    foreach ($foods as &$food) {
        $food['id'] = (int)$food['id'];
        $food['restaurant_id'] = (int)($food['restaurant_id'] ?? 1);
        $food['restaurant_name'] = $food['restaurant_name'] ?? 'Amber Bistro';
        $food['restaurant_logo'] = $food['restaurant_logo'] ?? '';
        $food['category_id'] = $food['category_id'] ? (int)$food['category_id'] : null;
        $food['category'] = $food['category_slug'] ?? ($food['category_name'] ? strtolower(str_replace(' ', '-', $food['category_name'])) : 'general');
        $food['price'] = (float)$food['price'];
        $food['is_available'] = (bool)$food['is_available'];
        $food['stockQuantity'] = (int)$food['stock_quantity'];
        $formattedImg = formatPublicImageUrl($food['image_url'] ?? '');
        $food['image_url'] = $formattedImg;
        $food['imageUrl'] = $formattedImg;
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
    }

    $totalPages = $totalItems > 0 ? (int)ceil($totalItems / $limit) : 0;
    $hasMore    = ($page * $limit) < $totalItems;

    // Fetch Target Restaurant Info
    $targetRestoId = is_numeric($restaurantParam) ? (int)$restaurantParam : 1;
    $restoStmt = $pdo->prepare("
        SELECT id, name, address, lat, lng, logo_url, phone, 
               COALESCE(delivery_radius_km, 5.00) as delivery_radius_km, 
               COALESCE(allow_delivery, 1) as allow_delivery, 
               COALESCE(allow_pickup, 1) as allow_pickup, 
               COALESCE(min_order_amount, 0.00) as min_order_amount
        FROM restaurants 
        WHERE id = ? OR slug = ?
        LIMIT 1
    ");
    $restoStmt->execute([$targetRestoId, (string)$restaurantParam]);
    $restaurantRow = $restoStmt->fetch(PDO::FETCH_ASSOC);

    $restaurantData = null;
    if ($restaurantRow) {
        $restaurantData = [
            'id' => (int)$restaurantRow['id'],
            'name' => $restaurantRow['name'],
            'address' => $restaurantRow['address'] ?? '',
            'lat' => $restaurantRow['lat'] !== null ? (float)$restaurantRow['lat'] : null,
            'lng' => $restaurantRow['lng'] !== null ? (float)$restaurantRow['lng'] : null,
            'logoUrl' => $restaurantRow['logo_url'] ?? '',
            'phone' => $restaurantRow['phone'] ?? '',
            'deliveryRadiusKm' => (float)$restaurantRow['delivery_radius_km'],
            'allowDelivery' => (int)$restaurantRow['allow_delivery'] === 1,
            'allowPickup' => (int)$restaurantRow['allow_pickup'] === 1,
            'minOrderAmount' => (float)$restaurantRow['min_order_amount'],
        ];
    }

    jsonResponse(1, 'Public customer menu fetched successfully', [
        'restaurant'  => $restaurantData,
        'categories'  => $categories,
        'total'       => $totalItems,
        'page'        => $page,
        'limit'       => $limit,
        'total_pages' => $totalPages,
        'has_more'    => $hasMore,
        'count'       => count($foods),
        'foods'       => $foods,
    ]);
} catch (PDOException $e) {
    jsonResponse(0, 'Failed to fetch public customer menu: ' . $e->getMessage(), null, 500);
}
