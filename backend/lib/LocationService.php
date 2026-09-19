<?php
// backend/lib/LocationService.php
// Two-Tier Delivery & Pickup Coverage Evaluator

class LocationService {
    /**
     * Calculate Haversine distance between two sets of GPS coordinates in Kilometers
     */
    public static function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float {
        $earthRadius = 6371.0; // Earth's radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 2);
    }

    /**
     * Evaluate Platform & Restaurant Coverage for a given Customer location and Target Restaurant
     *
     * @param PDO $pdo
     * @param float|null $custLat
     * @param float|null $custLng
     * @param int $restaurantId
     * @return array Diagnostic Coverage Result
     */
    public static function evaluateCoverage(PDO $pdo, ?float $custLat, ?float $custLng, int $restaurantId): array {
        // 1. Fetch Target Restaurant Configuration & Coordinates
        $restStmt = $pdo->prepare("
            SELECT id, name, is_active, lat, lng, 
                   COALESCE(delivery_radius_km, 5.00) as delivery_radius_km, 
                   COALESCE(allow_delivery, 1) as allow_delivery, 
                   COALESCE(allow_pickup, 1) as allow_pickup, 
                   COALESCE(min_order_amount, 0.00) as min_order_amount
            FROM restaurants 
            WHERE id = ?
        ");
        $restStmt->execute([$restaurantId]);
        $restaurant = $restStmt->fetch(PDO::FETCH_ASSOC);

        if (!$restaurant) {
            return [
                'success' => false,
                'error' => 'Restaurant not found',
                'deliveryAvailable' => false,
                'pickupAvailable' => false,
                'reasons' => ['Restaurant does not exist']
            ];
        }

        if ((int)$restaurant['is_active'] !== 1) {
            return [
                'success' => false,
                'error' => 'Restaurant is temporarily inactive',
                'deliveryAvailable' => false,
                'pickupAvailable' => false,
                'reasons' => ['Restaurant is currently closed or inactive']
            ];
        }

        // 2. Fetch Platform-Wide Service Coverage Settings
        $settStmt = $pdo->query("
            SELECT setting_key, setting_value 
            FROM settings 
            WHERE restaurant_id IS NULL AND setting_key IN (
                'platform_service_lat', 
                'platform_service_lng', 
                'platform_service_radius_km', 
                'platform_delivery_enabled'
            )
        ");
        $settRows = $settStmt->fetchAll(PDO::FETCH_KEY_PAIR);

        $platformLat = (float)($settRows['platform_service_lat'] ?? $restaurant['lat'] ?? 13.352270);
        $platformLng = (float)($settRows['platform_service_lng'] ?? $restaurant['lng'] ?? 103.955116);
        $platformRadiusKm = (float)($settRows['platform_service_radius_km'] ?? 15.0);
        $platformDeliveryEnabled = ($settRows['platform_delivery_enabled'] ?? '1') === '1';

        $restaurantAllowDelivery = (int)$restaurant['allow_delivery'] === 1;
        $restaurantAllowPickup = (int)$restaurant['allow_pickup'] === 1;
        $restaurantDeliveryRadiusKm = (float)$restaurant['delivery_radius_km'];

        $reasons = [];
        $platformCovered = false;
        $restaurantCovered = false;
        $platformDistance = null;
        $restaurantDistance = null;

        // Pickup is ALWAYS independent of location radius checks
        $pickupAvailable = $restaurantAllowPickup;
        if (!$restaurantAllowPickup) {
            $reasons[] = 'Restaurant does not offer pickup service.';
        }

        // Evaluate Delivery Coverage if coordinates are provided
        if ($custLat !== null && $custLng !== null) {
            $platformDistance = self::calculateDistance($custLat, $custLng, $platformLat, $platformLng);
            $restaurantDistance = self::calculateDistance($custLat, $custLng, (float)$restaurant['lat'], (float)$restaurant['lng']);

            if (!$platformDeliveryEnabled) {
                $reasons[] = 'Platform delivery service is currently disabled globally.';
            } else if ($platformDistance > $platformRadiusKm) {
                $reasons[] = "Delivery address is outside main platform service region ({$platformDistance} km away, max platform limit {$platformRadiusKm} km).";
            } else {
                $platformCovered = true;
            }

            if (!$restaurantAllowDelivery) {
                $reasons[] = 'Restaurant has disabled delivery fulfillment.';
            } else if ($restaurantDistance > $restaurantDeliveryRadiusKm) {
                $reasons[] = "Delivery address is outside restaurant delivery radius ({$restaurantDistance} km away, max limit {$restaurantDeliveryRadiusKm} km).";
            } else {
                $restaurantCovered = true;
            }
        } else {
            $reasons[] = 'Delivery location coordinates are missing.';
        }

        $deliveryAvailable = $platformDeliveryEnabled && $restaurantAllowDelivery && $platformCovered && $restaurantCovered;

        return [
            'success' => true,
            'restaurantId' => (int)$restaurant['id'],
            'restaurantName' => $restaurant['name'],
            'minOrderAmount' => (float)$restaurant['min_order_amount'],
            'deliveryAvailable' => $deliveryAvailable,
            'pickupAvailable' => $pickupAvailable,
            'platformCovered' => $platformCovered,
            'restaurantCovered' => $restaurantCovered,
            'platformDistanceKm' => $platformDistance,
            'restaurantDistanceKm' => $restaurantDistance,
            'maxRestaurantRadiusKm' => $restaurantDeliveryRadiusKm,
            'maxPlatformRadiusKm' => $platformRadiusKm,
            'reasons' => $reasons
        ];
    }
}
