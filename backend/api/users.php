<?php
// backend/api/users.php
// User Management API Endpoint Router

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../controllers/UserController.php';

// Apply CORS & OPTIONS preflight
CorsMiddleware::handle();

// Delegate request handling to UserController
$controller = new UserController();
$controller->handleRequest();
