<?php
// backend/middleware/RateLimitMiddleware.php
// Middleware for Security Rate Limiting (Anti-Spam & Brute Force Prevention)

require_once __DIR__ . '/../config/response.php';

class RateLimitMiddleware {
    /**
     * Enforce rate limit per IP address for specific actions
     *
     * @param PDO $pdo Database PDO connection
     * @param string $action Action name (e.g. 'register', 'login')
     * @param int $maxAttempts Maximum allowed attempts before lockout (default: 5)
     * @param int $decaySeconds Window in seconds to reset attempts if inactive (default: 300s = 5m)
     * @param int $lockoutSeconds Lockout duration in seconds when exceeded (default: 900s = 15m)
     */
    public static function check(
        PDO $pdo,
        string $action = 'register',
        int $maxAttempts = 5,
        int $decaySeconds = 300,
        int $lockoutSeconds = 900
    ): void {
        $ip = self::getClientIp();

        // 1. Fetch current rate limit status for this IP and Action
        $stmt = $pdo->prepare("SELECT attempts, TIMESTAMPDIFF(SECOND, last_attempt_at, NOW()) as seconds_since_last, TIMESTAMPDIFF(SECOND, NOW(), locked_until) as remaining_lock_seconds FROM rate_limits WHERE ip_address = ? AND action = ?");
        $stmt->execute([$ip, $action]);
        $record = $stmt->fetch();

        // 2. Check if currently locked out
        if ($record && !empty($record['remaining_lock_seconds']) && (int)$record['remaining_lock_seconds'] > 0) {
            $remaining = (int)$record['remaining_lock_seconds'];
            $mins = floor($remaining / 60);
            $secs = $remaining % 60;
            $timeMsg = $mins > 0 ? "{$mins}m {$secs}s" : "{$secs}s";

            jsonResponse(
                0,
                "Security Alert: Too many {$action} attempts from your IP address ({$ip}). Please wait {$timeMsg} before trying again.",
                [
                    'retryAfterSeconds' => $remaining,
                    'action' => $action
                ],
                429
            );
        }

        // 3. Update or Insert attempt count
        if (!$record) {
            // First attempt from this IP
            $insert = $pdo->prepare("INSERT INTO rate_limits (ip_address, action, attempts, last_attempt_at) VALUES (?, ?, 1, NOW())");
            $insert->execute([$ip, $action]);
        } else {
            $secondsSinceLast = (int)$record['seconds_since_last'];
            $attempts = (int)$record['attempts'];

            if ($secondsSinceLast > $decaySeconds) {
                // Reset attempt counter after decay period
                $update = $pdo->prepare("UPDATE rate_limits SET attempts = 1, locked_until = NULL, last_attempt_at = NOW() WHERE ip_address = ? AND action = ?");
                $update->execute([$ip, $action]);
            } else {
                $newAttempts = $attempts + 1;

                if ($newAttempts >= $maxAttempts) {
                    // Exceeded limit -> Lockout IP address
                    $lock = $pdo->prepare("UPDATE rate_limits SET attempts = ?, locked_until = DATE_ADD(NOW(), INTERVAL ? SECOND), last_attempt_at = NOW() WHERE ip_address = ? AND action = ?");
                    $lock->execute([$newAttempts, $lockoutSeconds, $ip, $action]);

                    $mins = floor($lockoutSeconds / 60);
                    jsonResponse(
                        0,
                        "Security Warning: Limit exceeded! Too many {$action} attempts from IP {$ip}. Locked for {$mins} minutes.",
                        [
                            'retryAfterSeconds' => $lockoutSeconds,
                            'action' => $action
                        ],
                        429
                    );
                } else {
                    // Increment attempt count
                    $update = $pdo->prepare("UPDATE rate_limits SET attempts = ?, last_attempt_at = NOW() WHERE ip_address = ? AND action = ?");
                    $update->execute([$newAttempts, $ip, $action]);
                }
            }
        }
    }

    /**
     * Reset rate limit counter on successful action (e.g., successful registration or login)
     */
    public static function clear(PDO $pdo, string $action = 'register'): void {
        $ip = self::getClientIp();
        $stmt = $pdo->prepare("DELETE FROM rate_limits WHERE ip_address = ? AND action = ?");
        $stmt->execute([$ip, $action]);
    }

    /**
     * Get Client IP Address safely
     */
    public static function getClientIp(): string {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        }
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            return trim($ipList[0]);
        }
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
}
