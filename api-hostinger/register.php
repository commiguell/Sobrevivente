<?php
/**
 * SOBREVIVENTE.EU — ENDPOINT DE REGISTO DE UTILIZADORES (HOSTINGER)
 * 
 * Arquiteto de Software: Sobrevivente.eu Engineering
 * Padrão: REST API JSON com Validação Rígida, Bcrypt e Prepared Statements
 */

declare(strict_types=1);

namespace Sobrevivente\Api;

require_once __DIR__ . '/config/database.php';

use Sobrevivente\Config\Database;
use PDOException;
use Throwable;

// 1. Configuração de Cabeçalhos HTTP & CORS
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Permitir chamadas de frontend (ajuste a origem para o domínio exato em produção se desejado)
$allowedOrigin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: {$allowedOrigin}");
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Responder a pedidos preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Permitir exclusivamente o método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'error' => 'Método não permitido. Utilize o método POST.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. Leitura e Decodificação do Payload JSON
$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Corpo do pedido vazio. Envie os dados em formato JSON.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode($rawInput, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Formato JSON inválido.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 3. Sanitização e Extração dos Dados de Entrada
$nomeRaw = $data['nome'] ?? ($data['name'] ?? '');
$emailRaw = $data['email'] ?? '';
$passwordRaw = $data['password'] ?? '';
$regiaoRaw = $data['regiao'] ?? ($data['region'] ?? 'Nacional');
$nivelRaw = $data['nivel_experiencia'] ?? ($data['experienceLevel'] ?? 'Iniciante');

// Limpeza de caracteres de controlo e espaços em branco
$nome = trim(strip_tags((string)$nomeRaw));
$email = strtolower(trim((string)$emailRaw));
$regiao = trim(strip_tags((string)$regiaoRaw));
$nivel = trim((string)$nivelRaw);

// Normalização do nível de experiência
$niveisValidos = ['Iniciante', 'Intermédio', 'Avançado'];
if (!in_array($nivel, $niveisValidos, true)) {
    $nivel = 'Iniciante';
}

if ($regiao === '') {
    $regiao = 'Nacional';
}

// 4. Validações de Negócio Rígidas
$erros = [];

if (mb_strlen($nome) < 2 || mb_strlen($nome) > 150) {
    $erros[] = 'O nome deve ter entre 2 e 150 caracteres.';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 191) {
    $erros[] = 'Por favor introduza um endereço de email válido.';
}

if (strlen($passwordRaw) < 6 || strlen($passwordRaw) > 72) {
    // 72 caracteres é o limite algorítmico do Bcrypt
    $erros[] = 'A palavra-passe deve conter entre 6 e 72 caracteres.';
}

if (!empty($erros)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => implode(' ', $erros),
        'detalhes' => $erros,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // 5. Conexão Segura à Base de Dados da Hostinger via PDO
    $pdo = Database::getConnection();

    // 6. PREPARED STATEMENT 1: Verificação de Unicidade do Email
    // Previne que o mesmo email seja cadastrado duas vezes
    $checkStmt = $pdo->prepare('SELECT id FROM utilizadores WHERE email = :email LIMIT 1');
    $checkStmt->execute([':email' => $email]);
    
    if ($checkStmt->fetch()) {
        http_response_code(409); // Conflict
        echo json_encode([
            'ok' => false,
            'error' => 'Este endereço de email já se encontra registado na comunidade.',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 7. Encriptação Forte com Bcrypt (Cost 12)
    // O algoritmo BCRYPT com custo 12 garante resistência contra ataques de força bruta
    $passwordHash = password_hash($passwordRaw, PASSWORD_BCRYPT, ['cost' => 12]);
    if ($passwordHash === false) {
        throw new RuntimeException('Falha interna ao gerar hash seguro da palavra-passe.');
    }

    // 8. PREPARED STATEMENT 2: Inserção Segura dos Dados
    // Os parâmetros parametrizados garantem imunidade contra SQL Injection
    $insertQuery = '
        INSERT INTO utilizadores (
            nome,
            email,
            password_hash,
            regiao,
            nivel_experiencia,
            ativo,
            data_registo
        ) VALUES (
            :nome,
            :email,
            :password_hash,
            :regiao,
            :nivel_experiencia,
            1,
            NOW()
        )
    ';

    $insertStmt = $pdo->prepare($insertQuery);
    $insertStmt->execute([
        ':nome' => $nome,
        ':email' => $email,
        ':password_hash' => $passwordHash,
        ':regiao' => $regiao,
        ':nivel_experiencia' => $nivel,
    ]);

    $novoId = (int)$pdo->lastInsertId();

    // 9. Resposta de Sucesso (HTTP 201 Created)
    // Nunca devolver o password_hash na resposta!
    http_response_code(201);
    echo json_encode([
        'ok' => true,
        'message' => 'Utilizador registado com sucesso no servidor Hostinger!',
        'user' => [
            'id' => $novoId,
            'nome' => $nome,
            'email' => $email,
            'regiao' => $regiao,
            'nivel_experiencia' => $nivel,
            'data_registo' => date('c'),
        ],
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    // Código 23000 = Violação de Chave Única (Duplicate entry)
    if ($e->getCode() === '23000' || ($e->errorInfo[1] ?? 0) === 1062) {
        http_response_code(409);
        echo json_encode([
            'ok' => false,
            'error' => 'Este endereço de email já se encontra registado.',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Registo de erro no log do servidor Hostinger sem expor dados sensíveis ao cliente
    error_log('[HOSTINGER-REGISTER-ERROR] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Ocorreu um erro no servidor ao processar o registo. Tente novamente mais tarde.',
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('[HOSTINGER-GENERAL-ERROR] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Erro interno de processamento.',
    ], JSON_UNESCAPED_UNICODE);
}
