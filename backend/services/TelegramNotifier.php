<?php
// backend/services/TelegramNotifier.php
// Centralized Reusable Telegram Notification Component for All Roles (Admin, Kitchen, Driver, Customer)

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/telegram.php';

class TelegramNotifier {
    private PDO $pdo;

    public function __construct(?PDO $pdo = null) {
        $this->pdo = $pdo ?? getDB();
    }

    /**
     * Send direct message to any Chat ID with optional Bot Token override
     */
    public function sendRaw($chatId, string $text, ?string $botToken = null, ?int $restaurantId = null): array {
        if (empty($botToken)) {
            $botToken = $this->getSetting('telegram_bot_token', env('TELEGRAM_BOT_TOKEN'), $restaurantId);
        }
        return sendTelegramMessage($chatId, $text, 'HTML', $botToken);
    }

    /**
     * Send notification to Main Admin Order Group Chat
     */
    public function notifyAdminGroup(string $text, ?int $restaurantId = null): array {
        $chatId = $this->getSetting('telegram_group_id', env('TELEGRAM_GROUP_CHAT_ID'), $restaurantId);
        if (empty($chatId)) {
            return ['success' => false, 'message' => 'Admin Group Chat ID not configured.'];
        }
        return $this->sendRaw($chatId, $text, null, $restaurantId);
    }

    /**
     * Send notification to Kitchen Prep Group Chat (falls back to Admin group)
     */
    public function notifyKitchenGroup(string $text, ?int $restaurantId = null): array {
        $chatId = $this->getSetting('telegram_kitchen_group_id', $this->getSetting('telegram_group_id', env('TELEGRAM_GROUP_CHAT_ID'), $restaurantId), $restaurantId);
        if (empty($chatId)) {
            return ['success' => false, 'message' => 'Kitchen Group Chat ID not configured.'];
        }
        return $this->sendRaw($chatId, $text, null, $restaurantId);
    }

    /**
     * Send notification to Delivery Driver Dispatch Group Chat (falls back to Admin group)
     */
    public function notifyDriverGroup(string $text, ?int $restaurantId = null): array {
        $chatId = $this->getSetting('telegram_driver_group_id', $this->getSetting('telegram_group_id', env('TELEGRAM_GROUP_CHAT_ID'), $restaurantId), $restaurantId);
        if (empty($chatId)) {
            return ['success' => false, 'message' => 'Driver Group Chat ID not configured.'];
        }
        return $this->sendRaw($chatId, $text, null, $restaurantId);
    }

    /**
     * Send direct private message to a specific User/Customer by User ID
     */
    public function notifyUser(int $userId, string $text, ?int $restaurantId = null): array {
        $stmt = $this->pdo->prepare("SELECT telegram_chat_id FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $chatId = $stmt->fetchColumn();

        if (empty($chatId)) {
            return ['success' => false, 'message' => "User #{$userId} has not linked their Telegram account."];
        }
        return $this->sendRaw($chatId, $text, null, $restaurantId);
    }

    /**
     * Event Trigger 1: New Order Placed (Notifies Admin & Kitchen Group + Customer)
     */
    public function sendNewOrderBroadcast(array $order, array $items): array {
        $results = [];
        $restaurantId = isset($order['restaurant_id']) ? (int)$order['restaurant_id'] : null;

        // Check toggle settings
        if ($this->isToggleEnabled('telegram_notify_new_order', $restaurantId)) {
            $msg = formatNewOrderGroupMessage($order, $items);
            $results['admin'] = $this->notifyAdminGroup($msg, $restaurantId);
        }

        // Notify customer directly if linked
        if (!empty($order['telegram_chat_id'])) {
            $custMsg = "🛍️ <b>Order Received!</b>\nYour order <b>#{$order['order_number']}</b> has been placed successfully. Total: <b>\${$order['total_amount']}</b>.";
            $results['customer'] = $this->sendRaw($order['telegram_chat_id'], $custMsg, null, $restaurantId);
        }

        return $results;
    }

    /**
     * Event Trigger 2: Order Status Changed (Notifies Customer + Relevant Groups)
     */
    public function sendStatusUpdateBroadcast(array $order, string $newStatus, string $note = ''): array {
        $results = [];
        $restaurantId = isset($order['restaurant_id']) ? (int)$order['restaurant_id'] : null;
        $msg = formatOrderStatusUpdateMessage($order, $newStatus, $note);

        // 1. Notify Customer directly if chat ID exists
        if (!empty($order['telegram_chat_id'])) {
            $results['customer'] = $this->sendRaw($order['telegram_chat_id'], $msg, null, $restaurantId);
        }

        // 2. Dispatch to specific role groups based on status transition
        switch ($newStatus) {
            case 'preparing':
                if ($this->isToggleEnabled('telegram_notify_kitchen_ready', $restaurantId)) {
                    $results['kitchen'] = $this->notifyKitchenGroup("🍳 <b>KITCHEN ALERT:</b> Order <b>#{$order['order_number']}</b> is now PREPARING!", $restaurantId);
                }
                break;

            case 'ready_for_delivery':
            case 'on_the_way':
                if ($this->isToggleEnabled('telegram_notify_driver_assigned', $restaurantId)) {
                    $results['driver'] = $this->notifyDriverGroup("🛵 <b>DRIVER DISPATCH:</b> Order <b>#{$order['order_number']}</b> is READY FOR DELIVERY!", $restaurantId);
                }
                break;

            case 'cancelled':
                if ($this->isToggleEnabled('telegram_notify_cancelled', $restaurantId)) {
                    $results['admin'] = $this->notifyAdminGroup("❌ <b>ORDER CANCELLED:</b> Order <b>#{$order['order_number']}</b> has been cancelled. Note: {$note}", $restaurantId);
                }
                break;
        }

        return $results;
    }

    /**
     * Helper to read dynamic setting from DB with fallback (scoped by restaurant ID)
     */
    public function getSetting(string $key, ?string $default = null, ?int $restaurantId = null): ?string {
        try {
            if ($restaurantId !== null && $restaurantId > 0) {
                $stmt = $this->pdo->prepare("
                    SELECT setting_value FROM settings 
                    WHERE setting_key = ? AND (restaurant_id = ? OR restaurant_id IS NULL)
                    ORDER BY CASE WHEN restaurant_id = ? THEN 1 ELSE 2 END ASC
                    LIMIT 1
                ");
                $stmt->execute([$key, $restaurantId, $restaurantId]);
            } else {
                $stmt = $this->pdo->prepare("
                    SELECT setting_value FROM settings 
                    WHERE setting_key = ? 
                    ORDER BY CASE WHEN restaurant_id IS NOT NULL THEN 1 ELSE 2 END ASC
                    LIMIT 1
                ");
                $stmt->execute([$key]);
            }
            $val = $stmt->fetchColumn();
            return ($val !== false && $val !== null && $val !== '') ? (string)$val : $default;
        } catch (\Throwable $e) {
            return $default;
        }
    }

    /**
     * Helper to check boolean feature toggle from DB settings
     */
    public function isToggleEnabled(string $key, ?int $restaurantId = null): bool {
        $val = strtolower((string)$this->getSetting($key, 'true', $restaurantId));
        return ($val === '1' || $val === 'true' || $val === 'on');
    }
}

