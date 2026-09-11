<?php
// backend/database/tables/settings.php

/**
 * Creates the 'settings' table for System & Restaurant Configuration
 * @param PDO $pdo
 */
function createSettingsTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT NULL DEFAULT NULL,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT NULL,
        setting_group VARCHAR(50) DEFAULT 'general',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_group (setting_group),
        INDEX idx_tenant (restaurant_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    // Safely alter existing table structure if needed
    try {
        $pdo->exec("ALTER TABLE settings ADD COLUMN restaurant_id INT NULL DEFAULT NULL AFTER id");
    } catch (PDOException $e) {}

    try {
        $pdo->exec("ALTER TABLE settings DROP INDEX setting_key");
    } catch (PDOException $e) {}

    try {
        $pdo->exec("ALTER TABLE settings ADD INDEX idx_tenant (restaurant_id)");
    } catch (PDOException $e) {}

    echo "  ✅ Table 'settings' ready (Key-Value System Configuration).\n";
}
