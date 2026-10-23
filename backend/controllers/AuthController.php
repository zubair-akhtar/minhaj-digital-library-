<?php
/**
 * Minhaj Digital Library — Auth Controller
 * Handles login, logout, and user profile endpoints.
 */

declare(strict_types=1);

class AuthController
{
    /**
     * POST /api/login
     * Public endpoint — authenticates user and returns bearer token.
     */
  
public static function login(): void
{
    error_log("LOGIN DEBUG 1: Login function called");

    $data = Request::jsonBody();

    error_log("LOGIN DEBUG 2: Request body keys: " .
        json_encode(array_keys($data)));

    $validator = new Validator();
    $validator->required($data, ['email', 'password'])
              ->email($data, 'email')
              ->minLength($data, 'password', 6)
              ->validateOrFail();

    error_log("LOGIN DEBUG 3: Validation passed");

    $email = trim($data['email']);
    $password = $data['password'];

    error_log("LOGIN DEBUG 4: Email: " . $email);

    $db = Database::getConnection();

    error_log("LOGIN DEBUG 5: Database connected");

    $stmt = $db->prepare(
        "SELECT id, name, email, password_hash, role
         FROM users WHERE email = ? LIMIT 1"
    );

    $stmt->bind_param('s', $email);
    $stmt->execute();

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    error_log("LOGIN DEBUG 6: User found: " .
        ($user ? "YES" : "NO"));

    if ($user) {
        error_log("LOGIN DEBUG 7: Password verification: " .
            (password_verify($password, $user['password_hash'])
                ? "SUCCESS" : "FAILED"));
    }

    if (!$user || !password_verify($password, $user['password_hash'])) {
        error_log("LOGIN DEBUG ERROR: Invalid credentials");
        Response::error('Invalid email or password', 401);
        return;
    }

    error_log("LOGIN DEBUG 8: Generating token");

    $rawToken = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $rawToken);

    $expirySeconds = (int) env('TOKEN_EXPIRY', '604800');
    $expiresAt = date('Y-m-d H:i:s', time() + $expirySeconds);

    $insertStmt = $db->prepare(
        "INSERT INTO auth_tokens
         (user_id, token_hash, expires_at)
         VALUES (?, ?, ?)"
    );

    $insertStmt->bind_param(
        'iss',
        $user['id'],
        $tokenHash,
        $expiresAt
    );

    $insertStmt->execute();
    $insertStmt->close();

    error_log("LOGIN DEBUG 9: Token saved successfully");

    Response::success([
        'user' => [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ],
        'token' => $rawToken,
        'token_type' => 'Bearer',
        'expires_in' => $expirySeconds,
    ], 'Login successful');
}

    /**
     * GET /api/me
     * Authenticated — returns current user profile.
     */
    public static function me(): void
    {
        $user = AuthMiddleware::authenticate();

        Response::success([
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ], 'User profile retrieved');
    }

    /**
     * POST /api/logout
     * Authenticated — revokes current bearer token.
     */
    public static function logout(): void
    {
        AuthMiddleware::authenticate();

        $token     = Request::bearerToken();
        $tokenHash = hash('sha256', $token);
        $db        = Database::getConnection();

        $stmt = $db->prepare("DELETE FROM auth_tokens WHERE token_hash = ?");
        $stmt->bind_param('s', $tokenHash);
        $stmt->execute();
        $stmt->close();

        Response::success(null, 'Logged out successfully');
    }
}
