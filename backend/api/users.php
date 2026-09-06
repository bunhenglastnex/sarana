<?php
// backend/api/users.php
// User Management API for Admin (List users by role, Delete/Deactivate user)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----------------------------------------------------
// GET /backend/api/users.php (List users filtered by role)
// ----------------------------------------------------
if ($method === 'GET') {
    $role = $_GET['role'] ?? null;
    $status = $_GET['status'] ?? null;

    try {
        $query = "SELECT id, name, phone, email, avatar_url, role, status, telegram_chat_id, telegram_username, created_at FROM users WHERE 1=1";
        $params = [];

        if (!empty($role)) {
            $query .= " AND role = ?";
            $params[] = $role;
        }

        if (!empty($status)) {
            $query .= " AND status = ?";
            $params[] = $status;
        }

        $query .= " ORDER BY id DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $users = $stmt->fetchAll();

        // Convert numeric IDs
        foreach ($users as &$u) {
            $u['id'] = (int)$u['id'];
        }

        jsonResponse(1, 'Users retrieved successfully', $users);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch users: ' . $e->getMessage(), null, 500);
    }
}

// ----------------------------------------------------
// POST /backend/api/users.php (Create user/staff directly)
// ----------------------------------------------------
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $name     = trim($input['name'] ?? '');
    $phone    = trim($input['phone'] ?? '');
    $password = trim($input['password'] ?? '123456');
    $email    = trim($input['email'] ?? '');
    $role     = trim($input['role'] ?? 'delivery');

    if (empty($name) || empty($phone)) {
        jsonResponse(0, 'Validation Error: Name and phone are required', null, 400);
    }

    try {
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
        $checkStmt->execute([$phone]);
        if ($checkStmt->fetch()) {
            jsonResponse(0, 'Phone number is already registered.', null, 400);
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("INSERT INTO users (name, phone, email, role, password, status) VALUES (?, ?, ?, ?, ?, 'active')");
        $stmt->execute([$name, $phone, !empty($email) ? $email : null, $role, $hashedPassword]);

        $newId = $pdo->lastInsertId();

        logSystemAction($pdo, 'CREATE_USER', 'ADMIN', "Created user '{$name}' with role '{$role}'.", 'info');

        jsonResponse(1, 'User created successfully', [
            'id'     => (int)$newId,
            'name'   => $name,
            'phone'  => $phone,
            'email'  => $email,
            'role'   => $role,
            'status' => 'active'
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to create user: ' . $e->getMessage(), null, 500);
    }
}

// ----------------------------------------------------
// DELETE /backend/api/users.php?id=X (Delete or Deactivate user)
// ----------------------------------------------------
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        jsonResponse(0, 'User ID is required', null, 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(0, 'User not found or cannot delete Admin account', null, 400);
        }

        logSystemAction($pdo, 'DELETE_USER', 'ADMIN', "Deleted user ID #{$id}.", 'warning');

        jsonResponse(1, "User ID #{$id} deleted successfully", ['id' => (int)$id]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to delete user: ' . $e->getMessage(), null, 500);
    }
}

jsonResponse(0, 'Method Not Allowed', null, 405);
