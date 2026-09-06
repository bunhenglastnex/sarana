<?php
// backend/controllers/UserController.php
// HTTP Controller for User Management

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../services/UserService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class UserController {
    private UserService $userService;
    private PDO $pdo;

    public function __construct() {
        $this->pdo = getDB();
        $this->userService = new UserService($this->pdo);
    }

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            // Require Admin role for listing users
            $adminUser = AuthMiddleware::authenticate($this->pdo, ['admin']);
            $role   = $_GET['role'] ?? null;
            $status = $_GET['status'] ?? null;
            $users  = $this->userService->getUsers($role, $status);
            jsonResponse(1, 'Users retrieved successfully', $users, 200);
        }

        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];
            $adminUser = AuthMiddleware::authenticate($this->pdo, ['admin']);
            $result = $this->userService->createUser($input, $adminUser);
            jsonResponse(1, 'User created successfully', $result, 201);
        }

        if ($method === 'DELETE') {
            $id = (int)($_GET['id'] ?? 0);
            if (!$id) {
                jsonResponse(0, 'User ID is required', null, 400);
            }
            $adminUser = AuthMiddleware::authenticate($this->pdo, ['admin']);
            $result = $this->userService->deleteUser($id, $adminUser);
            jsonResponse(1, "User ID #{$id} deleted successfully", $result, 200);
        }

        jsonResponse(0, 'Method Not Allowed', null, 405);
    }
}
