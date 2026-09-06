<?php
// backend/database/tables/rate_limits.php
// Migration for Rate Limits table (Brute-force protection & Anti-Spam Registration)

function createRateLimitsTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS `rate_limits` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `ip_address` VARCHAR(45) NOT NULL,
        `action` VARCHAR(50) NOT NULL,
        `attempts` INT DEFAULT 1,
        `last_attempt_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `locked_until` DATETIME NULL,
        UNIQUE KEY `unique_ip_action` (`ip_address`, `action`),
        INDEX `idx_ip_action` (`ip_address`, `action`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);
    echo "  - Table 'rate_limits' checked/created.\n";
}
