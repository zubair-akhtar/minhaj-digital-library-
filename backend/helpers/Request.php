<?php
/**
 * Minhaj Digital Library — Request Helper
 * Parses JSON body and provides safe access to request data.
 */

declare(strict_types=1);

class Request
{
    private static ?array $jsonBody = null;

    /**
     * Get the HTTP method.
     */
    public static function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    /**
     * Parse and return JSON body.
     */
    public static function jsonBody(): array
    {
        if (self::$jsonBody !== null) {
            return self::$jsonBody;
        }

        $rawBody = file_get_contents('php://input');

        if (empty($rawBody)) {
            self::$jsonBody = [];
            return self::$jsonBody;
        }

        $decoded = json_decode($rawBody, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Response::error('Malformed JSON in request body', 400);
        }

        self::$jsonBody = is_array($decoded) ? $decoded : [];
        return self::$jsonBody;
    }

    /**
     * Get a value from the JSON body.
     */
    public static function input(string $key, mixed $default = null): mixed
    {
        $body = self::jsonBody();
        return $body[$key] ?? $default;
    }

    /**
     * Get a query parameter.
     */
    public static function query(string $key, mixed $default = null): mixed
    {
        return $_GET[$key] ?? $default;
    }

    /**
     * Get the Authorization Bearer token.
     */
    public static function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
