<?php
/**
 * Minhaj Digital Library — Input Validator
 */

declare(strict_types=1);

class Validator
{
    private array $errors = [];

    /**
     * Validate required fields exist and are non-empty strings.
     */
    public function required(array $data, array $fields): self
    {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                $this->errors[$field] = "$field is required";
            }
        }
        return $this;
    }

    /**
     * Validate email format.
     */
    public function email(array $data, string $field): self
    {
        if (isset($data[$field]) && !filter_var($data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = "Invalid email format";
        }
        return $this;
    }

    /**
     * Validate string minimum length.
     */
    public function minLength(array $data, string $field, int $min): self
    {
        if (isset($data[$field]) && is_string($data[$field]) && mb_strlen(trim($data[$field])) < $min) {
            $this->errors[$field] = "$field must be at least $min characters";
        }
        return $this;
    }

    /**
     * Validate string maximum length.
     */
    public function maxLength(array $data, string $field, int $max): self
    {
        if (isset($data[$field]) && is_string($data[$field]) && mb_strlen(trim($data[$field])) > $max) {
            $this->errors[$field] = "$field must not exceed $max characters";
        }
        return $this;
    }

    /**
     * Validate a URL (must be HTTPS for pdf_url).
     */
    public function url(array $data, string $field, bool $requireHttps = false): self
    {
        if (isset($data[$field]) && !empty($data[$field])) {
            $url = filter_var($data[$field], FILTER_VALIDATE_URL);
            if (!$url) {
                $this->errors[$field] = "Invalid URL format";
            } elseif ($requireHttps && !str_starts_with($data[$field], 'https://')) {
                $this->errors[$field] = "$field must use HTTPS";
            }
        }
        return $this;
    }

    /**
     * Validate that a value is a positive integer.
     */
    public function positiveInt(array $data, string $field): self
    {
        if (isset($data[$field])) {
            $val = filter_var($data[$field], FILTER_VALIDATE_INT);
            if ($val === false || $val < 1) {
                $this->errors[$field] = "$field must be a positive integer";
            }
        }
        return $this;
    }

    /**
     * Check if validation passed.
     */
    public function passes(): bool
    {
        return empty($this->errors);
    }

    /**
     * Check if validation failed.
     */
    public function fails(): bool
    {
        return !empty($this->errors);
    }

    /**
     * Get validation errors.
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * If validation fails, send error response and exit.
     */
    public function validateOrFail(): void
    {
        if ($this->fails()) {
            Response::error('Validation failed', 422, $this->errors);
        }
    }
}
