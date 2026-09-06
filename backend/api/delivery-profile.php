<?php
// backend/api/delivery-profile.php
// Authenticated Courier Profile & Telemetry Status API (/delivery/profile)

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'GET') {
    jsonResponse(0, 'Method Not Allowed', null, 405);
}

try {
    $pdo = getDB();
    $authUser = AuthMiddleware::authenticate($pdo, ['delivery', 'admin']);

    $staffId = (int)$authUser['id'];

    // Fetch Telemetry & Vehicle Details
    $telemStmt = $pdo->prepare("
        SELECT vehicle_type, vehicle_label, speed_kmh, temp_celsius, status as courier_status, lat, lng
        FROM courier_telemetry
        WHERE user_id = ?
    ");
    $telemStmt->execute([$staffId]);
    $telemetry = $telemStmt->fetch() ?: [];

    // Count today's completed deliveries
    $completedStmt = $pdo->prepare("
        SELECT COUNT(*) as today_count
        FROM orders
        WHERE delivery_staff_id = ?
          AND status IN ('completed', 'delivered')
          AND DATE(created_at) = CURDATE()
    ");
    $completedStmt->execute([$staffId]);
    $completedRow = $completedStmt->fetch();
    $deliveriesToday = $completedRow ? (int)$completedRow['today_count'] : 0;

    $profile = [
        'id'               => $staffId,
        'code'             => 'AE-DRV-' . (4790 + $staffId),
        'name'             => $authUser['name'],
        'phone'            => $authUser['phone'],
        'email'            => $authUser['email'],
        'avatar_url'       => $authUser['avatar_url'],
        'role'             => $authUser['role'],
        'status'           => $telemetry['courier_status'] ?? 'active',
        'is_online'        => ($telemetry['courier_status'] ?? 'active') !== 'offline',
        'vehicle_type'     => $telemetry['vehicle_type'] ?? 'motorbike',
        'vehicle_label'    => $telemetry['vehicle_label'] ?? 'Honda Click (Motorbike)',
        'deliveries_today' => $deliveriesToday,
        'rating'           => 4.95,
        'created_at'       => $authUser['created_at'] ?? null,
    ];

    jsonResponse(1, 'Courier profile fetched successfully', $profile);
} catch (PDOException $e) {
    jsonResponse(0, 'Failed to fetch courier profile: ' . $e->getMessage(), null, 500);
}
