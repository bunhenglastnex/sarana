<?php
// backend/api/restaurants.php
// Multi-Tenant Restaurant Management API Endpoint (Super Admin & Public Catalogue)

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';

CorsMiddleware::handle();

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'GET') {
    try {
        $search = trim($_GET['search'] ?? '');
        $activeOnly = isset($_GET['active_only']) ? (bool)$_GET['active_only'] : false;

        $authUser = AuthMiddleware::getOptionalUser($pdo);

        $sql = "SELECT r.*, u.id as owner_admin_id, u.name as owner_admin_name, u.email as owner_admin_email, u.phone as owner_admin_phone 
                FROM restaurants r 
                LEFT JOIN users u ON (r.owner_admin_id = u.id OR (u.restaurant_id = r.id AND u.role = 'admin')) 
                WHERE 1=1";
        $params = [];

        // If authenticated as normal restaurant admin (not super_admin), restrict to their own restaurant
        if ($authUser && $authUser['role'] === 'admin' && !empty($authUser['restaurant_id']) && !$activeOnly) {
            $sql .= " AND r.id = ?";
            $params[] = (int)$authUser['restaurant_id'];
        }

        if ($activeOnly) {
            $sql .= " AND r.is_active = 1";
        }

        if ($search !== '') {
            $sql .= " AND (r.name LIKE ? OR r.slug LIKE ? OR r.address LIKE ? OR u.name LIKE ? OR u.email LIKE ?)";
            $term = '%' . $search . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " GROUP BY r.id ORDER BY r.id ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $restaurants = $stmt->fetchAll();

        foreach ($restaurants as &$r) {
            $r['id'] = (int)$r['id'];
            $r['is_active'] = (bool)$r['is_active'];
            $r['lat'] = $r['lat'] !== null ? (float)$r['lat'] : null;
            $r['lng'] = $r['lng'] !== null ? (float)$r['lng'] : null;

            // Fetch food count
            $fStmt = $pdo->prepare("SELECT COUNT(*) FROM foods WHERE restaurant_id = ? AND status = 'public'");
            $fStmt->execute([$r['id']]);
            $r['total_foods_count'] = (int)$fStmt->fetchColumn();
        }

        jsonResponse(1, 'Restaurants fetched successfully', $restaurants);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch restaurants: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST') {
    // Require Super Admin Auth
    $superUser = AuthMiddleware::authenticate($pdo, ['super_admin']);

    $input = json_decode(file_get_contents('php://input'), true);

    $name = trim($input['name'] ?? '');
    $slug = trim($input['slug'] ?? strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name)));
    $address = trim($input['address'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $lat = isset($input['lat']) ? (float)$input['lat'] : null;
    $lng = isset($input['lng']) ? (float)$input['lng'] : null;
    $logoUrl = trim($input['logo_url'] ?? '');
    $bannerUrl = trim($input['banner_url'] ?? '');
    $ownerEmail = trim($input['admin_email'] ?? $input['owner_email'] ?? '');
    $ownerName = trim($input['admin_name'] ?? $input['owner_name'] ?? ($name . ' Owner'));
    $ownerPhone = trim($input['admin_phone'] ?? $input['owner_phone'] ?? $phone);
    $adminPass = $input['admin_password'] ?? $input['password'] ?? 'admin123';

    if (empty($name)) {
        jsonResponse(0, 'Validation Error: Restaurant name is required', null, 400);
    }

    // Ensure unique slug
    $checkSlug = $pdo->prepare("SELECT id FROM restaurants WHERE slug = ?");
    $checkSlug->execute([$slug]);
    if ($checkSlug->fetch()) {
        $slug = $slug . '-' . rand(100, 999);
    }

    try {
        $pdo->beginTransaction();

        // 1. Insert Restaurant Record
        $stmt = $pdo->prepare("
            INSERT INTO restaurants (name, slug, logo_url, banner_url, address, lat, lng, phone, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");
        $stmt->execute([$name, $slug, $logoUrl, $bannerUrl, $address, $lat, $lng, $phone]);
        $restaurantId = (int)$pdo->lastInsertId();

        // 2. Create default Tenant Admin User if admin email or phone provided
        $ownerAdminId = null;
        if (!empty($ownerEmail) || !empty($ownerPhone)) {
            $hashedPassword = password_hash($adminPass, PASSWORD_BCRYPT);
            
            // Check if user with this email or phone already exists
            $userCheck = $pdo->prepare("SELECT id FROM users WHERE (email IS NOT NULL AND email = ?) OR (phone IS NOT NULL AND phone = ?)");
            $userCheck->execute([$ownerEmail ?: '---', $ownerPhone ?: '---']);
            $existingUser = $userCheck->fetch();

            if ($existingUser) {
                $ownerAdminId = (int)$existingUser['id'];
                $uUpdate = $pdo->prepare("UPDATE users SET role = 'admin', restaurant_id = ? WHERE id = ?");
                $uUpdate->execute([$restaurantId, $ownerAdminId]);
            } else {
                $userPhone = !empty($ownerPhone) ? $ownerPhone : ('012' . rand(100000, 999999));
                $uStmt = $pdo->prepare("
                    INSERT INTO users (name, phone, email, role, restaurant_id, created_by, password, status)
                    VALUES (?, ?, ?, 'admin', ?, ?, ?, 'active')
                ");
                $uStmt->execute([$ownerName, $userPhone, $ownerEmail ?: null, $restaurantId, $superUser['id'], $hashedPassword]);
                $ownerAdminId = (int)$pdo->lastInsertId();
            }

            $upStmt = $pdo->prepare("UPDATE restaurants SET owner_admin_id = ? WHERE id = ?");
            $upStmt->execute([$ownerAdminId, $restaurantId]);
        }

        $pdo->commit();

        logSystemAction(
            $pdo,
            'CREATE_RESTAURANT',
            'RESTAURANT',
            "Super Admin created new restaurant '{$name}' (ID #{$restaurantId}).",
            'info',
            $superUser['id'],
            $superUser['name']
        );

        jsonResponse(1, "Restaurant '{$name}' created successfully", [
            'id' => $restaurantId,
            'name' => $name,
            'slug' => $slug,
            'owner_admin_id' => $ownerAdminId
        ], 201);

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        jsonResponse(0, 'Failed to create restaurant: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'PUT' || $method === 'PATCH') {
    $superUser = AuthMiddleware::authenticate($pdo, ['super_admin']);
    $input = json_decode(file_get_contents('php://input'), true);

    $id = (int)($input['id'] ?? $_GET['id'] ?? 0);
    if ($id <= 0) {
        jsonResponse(0, 'Validation Error: Restaurant ID is required', null, 400);
    }

    try {
        if ((isset($input['action']) && $input['action'] === 'reset_password') || !empty($input['new_password'])) {
            $newPassword = trim($input['new_password'] ?? $input['password'] ?? '');
            if (empty($newPassword) || strlen($newPassword) < 4) {
                jsonResponse(0, 'Validation Error: Password must be at least 4 characters long', null, 400);
            }

            // Find owner user ID for this restaurant
            $rStmt = $pdo->prepare("SELECT owner_admin_id FROM restaurants WHERE id = ?");
            $rStmt->execute([$id]);
            $resto = $rStmt->fetch();
            $ownerId = $resto ? (int)$resto['owner_admin_id'] : 0;

            if ($ownerId <= 0) {
                $uStmt = $pdo->prepare("SELECT id FROM users WHERE restaurant_id = ? AND role = 'admin' LIMIT 1");
                $uStmt->execute([$id]);
                $uRow = $uStmt->fetch();
                if ($uRow) $ownerId = (int)$uRow['id'];
            }

            if ($ownerId <= 0) {
                jsonResponse(0, 'No owner or admin user assigned to this restaurant tenant', null, 404);
            }

            $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
            $upStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
            $upStmt->execute([$hashedPassword, $ownerId]);

            logSystemAction(
                $pdo,
                'RESET_RESTAURANT_PASSWORD',
                'RESTAURANT',
                "Super Admin reset password for Restaurant ID #{$id} owner (User #{$ownerId}).",
                'info',
                $superUser['id'],
                $superUser['name']
            );

            jsonResponse(1, "Password for Restaurant ID #{$id} admin reset successfully", [
                'id' => $id,
                'owner_id' => $ownerId
            ]);
            return;
        }

        if (isset($input['is_active'])) {
            $isActive = (int)(bool)$input['is_active'];
            $stmt = $pdo->prepare("UPDATE restaurants SET is_active = ? WHERE id = ?");
            $stmt->execute([$isActive, $id]);

            logSystemAction(
                $pdo,
                'TOGGLE_RESTAURANT_STATUS',
                'RESTAURANT',
                "Super Admin toggled restaurant ID #{$id} status to active={$isActive}.",
                'info',
                $superUser['id']
            );

            jsonResponse(1, "Restaurant status updated to active={$isActive}", ['id' => $id, 'is_active' => (bool)$isActive]);
            return;
        }

        $name = trim($input['name'] ?? '');
        $address = trim($input['address'] ?? '');
        $phone = trim($input['phone'] ?? '');

        $stmt = $pdo->prepare("UPDATE restaurants SET name = COALESCE(NULLIF(?, ''), name), address = COALESCE(NULLIF(?, ''), address), phone = COALESCE(NULLIF(?, ''), phone) WHERE id = ?");
        $stmt->execute([$name, $address, $phone, $id]);

        jsonResponse(1, "Restaurant #{$id} updated successfully", ['id' => $id]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to update restaurant: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
