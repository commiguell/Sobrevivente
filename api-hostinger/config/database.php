<?php
/**
 * SOBREVIVENTE.EU — GESTOR DE CONEXÃO MYSQL VIA PDO (HOSTINGER)
 * 
 * Arquiteto de Software: Sobrevivente.eu Engineering
 * Padrão: Singleton PDO com Prepared Statements Nativos e .env Loader
 */

declare(strict_types=1);

namespace Sobrevivente\Config;

use PDO;
use PDOException;
use RuntimeException;

class Database
{
    private static ?PDO $instance = null;

    /**
     * Carrega variáveis de ambiente de um ficheiro .env simples
     */
    private static function loadEnv(string $path): void
    {
        if (!file_exists($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            // Ignora comentários e linhas vazias
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            if (str_contains($line, '=')) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value, " \t\n\r\0\x0B\"'");
                
                if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV)) {
                    putenv(sprintf('%s=%s', $key, $value));
                    $_ENV[$key] = $value;
                    $_SERVER[$key] = $value;
                }
            }
        }
    }

    /**
     * Obtém uma instância PDO segura e configurada
     */
    public static function getConnection(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        // Tenta carregar o ficheiro .env na raiz do projeto ou na pasta da API
        self::loadEnv(__DIR__ . '/../.env');
        self::loadEnv(__DIR__ . '/../../.env');

        $host = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? 'localhost');
        $port = getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? '3306');
        $dbName = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? '');
        $username = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? '');
        $password = getenv('DB_PASSWORD') ?: ($_ENV['DB_PASSWORD'] ?? '');

        if (empty($dbName) || empty($username)) {
            throw new RuntimeException('Credenciais de base de dados MySQL em falta no ficheiro .env');
        }

        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName);

        $options = [
            // Lança exceções PDO em caso de erro SQL (fundamental para transações)
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            // Retorna arrays associativos por padrão
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // CRÍTICO: Desativa a emulação de prepared statements, forçando o motor MySQL
            // da Hostinger a preparar e compilar a query nativamente (prevenção total de SQL Injection)
            PDO::ATTR_EMULATE_PREPARES => false,
            // Conexão persistente otimizada para PHP-FPM / LiteSpeed
            PDO::ATTR_PERSISTENT => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ];

        try {
            self::$instance = new PDO($dsn, $username, $password, $options);
            return self::$instance;
        } catch (PDOException $e) {
            // Regista internamente sem vazar credenciais para o utilizador
            error_log('[HOSTINGER-DB-ERROR] ' . $e->getMessage());
            throw new RuntimeException('Falha de conexão à base de dados. Por favor tente mais tarde.');
        }
    }
}
