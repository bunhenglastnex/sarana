<?php
// backend/api/auth.php
// User Authentication API (Register, Login, Add Delivery Driver)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? 'login';
$pdo = getDB();

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----------------------------------------------------
// 1. POST action=register (Customer Public Registration Only)
// ----------------------------------------------------
if ($method === 'POST' && $action === 'register') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $name     = trim($input['name'] ?? '');
    $phone    = trim($input['phone'] ?? '');
    $password = trim($input['password'] ?? '');
    $email    = trim($input['email'] ?? '');

    if (empty($name) || empty($phone) || empty($password)) {
        jsonResponse(0, 'Validation Error: Name, phone number, and password are required', null, 400);
    }

    if (strlen($password) < 4) {
        jsonResponse(0, 'Validation Error: Password must be at least 4 characters long', null, 400);
    }

    try {
        // Check if phone number already exists
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
        $checkStmt->execute([$phone]);
        if ($checkStmt->fetch()) {
            jsonResponse(0, 'Phone number is already registered. Please log in instead.', null, 400);
        }

        // STRICT RULE: Public registration strictly assigns role = 'customer'
        $role = 'customer';
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("INSERT INTO users (name, phone, email, role, password, status) VALUES (?, ?, ?, ?, ?, 'active')");
        $stmt->execute([
            $name,
            $phone,
            !empty($email) ? $email : null,
            $role,
            $hashedPassword
        ]);

        $userId = $pdo->lastInsertId();
        $token = 'token_cust_' . $userId . '_' . bin2hex(random_bytes(8));

        logSystemAction(
            $pdo,
            'REGISTER_CUSTOMER',
            'AUTH',
            "New customer registered: '{$name}' ({$phone}).",
            'info',
            $userId,
            $name
        );

        jsonResponse(1, 'Registration successful', [
            'token'   => $token,
            'userId'  => (int)$userId,
            'name'    => $name,
            'phone'   => $phone,
            'email'   => $email,
            'role'    => $role,
            'status'  => 'active'
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to register customer: ' . $e->getMessage(), null, 500);
    }
}

// ----------------------------------------------------
// 2. POST action=login (Unified Login with Role Enforcement)
// ----------------------------------------------------
if ($method === 'POST' && ($action === 'login' || empty($action))) {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $identifier   = trim($input['identifier'] ?? $input['phone'] ?? $input['email'] ?? $input['username'] ?? '');
    $password     = trim($input['password'] ?? $input['pinCode'] ?? '');
    $requiredRole = trim($input['required_role'] ?? $input['role'] ?? '');

    if (empty($identifier) || empty($password)) {
        jsonResponse(0, 'Validation Error: Phone/Email/Username and Password are required', null, 400);
    }

    try {
        // Search user by phone or email or name
        $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ? OR email = ? OR name = ? LIMIT 1");
        $stmt->execute([$identifier, $identifier, $identifier]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(0, 'Invalid credentials. User not found.', null, 401);
        }

        // Verify password
        if (!password_verify($password, $user['password'])) {
            jsonResponse(0, 'Invalid password. Please check your credentials.', null, 401);
        }

        // Check account status
        if (($user['status'] ?? 'active') !== 'active') {
            jsonResponse(0, 'Account is inactive or disabled. Please contact restaurant administration.', null, 403);
        }

        // Enforce Required Role Access Controls
        if (!empty($requiredRole)) {
            if ($requiredRole === 'admin' && $user['role'] !== 'admin') {
                jsonResponse(0, 'Access denied. You do not have Admin privileges.', null, 403);
            }
            if ($requiredRole === 'delivery' && $user['role'] !== 'delivery') {
                jsonResponse(0, 'Access denied. You are not registered as a Delivery Driver.', null, 403);
            }
        }

        $token = 'token_' . $user['role'] . '_' . $user['id'] . '_' . bin2hex(random_bytes(8));

        logSystemAction(
            $pdo,
            'LOGIN_SUCCESS',
            'AUTH',
            "User '{$user['name']}' ({$user['role']}) logged in successfully.",
            'info',
            $user['id'],
            $user['name']
        );

        jsonResponse(1, 'Login successful', [
            'token'            => $token,
            'userId'           => (int)$user['id'],
            'name'             => $user['name'],
            'phone'            => $user['phone'],
            'email'            => $user['email'],
            'avatarUrl'        => $user['avatar_url'] ?? null,
            'role'             => $user['role'],
            'telegramChatId'   => $user['telegram_chat_id'] ?? null,
            'telegramUsername' => $user['telegram_username'] ?? null,
            'status'           => $user['status'] ?? 'active'
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Login failed: ' . $e->getMessage(), null, 500);
    }
}

// ----------------------------------------------------
// 3. POST action=add-delivery (Admin Creates Delivery Driver)
// ----------------------------------------------------
if ($method === 'POST' && ($action === 'add-delivery' || $action === 'create-staff')) {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $name     = trim($input['name'] ?? '');
    $phone    = trim($input['phone'] ?? '');
    $password = trim($input['password'] ?? 'driver123');
    $email    = trim($input['email'] ?? '');
    $avatarUrl = trim($input['avatar_url'] ?? $input['avatarUrl'] ?? '');
    $targetRole = trim($input['role'] ?? 'delivery');

    if (empty($name) || empty($phone)) {
        jsonResponse(0, 'Validation Error: Driver name and phone number are required', null, 400);
    }

    try {
        // Check if phone number already exists
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
        $checkStmt->execute([$phone]);
        if ($checkStmt->fetch()) {
            jsonResponse(0, 'Phone number is already registered to another account.', null, 400);
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("INSERT INTO users (name, phone, email, avatar_url, role, password, status) VALUES (?, ?, ?, ?, ?, ?, 'active')");
        $stmt->execute([
            $name,
            $phone,
            !empty($email) ? $email : null,
            !empty($avatarUrl) ? $avatarUrl : null,
            $targetRole,
            $hashedPassword
        ]);

        $newUserId = $pdo->lastInsertId();

        logSystemAction(
            $pdo,
            'ADD_STAFF_DRIVER',
            'ADMIN',
            "Admin added new staff/driver: '{$name}' (Role: {$targetRole}, Phone: {$phone}).",
            'info'
        );

        jsonResponse(1, "New {$targetRole} account created successfully", [
            'id'        => (int)$newUserId,
            'name'      => $name,
            'phone'     => $phone,
            'email'     => $email,
            'avatarUrl' => $avatarUrl,
            'role'      => $targetRole,
            'status'    => 'active'
        ], 201);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to create driver account: ' . $e->getMessage(), null, 500);
    }
}

// ----------------------------------------------------
// 4. GET action=me (Check Current Auth Status)
// ----------------------------------------------------
if ($method === 'GET' && $action === 'me') {
    $userId = $_GET['user_id'] ?? null;
    if (!$userId) {
        jsonResponse(0, 'User ID is required', null, 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT id, name, phone, email, avatar_url, role, telegram_chat_id, telegram_username, status, created_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(0, 'User not found', null, 404);
        }

        jsonResponse(1, 'User data retrieved', $user);
    } catch (PDOException $e) {
        jsonResponse(0, 'Database error: ' . $e->getMessage(), null, 500);
    }
}

jsonResponse(0, 'Invalid request method or action', null, 400);
