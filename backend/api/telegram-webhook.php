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

// Handle /start or /start <phone_or_email>
if (strpos($text, '/start') === 0) {
    // 1. Broadcast Chat ID to Telegram Group
    $displayUsername = !empty($username) ? "@" . htmlspecialchars($username) : "None";
    $displayName = htmlspecialchars($firstName);
    $safeText = htmlspecialchars($text);
    $currentTime = date('Y-m-d H:i:s');

    $groupMsg  = "📢 <b>TELEGRAM BOT /START EVENT</b>\n";
    $groupMsg .= "━━━━━━━━━━━━━━━━━━━━\n";
    $groupMsg .= "👤 <b>User:</b> {$displayName} ({$displayUsername})\n";
    $groupMsg .= "🆔 <b>Chat ID:</b> <code>{$chatId}</code>\n";
    $groupMsg .= "💬 <b>Command:</b> <code>{$safeText}</code>\n";
    $groupMsg .= "📅 <b>Time:</b> {$currentTime}\n";
    $groupMsg .= "━━━━━━━━━━━━━━━━━━━━";

    notifyTelegramGroup($groupMsg);
    error_log("🚀 [/start BOT EVENT] User: {$firstName} | Chat ID: {$chatId} | Text: {$text}");

    $param = trim(preg_replace('/^\/start[=\s]*/i', '', $text));

    if (!empty($param)) {
        $identifier = trim(urldecode($param));

        // Find or link user by phone, email or name
        $stmt = $pdo->prepare("SELECT id, name, phone, email FROM users WHERE phone = ? OR email = ? OR name = ?");
        $stmt->execute([$identifier, $identifier, $identifier]);
        $user = $stmt->fetch();

        if ($user) {
            $updateStmt = $pdo->prepare("UPDATE users SET telegram_chat_id = ?, telegram_username = ? WHERE id = ?");
            $updateStmt->execute([(string)$chatId, $username, $user['id']]);

            // Update any recent orders with this phone or user_id to link telegram_chat_id
            $orderStmt = $pdo->prepare("UPDATE orders SET telegram_chat_id = ? WHERE customer_phone = ? OR user_id = ?");
            $orderStmt->execute([(string)$chatId, $user['phone'], $user['id']]);

            $userName = htmlspecialchars($user['name']);
            $reply = "🎉 <b>Welcome to Amber Bistro, {$userName}!</b>\n\n✅ <b>Account Linked Successfully!</b>\n🆔 <b>Your Chat ID:</b> <code>{$chatId}</code>\n\nYour account (<code>{$identifier}</code>) is connected to Telegram. You will receive live status updates for all your orders! 🍽️📦";
        } else {
            // Create user
            $isEmail = strpos($identifier, '@') !== false;
            $phoneVal = $isEmail ? ('+855' . rand(10000000, 99999999)) : $identifier;
            $emailVal = $isEmail ? $identifier : null;

            $insertStmt = $pdo->prepare("INSERT INTO users (name, phone, email, role, password, telegram_chat_id, telegram_username, status) VALUES (?, ?, ?, 'customer', 'nopassword', ?, ?, 'active')");
            $insertStmt->execute([$firstName, $phoneVal, $emailVal, (string)$chatId, $username]);

            $reply = "🎉 <b>Welcome to Amber Bistro, " . htmlspecialchars($firstName) . "!</b>\n\n✅ <b>Telegram Connected!</b>\n🆔 <b>Your Chat ID:</b> <code>{$chatId}</code>\n\nYour account (<code>{$identifier}</code>) is linked to Telegram! You will receive order notifications right here.";
        }
    } else {
        $reply = "👋 <b>Hello " . htmlspecialchars($firstName) . "!</b>\n\nWelcome to <b>Amber Bistro Bot</b>.\n🆔 <b>Your Chat ID:</b> <code>{$chatId}</code>\n\nTo link your account, use link from website or send:\n<code>/start YOUR_PHONE_OR_EMAIL</code>";
    }

    sendTelegramMessage($chatId, $reply);
}

jsonResponse(1, 'OK');
