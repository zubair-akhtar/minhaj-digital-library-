<?php
/**
 * Minhaj Digital Library — Auth Middleware
 * Authenticates bearer tokens and enforces role-based access.
 */

declare(strict_types=1);

class AuthMiddleware
{
    /**
     * Authenticate the request. Returns user array or sends 401.
     */
    public static function authenticate(): array
    {
        $token = Request::bearerToken();

        if (!$token) {
            Response::error('Authentication required', 401);
        }

        $tokenHash = hash('sha256', $token);
        $db = Database::getConnection();

        $stmt = $db->prepare(
            "SELECT u.id, u.name, u.email, u.role, at.expires_at
             FROM auth_tokens at
             INNER JOIN users u ON u.id = at.user_id
             WHERE at.token_hash = ?
             LIMIT 1"
        );
        $stmt->bind_param('s', $tokenHash);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        if (!$row) {
            Response::error('Invalid or expired token', 401);
        }

        // Check expiry
        $expiresAt = new DateTime($row['expires_at']);
        $now = new DateTime();

        if ($now > $expiresAt) {
            // Clean up expired token
            $deleteStmt = $db->prepare("DELETE FROM auth_tokens WHERE token_hash = ?");
            $deleteStmt->bind_param('s', $tokenHash);
            $deleteStmt->execute();
            $deleteStmt->close();

            Response::error('Token has expired', 401);
        }

        return [
            'id'    => (int) $row['id'],
            'name'  => $row['name'],
            'email' => $row['email'],
            'role'  => $row['role'],
        ];
    }

    /**
     * Require admin role. Call after authenticate().
     */
    public static function requireAdmin(array $user): void
    {
        if ($user['role'] !== 'admin') {
            Response::error('Admin access required', 403);
        }
    }
}
