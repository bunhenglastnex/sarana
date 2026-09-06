<?php
// Scratch script to test process_refund action on orders.php
$_SERVER['REQUEST_METHOD'] = 'POST';

require_once __DIR__ . '/../backend/config/db.php';
$pdo = getDB();

$orderNumber = '#1019';
$action = 'process_refund';
$proofUrl = 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop';
$reason = 'Customer requested refund via ABA Pay';

$cleanOrderNum = '#' . ltrim($orderNumber, '#');
$stmt = $pdo->prepare("SELECT id, order_number, status, payment_status FROM orders WHERE order_number = ? OR id = ? OR order_number = ?");
$stmt->execute([$orderNumber, $orderNumber, $cleanOrderNum]);
$order = $stmt->fetch();

if ($order) {
    $dbId = (int)$order['id'];
    $upSql = "UPDATE orders SET payment_status = 'refunded', status = 'cancelled', payment_proof_url = ?, notes = ? WHERE id = ?";
    $upStmt = $pdo->prepare($upSql);
    $upStmt->execute([$proofUrl, $reason, $dbId]);

    echo "✅ Refund processed successfully for Order {$order['order_number']}\n";
    
    // Query updated row
    $verifyStmt = $pdo->prepare("SELECT order_number, status, payment_status, payment_proof_url, notes FROM orders WHERE id = ?");
    $verifyStmt->execute([$dbId]);
    print_r($verifyStmt->fetch());
} else {
    echo "❌ Order not found\n";
}
