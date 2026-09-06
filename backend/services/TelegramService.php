<?php
// backend/services/TelegramService.php
// Service layer for Telegram Bot operations and notifications

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/telegram.php';

class TelegramService {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Process incoming /start command from Telegram bot
     */
    public function handleStartCommand(int $chatId, string $username, string $firstName, string $text): string {
        $param = trim(preg_replace('/^\/start[=\s]*/i', '', $text));

        if (!empty($param)) {
            $rawParam = trim(urldecode($param));
            $user = false;

            // 1. Check if parameter is usr_ID (e.g. usr_4 or usr4)
            if (preg_match('/^usr_?(\d+)$/i', $rawParam, $matches)) {
                $targetUserId = (int)$matches[1];
                $stmt = $this->pdo->prepare("SELECT id, name, phone, email FROM users WHERE id = ?");
                $stmt->execute([$targetUserId]);
                $user = $stmt->fetch();
            }

            // 2. Fallback search by phone, email, or name
            if (!$user) {
                $identifier = str_replace(['_at_', '_dot_'], ['@', '.'], $rawParam);
                $stmt = $this->pdo->prepare("SELECT id, name, phone, email FROM users WHERE phone = ? OR email = ? OR name = ? OR id = ?");
                $stmt->execute([$identifier, $identifier, $identifier, $rawParam]);
                $user = $stmt->fetch();
            }

            if ($user) {
                $updateStmt = $this->pdo->prepare("UPDATE users SET telegram_chat_id = ?, telegram_username = ? WHERE id = ?");
                $updateStmt->execute([$chatId, $username, $user['id']]);

                // Link recent orders with this user's phone or email
                $orderStmt = $this->pdo->prepare("UPDATE orders SET telegram_chat_id = ? WHERE customer_phone = ? OR user_id = ?");
                $orderStmt->execute([$chatId, $user['phone'], $user['id']]);

                $userName = htmlspecialchars($user['name']);
                $reply = "🎉 <b>Welcome to Amber Bistro, {$userName}!</b>\n\n✅ <b>Account Linked Successfully!</b>\nYour account is now connected. You will receive real-time updates for your food orders right here! 🍽️📦";
            } else {
                $reply = "🎉 <b>Welcome, " . htmlspecialchars($firstName) . "!</b>\n\n✅ <b>Telegram Connected!</b>\nYour Telegram account is linked & ready for order notifications!";
            }
        } else {
            $reply = "👋 <b>Hello " . htmlspecialchars($firstName) . "!</b>\n\nWelcome to <b>Amber Bistro Bot</b>.\nTo link your account, click the link from your profile on our website!";
        }

        sendTelegramMessage($chatId, $reply);
        return $reply;
    }

    /**
     * Send order notification to linked Telegram chat
     */
    public function notifyOrderStatus(string $chatId, string $orderCode, string $statusText): bool {
        $message = "📦 <b>Order Status Update</b>\n\nOrder <b>#{$orderCode}</b> is now: <b>{$statusText}</b>\nThank you for ordering with Amber Bistro!";
        return sendTelegramMessage($chatId, $message);
    }
}
