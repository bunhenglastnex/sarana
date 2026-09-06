<?php
// backend/services/AuthService.php
// Business logic service for User Registration, Login & Staff creation

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';

class AuthService {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Register a new Customer account (Role is strictly forced to 'customer')
     */
    public function registerCustomer(array $input): array {
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

        // Check if phone number already exists
        $checkStmt = $this->pdo->prepare("SELECT id FROM users WHERE phone = ?");
        $checkStmt->execute([$phone]);
        if ($checkStmt->fetch()) {
            jsonResponse(0, 'Phone number is already registered. Please log in instead.', null, 400);
        }

        // Check if email already exists
        if (!empty($email)) {
            $emailStmt = $this->pdo->prepare("SELECT id FROM users WHERE email = ?");
            $emailStmt->execute([$email]);
            if ($emailStmt->fetch()) {
                jsonResponse(0, 'Email address is already registered. Please log in instead.', null, 400);
            }
        }

        $role = 'customer';
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->pdo->prepare("INSERT INTO users (name, phone, email, role, password, status) VALUES (?, ?, ?, ?, ?, 'active')");
        $stmt->execute([
            $name,
            $phone,
            !empty($email) ? $email : null,
            $role,
            $hashedPassword
        ]);

        $userId = (int)$this->pdo->lastInsertId();
        $token = 'token_customer_' . $userId . '_' . bin2hex(random_bytes(8));

        logSystemAction(
            $this->pdo,
            'REGISTER_CUSTOMER',
            'AUTH',
            "New customer registered: '{$name}' ({$phone}).",
            'info',
            $userId,
            $name
        );

        return [
            'token'   => $token,
            'userId'  => $userId,
            'name'    => $name,
            'phone'   => $phone,
            'email'   => $email,
            'role'    => $role,
            'status'  => 'active'
        ];
    }

    /**
     * Unified Login method for Customers, Admins, and Delivery Drivers
     */
    public function loginUser(array $input): array {
        $identifier   = trim($input['identifier'] ?? $input['phone'] ?? $input['email'] ?? $input['username'] ?? '');
        $password     = trim($input['password'] ?? $input['pinCode'] ?? '');
        $requiredRole = trim($input['required_role'] ?? $input['role'] ?? '');

        if (empty($identifier) || empty($password)) {
            jsonResponse(0, 'Validation Error: Phone/Email/Username and Password are required', null, 400);
        }

        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE phone = ? OR email = ? OR name = ? LIMIT 1");
        $stmt->execute([$identifier, $identifier, $identifier]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(0, 'Invalid credentials. User not found.', null, 401);
        }

        if (!password_verify($password, $user['password'])) {
            jsonResponse(0, 'Invalid password. Please check your credentials.', null, 401);
        }

        if (($user['status'] ?? 'active') !== 'active') {
            jsonResponse(0, 'Account is inactive or disabled. Please contact restaurant administration.', null, 403);
        }

        // Role restriction check
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
            $this->pdo,
            'LOGIN_SUCCESS',
            'AUTH',
            "User '{$user['name']}' ({$user['role']}) logged in successfully.",
            'info',
            (int)$user['id'],
            $user['name']
        );

        return [
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
        ];
    }

    /**
     * Create Staff or Delivery Driver (Admin only)
     */
    public function createStaffDriver(array $input, ?array $adminUser = null): array {
        $name       = trim($input['name'] ?? '');
        $phone      = trim($input['phone'] ?? '');
        $password   = trim($input['password'] ?? 'driver123');
        $email      = trim($input['email'] ?? '');
        $avatarUrl  = trim($input['avatar_url'] ?? $input['avatarUrl'] ?? '');
        $targetRole = trim($input['role'] ?? 'delivery');

        if (empty($name) || empty($phone)) {
            jsonResponse(0, 'Validation Error: Driver/Staff name and phone number are required', null, 400);
        }

        $checkStmt = $this->pdo->prepare("SELECT id FROM users WHERE phone = ?");
        $checkStmt->execute([$phone]);
        if ($checkStmt->fetch()) {
            jsonResponse(0, 'Phone number is already registered to another account.', null, 400);
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->pdo->prepare("INSERT INTO users (name, phone, email, avatar_url, role, password, status) VALUES (?, ?, ?, ?, ?, ?, 'active')");
        $stmt->execute([
            $name,
            $phone,
            !empty($email) ? $email : null,
            !empty($avatarUrl) ? $avatarUrl : null,
            $targetRole,
            $hashedPassword
        ]);

        $newUserId = (int)$this->pdo->lastInsertId();

        logSystemAction(
            $this->pdo,
            'ADD_STAFF_DRIVER',
            'AUTH',
            "Admin created new staff ({$targetRole}): '{$name}' ({$phone}).",
            'info',
            $adminUser ? $adminUser['id'] : null,
            $adminUser ? $adminUser['name'] : 'Admin'
        );

        return [
            'userId'    => $newUserId,
            'name'      => $name,
            'phone'     => $phone,
            'email'     => $email,
            'avatarUrl' => $avatarUrl,
            'role'      => $targetRole,
            'status'    => 'active'
        ];
    }
}
