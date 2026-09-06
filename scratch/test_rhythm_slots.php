<?php
// Scratch script to test reports API rhythm data for 7days and month
require_once __DIR__ . '/../backend/config/db.php';
$pdo = getDB();

// 1. Test 7days
$dateCondition7 = "DATE(o.created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY) AND DATE(o.created_at) <= CURRENT_DATE()";
$rhythmSlots7 = [];
for ($i = 6; $i >= 0; $i--) {
    $dateKey   = date('Y-m-d', strtotime("-{$i} days"));
    $timeLabel = date('M d', strtotime("-{$i} days"));
    $rhythmSlots7[$dateKey] = ['time' => $timeLabel, 'orders' => 0, 'revenue' => 0.00];
}

$sql7 = "SELECT 
            DATE(o.created_at) as date_key,
            DATE_FORMAT(o.created_at, '%b %d') as time_slot,
            COUNT(o.id) as orders,
            COALESCE(SUM(o.total_amount), 0.00) as revenue
          FROM orders o
          WHERE {$dateCondition7} AND o.payment_status IN ('paid', 'verified')
          GROUP BY DATE(o.created_at), time_slot
          ORDER BY DATE(o.created_at) ASC";

$rows7 = $pdo->query($sql7)->fetchAll();
foreach ($rows7 as $row) {
    $dKey = $row['date_key'];
    if (isset($rhythmSlots7[$dKey])) {
        $rhythmSlots7[$dKey]['orders'] = (int)$row['orders'];
        $rhythmSlots7[$dKey]['revenue'] = (float)$row['revenue'];
    }
}

echo "=== 7 DAYS RHYTHM DATA (7 Slots) ===\n";
print_r(array_values($rhythmSlots7));

// 2. Test month
$startOfMonth = date('Y-m-01');
$daysInMonth  = (int)date('t');
$rhythmSlotsM = [];
for ($d = 1; $d <= $daysInMonth; $d++) {
    $dateKey   = date('Y-m-') . sprintf('%02d', $d);
    $timeLabel = date('M d', strtotime($dateKey));
    $rhythmSlotsM[$dateKey] = ['time' => $timeLabel, 'orders' => 0, 'revenue' => 0.00];
}

echo "\n=== MONTH RHYTHM DATA (First 5 and Count) ===\n";
echo "Total Days in Month: " . count($rhythmSlotsM) . "\n";
print_r(array_slice(array_values($rhythmSlotsM), 0, 5));
