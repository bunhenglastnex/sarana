<?php
// backend/lib/telegram.php
// Telegram Bot Notification Service Module

require_once __DIR__ . '/../config/env.php';

/**
 * Sends a message using Telegram Bot API.
 * @param string|int $chatId
 * @param string $text
 * @param string $parseMode ('HTML' or 'MarkdownV2')
 * @return array
 */
function sendTelegramMessage($chatId, string $text, string $parseMode = 'HTML', ?string $overrideBotToken = null): array {
    $botToken = !empty($overrideBotToken) ? $overrideBotToken : env('TELEGRAM_BOT_TOKEN');

    if (empty($botToken) || empty($chatId)) {
        return [
            'success' => false,
            'message' => 'Telegram Bot Token or Chat ID is missing.'
        ];
    }

    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    $data = [
        'chat_id'                  => $chatId,
        'text'                     => $text,
        'parse_mode'               => $parseMode,
        'disable_web_page_preview' => true
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($data),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_TIMEOUT        => 10,
    ]);

    $result = curl_exec($ch);
    $error  = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return ['success' => false, 'message' => "cURL Error: $error"];
    }

    $response = json_decode($result, true);
    return [
        'success' => $response['ok'] ?? false,
        'data'    => $response
    ];
}

/**
 * Sends a notification to the configured Admin & Delivery Telegram Group.
 * @param string $text
 * @return array
 */
function notifyTelegramGroup(string $text): array {
    $groupChatId = env('TELEGRAM_GROUP_CHAT_ID');
    if (empty($groupChatId)) {
        return ['success' => false, 'message' => 'TELEGRAM_GROUP_CHAT_ID not configured in .env'];
    }
    return sendTelegramMessage($groupChatId, $text, 'HTML');
}

/**
 * Sends a notification to a specific customer's Telegram chat_id.
 * @param string|int $chatId
 * @param string $text
 * @return array
 */
function notifyCustomerTelegram($chatId, string $text): array {
    if (empty($chatId)) {
        return ['success' => false, 'message' => 'Customer has no linked Telegram chat ID.'];
    }
    return sendTelegramMessage($chatId, $text, 'HTML');
}

/**
 * Formats a rich HTML message for New Order alerts (Sent to Admin & Delivery Group).
 * @param array $order
 * @param array $items
 * @return string
 */
function formatNewOrderGroupMessage(array $order, array $items): string {
    $fulfillmentIcon = ($order['fulfillment_type'] === 'delivery') ? '🛵 <b>DELIVERY</b>' : '🛍️ <b>PICKUP</b>';
    $paymentMethod = ($order['payment_method'] === 'cash_on_delivery') ? 'Cash on Delivery (COD)' : 'Cash at Counter';
    $formattedTotal = number_format((float)$order['total_amount'], 2);

    $msg  = "🔔 <b>NEW ORDER RECEIVED!</b>\n";
    $msg .= "━━━━━━━━━━━━━━━━━━━━\n";
    $msg .= "🆔 <b>Order #:</b> <code>{$order['order_number']}</code>\n";
    $msg .= "👤 <b>Customer:</b> " . htmlspecialchars($order['customer_name']) . "\n";
    $msg .= "📞 <b>Phone:</b> <code>" . htmlspecialchars($order['customer_phone']) . "</code>\n";
    $msg .= "📦 <b>Fulfillment:</b> {$fulfillmentIcon}\n";

    if ($order['fulfillment_type'] === 'delivery' && !empty($order['delivery_address'])) {
        $msg .= "📍 <b>Address:</b> " . htmlspecialchars($order['delivery_address']) . "\n";
        $msg .= "💵 <b>Delivery Fee:</b> $" . number_format((float)$order['delivery_fee'], 2) . "\n";
    }

    $msg .= "\n📋 <b>ORDER ITEMS:</b>\n";
    foreach ($items as $item) {
        $itemName = htmlspecialchars($item['food_name']);
        $qty = (int)$item['quantity'];
        $subtotal = number_format((float)$item['subtotal'], 2);
        $msg .= "  • {$qty}x {$itemName} — <b>\${$subtotal}</b>\n";
    }

    $msg .= "\n💰 <b>TOTAL AMOUNT:</b> <b>\${$formattedTotal}</b>\n";
    $msg .= "💳 <b>Payment:</b> {$paymentMethod}\n";

    if (!empty($order['notes'])) {
        $msg .= "📝 <b>Notes:</b> " . htmlspecialchars($order['notes']) . "\n";
    }

    $msg .= "━━━━━━━━━━━━━━━━━━━━\n";
    $msg .= "⏳ <i>Status: Pending Admin Confirmation</i>";

    return $msg;
}

/**
 * Formats a rich HTML status update message for Customer & Group notifications.
 * @param array $order
 * @param string $newStatus
 * @param string $extraInfo
 * @return string
 */
function formatOrderStatusUpdateMessage(array $order, string $newStatus, string $extraInfo = ''): string {
    $statusText = '';
    $statusIcon = 'ℹ️';

    switch ($newStatus) {
        case 'accepted':
            $statusIcon = '✅';
            $statusText = '<b>Accepted</b> — The restaurant has confirmed your order.';
            break;
        case 'preparing':
            $statusIcon = '🍳';
            $statusText = '<b>Preparing</b> — Your food is currently being cooked in the kitchen!';
            break;
        case 'ready_for_pickup':
            $statusIcon = '🛍️';
            $statusText = '<b>Ready for Pickup</b> — Your order is fresh & ready for pickup at our counter!';
            break;
        case 'ready_for_delivery':
            $statusIcon = '📦';
            $statusText = '<b>Ready for Delivery</b> — Waiting for a rider to pick up.';
            break;
        case 'on_the_way':
            $statusIcon = '🛵';
            $statusText = '<b>On the Way!</b> — Delivery rider is on the way with your food.';
            break;
        case 'completed':
            $statusIcon = '🎉';
            $statusText = '<b>Completed</b> — Order has been delivered/picked up. Thank you!';
            break;
        case 'cancelled':
            $statusIcon = '❌';
            $statusText = '<b>Cancelled</b> — Your order has been cancelled.';
            break;
        default:
            $statusText = "<b>" . ucfirst($newStatus) . "</b>";
            break;
    }

    $msg  = "{$statusIcon} <b>ORDER STATUS UPDATE</b>\n";
    $msg .= "━━━━━━━━━━━━━━━━━━━━\n";
    $msg .= "🆔 <b>Order #:</b> <code>{$order['order_number']}</code>\n";
    $msg .= "📊 <b>Status:</b> {$statusText}\n";

    if (!empty($extraInfo)) {
        $msg .= "ℹ️ <i>{$extraInfo}</i>\n";
    }

    $msg .= "━━━━━━━━━━━━━━━━━━━━";

    return $msg;
}
