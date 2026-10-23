<?php
/**
 * Minhaj Digital Library — User Seeder
 * CLI-only script to create test admin and reader accounts.
 *
 * Usage:
 *   php seed_users.php --admin-password=SecureAdmin123 --reader-password=SecureReader123
 *
 * Or via environment variables:
 *   ADMIN_PASSWORD=SecureAdmin123 READER_PASSWORD=SecureReader123 php seed_users.php
 */

declare(strict_types=1);

// Prevent web execution
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    die('This script can only be run from the command line.');
}

// Load bootstrap
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../config/database.php';

// Parse CLI arguments
$options = getopt('', ['admin-password:', 'reader-password:']);

$adminPassword  = $options['admin-password']  ?? getenv('ADMIN_PASSWORD')  ?: null;
$readerPassword = $options['reader-password'] ?? getenv('READER_PASSWORD') ?: null;

if (!$adminPassword || !$readerPassword) {
    echo "Usage: php seed_users.php --admin-password=<password> --reader-password=<password>\n";
    echo "  Or set ADMIN_PASSWORD and READER_PASSWORD environment variables.\n\n";
    echo "  Passwords must be at least 6 characters long.\n";
    exit(1);
}

if (strlen($adminPassword) < 6 || strlen($readerPassword) < 6) {
    echo "Error: Passwords must be at least 6 characters long.\n";
    exit(1);
}

$db = Database::getConnection();

$users = [
    [
        'name'     => 'Admin User',
        'email'    => 'admin@minhajlibrary.com',
        'password' => $adminPassword,
        'role'     => 'admin',
    ],
    [
        'name'     => 'Reader User',
        'email'    => 'reader@minhajlibrary.com',
        'password' => $readerPassword,
        'role'     => 'reader',
    ],
];

foreach ($users as $userData) {
    // Check if user already exists (idempotent)
    $checkStmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $checkStmt->bind_param('s', $userData['email']);
    $checkStmt->execute();
    $existing = $checkStmt->get_result()->fetch_assoc();
    $checkStmt->close();

    if ($existing) {
        // Update password hash
        $hash = password_hash($userData['password'], PASSWORD_DEFAULT);
        $updateStmt = $db->prepare("UPDATE users SET password_hash = ?, name = ?, role = ? WHERE email = ?");
        $updateStmt->bind_param('ssss', $hash, $userData['name'], $userData['role'], $userData['email']);
        $updateStmt->execute();
        $updateStmt->close();
        echo "[UPDATED] {$userData['role']}: {$userData['email']}\n";
    } else {
        // Insert new user
        $hash = password_hash($userData['password'], PASSWORD_DEFAULT);
        $insertStmt = $db->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)");
        $insertStmt->bind_param('ssss', $userData['name'], $userData['email'], $hash, $userData['role']);
        $insertStmt->execute();
        $insertStmt->close();
        echo "[CREATED] {$userData['role']}: {$userData['email']}\n";
    }
}

echo "\nDone! Test accounts are ready.\n";
echo "Admin:  admin@minhajlibrary.com\n";
echo "Reader: reader@minhajlibrary.com\n";
echo "\nNote: Passwords are not displayed for security.\n";

Database::close();
