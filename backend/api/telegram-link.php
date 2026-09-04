<?php
// backend/api/telegram-link.php
// Endpoint to link a user/customer account with Telegram Bot

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/telegram.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $phone = trim($input['phone'] ?? '');
    $telegramChatId = trim($input['telegram_chat_id'] ?? '');
    $telegramUsername = trim($input['telegram_username'] ?? '');

    if (empty($phone)) {
        jsonResponse(0, 'Phone number is required to link Telegram account', null, 400);
    }

    try {
        // Find user by phone
        $stmt = $pdo->prepare("SELECT id, name, phone, telegram_chat_id FROM users WHERE phone = ?");
        $stmt->execute([$phone]);
        $user = $stmt->fetch();

        if ($user) {
            if (!empty($telegramChatId)) {
                $updateStmt = $pdo->prepare("UPDATE users SET telegram_chat_id = ?, telegram_username = ? WHERE id = ?");
                $updateStmt->execute([$telegramChatId, $telegramUsername, $user['id']]);
            }

            $botUsername = env('TELEGRAM_BOT_USERNAME', 'YourRestaurantBot');
            $botLink = "https://t.me/{$botUsername}?start=" . urlencode($phone);

            jsonResponse(1, 'Telegram account link status retrieved', [
                'user_id'          => (int)$user['id'],
                'name'             => $user['name'],
                'phone'            => $user['phone'],
                'telegram_chat_id' => $user['telegram_chat_id'] ?: $telegramChatId,
                'is_linked'        => !empty($user['telegram_chat_id'] || $telegramChatId),
                'bot_username'     => $botUsername,
                'telegram_bot_link'=> $botLink
            ]);
        } else {
            // Create customer user record if not existing
            if (!empty($telegramChatId)) {
                $insertStmt = $pdo->prepare("INSERT INTO users (name, phone, role, password, telegram_chat_id, telegram_username) VALUES (?, ?, 'customer', 'nopassword', ?, ?)");
                $insertStmt->execute([$phone, $phone, $telegramChatId, $telegramUsername]);
                $userId = (int)$pdo->lastInsertId();
            }

            $botUsername = env('TELEGRAM_BOT_USERNAME', 'YourRestaurantBot');
            $botLink = "https://t.me/{$botUsername}?start=" . urlencode($phone);

            jsonResponse(1, 'Telegram link created', [
                'phone'            => $phone,
                'telegram_chat_id' => $telegramChatId,
                'is_linked'        => !empty($telegramChatId),
                'bot_username'     => $botUsername,
                'telegram_bot_link'=> $botLink
            ]);
        }
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to link Telegram: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'GET') {
    // Generate Bot Link for a given phone
    $phone = trim($_GET['phone'] ?? '');
    $botUsername = env('TELEGRAM_BOT_USERNAME', 'YourRestaurantBot');
    $botLink = !empty($phone) ? "https://t.me/{$botUsername}?start=" . urlencode($phone) : "https://t.me/{$botUsername}";

    jsonResponse(1, 'Telegram Bot Link info', [
        'bot_username'      => $botUsername,
        'telegram_bot_link' => $botLink
    ]);
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
