<?php
// backend/lib/upload.php
// Helper module for processing Base64 & Multipart Image Uploads

/**
 * Saves a Base64 encoded image string to the local filesystem in backend/uploads/.
 * Returns relative public URL path (e.g. /uploads/foods/img_64f10a21.jpg)
 *
 * @param string|null $base64String
 * @param string $subFolder
 * @return string|null
 */
function saveBase64Image(?string $base64String, string $subFolder = 'foods'): ?string {
    if (empty($base64String)) {
        return null;
    }

    // If it's already a standard HTTP/HTTPS URL or static image path, return as is
    if (!preg_match('/^data:image\/(\w+);base64,/i', $base64String, $type)) {
        return $base64String;
    }

    // Extract image format (jpeg, png, webp, gif, etc.)
    $ext = strtolower($type[1]);
    if ($ext === 'jpeg') $ext = 'jpg';
    if (!in_array($ext, ['jpg', 'png', 'webp', 'gif', 'svg'])) {
        $ext = 'jpg';
    }

    // Strip header prefix and decode raw base64 binary bytes
    $base64Data = substr($base64String, strpos($base64String, ',') + 1);
    $binaryData = base64_decode($base64Data);

    if ($binaryData === false) {
        return null;
    }

    // Ensure uploads target directory exists
    $targetDir = __DIR__ . "/../uploads/{$subFolder}/";
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    // Generate unique random filename
    $fileName = 'img_' . uniqid() . '_' . time() . '.' . $ext;
    $filePath = $targetDir . $fileName;

    // Save image file bytes to disk
    if (file_put_contents($filePath, $binaryData) !== false) {
        return "/uploads/{$subFolder}/" . $fileName;
    }

    return null;
}

/**
 * Formats a stored image URL path into a complete accessible HTTP URL
 *
 * @param string|null $url
 * @return string|null
 */
function formatPublicImageUrl(?string $url): ?string {
    if (empty($url)) {
        return null;
    }
    if (strpos($url, 'http://') === 0 || strpos($url, 'https://') === 0 || strpos($url, 'data:') === 0) {
        return $url;
    }
    $host = isset($_SERVER['HTTP_HOST']) && !empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost:8000';
    $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http';
    $baseUrl = "{$scheme}://{$host}";
    return strpos($url, '/') === 0 ? "{$baseUrl}{$url}" : "{$baseUrl}/{$url}";
}
