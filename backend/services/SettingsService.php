<?php
// backend/services/SettingsService.php
// Service layer for System & Restaurant Configuration Settings

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/logger.php';

class SettingsService {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Get all settings grouped or flat key-value pairs
     */
    public function getSettings(?string $group = null): array {
        $query = "SELECT setting_key, setting_value, setting_group FROM settings";
        $params = [];

        if (!empty($group)) {
            $query .= " WHERE setting_group = ?";
            $params[] = $group;
        }

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $settings = [];
        foreach ($rows as $row) {
            $key = $row['setting_key'];
            $val = $row['setting_value'];
            // Auto parse booleans or numbers if applicable
            if ($val === 'true') $val = true;
            elseif ($val === 'false') $val = false;
            elseif (is_numeric($val) && strpos($val, '.') !== false) $val = (float)$val;
            elseif (is_numeric($val)) $val = (int)$val;

            $settings[$key] = $val;
        }

        return $settings;
    }

    /**
     * Update settings batch or key-value pair
     */
    public function saveSettings(array $input, ?array $adminUser = null): array {
        $stmt = $this->pdo->prepare("INSERT INTO settings (setting_key, setting_value, setting_group) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()");

        foreach ($input as $key => $value) {
            if ($key === 'action' || $key === 'token') continue;

            // Handle base64 image upload for KHQR image
            if (($key === 'khqr_image_url' || $key === 'khqrImageUrl') && !empty($value)) {
                require_once __DIR__ . '/../lib/upload.php';
                $value = saveBase64Image($value, 'qr') ?? $value;
                $key = 'khqr_image_url';
            }

            $group = 'general';
            if (strpos($key, 'telegram') === 0) $group = 'telegram';
            elseif (strpos($key, 'delivery') !== false || strpos($key, 'radius') !== false || strpos($key, 'fee') !== false || strpos($key, 'zone') !== false) $group = 'delivery';
            elseif (strpos($key, 'chime') !== false || strpos($key, 'audio') !== false || strpos($key, 'volume') !== false || strpos($key, 'push') !== false) $group = 'audio';
            elseif (strpos($key, 'session') !== false || strpos($key, 'log') !== false || strpos($key, 'security') !== false) $group = 'security';

            $valStr = is_bool($value) ? ($value ? 'true' : 'false') : (string)$value;
            $stmt->execute([$key, $valStr, $group]);
        }

        logSystemAction(
            $this->pdo,
            'UPDATE_SETTINGS',
            'SETTINGS',
            "Restaurant configuration settings updated by Admin.",
            'info',
            $adminUser ? $adminUser['id'] : null,
            $adminUser ? $adminUser['name'] : 'Admin'
        );

        return $this->getSettings();
    }

    /**
     * Test sending a live test message to Telegram Bot / Group
     */
    public function testTelegramConnection(?string $botToken = null, ?string $chatId = null): array {
        require_once __DIR__ . '/../lib/telegram.php';

        // Fallback to saved DB settings if not provided
        if (empty($botToken) || empty($chatId)) {
            $savedSettings = $this->getSettings('telegram');
            if (empty($botToken)) {
                $botToken = $savedSettings['telegramBotToken'] ?? env('TELEGRAM_BOT_TOKEN');
            }
            if (empty($chatId)) {
                $chatId = $savedSettings['telegramGroupId'] ?? env('TELEGRAM_GROUP_CHAT_ID');
            }
        }

        if (empty($botToken)) {
            return ['success' => false, 'message' => 'Telegram Bot Token is missing. Please provide a valid Bot Token.'];
        }

        if (empty($chatId)) {
            return ['success' => false, 'message' => 'Telegram Group / Chat ID is missing. Please provide a valid Chat ID.'];
        }

        $testMessage = "🧪 <b>TEST TELEGRAM CONNECTION</b>\n";
        $testMessage .= "━━━━━━━━━━━━━━━━━━━━\n";
        $testMessage .= "✅ <b>System:</b> Amber Bistro Admin Settings\n";
        $testMessage .= "⏰ <b>Time:</b> " . date('Y-m-d H:i:s') . "\n";
        $testMessage .= "⚡ <b>Status:</b> Telegram Bot API is connected and responding successfully!";

        $result = sendTelegramMessage($chatId, $testMessage, 'HTML', $botToken);

        if ($result['success']) {
            return [
                'success' => true,
                'message' => "⚡ Test message dispatched successfully to Telegram Group ({$chatId})!",
                'data' => $result['data'] ?? null
            ];
        } else {
            $errMsg = $result['message'] ?? 'Failed to send message via Telegram Bot API.';
            if (isset($result['data']['description'])) {
                $errMsg .= " (" . $result['data']['description'] . ")";
            }
            return [
                'success' => false,
                'message' => $errMsg
            ];
        }
    }
}

