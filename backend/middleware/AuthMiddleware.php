<?php
// backend/middleware/AuthMiddleware.php
// Middleware for Authentication & Role-Based Access Control (RBAC)

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';

class AuthMiddleware {
    /**
     * Authenticate token from Authorization Header or Request Payload
     *
     * @param PDO $pdo
     * @param array $allowedRoles Array of allowed roles (e.g. ['admin', 'staff']). Empty array allows any role.
     * @return array Authenticated user array
     */
    public static function authenticate(PDO $pdo, array $allowedRoles = []): array {
        $token = self::getTokenFromRequest();

        if (empty($token)) {
            jsonResponse(0, 'Unauthorized: Access token is missing', null, 401);
        }

        // Extract token_role_userId_hash if token follows token_format
        $user = null;
        if (preg_match('/^token_([a-z]+)_(\d+)_/i', $token, $matches)) {
            $userId = (int)$matches[2];
            $stmt = $pdo->prepare("SELECT id, name, phone, email, avatar_url, role, telegram_chat_id, telegram_username, status FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
        }

        if (!$user) {
            jsonResponse(0, 'Unauthorized: Invalid or expired session token', null, 401);
        }

        if (($user['status'] ?? 'active') !== 'active') {
            jsonResponse(0, 'Forbidden: Account is inactive or disabled', null, 403);
        }

        // Check Role-Based Access Control
        if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles, true)) {
            jsonResponse(0, "Forbidden: Required role [" . implode(', ', $allowedRoles) . "] privilege missing", null, 403);
        }

        return $user;
    }

    /**
     * Get bearer token from HTTP headers or request body
     */
    private static function getTokenFromRequest(): ?string {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;

        if ($authHeader && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            return $matches[1];
        }

        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        return $_GET['token'] ?? $_POST['token'] ?? $input['token'] ?? null;
    }
}
