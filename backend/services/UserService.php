<?php
// backend/services/UserService.php
// Service layer for User querying, creation, updating, and deletion

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';

class UserService {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function getUsers(?string $role = null, ?string $status = null): array {
        $query = "
            SELECT 
                u.id, 
                u.name, 
                u.phone, 
                u.email, 
                u.avatar_url, 
                u.role, 
                u.status as account_status,
                COALESCE(t.status, u.status) as status,
                t.status as courier_status,
                t.vehicle_type,
                t.vehicle_label,
                t.speed_kmh,
                t.temp_celsius,
                u.telegram_chat_id, 
                u.telegram_username, 
                u.created_at 
            FROM users u
            LEFT JOIN courier_telemetry t ON u.id = t.user_id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($role)) {
            $query .= " AND u.role = ?";
            $params[] = $role;
        }

        if (!empty($status)) {
            $query .= " AND COALESCE(t.status, u.status) = ?";
            $params[] = $status;
        }

        $query .= " ORDER BY u.id DESC";

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        $users = $stmt->fetchAll();

        foreach ($users as &$u) {
            $u['id'] = (int)$u['id'];
        }

        return $users;
    }

    public function createUser(array $input, ?array $adminUser = null): array {
        $name     = trim($input['name'] ?? '');
        $phone    = trim($input['phone'] ?? '');
        $password = trim($input['password'] ?? '123456');
        $email    = trim($input['email'] ?? '');
        $role     = trim($input['role'] ?? 'delivery');

        if (empty($name) || empty($phone)) {
            jsonResponse(0, 'Validation Error: Name and phone are required', null, 400);
        }

        $checkStmt = $this->pdo->prepare("SELECT id FROM users WHERE phone = ?");
        $checkStmt->execute([$phone]);
        if ($checkStmt->fetch()) {
            jsonResponse(0, 'Phone number is already registered.', null, 400);
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->pdo->prepare("INSERT INTO users (name, phone, email, role, password, status) VALUES (?, ?, ?, ?, ?, 'active')");
        $stmt->execute([$name, $phone, !empty($email) ? $email : null, $role, $hashedPassword]);

        $newId = (int)$this->pdo->lastInsertId();

        logSystemAction(
            $this->pdo,
            'CREATE_USER',
            'ADMIN',
            "Created user '{$name}' with role '{$role}'.",
            'info',
            $adminUser ? $adminUser['id'] : null,
            $adminUser ? $adminUser['name'] : 'Admin'
        );

        return [
            'id'     => $newId,
            'name'   => $name,
            'phone'  => $phone,
            'email'  => $email,
            'role'   => $role,
            'status' => 'active'
        ];
    }

    public function deleteUser(int $id, ?array $adminUser = null): array {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(0, 'User not found or cannot delete Admin account', null, 400);
        }

        logSystemAction(
            $this->pdo,
            'DELETE_USER',
            'ADMIN',
            "Deleted user ID #{$id}.",
            'warning',
            $adminUser ? $adminUser['id'] : null,
            $adminUser ? $adminUser['name'] : 'Admin'
        );

        return ['id' => $id];
    }
}
