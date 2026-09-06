<?php
// backend/api/payments.php
// Payments & Financial Audit API Endpoint

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

// Require Admin Role Authentication
$adminUser = AuthMiddleware::authenticate($pdo, ['admin']);

if ($method === 'GET') {
    try {
        $filter = $_GET['filter'] ?? 'all';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $datePreset = $_GET['date_preset'] ?? 'all';
        $dateFrom = $_GET['date_from'] ?? null;
        $dateTo = $_GET['date_to'] ?? null;

        // Fetch all order records with payment information
        $sql = "SELECT id, order_number, customer_name, customer_phone, fulfillment_type, 
                       total_amount, amount_khr, payment_method, payment_status, 
                       payment_proof_url, payment_txn_ref, status, created_at 
                FROM orders 
                ORDER BY id DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $allRows = $stmt->fetchAll();

        // Helper to format dateLabel and dateIso
        $todayDate = date('Y-m-d');
        $yesterdayDate = date('Y-m-d', strtotime('-1 day'));

        $mappedRecords = [];
        foreach ($allRows as $row) {
            $createdTs = strtotime($row['created_at']);
            $dateIso = date('Y-m-d', $createdTs);
            $timeStr = date('H:i:s', $createdTs);
            $shortTimeStr = date('H:i', $createdTs);

            if ($dateIso === $todayDate) {
                $dateLabel = "Today, {$shortTimeStr}";
            } elseif ($dateIso === $yesterdayDate) {
                $dateLabel = "Yesterday";
            } else {
                $dateLabel = date('M d, Y', $createdTs);
            }

            // Map method
            $rawMethod = strtolower($row['payment_method']);
            if (in_array($rawMethod, ['khqr'])) {
                $methodType = 'khqr';
            } elseif (in_array($rawMethod, ['cod', 'cash_on_delivery'])) {
                $methodType = 'cod';
            } elseif (in_array($rawMethod, ['counter_cash', 'cash_at_counter'])) {
                $methodType = 'counter_cash';
            } else {
                $methodType = 'card';
            }

            // Map Gateway name
            $txnRef = !empty($row['payment_txn_ref']) ? $row['payment_txn_ref'] : ('TXN-REF-' . $row['id']);
            if ($methodType === 'khqr') {
                if (str_contains(strtoupper($txnRef), 'WING')) {
                    $gateway = 'Wing KHQR';
                } elseif (str_contains(strtoupper($txnRef), 'CANADIA')) {
                    $gateway = 'Canadia KHQR';
                } else {
                    $gateway = 'ABA KHQR';
                }
            } elseif ($methodType === 'cod') {
                $gateway = 'COD Courier';
            } elseif ($methodType === 'counter_cash') {
                $gateway = 'Counter POS';
            } else {
                $gateway = 'Card (Visa/MC)';
            }

            // Map Settlement Status
            $rawStatus = strtolower($row['payment_status']);
            if (in_array($rawStatus, ['verified', 'paid'])) {
                $settlementStatus = 'verified';
            } elseif (in_array($rawStatus, ['pending_review', 'pending'])) {
                $settlementStatus = 'pending_review';
            } elseif ($rawStatus === 'flagged') {
                $settlementStatus = 'flagged';
            } else {
                $settlementStatus = 'refunded';
            }

            $amountUsd = (float)$row['total_amount'];
            $amountKhr = (int)($row['amount_khr'] ?? ($amountUsd * 4000));

            $mappedRecords[] = [
                'id' => 'TXN-' . $row['id'],
                'rawId' => (int)$row['id'],
                'orderId' => $row['order_number'],
                'customerName' => $row['customer_name'],
                'customerPhone' => $row['customer_phone'],
                'gateway' => $gateway,
                'method' => $methodType,
                'amountUsd' => $amountUsd,
                'amountKhr' => $amountKhr,
                'status' => $settlementStatus,
                'rawPaymentStatus' => $row['payment_status'],
                'rawOrderStatus' => $row['status'],
                'txnRef' => $txnRef,
                'proofImageUrl' => $row['payment_proof_url'],
                'timestamp' => $timeStr,
                'dateLabel' => $dateLabel,
                'dateIso' => $dateIso,
            ];
        }

        // 1. Date Filtering Helper Function
        $isDateInRange = function ($record) use ($datePreset, $dateFrom, $dateTo, $todayDate) {
            $tDateIso = $record['dateIso'];
            if ($datePreset === 'today') {
                return $tDateIso === $todayDate;
            }
            if ($datePreset === 'week') {
                $weekAgo = date('Y-m-d', strtotime('-7 days'));
                return $tDateIso >= $weekAgo && $tDateIso <= $todayDate;
            }
            if ($datePreset === 'month') {
                $monthAgo = date('Y-m-d', strtotime('-30 days'));
                return $tDateIso >= $monthAgo && $tDateIso <= $todayDate;
            }
            if ($datePreset === 'custom') {
                if ($dateFrom && $tDateIso < $dateFrom) return false;
                if ($dateTo && $tDateIso > $dateTo) return false;
                return true;
            }
            return true; // 'all'
        };

        // Date-filtered set for Summary Metrics calculation
        $dateFilteredOnly = array_filter($mappedRecords, $isDateInRange);

        // 2. Metrics Calculation
        $verifiedKhqrUsd = 0.0;
        $totalUsd = 0.0;
        $pendingKhqrCount = 0;
        $pendingKhqrUsd = 0.0;
        $codOnHandUsd = 0.0;
        $cancelledCount = 0;
        $cancelledAmountUsd = 0.0;

        foreach ($dateFilteredOnly as $rec) {
            if ($rec['status'] === 'verified') {
                $totalUsd += $rec['amountUsd'];
                if ($rec['method'] === 'khqr') {
                    $verifiedKhqrUsd += $rec['amountUsd'];
                }
                if ($rec['method'] === 'cod') {
                    $codOnHandUsd += $rec['amountUsd'];
                }
            } elseif ($rec['status'] === 'pending_review') {
                $pendingKhqrCount++;
                $pendingKhqrUsd += $rec['amountUsd'];
            } elseif ($rec['status'] === 'flagged' || $rec['status'] === 'refunded' || $rec['rawOrderStatus'] === 'cancelled') {
                $cancelledCount++;
                $cancelledAmountUsd += $rec['amountUsd'];
            }
        }

        $metrics = [
            'totalSettledUsd' => round($totalUsd, 2),
            'totalSettledKhr' => (int)round($totalUsd * 4000),
            'khqrSharePercentage' => $totalUsd > 0 ? (int)round(($verifiedKhqrUsd / $totalUsd) * 100) : 0,
            'pendingVerificationCount' => $pendingKhqrCount,
            'pendingVerificationAmountUsd' => round($pendingKhqrUsd, 2),
            'codOnHandUsd' => round($codOnHandUsd, 2),
            'cancelledCount' => $cancelledCount,
            'cancelledAmountUsd' => round($cancelledAmountUsd, 2),
        ];

        // 3. Method & Search Filtering for Response Table
        $finalTransactions = array_filter($mappedRecords, function ($rec) use ($isDateInRange, $filter, $search) {
            // Date filter check
            if (!$isDateInRange($rec)) return false;

            // Method/Status chip filter check
            if ($filter === 'khqr' && $rec['method'] !== 'khqr') return false;
            if ($filter === 'pending_audit' && $rec['status'] !== 'pending_review') return false;
            if ($filter === 'cod' && $rec['method'] !== 'cod') return false;
            if ($filter === 'counter' && $rec['method'] !== 'counter_cash') return false;
            if ($filter === 'cancelled' && !in_array($rec['status'], ['refunded', 'flagged'])) return false;

            // Search Query filter check
            if (!empty($search)) {
                $q = strtolower($search);
                $matchRef = str_contains(strtolower($rec['txnRef']), $q);
                $matchOrder = str_contains(strtolower($rec['orderId']), $q);
                $matchCust = str_contains(strtolower($rec['customerName']), $q);
                $matchPhone = str_contains(strtolower($rec['customerPhone']), $q);
                $matchGateway = str_contains(strtolower($rec['gateway']), $q);

                if (!$matchRef && !$matchOrder && !$matchCust && !$matchPhone && !$matchGateway) {
                    return false;
                }
            }

            return true;
        });

        jsonResponse(1, 'Payments retrieved successfully', [
            'data' => array_values($finalTransactions),
            'totalRecordsCount' => count($mappedRecords),
            'metrics' => $metrics,
        ]);

    } catch (PDOException $e) {
        jsonResponse(0, 'Database error: ' . $e->getMessage(), null, 500);
    }
}

elseif ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
    try {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $action = $input['action'] ?? null;
        $txnId = $input['txn_id'] ?? ($input['id'] ?? null);
        $status = $input['status'] ?? null;

        if (!$txnId) {
            jsonResponse(0, 'Transaction ID is required.', null, 400);
            return;
        }

        // Clean numeric order ID
        $cleanId = is_numeric($txnId) ? (int)$txnId : (int)str_replace('TXN-', '', $txnId);

        // Determine target payment status
        if ($action === 'verify' || $status === 'verified') {
            $newPaymentStatus = 'verified';
            // Also accept order if currently pending
            $updateSql = "UPDATE orders SET payment_status = 'verified', status = CASE WHEN status = 'pending' THEN 'accepted' ELSE status END WHERE id = ?";
            $logAction = 'payment_verified';
            $logMsg = "Verified payment for order ID #{$cleanId}";
        } elseif ($action === 'flag' || $status === 'flagged') {
            $newPaymentStatus = 'flagged';
            $updateSql = "UPDATE orders SET payment_status = 'flagged' WHERE id = ?";
            $logAction = 'payment_flagged';
            $logMsg = "Flagged payment as invalid for order ID #{$cleanId}";
        } elseif ($action === 'process_refund' || $action === 'refund' || $status === 'refunded') {
            $newPaymentStatus = 'refunded';
            $proofUrl = $input['refund_proof_url'] ?? $input['proofUrl'] ?? $input['proof_image_url'] ?? null;
            if ($proofUrl) {
                $updateSql = "UPDATE orders SET payment_status = 'refunded', status = 'cancelled', payment_proof_url = " . $pdo->quote($proofUrl) . " WHERE id = ?";
            } else {
                $updateSql = "UPDATE orders SET payment_status = 'refunded', status = 'cancelled' WHERE id = ?";
            }
            $logAction = 'payment_refunded';
            $logMsg = "Processed refund for order ID #{$cleanId}";
        } else {
            jsonResponse(0, 'Invalid action specified. Supported: verify, flag, process_refund.', null, 400);
            return;
        }

        $stmt = $pdo->prepare($updateSql);
        $stmt->execute([$cleanId]);

        if ($stmt->rowCount() > 0) {
            logSystemAction($pdo, $logAction, 'PAYMENT', $logMsg, 'info', $adminUser['id'] ?? null, $adminUser['name'] ?? 'Admin');
            jsonResponse(1, "Payment updated to {$newPaymentStatus} successfully.", [
                'txn_id' => 'TXN-' . $cleanId,
                'status' => $newPaymentStatus
            ]);
        } else {
            jsonResponse(0, "Transaction record ID #{$cleanId} not found or no changes made.", null, 404);
        }

    } catch (PDOException $e) {
        jsonResponse(0, 'Database error: ' . $e->getMessage(), null, 500);
    }
} else {
    jsonResponse(0, 'Method not allowed.', null, 405);
}
