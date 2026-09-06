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
            // Require Admin role for admin settings retrieval
            $adminUser = AuthMiddleware::authenticate($this->pdo, ['admin']);
            $group = $_GET['group'] ?? null;
            $data = $this->settingsService->getSettings($group);
            jsonResponse(1, 'Settings retrieved successfully', $data, 200);
        }

        if ($method === 'POST' || $method === 'PUT') {
            // Require Admin role for updating admin settings
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

            $data = $this->settingsService->saveSettings($input, $adminUser);
            jsonResponse(1, 'Settings updated successfully', $data, 200);
        }

        jsonResponse(0, 'Method Not Allowed', null, 405);
    }
}
