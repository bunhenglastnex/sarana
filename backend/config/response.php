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
            header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Tenant-ID, X-Restaurant-ID, Accept, Origin, *");
            header("Access-Control-Max-Age: 86400");
            header("Content-Type: application/json; charset=UTF-8");
        }

        echo json_encode([
            'code' => $code,
            'msg'  => $msg,
            'data' => $data
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Register global exception handler to ensure CORS headers & JSON are ALWAYS returned on error
    if (!defined('GLOBAL_ERROR_HANDLER_SET') && php_sapi_name() !== 'cli') {
        define('GLOBAL_ERROR_HANDLER_SET', true);

        set_exception_handler(function (\Throwable $e) {
            jsonResponse(0, 'Server Exception: ' . $e->getMessage(), null, 500);
        });
    }
}
