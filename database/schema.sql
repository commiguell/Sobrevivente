-- ==============================================================================
-- SOBREVIVENTE.EU — SCRIPT SQL DE CRIAÇÃO DE BASE DE DADOS (HOSTINGER MYSQL)
-- Arquiteto de Software: Sobrevivente.eu Engineering
-- Compatibilidade: MySQL 5.7 / 8.0 / 8.4 e MariaDB 10.x (Hostinger hPanel / phpMyAdmin)
-- ==============================================================================

-- 1. Criação ou seleção da Base de Dados (caso não tenha sido criada no hPanel da Hostinger)
-- NOTA: No hPanel da Hostinger, a base de dados costuma ser criada previamente 
-- com prefixo (ex: u123456789_sobrevivente). Se já existir, comente esta linha:
-- CREATE DATABASE IF NOT EXISTS `u123456789_sobrevivente` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `u123456789_sobrevivente`;

-- 2. Tabela de Utilizadores (Estrutura Obrigatória + Campos de Terreno)
CREATE TABLE IF NOT EXISTS `utilizadores` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL COMMENT 'Nome completo ou alcunha do utilizador',
  `email` VARCHAR(191) NOT NULL COMMENT 'Email de acesso único (191 chars para índice utf8mb4 seguro)',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'Hash da palavra-passe gerada via BCRYPT ou ARGON2ID',
  `regiao` VARCHAR(100) NOT NULL DEFAULT 'Nacional' COMMENT 'Distrito ou Região Autónoma de Portugal',
  `nivel_experiencia` ENUM('Iniciante', 'Intermédio', 'Avançado') NOT NULL DEFAULT 'Iniciante' COMMENT 'Grau de autonomia em campo',
  `ativo` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Ativo, 0 = Suspenso',
  `email_verificado` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 = Pendente, 1 = Verificado',
  `data_registo` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora do registo original',
  `ultimo_login` TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp da última autenticação com sucesso',
  `atualizado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_utilizadores_email` (`email`),
  KEY `idx_utilizadores_regiao` (`regiao`),
  KEY `idx_utilizadores_data_registo` (`data_registo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registo seguro de membros da comunidade Sobrevivente.eu';

-- 3. Tabela de Registos de Acesso e Auditoria de Segurança (Opcional recomendado)
CREATE TABLE IF NOT EXISTS `logs_autenticacao` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `utilizador_id` INT UNSIGNED DEFAULT NULL,
  `email_tentativa` VARCHAR(191) NOT NULL,
  `ip_origem` VARCHAR(45) NOT NULL COMMENT 'IPv4 ou IPv6 do cliente',
  `sucesso` TINYINT(1) NOT NULL DEFAULT 0,
  `motivo_falha` VARCHAR(255) DEFAULT NULL,
  `data_tentativa` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_logs_utilizador` (`utilizador_id`),
  KEY `idx_logs_data` (`data_tentativa`),
  CONSTRAINT `fk_logs_utilizador` FOREIGN KEY (`utilizador_id`) REFERENCES `utilizadores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
