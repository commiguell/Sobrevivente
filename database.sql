-- ====================================================================
-- SOBREVIVENTE.EU — ESQUEMA DE BASE DE DADOS MYSQL PARA HOSTINGER
-- Importável diretamente no phpMyAdmin (hPanel da Hostinger)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `sobrevivente_db` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `sobrevivente_db`;

-- 1. TABELA DE UTILIZADORES / INSCRIÇÕES
CREATE TABLE IF NOT EXISTS `utilizadores` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `nome` VARCHAR(120) NOT NULL,
  `email` VARCHAR(190) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `salt` VARCHAR(64) NOT NULL,
  `regiao` VARCHAR(100) DEFAULT 'Serra da Lousã & Centro',
  `nivel_experiencia` ENUM('Iniciante', 'Intermédio', 'Avançado') DEFAULT 'Iniciante',
  `xp` INT DEFAULT 150,
  `ativo` TINYINT(1) DEFAULT 1,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ultimo_login` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_regiao` (`regiao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA DE INSÍGNIAS E CONQUISTAS DO UTILIZADOR
CREATE TABLE IF NOT EXISTS `utilizadores_insignias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `utilizador_id` VARCHAR(64) NOT NULL,
  `badge_id` VARCHAR(64) NOT NULL,
  `badge_titulo` VARCHAR(100) NOT NULL,
  `desbloqueado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `em_destaque` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`utilizador_id`) REFERENCES `utilizadores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABELA DE INSCRIÇÕES EM SAÍDAS DE CAMPO E EVENTOS
CREATE TABLE IF NOT EXISTS `inscricoes_eventos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `utilizador_id` VARCHAR(64) NOT NULL,
  `evento_id` VARCHAR(64) NOT NULL,
  `evento_titulo` VARCHAR(200) NOT NULL,
  `data_inscricao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `estado` ENUM('Confirmado', 'Lista de Espera', 'Cancelado') DEFAULT 'Confirmado',
  FOREIGN KEY (`utilizador_id`) REFERENCES `utilizadores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. INSERÇÃO DE UTILIZADOR INICIAL (CONTA DE TESTE)
-- Palavra-passe padrão: sobrevivente2026
INSERT INTO `utilizadores` (`id`, `nome`, `email`, `password_hash`, `salt`, `regiao`, `nivel_experiencia`, `xp`)
VALUES (
  'usr_admin_default',
  'Gonçalo Alvim',
  'goncalo@sobrevivente.eu',
  '4c7e6c4e1320efdfb95e347ad61d31df6887a07ea2bc20e2ef24bdf887d1df1846b0a1d488e1467df2146f254b032d1840003b14fa35e69888998daff26ef9f3',
  'salt_seed_123',
  'Norte Atlântico & Gerês',
  'Avançado',
  730
) ON DUPLICATE KEY UPDATE `nome` = VALUES(`nome`);
