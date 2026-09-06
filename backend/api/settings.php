<?php
// backend/api/settings.php
// Settings API Router Endpoint

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../controllers/SettingsController.php';

// Apply CORS & OPTIONS preflight
CorsMiddleware::handle();

// Delegate request to SettingsController
$controller = new SettingsController();
$controller->handleRequest();
