<?php
// backend/api/telegram-webhook.php
// Telegram Bot Webhook endpoint to capture user /start commands & link chat_id

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/telegram.php';

$content = file_get_contents('php://input');
$update = json_decode($content, true);

if (!$update || !isset($update['message'])) {
    jsonResponse(1, 'Webhook alive');
}

$message  = $update['message'];
$chatId   = $message['chat']['id'];
$username = $message['from']['username'] ?? '';
$firstName= $message['from']['first_name'] ?? 'Customer';
$text     = trim($message['text'] ?? '');

$pdo = getDB();

// Handle /start or /start <phone>
if (strpos($text, '/start') === 0) {
    $parts = explode(' ', $text, 2);
    $param = trim($parts[1] ?? '');

    if (!empty($param)) {
        // Parameter passed, e.g., phone number or order number
        $phone = $param;

        // Find or link user by phone
        $stmt = $pdo->prepare("SELECT id, name, phone FROM users WHERE phone = ?");
        $stmt->execute([$phone]);
        $user = $stmt->fetch();

        if ($user) {
            $updateStmt = $pdo->prepare("UPDATE users SET telegram_chat_id = ?, telegram_username = ? WHERE id = ?");
            $updateStmt->execute([$chatId, $username, $user['id']]);

            // Update any recent orders with this phone to link telegram_chat_id
            $orderStmt = $pdo->prepare("UPDATE orders SET telegram_chat_id = ? WHERE customer_phone = ?");
            $orderStmt->execute([$chatId, $phone]);

            $reply = "✅ <b>Account Linked Successfully!</b>\n\nWelcome back, <b>" . htmlspecialchars($user['name']) . "</b>!\nYour Telegram account is now connected. You will receive live updates here for your orders! 🍽️";
        } else {
            // Create user
            $insertStmt = $pdo->prepare("INSERT INTO users (name, phone, role, password, telegram_chat_id, telegram_username) VALUES (?, ?, 'customer', 'nopassword', ?, ?)");
            $insertStmt->execute([$firstName, $phone, $chatId, $username]);

            // Update any pending orders with this phone
            $orderStmt = $pdo->prepare("UPDATE orders SET telegram_chat_id = ? WHERE customer_phone = ?");
            $orderStmt->execute([$chatId, $phone]);

            $reply = "🎉 <b>Welcome to Online Ordering!</b>\n\nYour phone (<code>{$phone}</code>) is linked to Telegram! You will receive order notifications right here.";
        }
    } else {
        $reply = "👋 <b>Hello {$firstName}!</b>\n\nWelcome to our Restaurant Ordering Bot.\n\nTo link your account, use link from website or send your phone number like:\n<code>/start 012345678</code>";
    }

    sendTelegramMessage($chatId, $reply);
}

jsonResponse(1, 'OK');
