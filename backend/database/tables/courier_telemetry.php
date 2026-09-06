<?php
// backend/database/tables/courier_telemetry.php

/**
 * Creates the 'courier_telemetry' table for real-time driver GPS tracking.
 * @param PDO $pdo
 */
function createCourierTelemetryTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS courier_telemetry (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        vehicle_type VARCHAR(50) NOT NULL DEFAULT 'motorbike',
        vehicle_label VARCHAR(100) NOT NULL DEFAULT 'Motorbike #1',
        lat DECIMAL(10, 8) NOT NULL DEFAULT 11.556400,
        lng DECIMAL(11, 8) NOT NULL DEFAULT 104.928200,
        speed_kmh INT NOT NULL DEFAULT 0,
        temp_celsius INT NOT NULL DEFAULT 65,
        status ENUM('active', 'on_delivery', 'idle', 'offline') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);

    echo "  ✅ Table 'courier_telemetry' ready (Live Driver GPS Telemetry).\n";
}
