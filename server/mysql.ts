/**
 * SOBREVIVENTE.EU — CONEXÃO SEGURA MYSQL (HOSTINGER SERVER)
 * 
 * Arquiteto de Software: Sobrevivente.eu Engineering
 * Padrão: Connection Pool com Prepared Statements e Encriptação Bcrypt
 * Segurança: Credenciais exclusivamente via variáveis de ambiente (.env)
 */

import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Interface do Registo de Utilizador na Base de Dados
export interface DbUserRecord {
  id: number;
  nome: string;
  email: string;
  password_hash: string;
  regiao: string;
  nivel_experiencia: 'Iniciante' | 'Intermédio' | 'Avançado';
  ativo: number;
  data_registo: string;
  ultimo_login: string | null;
}

// Configuração lida de forma segura a partir do .env
const DB_HOST = process.env.DB_HOST || '';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || '';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || '';
const DB_SSL = process.env.DB_SSL === 'true';

// Verifica se as variáveis de MySQL estão configuradas
export const isMySqlConfigured = Boolean(DB_HOST && DB_USER && DB_NAME);

let pool: Pool | null = null;

/**
 * Obtém ou inicializa a pool de ligações MySQL.
 * Configurada com timeouts rígidos e reciclagem de conexões para a infraestrutura Hostinger.
 */
export function getMySqlPool(): Pool {
  if (pool) {
    return pool;
  }

  if (!isMySqlConfigured) {
    throw new Error(
      'MySQL Hostinger não configurado. Defina DB_HOST, DB_USER, DB_PASSWORD e DB_NAME no ficheiro .env'
    );
  }

  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    charset: 'utf8mb4',
    ssl: DB_SSL ? { rejectUnauthorized: false } : undefined,
  });

  return pool;
}

/**
 * Testa a integridade da ligação ao servidor MySQL da Hostinger.
 */
export async function testMySqlConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isMySqlConfigured) {
    return {
      ok: false,
      message: 'Base de dados MySQL não configurada. A usar armazenamento local para desenvolvimento.',
    };
  }

  try {
    const currentPool = getMySqlPool();
    const connection: PoolConnection = await currentPool.getConnection();
    await connection.ping();
    connection.release();
    return {
      ok: true,
      message: `Conectado com sucesso à base de dados MySQL '${DB_NAME}' na Hostinger (${DB_HOST}).`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[MYSQL-HOSTINGER ERROR] Falha na conexão:', errorMsg);
    return {
      ok: false,
      message: `Erro ao conectar ao MySQL da Hostinger: ${errorMsg}`,
    };
  }
}

/**
 * Sanitiza campos de texto genéricos contra XSS e injeção
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres perigosos de tags
    .slice(0, 150);
}

/**
 * Validação rigorosa de Email segundo RFC 5322
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

/**
 * Regista um novo utilizador na base de dados MySQL da Hostinger.
 * REQUISITOS OBRIGATÓRIOS:
 * 1. Sanitização estrita de inputs
 * 2. Encriptação forte com Bcrypt (salt rounds = 12)
 * 3. Utilização estrita de Prepared Statements
 */
export async function registerUserInHostingerMySql(data: {
  nome: string;
  email: string;
  password: string;
  regiao?: string;
  nivelExperiencia?: 'Iniciante' | 'Intermédio' | 'Avançado';
}): Promise<{
  id: number;
  nome: string;
  email: string;
  regiao: string;
  nivelExperiencia: string;
  dataRegisto: string;
}> {
  // 1. Sanitização dos inputs
  const nomeSanitizado = sanitizeString(data.nome);
  const emailSanitizado = data.email.trim().toLowerCase();
  const regiaoSanitizada = sanitizeString(data.regiao || 'Nacional');
  const nivelSanitizado = ['Iniciante', 'Intermédio', 'Avançado'].includes(data.nivelExperiencia || '')
    ? (data.nivelExperiencia as 'Iniciante' | 'Intermédio' | 'Avançado')
    : 'Iniciante';

  // Validações de negócio
  if (!nomeSanitizado || nomeSanitizado.length < 2) {
    throw new Error('O nome é obrigatório e deve ter pelo menos 2 caracteres.');
  }

  if (!isValidEmail(emailSanitizado)) {
    throw new Error('Por favor introduza um endereço de email válido.');
  }

  if (!data.password || data.password.length < 6) {
    throw new Error('A palavra-passe deve conter no mínimo 6 caracteres.');
  }

  const currentPool = getMySqlPool();

  // 2. PREPARED STATEMENT 1: Verificar se o email já existe
  const checkSql = 'SELECT id FROM utilizadores WHERE email = ? LIMIT 1';
  const [existingRows] = await currentPool.execute<RowDataPacket[]>(checkSql, [emailSanitizado]);

  if (existingRows.length > 0) {
    throw new Error('Este endereço de email já se encontra registado na comunidade.');
  }

  // 3. Encriptação forte da password com Bcrypt (12 salt rounds)
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(data.password, salt);

  // 4. PREPARED STATEMENT 2: Inserção segura dos dados
  const insertSql = `
    INSERT INTO utilizadores (
      nome,
      email,
      password_hash,
      regiao,
      nivel_experiencia,
      ativo,
      data_registo
    ) VALUES (?, ?, ?, ?, ?, 1, NOW())
  `;

  const [result] = await currentPool.execute<ResultSetHeader>(insertSql, [
    nomeSanitizado,
    emailSanitizado,
    passwordHash,
    regiaoSanitizada,
    nivelSanitizado,
  ]);

  const newUserId = result.insertId;

  // 5. Retorna os dados seguros (sem hash)
  return {
    id: newUserId,
    nome: nomeSanitizado,
    email: emailSanitizado,
    regiao: regiaoSanitizada,
    nivelExperiencia: nivelSanitizado,
    dataRegisto: new Date().toISOString(),
  };
}
