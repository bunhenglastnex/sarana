<?php
// backend/controllers/SettingsController.php
// HTTP Controller for Restaurant & System Settings

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../services/SettingsService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class SettingsController {
    private SettingsService $settingsService;
    private PDO $pdo;

    public function __construct() {
        $this->pdo = getDB();
        $this->settingsService = new SettingsService($this->pdo);
    }

    public function handleRequest(): void {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            $group = $_GET['group'] ?? null;
            $tenantId = AuthMiddleware::getTenantFilter($this->pdo, ['admin']);
            if (isset($_GET['restaurant_id']) && is_numeric($_GET['restaurant_id'])) {
                $tenantId = (int)$_GET['restaurant_id'];
            }

            $data = $this->settingsService->getSettings($group, $tenantId);
            jsonResponse(1, 'Settings retrieved successfully', $data, 200);
        }

        if ($method === 'POST' || $method === 'PUT') {
            $adminUser = AuthMiddleware::authenticate($this->pdo, ['admin']);
            $input = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];
            $action = $_GET['action'] ?? $input['action'] ?? null;

            if ($action === 'test-telegram' || $action === 'test_telegram') {
                $botToken = $input['telegramBotToken'] ?? null;
                $chatId = $input['telegramGroupId'] ?? null;
                $res = $this->settingsService->testTelegramConnection($botToken, $chatId);
                if ($res['success']) {
                    jsonResponse(1, $res['message'], $res['data'] ?? null, 200);
                } else {
                    jsonResponse(0, $res['message'], null, 400);
                }
            }

            $tenantId = AuthMiddleware::getTenantFilter($this->pdo, ['admin']);
            if (isset($input['restaurant_id']) && is_numeric($input['restaurant_id'])) {
                $tenantId = (int)$input['restaurant_id'];
            }

            $data = $this->settingsService->saveSettings($input, $adminUser, $tenantId);
            jsonResponse(1, 'Settings updated successfully', $data, 200);
        }

        jsonResponse(0, 'Method Not Allowed', null, 405);
    }
}
