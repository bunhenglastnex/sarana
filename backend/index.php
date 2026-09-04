<?php
// backend/index.php
// API Welcome & Documentation Route

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    'project' => 'Single Restaurant Online Ordering API (Cash Only)',
    'version' => '1.0.0',
    'status' => 'running'
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
