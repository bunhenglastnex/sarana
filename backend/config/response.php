<?php
// backend/config/response.php
// Global API JSON Response Formatter with standard { code, msg, data } structure

if (!function_exists('jsonResponse')) {
    /**
     * Send a standardized JSON response and terminate execution.
     *
     * @param int $code 1 for success, 0 for failure (or custom error code)
     * @param string $msg Message describing the result or error
     * @param mixed $data Payload data (array, object, or null)
     * @param int $httpStatus HTTP status code (default 200)
     */
    function jsonResponse(int $code = 1, string $msg = "Success", $data = null, int $httpStatus = 200): void {
        if (php_sapi_name() !== 'cli' && !headers_sent()) {
            http_response_code($httpStatus);
            header("Access-Control-Allow-Origin: *");
            header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
            header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
            header("Content-Type: application/json; charset=UTF-8");
        }

        echo json_encode([
            'code' => $code,
            'msg'  => $msg,
            'data' => $data
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
