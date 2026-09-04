<?php
// backend/database/tables/system_logs.php

/**
 * Creates the 'system_logs' table.
 * @param PDO $pdo
 */
function createSystemLogsTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS system_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
        level ENUM('info', 'warning', 'error') NOT NULL DEFAULT 'info',
        description TEXT NULL,
        user_id INT NULL,
        user_name VARCHAR(100) NULL,
        ip_address VARCHAR(45) NULL,
        user_agent VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_action (action),
        INDEX idx_category (category),
        INDEX idx_level (level),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);
    echo "  ✅ Table 'system_logs' ready.\n";
}
