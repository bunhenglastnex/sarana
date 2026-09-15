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
     * Get all settings grouped or flat key-value pairs, scoped to tenant
     */
    public function getSettings(?string $group = null, ?int $tenantId = null): array {
        // 1. Fetch global settings (restaurant_id IS NULL)
        $query = "SELECT setting_key, setting_value, setting_group FROM settings WHERE restaurant_id IS NULL";
        $params = [];
        if (!empty($group)) {
            $query .= " AND setting_group = ?";
            $params[] = $group;
        }

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $settings = [];
        foreach ($rows as $row) {
            $key = $row['setting_key'];
            $val = $row['setting_value'];
            if ($val === 'true') $val = true;
            elseif ($val === 'false') $val = false;
            elseif (is_numeric($val) && strpos($val, '.') !== false) $val = (float)$val;
            elseif (is_numeric($val)) $val = (int)$val;

            $settings[$key] = $val;
        }

        // 2. If tenantId is specified, fetch restaurant store profile & override settings
        if ($tenantId !== null && $tenantId > 0) {
            $restoStmt = $this->pdo->prepare("SELECT id, name, phone, address, lat, lng, is_active FROM restaurants WHERE id = ?");
            $restoStmt->execute([$tenantId]);
            $resto = $restoStmt->fetch();

            if ($resto) {
                if (!empty($resto['name'])) $settings['store_name'] = $resto['name'];
                if (!empty($resto['phone'])) $settings['store_phone'] = $resto['phone'];
                if (!empty($resto['address'])) $settings['store_address'] = $resto['address'];
                if (!empty($resto['lat'])) $settings['store_latitude'] = (string)$resto['lat'];
                if (!empty($resto['lng'])) $settings['store_longitude'] = (string)$resto['lng'];
                if (isset($resto['is_active'])) $settings['is_active'] = (bool)$resto['is_active'];
            }

            $tQuery = "SELECT setting_key, setting_value FROM settings WHERE restaurant_id = ?";
            $tParams = [$tenantId];
            if (!empty($group)) {
                $tQuery .= " AND setting_group = ?";
                $tParams[] = $group;
            }

            $tStmt = $this->pdo->prepare($tQuery);
            $tStmt->execute($tParams);
            $tRows = $tStmt->fetchAll();

            foreach ($tRows as $row) {
                $key = $row['setting_key'];
                $val = $row['setting_value'];
                if ($val === 'true') $val = true;
                elseif ($val === 'false') $val = false;
                elseif (is_numeric($val) && strpos($val, '.') !== false) $val = (float)$val;
                elseif (is_numeric($val)) $val = (int)$val;

                $settings[$key] = $val;
            }
        }

        return $settings;
    }

    /**
     * Update settings batch or key-value pair for tenant
     */
    public function saveSettings(array $input, ?array $adminUser = null, ?int $tenantId = null): array {
        if ($tenantId === null && $adminUser) {
            if ($adminUser['role'] === 'admin' && !empty($adminUser['restaurant_id'])) {
                $tenantId = (int)$adminUser['restaurant_id'];
            } elseif ($adminUser['role'] === 'super_admin' && !empty($input['restaurant_id'])) {
                $tenantId = (int)$input['restaurant_id'];
            } elseif (!empty($adminUser['restaurant_id'])) {
                $tenantId = (int)$adminUser['restaurant_id'];
            }
        }

        // Determine target tenant ID (fallback to 1 if not specified)
        $targetRestoId = ($tenantId !== null && $tenantId > 0) ? $tenantId : 1;

        // 1. Update core restaurant profile in `restaurants` table
        $storeName    = $input['store_name'] ?? $input['storeName'] ?? null;
        $storePhone   = $input['store_phone'] ?? $input['storePhone'] ?? null;
        $storeAddress = $input['store_address'] ?? $input['storeAddress'] ?? null;
        $storeLat     = $input['store_latitude'] ?? $input['storeLatitude'] ?? null;
        $storeLng     = $input['store_longitude'] ?? $input['storeLongitude'] ?? null;
        $isActive     = isset($input['is_active']) ? (int)(bool)$input['is_active'] : (isset($input['isActive']) ? (int)(bool)$input['isActive'] : null);

        if ($isActive !== null) {
            $upResto = $this->pdo->prepare("UPDATE restaurants SET is_active = ? WHERE id = ?");
            $upResto->execute([$isActive, $targetRestoId]);
            if ($tenantId === null) {
                $upAllResto = $this->pdo->prepare("UPDATE restaurants SET is_active = ?");
                $upAllResto->execute([$isActive]);
            }
        }

        if ($storeName !== null || $storePhone !== null || $storeAddress !== null || $storeLat !== null || $storeLng !== null) {
            $upSql = "UPDATE restaurants SET 
                        name = COALESCE(:name, name),
                        phone = COALESCE(:phone, phone),
                        address = COALESCE(:address, address),
                        lat = COALESCE(:lat, lat),
                        lng = COALESCE(:lng, lng)
                      WHERE id = :id";
            $upStmt = $this->pdo->prepare($upSql);
            $upStmt->execute([
                'name'      => $storeName,
                'phone'     => $storePhone,
                'address'   => $storeAddress,
                'lat'       => $storeLat !== null ? (float)$storeLat : null,
                'lng'       => $storeLng !== null ? (float)$storeLng : null,
                'id'        => $targetRestoId,
            ]);
        }

        // 2. Save settings key-values
        foreach ($input as $key => $value) {
            if ($key === 'action' || $key === 'token' || $key === 'restaurant_id') continue;

            $keyMap = [
                'storeName' => 'store_name',
                'storePhone' => 'store_phone',
                'storeAddress' => 'store_address',
                'openingTime' => 'opening_time',
                'closingTime' => 'closing_time',
                'taxRate' => 'tax_rate',
                'khqrImageUrl' => 'khqr_image_url',
                'enableAudioChimes' => 'enable_audio_chimes',
                'chimeTone' => 'chime_tone',
                'chimeRepeatCount' => 'chime_repeat_count',
                'volumeLevel' => 'volume_level',
                'enablePushAlerts' => 'enable_push_alerts',
                'autoRefreshSeconds' => 'auto_refresh_seconds',
                'sessionTimeout' => 'session_timeout',
                'logRetentionDays' => 'log_retention_days',
                'telegramBotToken' => 'telegram_bot_token',
                'telegramGroupId' => 'telegram_group_id',
                'telegramKitchenGroupId' => 'telegram_kitchen_group_id',
                'telegramDriverGroupId' => 'telegram_driver_group_id',
                'telegramNotifyNewOrder' => 'telegram_notify_new_order',
                'telegramNotifyKitchenReady' => 'telegram_notify_kitchen_ready',
                'telegramNotifyDriverAssigned' => 'telegram_notify_driver_assigned',
                'telegramNotifyCancelled' => 'telegram_notify_cancelled',
                'storeLatitude' => 'store_latitude',
                'storeLongitude' => 'store_longitude',
                'maxDeliveryRadiusKm' => 'max_delivery_radius_km',
                'enableZoneBlocker' => 'enable_zone_blocker',
                'outOfZoneMessage' => 'out_of_zone_message',
                'baseDeliveryFee' => 'base_delivery_fee',
                'baseIncludedKm' => 'base_included_km',
                'extraFeePerKm' => 'extra_fee_per_km',
                'freeDeliveryMinSubtotal' => 'free_delivery_min_subtotal',
            ];
            $dbKey = $keyMap[$key] ?? $key;

            if (($dbKey === 'khqr_image_url') && !empty($value)) {
                require_once __DIR__ . '/../lib/upload.php';
                $value = saveBase64Image($value, 'qr') ?? $value;
            }

            $group = 'general';
            if (strpos($dbKey, 'telegram') === 0) $group = 'telegram';
            elseif (strpos($dbKey, 'delivery') !== false || strpos($dbKey, 'radius') !== false || strpos($dbKey, 'fee') !== false || strpos($dbKey, 'zone') !== false) $group = 'delivery';
            elseif (strpos($dbKey, 'chime') !== false || strpos($dbKey, 'audio') !== false || strpos($dbKey, 'volume') !== false || strpos($dbKey, 'push') !== false) $group = 'audio';
            elseif (strpos($dbKey, 'session') !== false || strpos($dbKey, 'log') !== false || strpos($dbKey, 'security') !== false) $group = 'security';

            $valStr = is_bool($value) ? ($value ? 'true' : 'false') : (string)$value;

            if ($tenantId !== null && $tenantId > 0) {
                $chkStmt = $this->pdo->prepare("SELECT id FROM settings WHERE setting_key = ? AND restaurant_id = ?");
                $chkStmt->execute([$dbKey, $tenantId]);
                $exists = $chkStmt->fetch();

                if ($exists) {
                    $updStmt = $this->pdo->prepare("UPDATE settings SET setting_value = ?, setting_group = ?, updated_at = NOW() WHERE id = ?");
                    $updStmt->execute([$valStr, $group, $exists['id']]);
                } else {
                    $insStmt = $this->pdo->prepare("INSERT INTO settings (setting_key, setting_value, setting_group, restaurant_id) VALUES (?, ?, ?, ?)");
                    $insStmt->execute([$dbKey, $valStr, $group, $tenantId]);
                }
            } else {
                $chkStmt = $this->pdo->prepare("SELECT id FROM settings WHERE setting_key = ? AND restaurant_id IS NULL");
                $chkStmt->execute([$dbKey]);
                $exists = $chkStmt->fetch();

                if ($exists) {
                    $updStmt = $this->pdo->prepare("UPDATE settings SET setting_value = ?, setting_group = ?, updated_at = NOW() WHERE id = ?");
                    $updStmt->execute([$valStr, $group, $exists['id']]);
                } else {
                    $insStmt = $this->pdo->prepare("INSERT INTO settings (setting_key, setting_value, setting_group, restaurant_id) VALUES (?, ?, ?, NULL)");
                    $insStmt->execute([$dbKey, $valStr, $group]);
                }
            }
        }

        logSystemAction(
            $this->pdo,
            'UPDATE_SETTINGS',
            'SETTINGS',
            "Restaurant configuration settings updated by Admin (Tenant #" . ($tenantId ?? 'Global') . ").",
            'info',
            $adminUser ? $adminUser['id'] : null,
            $adminUser ? $adminUser['name'] : 'Admin'
        );

        return $this->getSettings(null, $tenantId);
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

