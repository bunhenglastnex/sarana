<?php
// backend/config/db.php
// Database configuration & PDO Connection

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
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $e->getMessage()
        ]);
        exit;
    }
}
