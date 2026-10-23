<?php
/**
 * Minhaj Digital Library — Database Connection (Singleton)
 * Uses MySQLi with prepared statements.
 */

declare(strict_types=1);

class Database
{
    private static ?mysqli $connection = null;

    /**
     * Get the singleton MySQLi connection.
     */
    public static function getConnection(): mysqli
    {
        if (self::$connection === null) {
            mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

            $host = env('DB_HOST', 'localhost');
            $port = (int) env('DB_PORT', '3306');
            $name = env('DB_NAME', 'minhaj_library');
            $user = env('DB_USER', 'root');
            $pass = env('DB_PASS', '');

            try {
                self::$connection = new mysqli($host, $user, $pass, $name, $port);
                self::$connection->set_charset('utf8mb4');
            } catch (\mysqli_sql_exception $e) {
                error_log('Database connection failed: ' . $e->getMessage());
                Response::error('Database connection failed', 500);
                exit;
            }
        }

        return self::$connection;
    }

    /**
     * Close the connection (optional cleanup).
     */
    public static function close(): void
    {
        if (self::$connection !== null) {
            self::$connection->close();
            self::$connection = null;
        }
    }
}
