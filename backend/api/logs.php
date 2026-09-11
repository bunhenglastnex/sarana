<?php
// backend/api/logs.php
// System Activity Logs API Endpoint (Fetch logs, filters, metrics & clear old logs)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../lib/logger.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

// Require Super Admin Role Authentication
$adminUser = AuthMiddleware::authenticate($pdo, ['super_admin']);

if ($method === 'GET') {
    try {
        $page     = max(1, (int)($_GET['page'] ?? 1));
        $limit    = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset   = ($page - 1) * $limit;

        $level    = $_GET['level'] ?? null;
        $category = $_GET['category'] ?? null;
        $action   = $_GET['action'] ?? null;
        $search   = $_GET['search'] ?? null;
        $days     = isset($_GET['days']) ? (int)$_GET['days'] : null;

        $whereClause = "WHERE 1=1";
        $params = [];

        if ($level && in_array(strtolower($level), ['info', 'warning', 'error'])) {
            $whereClause .= " AND level = ?";
            $params[] = strtolower($level);
        }

        if ($category) {
            $whereClause .= " AND category = ?";
            $params[] = strtoupper($category);
        }

        if ($action) {
            $whereClause .= " AND action = ?";
            $params[] = strtoupper($action);
        }

        if ($days && $days > 0) {
            $whereClause .= " AND created_at >= NOW() - INTERVAL ? DAY";
            $params[] = $days;
        }

        if ($search) {
            $whereClause .= " AND (description LIKE ? OR action LIKE ? OR ip_address LIKE ? OR user_name LIKE ?)";
            $searchTerm = "%" . $search . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        // Count Total Filtered Logs
        $countSql = "SELECT COUNT(*) as total FROM system_logs {$whereClause}";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($params);
        $totalLogs = (int)$countStmt->fetch()['total'];

        // Fetch Logs Page
        $sql = "SELECT id, action, category, level, description, user_id, user_name, ip_address, user_agent, created_at
                FROM system_logs
                {$whereClause}
                ORDER BY id DESC
                LIMIT {$limit} OFFSET {$offset}";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $logs = $stmt->fetchAll();

        // Cast numeric fields
        foreach ($logs as &$log) {
            $log['id'] = (int)$log['id'];
            $log['user_id'] = $log['user_id'] !== null ? (int)$log['user_id'] : null;
        }

        // Fetch Overview Stats
        $statsStmt = $pdo->query("
            SELECT 
                COUNT(*) as total_all,
                SUM(CASE WHEN level = 'error' THEN 1 ELSE 0 END) as errors_count,
                SUM(CASE WHEN level = 'warning' THEN 1 ELSE 0 END) as warnings_count,
                SUM(CASE WHEN created_at >= NOW() - INTERVAL 7 DAY THEN 1 ELSE 0 END) as logs_past_7_days
            FROM system_logs
        ");
        $stats = $statsStmt->fetch();

        jsonResponse(1, 'Fetch system logs successfully', [
            'logs'       => $logs,
            'pagination' => [
                'page'        => $page,
                'limit'       => $limit,
                'total_items' => $totalLogs,
                'total_pages' => ceil($totalLogs / $limit)
            ],
            'stats'      => [
                'total_all'        => (int)($stats['total_all'] ?? 0),
                'errors_count'     => (int)($stats['errors_count'] ?? 0),
                'warnings_count'   => (int)($stats['warnings_count'] ?? 0),
                'logs_past_7_days' => (int)($stats['logs_past_7_days'] ?? 0),
            ]
        ]);
    } catch (PDOException $e) {
        jsonResponse(0, 'Failed to fetch system logs: ' . $e->getMessage(), null, 500);
    }
} elseif ($method === 'POST' || $method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $actionType = $input['action'] ?? ($_GET['action'] ?? 'clean');

    if ($actionType === 'clean') {
        // Clear logs older than X days (e.g. 7 days / 1 week, 30 days / 1 month, 0 for clear all)
        $days = isset($input['days']) ? (int)$input['days'] : 7;
        
        $deletedCount = cleanOldSystemLogs($pdo, $days);

        // Record log of cleanup event
        $retentionLabel = $days === 0 ? "All logs" : "logs older than {$days} days (1 week/custom retention)";
        logSystemAction(
            $pdo,
            'CLEAN_LOGS',
            'SYSTEM',
            "Database log maintenance executed. Purged {$deletedCount} log entries ({$retentionLabel}).",
            'info'
        );

        jsonResponse(1, "Database cleanup successful. Purged {$deletedCount} log entries.", [
            'deleted_count' => $deletedCount,
            'days_kept'     => $days
        ]);
    } elseif ($actionType === 'log') {
        // Create manual log entry
        $action = $input['log_action'] ?? 'CUSTOM_LOG';
        $category = $input['category'] ?? 'SYSTEM';
        $desc = $input['description'] ?? 'Custom system log entry';
        $level = $input['level'] ?? 'info';

        $saved = logSystemAction($pdo, $action, $category, $desc, $level);

        if ($saved) {
            jsonResponse(1, 'Log recorded successfully', null, 201);
        } else {
            jsonResponse(0, 'Failed to record log', null, 500);
        }
    } else {
        jsonResponse(0, 'Invalid log action', null, 400);
    }
} else {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}
