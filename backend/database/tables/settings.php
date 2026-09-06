<?php
// backend/database/tables/settings.php

/**
 * Creates the 'settings' table for System & Restaurant Configuration
 * @param PDO $pdo
 */
function createSettingsTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NULL,
        setting_group VARCHAR(50) DEFAULT 'general',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_group (setting_group)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);
    echo "  ✅ Table 'settings' ready (Key-Value System Configuration).\n";
}
