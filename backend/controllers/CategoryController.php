<?php
/**
 * Minhaj Digital Library — Category Controller
 * Handles category listing and creation.
 */

declare(strict_types=1);

class CategoryController
{
    /**
     * GET /api/categories
     * Authenticated — returns all categories.
     */
    public static function index(): void
    {
        AuthMiddleware::authenticate();

        $db   = Database::getConnection();
        $stmt = $db->prepare("SELECT id, name, created_at, updated_at FROM categories ORDER BY name ASC");
        $stmt->execute();
        $result     = $stmt->get_result();
        $categories = [];

        while ($row = $result->fetch_assoc()) {
            $categories[] = [
                'id'         => (int) $row['id'],
                'name'       => $row['name'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
            ];
        }
        $stmt->close();

        Response::success($categories, 'Categories retrieved');
    }

    /**
     * POST /api/categories
     * Admin only — creates a new category.
     */
    public static function store(): void
    {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $data = Request::jsonBody();

        $validator = new Validator();
        $validator->required($data, ['name'])
                  ->minLength($data, 'name', 2)
                  ->maxLength($data, 'name', 100)
                  ->validateOrFail();

        $name = trim($data['name']);
        $db   = Database::getConnection();

        // Check for duplicate
        $checkStmt = $db->prepare("SELECT id FROM categories WHERE name = ? LIMIT 1");
        $checkStmt->bind_param('s', $name);
        $checkStmt->execute();
        $existing = $checkStmt->get_result()->fetch_assoc();
        $checkStmt->close();

        if ($existing) {
            Response::error('Category already exists', 409);
        }

        $insertStmt = $db->prepare("INSERT INTO categories (name) VALUES (?)");
        $insertStmt->bind_param('s', $name);
        $insertStmt->execute();
        $categoryId = $insertStmt->insert_id;
        $insertStmt->close();

        // Fetch the created category
        $fetchStmt = $db->prepare("SELECT id, name, created_at, updated_at FROM categories WHERE id = ?");
        $fetchStmt->bind_param('i', $categoryId);
        $fetchStmt->execute();
        $category = $fetchStmt->get_result()->fetch_assoc();
        $fetchStmt->close();

        $category['id'] = (int) $category['id'];

        Response::created($category, 'Category created successfully');
    }
}
