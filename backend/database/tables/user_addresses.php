<?php
// backend/database/tables/user_addresses.php
// Migration for User Saved Addresses table

function createUserAddressesTable(PDO $pdo): void {
    $sql = "CREATE TABLE IF NOT EXISTS `user_addresses` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `label` VARCHAR(100) NOT NULL,
        `address` TEXT NOT NULL,
        `lat` DECIMAL(10,8) NULL,
        `lng` DECIMAL(11,8) NULL,
        `tag` VARCHAR(50) NULL DEFAULT 'Home',
        `is_default` TINYINT(1) DEFAULT 0,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_user_id` (`user_id`),
        CONSTRAINT `fk_user_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);
    echo "  - Table 'user_addresses' checked/created.\n";
}
