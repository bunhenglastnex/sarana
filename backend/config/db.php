<?php
// backend/config/db.php
// Database configuration & PDO Connection

require_once __DIR__ . '/response.php';

$host = '127.0.0.1';
$port = '3306';
$db   = 'restaurant_db';
$user = 'root';
$pass = ''; // Default XAMPP/MySQL password is empty
$charset = 'utf8mb4';

function getDB() {
    global $host, $port, $db, $user, $pass, $charset;

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (\PDOException $e) {
        jsonResponse(0, 'Database connection failed: ' . $e->getMessage(), null, 500);
    }
}

