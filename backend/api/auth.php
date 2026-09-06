<?php
// backend/api/auth.php
// User Authentication API Router Endpoint

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../controllers/AuthController.php';

// Apply CORS & OPTIONS preflight
CorsMiddleware::handle();

// Instantiate and delegate request to AuthController
$controller = new AuthController();
$controller->handleRequest();
