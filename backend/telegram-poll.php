<?php
// backend/telegram-poll.php
// Local Long-Polling Script for Telegram Bot (No Ngrok or Webhook required for local testing!)
// Run via CLI: php telegram-poll.php

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/lib/telegram.php';

$botToken = env('TELEGRAM_BOT_TOKEN');

if (empty($botToken)) {
    echo "❌ Error: TELEGRAM_BOT_TOKEN is missing in .env!\n";
    exit(1);
}

echo "===========================================\n";
echo "🤖 Telegram Bot Local Long-Polling Service\n";
echo "===========================================\n";
echo "Press Ctrl+C to stop.\n\n";

$offset = 0;
$pdo = getDB();

while (true) {
    $url = "https://api.telegram.org/bot{$botToken}/getUpdates?offset={$offset}&timeout=10";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT        => 15,
    ]);

    $responseRaw = curl_exec($ch);
    curl_close($ch);

    if ($responseRaw) {
        $response = json_decode($responseRaw, true);

        if (!empty($response['ok']) && !empty($response['result'])) {
            foreach ($response['result'] as $update) {
                $offset = $update['update_id'] + 1;

                if (isset($update['message'])) {
                    $message   = $update['message'];
                    $chatId    = $message['chat']['id'];
                    $username  = $message['from']['username'] ?? '';
                    $firstName = $message['from']['first_name'] ?? 'Customer';
                    $text      = trim($message['text'] ?? '');

                    echo "📩 [Incoming Message] From: {$firstName} (Chat ID: {$chatId}): {$text}\n";

                    // Handle /start command (supports /start <param> or /start=<param>)
                    if (strpos($text, '/start') === 0) {
                        $param = trim(preg_replace('/^\/start[=\s]*/i', '', $text));

                        if (!empty($param)) {
                            $rawParam = trim(urldecode($param));
                            $user = false;

                            // 1. Check if parameter is usr_ID (e.g. usr_4 or usr4)
                            if (preg_match('/^usr_?(\d+)$/i', $rawParam, $matches)) {
                                $targetUserId = (int)$matches[1];
                                $stmt = $pdo->prepare("SELECT id, name, phone, email FROM users WHERE id = ?");
                                $stmt->execute([$targetUserId]);
                                $user = $stmt->fetch();
                            }

                            // 2. Fallback search by phone, email, or name
                            if (!$user) {
                                $identifier = str_replace(['_at_', '_dot_'], ['@', '.'], $rawParam);
                                $stmt = $pdo->prepare("SELECT id, name, phone, email FROM users WHERE phone = ? OR email = ? OR name = ? OR id = ?");
                                $stmt->execute([$identifier, $identifier, $identifier, $rawParam]);
                                $user = $stmt->fetch();
                            }

                            if ($user) {
                                $updateStmt = $pdo->prepare("UPDATE users SET telegram_chat_id = ?, telegram_username = ? WHERE id = ?");
                                $updateStmt->execute([$chatId, $username, $user['id']]);

                                // Link recent orders with this user's phone or email
                                $orderStmt = $pdo->prepare("UPDATE orders SET telegram_chat_id = ? WHERE customer_phone = ? OR user_id = ?");
                                $orderStmt->execute([$chatId, $user['phone'], $user['id']]);

                                $userName = htmlspecialchars($user['name']);
                                $reply = "🎉 <b>Welcome to Amber Bistro, {$userName}!</b>\n\n✅ <b>Account Linked Successfully!</b>\nYour account is now connected. You will receive real-time updates for your food orders right here! 🍽️📦";
                            } else {
                                // Create new customer account if not found
                                $insertStmt = $pdo->prepare("INSERT INTO users (name, phone, role, password, telegram_chat_id, telegram_username, status) VALUES (?, ?, ?, 'customer', 'nopassword', ?, ?, 'active')");
                                $insertStmt->execute([$firstName, '+855' . rand(10000000, 99999999), $chatId, $username]);

                                $reply = "🎉 <b>Welcome, " . htmlspecialchars($firstName) . "!</b>\n\n✅ <b>Telegram Connected!</b>\nYour Telegram account is linked & ready for order notifications!";
                            }
                        } else {
                            $reply = "👋 <b>Hello " . htmlspecialchars($firstName) . "!</b>\n\nWelcome to <b>Amber Bistro Bot</b>.\nTo link your account, click the link from your profile on our website!";
                        }

                        sendTelegramMessage($chatId, $reply);
                        echo "  ➡️ Linked User & Replied to {$firstName} (Chat ID: {$chatId})\n";
                    }
                }
            }
        }
    }

    sleep(1);
}
