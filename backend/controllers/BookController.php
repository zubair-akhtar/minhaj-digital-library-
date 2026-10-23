<?php
/**
 * Minhaj Digital Library — Book Controller
 * Full CRUD for books with search and category filtering.
 */

declare(strict_types=1);

class BookController
{
    /**
     * GET /api/books
     * Authenticated — returns books with optional search and category filter.
     * Query params: search, category_id
     */
    public static function index(): void
    {
        AuthMiddleware::authenticate();

        $db         = Database::getConnection();
        $search     = Request::query('search');
        $categoryId = Request::query('category_id');

        $sql    = "SELECT b.id, b.title, b.author, b.category_id, c.name AS category_name,
                          b.description, b.cover_image, b.pdf_url, b.created_at, b.updated_at
                   FROM books b
                   INNER JOIN categories c ON c.id = b.category_id
                   WHERE 1=1";
        $params = [];
        $types  = '';

        if ($search && trim($search) !== '') {
            $sql .= " AND b.title LIKE ?";
            $searchParam = '%' . trim($search) . '%';
            $params[]    = $searchParam;
            $types      .= 's';
        }

        if ($categoryId && is_numeric($categoryId)) {
            $sql .= " AND b.category_id = ?";
            $params[] = (int) $categoryId;
            $types   .= 'i';
        }

        $sql .= " ORDER BY b.created_at DESC";

        $stmt = $db->prepare($sql);

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $books  = [];

        $appUrl = rtrim(env('APP_URL', ''), '/');

        while ($row = $result->fetch_assoc()) {
            $coverImage = $row['cover_image'];
            // Build full URL for relative cover paths
            if ($coverImage && !str_starts_with($coverImage, 'http')) {
                $coverImage = $appUrl . '/' . ltrim($coverImage, '/');
            }

            $books[] = [
                'id'            => (int) $row['id'],
                'title'         => $row['title'],
                'author'        => $row['author'],
                'category_id'   => (int) $row['category_id'],
                'category_name' => $row['category_name'],
                'description'   => $row['description'],
                'cover_image'   => $coverImage,
                'pdf_url'       => $row['pdf_url'],
                'created_at'    => $row['created_at'],
                'updated_at'    => $row['updated_at'],
            ];
        }
        $stmt->close();

        Response::success($books, 'Books retrieved');
    }

    /**
     * GET /api/books/{id}
     * Authenticated — returns a single book by ID.
     */
    public static function show(int $id): void
    {
        AuthMiddleware::authenticate();

        $book = self::findBookById($id);

        if (!$book) {
            Response::error('Book not found', 404);
        }

        Response::success($book, 'Book retrieved');
    }

    /**
     * POST /api/books
     * Admin only — creates a new book.
     */
    public static function store(): void
    {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $data = Request::jsonBody();

        $validator = new Validator();
        $validator->required($data, ['title', 'author', 'category_id', 'pdf_url'])
                  ->minLength($data, 'title', 1)
                  ->maxLength($data, 'title', 255)
                  ->minLength($data, 'author', 1)
                  ->maxLength($data, 'author', 255)
                  ->positiveInt($data, 'category_id')
                  ->url($data, 'pdf_url')
                  ->maxLength($data, 'description', 5000)
                  ->validateOrFail();

        $db = Database::getConnection();

        // Verify category exists
        $catId   = (int) $data['category_id'];
        $catStmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
        $catStmt->bind_param('i', $catId);
        $catStmt->execute();
        if (!$catStmt->get_result()->fetch_assoc()) {
            $catStmt->close();
            Response::error('Category not found', 422, ['category_id' => 'Invalid category']);
        }
        $catStmt->close();

        $title       = trim($data['title']);
        $author      = trim($data['author']);
        $description = isset($data['description']) ? trim($data['description']) : null;
        $coverImage  = isset($data['cover_image']) ? trim($data['cover_image']) : null;
        $pdfUrl      = trim($data['pdf_url']);

        $stmt = $db->prepare(
            "INSERT INTO books (title, author, category_id, description, cover_image, pdf_url)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param('ssisss', $title, $author, $catId, $description, $coverImage, $pdfUrl);
        $stmt->execute();
        $bookId = $stmt->insert_id;
        $stmt->close();

        $book = self::findBookById($bookId);

        Response::created($book, 'Book created successfully');
    }

    /**
     * PUT /api/books/{id}
     * Admin only — updates an existing book (partial update supported).
     */
    public static function update(int $id): void
    {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $existing = self::findBookById($id);
        if (!$existing) {
            Response::error('Book not found', 404);
        }

        $data = Request::jsonBody();

        if (empty($data)) {
            Response::error('No data provided for update', 400);
        }

        $validator = new Validator();

        if (isset($data['title'])) {
            $validator->minLength($data, 'title', 1)->maxLength($data, 'title', 255);
        }
        if (isset($data['author'])) {
            $validator->minLength($data, 'author', 1)->maxLength($data, 'author', 255);
        }
        if (isset($data['category_id'])) {
            $validator->positiveInt($data, 'category_id');
        }
        if (isset($data['pdf_url'])) {
            $validator->url($data, 'pdf_url');
        }
        if (isset($data['description'])) {
            $validator->maxLength($data, 'description', 5000);
        }

        $validator->validateOrFail();

        $db = Database::getConnection();

        // Verify category if being updated
        if (isset($data['category_id'])) {
            $catId   = (int) $data['category_id'];
            $catStmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
            $catStmt->bind_param('i', $catId);
            $catStmt->execute();
            if (!$catStmt->get_result()->fetch_assoc()) {
                $catStmt->close();
                Response::error('Category not found', 422, ['category_id' => 'Invalid category']);
            }
            $catStmt->close();
        }

        // Build dynamic update
        $fields = [];
        $values = [];
        $types  = '';

        $allowedFields = [
            'title'       => 's',
            'author'      => 's',
            'category_id' => 'i',
            'description' => 's',
            'cover_image' => 's',
            'pdf_url'     => 's',
        ];

        foreach ($allowedFields as $field => $type) {
            if (array_key_exists($field, $data)) {
                $fields[] = "`$field` = ?";
                $values[] = is_string($data[$field]) ? trim($data[$field]) : $data[$field];
                $types   .= $type;
            }
        }

        if (empty($fields)) {
            Response::error('No valid fields to update', 400);
        }

        $sql = "UPDATE books SET " . implode(', ', $fields) . " WHERE id = ?";
        $types  .= 'i';
        $values[] = $id;

        $stmt = $db->prepare($sql);
        $stmt->bind_param($types, ...$values);
        $stmt->execute();
        $stmt->close();

        $updatedBook = self::findBookById($id);

        Response::success($updatedBook, 'Book updated successfully');
    }

    /**
     * DELETE /api/books/{id}
     * Admin only — deletes a book.
     */
    public static function destroy(int $id): void
    {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireAdmin($user);

        $existing = self::findBookById($id);
        if (!$existing) {
            Response::error('Book not found', 404);
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM books WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $stmt->close();

        Response::success(null, 'Book deleted successfully');
    }

    /**
     * Find a book by ID with category name.
     */
    private static function findBookById(int $id): ?array
    {
        $db   = Database::getConnection();
        $stmt = $db->prepare(
            "SELECT b.id, b.title, b.author, b.category_id, c.name AS category_name,
                    b.description, b.cover_image, b.pdf_url, b.created_at, b.updated_at
             FROM books b
             INNER JOIN categories c ON c.id = b.category_id
             WHERE b.id = ?
             LIMIT 1"
        );
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row    = $result->fetch_assoc();
        $stmt->close();

        if (!$row) {
            return null;
        }

        $appUrl     = rtrim(env('APP_URL', ''), '/');
        $coverImage = $row['cover_image'];
        if ($coverImage && !str_starts_with($coverImage, 'http')) {
            $coverImage = $appUrl . '/' . ltrim($coverImage, '/');
        }

        return [
            'id'            => (int) $row['id'],
            'title'         => $row['title'],
            'author'        => $row['author'],
            'category_id'   => (int) $row['category_id'],
            'category_name' => $row['category_name'],
            'description'   => $row['description'],
            'cover_image'   => $coverImage,
            'pdf_url'       => $row['pdf_url'],
            'created_at'    => $row['created_at'],
            'updated_at'    => $row['updated_at'],
        ];
    }
}
