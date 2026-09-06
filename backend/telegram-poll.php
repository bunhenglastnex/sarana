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
$pdo = getDB();
$telegramService = new TelegramService($pdo);

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
                        $reply = $telegramService->handleStartCommand($chatId, $username, $firstName, $text);
                        echo "  ➡️ Processed /start & Replied to {$firstName} (Chat ID: {$chatId})\n";
                    }
                }
            }
        }
    }

    sleep(1);
}
