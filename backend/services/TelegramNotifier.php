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
    public function sendRaw($chatId, string $text, ?string $botToken = null): array {
        if (empty($botToken)) {
            $botToken = $this->getSetting('telegram_bot_token', env('TELEGRAM_BOT_TOKEN'));
        }
        return sendTelegramMessage($chatId, $text, 'HTML', $botToken);
    }

    /**
     * Send notification to Main Admin Order Group Chat
     */
    public function notifyAdminGroup(string $text): array {
        $chatId = $this->getSetting('telegram_group_id', env('TELEGRAM_GROUP_CHAT_ID'));
        if (empty($chatId)) {
            return ['success' => false, 'message' => 'Admin Group Chat ID not configured.'];
        }
        return $this->sendRaw($chatId, $text);
    }

    /**
     * Send notification to Kitchen Prep Group Chat (falls back to Admin group)
     */
    public function notifyKitchenGroup(string $text): array {
        $chatId = $this->getSetting('telegram_kitchen_group_id', $this->getSetting('telegram_group_id', env('TELEGRAM_GROUP_CHAT_ID')));
        if (empty($chatId)) {
            return ['success' => false, 'message' => 'Kitchen Group Chat ID not configured.'];
        }
        return $this->sendRaw($chatId, $text);
    }

    /**
     * Send notification to Delivery Driver Dispatch Group Chat (falls back to Admin group)
     */
    public function notifyDriverGroup(string $text): array {
        $chatId = $this->getSetting('telegram_driver_group_id', $this->getSetting('telegram_group_id', env('TELEGRAM_GROUP_CHAT_ID')));
        if (empty($chatId)) {
            return ['success' => false, 'message' => 'Driver Group Chat ID not configured.'];
        }
        return $this->sendRaw($chatId, $text);
    }

    /**
     * Send direct private message to a specific User/Customer by User ID
     */
    public function notifyUser(int $userId, string $text): array {
        $stmt = $this->pdo->prepare("SELECT telegram_chat_id FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $chatId = $stmt->fetchColumn();

        if (empty($chatId)) {
            return ['success' => false, 'message' => "User #{$userId} has not linked their Telegram account."];
        }
        return $this->sendRaw($chatId, $text);
    }

    /**
     * Event Trigger 1: New Order Placed (Notifies Admin & Kitchen Group + Customer)
     */
    public function sendNewOrderBroadcast(array $order, array $items): array {
        $results = [];

        // Check toggle settings
        if ($this->isToggleEnabled('telegram_notify_new_order')) {
            $msg = formatNewOrderGroupMessage($order, $items);
            $results['admin'] = $this->notifyAdminGroup($msg);
        }

        // Notify customer directly if linked
        if (!empty($order['telegram_chat_id'])) {
            $custMsg = "🛍️ <b>Order Received!</b>\nYour order <b>#{$order['order_number']}</b> has been placed successfully. Total: <b>\${$order['total_amount']}</b>.";
            $results['customer'] = $this->sendRaw($order['telegram_chat_id'], $custMsg);
        }

        return $results;
    }

    /**
     * Event Trigger 2: Order Status Changed (Notifies Customer + Relevant Groups)
     */
    public function sendStatusUpdateBroadcast(array $order, string $newStatus, string $note = ''): array {
        $results = [];
        $msg = formatOrderStatusUpdateMessage($order, $newStatus, $note);

        // 1. Notify Customer directly if chat ID exists
        if (!empty($order['telegram_chat_id'])) {
            $results['customer'] = $this->sendRaw($order['telegram_chat_id'], $msg);
        }

        // 2. Dispatch to specific role groups based on status transition
        switch ($newStatus) {
            case 'preparing':
                if ($this->isToggleEnabled('telegram_notify_kitchen_ready')) {
                    $results['kitchen'] = $this->notifyKitchenGroup("🍳 <b>KITCHEN ALERT:</b> Order <b>#{$order['order_number']}</b> is now PREPARING!");
                }
                break;

            case 'ready_for_delivery':
            case 'on_the_way':
                if ($this->isToggleEnabled('telegram_notify_driver_assigned')) {
                    $results['driver'] = $this->notifyDriverGroup("🛵 <b>DRIVER DISPATCH:</b> Order <b>#{$order['order_number']}</b> is READY FOR DELIVERY!");
                }
                break;

            case 'cancelled':
                if ($this->isToggleEnabled('telegram_notify_cancelled')) {
                    $results['admin'] = $this->notifyAdminGroup("❌ <b>ORDER CANCELLED:</b> Order <b>#{$order['order_number']}</b> has been cancelled. Note: {$note}");
                }
                break;
        }

        return $results;
    }

    /**
     * Helper to read dynamic setting from DB with fallback
     */
    public function getSetting(string $key, ?string $default = null): ?string {
        try {
            $stmt = $this->pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
            $stmt->execute([$key]);
            $val = $stmt->fetchColumn();
            return ($val !== false && $val !== null && $val !== '') ? $val : $default;
        } catch (\Throwable $e) {
            return $default;
        }
    }

    /**
     * Helper to check boolean feature toggle from DB settings
     */
    public function isToggleEnabled(string $key): bool {
        $val = strtolower((string)$this->getSetting($key, 'true'));
        return ($val === '1' || $val === 'true' || $val === 'on');
    }
}
