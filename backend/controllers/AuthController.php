<?php
// backend/controllers/AuthController.php
// HTTP Controller for Authentication endpoints

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AuthController {
    private AuthService $authService;
    private PDO $pdo;

    public function __construct() {
        $this->pdo = getDB();
        $this->authService = new AuthService($this->pdo);
    }

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? $_POST['action'] ?? 'login';
        $input  = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];

        switch ($action) {
            case 'register':
                if ($method !== 'POST') {
                    jsonResponse(0, 'Method Not Allowed', null, 405);
                }
                $data = $this->authService->registerCustomer($input);
                jsonResponse(1, 'Registration successful', $data, 201);
                break;

            case 'login':
                if ($method !== 'POST') {
                    jsonResponse(0, 'Method Not Allowed', null, 405);
                }
                $data = $this->authService->loginUser($input);
                jsonResponse(1, 'Login successful', $data, 200);
                break;

            case 'add-delivery':
            case 'create-staff':
                if ($method !== 'POST') {
                    jsonResponse(0, 'Method Not Allowed', null, 405);
                }
                // Require Admin permissions
                $adminUser = AuthMiddleware::authenticate($this->pdo, ['admin']);
                $data = $this->authService->createStaffDriver($input, $adminUser);
                jsonResponse(1, 'Staff/Driver created successfully', $data, 201);
                break;

            case 'me':
                if ($method !== 'GET') {
                    jsonResponse(0, 'Method Not Allowed', null, 405);
                }
                $user = AuthMiddleware::authenticate($this->pdo);
                jsonResponse(1, 'Current user profile fetched successfully', $user, 200);
                break;

            default:
                jsonResponse(0, "Invalid action '$action'", null, 400);
                break;
        }
    }
}
