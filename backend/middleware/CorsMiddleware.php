<?php
// backend/middleware/CorsMiddleware.php
// Middleware for Cross-Origin Resource Sharing (CORS) and preflight requests

require_once __DIR__ . '/../config/env.php';

class CorsMiddleware {
    public static function handle(): void {
        $origin = env('ALLOWED_ORIGIN', '*');
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Content-Type: application/json; charset=UTF-8");

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
