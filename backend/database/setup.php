<?php
// backend/database/setup.php
// Script to automatically create database, tables, and seed dummy data.
// Run via CLI: php database/setup.php
// Or via Browser: http://localhost:8000/database/setup.php

$isCli = php_sapi_name() === 'cli';
if (!$isCli) {
    header("Content-Type: text/plain; charset=UTF-8");
}

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/tables/users.php';
require_once __DIR__ . '/tables/categories.php';
require_once __DIR__ . '/tables/foods.php';
require_once __DIR__ . '/tables/orders.php';
require_once __DIR__ . '/tables/order_items.php';
require_once __DIR__ . '/tables/system_logs.php';
require_once __DIR__ . '/seeder.php';

$host   = env('DB_HOST', '127.0.0.1');
$port   = env('DB_PORT', '3306');
$dbName = env('DB_NAME', 'restaurant_db');
$user   = env('DB_USER', 'root');
$pass   = env('DB_PASS', '');

echo "===========================================\n";
echo "🚀 Restaurant System DB Migration & Seeder\n";
echo "===========================================\n\n";

try {
    // 1. Connect to MySQL server
    $pdo = new PDO("mysql:host=$host;port=$port", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Create Database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `{$dbName}`");
    echo "✅ Database '{$dbName}' checked/created.\n\n";

    // 3. Create Tables in dependency order
    echo "📦 Creating database tables...\n";
    createUsersTable($pdo);
    createCategoriesTable($pdo);
    createFoodsTable($pdo);
    createOrdersTable($pdo);
    createOrderItemsTable($pdo);
    createSystemLogsTable($pdo);
    echo "\n";

    // 4. Seed Dummy Data
    seedDatabase($pdo);

    echo "\n🎉 ALL DONE! Your database is completely ready.\n";

} catch (PDOException $e) {
    echo "\n❌ Database Error: " . $e->getMessage() . "\n";
}
