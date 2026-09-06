<?php
// Scratch script to test reports API output with zero orders date
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer dummy';
$_GET['time_range'] = 'custom';
$_GET['selected_date'] = '2027-11-05';

// Mock AuthMiddleware authenticate to return admin user
require_once __DIR__ . '/../backend/config/db.php';
require_once __DIR__ . '/../backend/config/response.php';
require_once __DIR__ . '/../backend/middleware/CorsMiddleware.php';
require_once __DIR__ . '/../backend/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../backend/lib/logger.php';

// Override AuthMiddleware method for CLI scratch testing
class TestAuthMiddleware extends AuthMiddleware {
    public static function authenticate(PDO $pdo, array $allowedRoles = []): array {
        return ['id' => 1, 'role' => 'admin', 'username' => 'admin'];
    }
}

// Intercept AuthMiddleware::authenticate call by reading file and executing logic or executing via php
$pdo = getDB();
$dateCondition = "DATE(o.created_at) = '2027-11-05'";
$channelCondition = "1=1";

$salesSql = "SELECT 
                COUNT(id) as total_orders,
                COALESCE(SUM(total_amount), 0.00) as gross_sales,
                COALESCE(SUM(CASE WHEN payment_method = 'khqr' THEN 1 ELSE 0 END), 0) as khqr_orders
            FROM orders o
            WHERE {$dateCondition} AND {$channelCondition}
              AND o.payment_status IN ('paid', 'verified')
              AND o.status != 'cancelled'";

$salesStmt = $pdo->query($salesSql);
$currSales = $salesStmt->fetch();

echo "Sales Data for 2027-11-05:\n";
print_r($currSales);

$mixSql = "SELECT 
            o.fulfillment_type,
            COUNT(o.id) as cnt,
            COALESCE(SUM(o.total_amount), 0.00) as rev
           FROM orders o
           WHERE {$dateCondition} AND o.payment_status IN ('paid', 'verified')
           GROUP BY o.fulfillment_type";

$mixStmt = $pdo->query($mixSql);
$mixRows = $mixStmt->fetchAll();

echo "Mix Data:\n";
print_r($mixRows);
