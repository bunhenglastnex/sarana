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

                    // Handle /start command
                    if (strpos($text, '/start') === 0) {
                        $parts = explode(' ', $text, 2);
                        $param = trim($parts[1] ?? '');

                        if (!empty($param)) {
                            $phone = $param;

                            $stmt = $pdo->prepare("SELECT id, name, phone FROM users WHERE phone = ?");
                            $stmt->execute([$phone]);
                            $user = $stmt->fetch();

                            if ($user) {
                                $updateStmt = $pdo->prepare("UPDATE users SET telegram_chat_id = ?, telegram_username = ? WHERE id = ?");
                                $updateStmt->execute([$chatId, $username, $user['id']]);

                                $orderStmt = $pdo->prepare("UPDATE orders SET telegram_chat_id = ? WHERE customer_phone = ?");
                                $orderStmt->execute([$chatId, $phone]);

                                $reply = "✅ <b>Account Linked Successfully!</b>\n\nWelcome, <b>" . htmlspecialchars($user['name']) . "</b>!\nYour Telegram account is connected to <code>{$phone}</code>.";
                            } else {
                                $insertStmt = $pdo->prepare("INSERT INTO users (name, phone, role, password, telegram_chat_id, telegram_username) VALUES (?, ?, 'customer', 'nopassword', ?, ?)");
                                $insertStmt->execute([$firstName, $phone, $chatId, $username]);

                                $orderStmt = $pdo->prepare("UPDATE orders SET telegram_chat_id = ? WHERE customer_phone = ?");
                                $orderStmt->execute([$chatId, $phone]);

                                $reply = "🎉 <b>Welcome!</b>\n\nYour phone (<code>{$phone}</code>) is now linked to Telegram!";
                            }
                        } else {
                            $reply = "👋 <b>Hello {$firstName}!</b>\n\nTo link your account, use link from website or send:\n<code>/start YOUR_PHONE</code>";
                        }

                        sendTelegramMessage($chatId, $reply);
                        echo "  ➡️ Replied to {$firstName}\n";
                    }
                }
            }
        }
    }

    sleep(1);
}
