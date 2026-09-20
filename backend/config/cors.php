<?php
// backend/config/cors.php
// Allow Cross-Origin Requests (CORS) from Next.js (localhost:3001) or any client

require_once __DIR__ . '/env.php';

$origin = env('ALLOWED_ORIGIN', '*');
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Tenant-ID, X-Restaurant-ID, Accept, Origin, *");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
