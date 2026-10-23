<?php
/**
 * Minhaj Digital Library — Upload Controller
 * Handles cover image uploads for books (admin only).
 */

declare(strict_types=1);

class UploadController
{
    private const ALLOWED_MIMES = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    ];

    private const MAX_SIZE = 3145728; // 3 MB

    /**
     * POST /api/upload-cover
     * Admin only — uploads a cover image.
     * Expects multipart form-data with field name `cover`.
     */
    public static function uploadCover(): void
    {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        // Check if file was uploaded
        if (!isset($_FILES['cover']) || $_FILES['cover']['error'] === UPLOAD_ERR_NO_FILE) {
            Response::error('No cover image uploaded', 400, ['cover' => 'Cover image is required']);
        }

        $file = $_FILES['cover'];

        // Check upload error
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload limit',
                UPLOAD_ERR_FORM_SIZE  => 'File exceeds form upload limit',
                UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Server configuration error',
                UPLOAD_ERR_CANT_WRITE => 'Server configuration error',
                UPLOAD_ERR_EXTENSION  => 'Upload blocked by server extension',
            ];
            $msg = $errorMessages[$file['error']] ?? 'Unknown upload error';
            Response::error($msg, 400);
        }

        // Check file size
        $maxSize = (int) env('UPLOAD_MAX_SIZE', (string) self::MAX_SIZE);
        if ($file['size'] > $maxSize) {
            Response::error('File size exceeds maximum allowed (3MB)', 413);
        }

        // Verify MIME type using finfo (do not trust client headers)
        $finfo    = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        if (!array_key_exists($mimeType, self::ALLOWED_MIMES)) {
            Response::error('Invalid file type. Allowed: JPEG, PNG, WebP', 415);
        }

        // Generate random filename
        $extension   = self::ALLOWED_MIMES[$mimeType];
        $filename    = bin2hex(random_bytes(16)) . '.' . $extension;
        $uploadDir   = env('UPLOAD_DIR', 'uploads/covers');
        $uploadPath  = __DIR__ . '/../public/' . $uploadDir;

        // Ensure upload directory exists
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        $destination = $uploadPath . '/' . $filename;

        // Move file
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            error_log('Failed to move uploaded file to: ' . $destination);
            Response::error('Failed to save uploaded file', 500);
        }

        // Prevent execution in upload directory
        $htaccessPath = $uploadPath . '/.htaccess';
        if (!file_exists($htaccessPath)) {
            file_put_contents($htaccessPath, "Options -ExecCGI\nRemoveHandler .php .phtml .php3 .php4 .php5 .pl .py .cgi\nAddType text/plain .php .phtml .php3 .php4 .php5 .pl .py .cgi\n");
        }

        $relativePath = $uploadDir . '/' . $filename;
        $appUrl       = rtrim(env('APP_URL', ''), '/');
        $fullUrl      = $appUrl . '/' . $relativePath;

        Response::created([
            'path' => $relativePath,
            'url'  => $fullUrl,
        ], 'Cover image uploaded successfully');
    }
}
