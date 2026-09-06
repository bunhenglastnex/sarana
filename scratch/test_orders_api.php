<?php
// Scratch script to test orders API filtering and response payload
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['status'] = 'all';

require_once __DIR__ . '/../backend/config/db.php';
$pdo = getDB();

$sql = "SELECT o.*, u.name as delivery_staff_name, c.customer_tag 
        FROM orders o 
        LEFT JOIN users u ON o.delivery_staff_id = u.id 
        LEFT JOIN users c ON o.user_id = c.id 
        ORDER BY o.created_at DESC, o.id DESC";

$rawOrders = $pdo->query($sql)->fetchAll();
echo "Total Orders in DB: " . count($rawOrders) . "\n\n";

foreach ($rawOrders as $o) {
    echo "Order #{$o['order_number']} | Customer: {$o['customer_name']} | Status: {$o['status']} | Type: {$o['fulfillment_type']} | Amount: \${$o['total_amount']}\n";
}
