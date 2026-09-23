<?php
// backend/telegram-poll.php
// Local Long-Polling Script for Telegram Bot (No Ngrok or Webhook required for local testing!)
// Run via CLI: php telegram-poll.php

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/lib/telegram.php';

require_once __DIR__ . '/services/TelegramService.php';

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
$pdo = null;
$telegramService = null;

while (true) {
    // Attempt DB connection gracefully if not connected
    if (!$pdo) {
        try {
            $host = env('DB_HOST', '127.0.0.1');
            $port = env('DB_PORT', '3306');
            $db   = env('DB_NAME', 'restaurant_db');
            $user = env('DB_USER', 'root');
            $pass = env('DB_PASS', '');
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $pdo = new PDO($dsn, $user, $pass, $options);
            $telegramService = new TelegramService($pdo);
            echo "✅ Connected to Database successfully!\n\n";
        } catch (\Throwable $e) {
            echo "⏳ Database connection waiting... Retrying in 5s (" . $e->getMessage() . ")\n";
            sleep(5);
            continue;
        }
    }
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
                        $userTag = !empty($username) ? "@{$username}" : "No username";
                        $timestamp = date('Y-m-d H:i:s');
                        echo "\n======================================================\n";
                        echo "🚀 [/start BOT EVENT DETECTED]\n";
                        echo "👤 User: {$firstName} ({$userTag})\n";
                        echo "🆔 CHAT ID: {$chatId}\n";
                        echo "💬 Text: {$text}\n";
                        echo "⏰ Time: {$timestamp}\n";
                        echo "======================================================\n";

                        $reply = $telegramService->handleStartCommand($chatId, $username, $firstName, $text);
                        echo "  ✅ Processed /start | Chat ID: {$chatId} | Broadcasted to Group & Customer\n\n";
                    }
                }
            }
        }
    }

    sleep(1);
}
