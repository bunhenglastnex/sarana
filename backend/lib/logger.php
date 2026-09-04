<?php
// backend/lib/logger.php
// System Action Logger & Database Retention Maintenance Library

if (!function_exists('getClientIp')) {
    /**
     * Get the real client IP address reliably.
     */
    function getClientIp(): string {
        $ip = '127.0.0.1';

        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            // Can contain multiple IPs separated by comma (client, proxy1, proxy2)
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ips[0]);
        } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }

        // Return sanitized IP
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '127.0.0.1';
    }
}

if (!function_exists('logSystemAction')) {
    /**
     * Store system action log entry in MySQL database.
     *
     * @param PDO $pdo
     * @param string $action Action code e.g. CREATE_FOOD, CREATE_ORDER, UPDATE_ORDER_STATUS, CLEAN_LOGS
     * @param string $category Category e.g. FOOD, ORDER, DELIVERY, TELEGRAM, SYSTEM
     * @param string $description Detailed message or JSON string
     * @param string $level Log level: 'info', 'warning', 'error'
     * @param int|null $userId User ID if available
     * @param string|null $userName User name or role if available
     * @return bool
     */
    function logSystemAction(
        PDO $pdo,
        string $action,
        string $category,
        string $description,
        string $level = 'info',
        ?int $userId = null,
        ?string $userName = null
    ): bool {
        try {
            $ipAddress = getClientIp();
            $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 255) : null;
            $level = in_array(strtolower($level), ['info', 'warning', 'error']) ? strtolower($level) : 'info';

            $stmt = $pdo->prepare("
                INSERT INTO system_logs (action, category, level, description, user_id, user_name, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");

            return $stmt->execute([
                strtoupper($action),
                strtoupper($category),
                $level,
                $description,
                $userId,
                $userName,
                $ipAddress,
                $userAgent
            ]);
        } catch (\Exception $e) {
            // Fail safely without disrupting caller request
            error_log("Failed to insert system_log: " . $e->getMessage());
            return false;
        }
    }
}

if (!function_exists('cleanOldSystemLogs')) {
    /**
     * Purge system logs older than specified number of days.
     *
     * @param PDO $pdo
     * @param int $daysToKeep Number of days to retain (e.g. 7 for 1 week, 30 for 1 month). If 0, clears all logs.
     * @return int Number of deleted log rows
     */
    function cleanOldSystemLogs(PDO $pdo, int $daysToKeep): int {
        try {
            if ($daysToKeep <= 0) {
                $stmt = $pdo->query("DELETE FROM system_logs");
                return $stmt->rowCount();
            } else {
                $stmt = $pdo->prepare("DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL ? DAY");
                $stmt->execute([$daysToKeep]);
                return $stmt->rowCount();
            }
        } catch (\Exception $e) {
            error_log("Failed to clean old system logs: " . $e->getMessage());
            return 0;
        }
    }
}
