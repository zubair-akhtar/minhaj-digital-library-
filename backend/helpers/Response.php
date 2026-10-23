<?php
/**
 * Minhaj Digital Library — JSON Response Helper
 */

declare(strict_types=1);

class Response
{
    /**
     * Send a success response.
     */
    public static function success(mixed $data = null, string $message = 'Success', int $statusCode = 200): void
    {
        http_response_code($statusCode);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send an error response.
     */
    public static function error(string $message = 'Error', int $statusCode = 400, ?array $errors = null): void
    {
        http_response_code($statusCode);
        $response = [
            'success' => false,
            'message' => $message,
            'data'    => null,
        ];
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send a created response (201).
     */
    public static function created(mixed $data = null, string $message = 'Created successfully'): void
    {
        self::success($data, $message, 201);
    }
}
