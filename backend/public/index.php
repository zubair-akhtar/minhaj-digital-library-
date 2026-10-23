<?php
/**
 * Minhaj Digital Library — API Router
 * Single entry point for all API requests.
 * 
 * All routes are prefixed with /api.
 * Apache rewrite rules direct all requests to this file.
 */

declare(strict_types=1);

// ─── Load all required files ──────────────────────────────────
require_once __DIR__ . '/../config/bootstrap.php';
require_once __DIR__ . '/../helpers/Response.php';
require_once __DIR__ . '/../helpers/Request.php';
require_once __DIR__ . '/../helpers/Validator.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/BookController.php';
require_once __DIR__ . '/../controllers/CategoryController.php';
require_once __DIR__ . '/../controllers/UploadController.php';

// ─── Parse the request URI ───────────────────────────────────
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';

// Remove the script directory path to get the clean route
$basePath = dirname($scriptName);
$path     = parse_url($requestUri, PHP_URL_PATH);

// Remove base path prefix
if ($basePath !== '/' && $basePath !== '\\') {
    $path = substr($path, strlen($basePath));
}

// Normalize: ensure starts with /, remove trailing slash
$path = '/' . ltrim($path, '/');
$path = rtrim($path, '/');
if ($path === '') {
    $path = '/';
}

$method = Request::method();

// ─── Route Definitions ───────────────────────────────────────

// Health check
if ($path === '/api/health' && $method === 'GET') {
    Response::success([
        'status'  => 'ok',
        'service' => 'Minhaj Digital Library API',
        'version' => '1.0.0',
        'time'    => date('c'),
    ], 'API is running');
}

// ─── Auth Routes ─────────────────────────────────────────────

// POST /api/login
if ($path === '/api/login' && $method === 'POST') {
    AuthController::login();
}

// GET /api/me
if ($path === '/api/me' && $method === 'GET') {
    AuthController::me();
}

// POST /api/logout
if ($path === '/api/logout' && $method === 'POST') {
    AuthController::logout();
}

// ─── Category Routes ─────────────────────────────────────────

// GET /api/categories
if ($path === '/api/categories' && $method === 'GET') {
    CategoryController::index();
}

// POST /api/categories
if ($path === '/api/categories' && $method === 'POST') {
    CategoryController::store();
}

// ─── Book Routes ─────────────────────────────────────────────

// GET /api/books
if ($path === '/api/books' && $method === 'GET') {
    BookController::index();
}

// POST /api/books
if ($path === '/api/books' && $method === 'POST') {
    BookController::store();
}

// GET /api/books/{id}
if (preg_match('#^/api/books/(\d+)$#', $path, $matches) && $method === 'GET') {
    BookController::show((int) $matches[1]);
}

// PUT /api/books/{id}
if (preg_match('#^/api/books/(\d+)$#', $path, $matches) && $method === 'PUT') {
    BookController::update((int) $matches[1]);
}

// DELETE /api/books/{id}
if (preg_match('#^/api/books/(\d+)$#', $path, $matches) && $method === 'DELETE') {
    BookController::destroy((int) $matches[1]);
}

// ─── Upload Routes ───────────────────────────────────────────

// POST /api/upload-cover
if ($path === '/api/upload-cover' && $method === 'POST') {
    UploadController::uploadCover();
}

// ─── Method Not Allowed Check ────────────────────────────────

// Check if the path exists but method is wrong
$knownPaths = [
    '/api/health'      => ['GET'],
    '/api/login'       => ['POST'],
    '/api/me'          => ['GET'],
    '/api/logout'      => ['POST'],
    '/api/categories'  => ['GET', 'POST'],
    '/api/books'       => ['GET', 'POST'],
    '/api/upload-cover' => ['POST'],
];

foreach ($knownPaths as $knownPath => $allowedMethods) {
    if ($path === $knownPath && !in_array($method, $allowedMethods)) {
        http_response_code(405);
        header('Allow: ' . implode(', ', $allowedMethods));
        Response::error('Method not allowed', 405);
    }
}

// Check book resource routes
if (preg_match('#^/api/books/(\d+)$#', $path)) {
    $allowedBookMethods = ['GET', 'PUT', 'DELETE'];
    if (!in_array($method, $allowedBookMethods)) {
        http_response_code(405);
        header('Allow: ' . implode(', ', $allowedBookMethods));
        Response::error('Method not allowed', 405);
    }
}

// ─── 404 Not Found ───────────────────────────────────────────
Response::error('Endpoint not found', 404);
