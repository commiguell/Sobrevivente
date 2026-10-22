# SOBREVIVENTE.EU — GUIA DE ARQUITETURA & DEPLOY HOSTINGER

**Função:** Arquiteto de Software Sénior  
**Projeto:** Sobrevivente.eu  
**Infraestrutura Alvo:** Servidor Hostinger (hPanel / MySQL / Apache / LiteSpeed / Node.js)

---

## 1. Visão Geral da Arquitetura

O sistema de registo de utilizadores foi concebido com base nas melhores práticas da indústria (OWASP Top 10), garantindo:

1. **Prevenção Total de SQL Injection:** Utilização obrigatória de *Prepared Statements* nativos em todas as consultas SQL, separando a estrutura da query dos dados do utilizador.
2. **Encriptação Robusta de Palavras-passe:** Aplicação do algoritmo **Bcrypt com fator de custo 12** (`PASSWORD_BCRYPT`), resistente a ataques de dicionário e GPU brute-force.
3. **Isolamento de Credenciais:** Nenhuma palavra-passe ou utilizador de base de dados está em código aberto. Todas as credenciais são injetadas exclusivamente através do ficheiro `.env` ou variáveis de ambiente de produção.
4. **Sanitização Rigorosa de Dados:** Filtragem e validação com RFC 5322 para emails e remoção de caracteres de controlo para proteção XSS.
5. **Compatibilidade Dupla na Hostinger:**
   - **Stack Node.js (Express + mysql2/promise):** Para instâncias Node.js ou Hostinger VPS (`server.ts` / `server/mysql.ts`).
   - **Stack PHP 8.x (PDO nativo):** Para alojamento partilhado padrão da Hostinger Web Hosting (`api-hostinger/register.php`).

---

## 2. Estrutura Padrão de Ficheiros no Repositório

```text
├── database/
│   └── schema.sql                # Script DDL de criação da tabela 'utilizadores'
│
├── server/
│   ├── mysql.ts                  # Conexão Pool MySQL + Prepared Statements + Bcrypt (Node.js)
│   └── db.ts                     # Fallback local em JSON para desenvolvimento isolado
│
├── api-hostinger/                # Backend alternativo em PHP 8.x para alojamento partilhado
│   ├── .htaccess                 # Bloqueio de segurança a ficheiros .env e cabeçalhos HTTP
│   ├── config/
│   │   └── database.php          # Singleton PDO com EMULATE_PREPARES=false e .env loader
│   └── register.php              # Endpoint REST POST com sanitização, bcrypt e prepared statement
│
├── .github/
│   └── workflows/
│       └── deploy-hostinger.yml  # Pipeline de CI/CD para deploy automático após push para 'main'
│
├── server.ts                     # Servidor Express com rota POST /api/auth/register integrada
├── .env.example                  # Template documentado de variáveis de ambiente
└── HOSTINGER_DEPLOYMENT_GUIDE.md # Este documento de arquitetura
```

---

## 3. Passo a Passo de Implementação na Hostinger

### Passo 1: Criar a Base de Dados no hPanel da Hostinger
1. Aceda ao painel da Hostinger (**hPanel**).
2. Navegue até **Bases de Dados** -> **Bases de Dados MySQL**.
3. Crie uma nova base de dados:
   - **Nome da Base de Dados:** ex: `u123456789_sobrevivente`
   - **Nome de Utilizador:** ex: `u123456789_admin`
   - **Palavra-passe:** Defina uma palavra-passe forte (com símbolos, números e letras maiúsculas).
4. Guarde estes três valores.

### Passo 2: Executar o Script SQL no phpMyAdmin
1. No hPanel, junto à base de dados criada, clique no botão **Entrar no phpMyAdmin**.
2. No menu superior do phpMyAdmin, clique no separador **SQL**.
3. Copie e cole todo o conteúdo do ficheiro `database/schema.sql`.
4. Clique em **Executar** (ou *Go*).
5. A tabela `utilizadores` será criada com a estrutura otimizada `InnoDB`, conjunto de caracteres `utf8mb4` e índice único no campo `email`.

### Passo 3: Configurar o Ficheiro `.env` no Servidor da Hostinger
No servidor de produção (através do Gestor de Ficheiros da Hostinger ou SSH), crie um ficheiro `.env` no diretório raiz da aplicação com as credenciais reais:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u123456789_sobrevivente
DB_USER=u123456789_admin
DB_PASSWORD=A_Sua_Password_Segura_Criada_No_hPanel
DB_SSL=false
NODE_ENV=production
```

> **Atenção de Segurança:** O ficheiro `.env` nunca deve ser adicionado ao controlo de versões do Git (está devidamente listado no `.gitignore`).

---

## 4. Escolha do Ambiente de Execução na Hostinger

### Opção A: Execução em Node.js (Hostinger Cloud / VPS / Gestor Node.js)
1. O backend em Node.js utiliza o módulo `server/mysql.ts` via `mysql2/promise`.
2. O endpoint `/api/auth/register` processa a validação:
   - Valida se `email`, `nome` e `password` cumprem as regras de integridade;
   - Executa a query preparada: `SELECT id FROM utilizadores WHERE email = ?`;
   - Encripta a palavra-passe com `bcrypt.hash(password, 12)`;
   - Executa a inserção preparada: `INSERT INTO utilizadores (...) VALUES (?, ?, ?, ?, ?, 1, NOW())`;
   - Retorna o utilizador criado com código HTTP `201 Created`.

### Opção B: Execução em PHP 8.x (Hostinger Alojamento Web Partilhado)
1. Se o seu plano for o Web Hosting tradicional sem suporte a daemons Node.js contínuos:
2. Copie a pasta `api-hostinger/` para o diretório web (ex: `public_html/api/`):
   - Ficheiro de conexão: `public_html/api/config/database.php`
   - Endpoint de registo: `public_html/api/register.php`
3. O endpoint recebe requisições `POST` em formato JSON e responde com o mesmo payload da API Node.js.

---

## 5. Pipeline de Deploy Automático via GitHub Actions

O repositório já inclui o ficheiro `.github/workflows/deploy-hostinger.yml`.

### Como ativar no GitHub:
1. No seu repositório GitHub, vá a **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
2. Adicione as seguintes credenciais fornecidas pela Hostinger (disponíveis em *Acesso FTP* no hPanel):
   - `HOSTINGER_FTP_SERVER`: ex: `ftp.oseudominio.com` ou IP do servidor.
   - `HOSTINGER_FTP_USERNAME`: o seu utilizador FTP.
   - `HOSTINGER_FTP_PASSWORD`: a sua password FTP.
   - `HOSTINGER_FTP_REMOTE_DIR`: pasta de destino, normalmente `public_html/`.

A cada `git push` para o ramo `main`, o GitHub Actions irá:
1. Executar os testes e linter (`npm run lint`).
2. Compilar o frontend e backend otimizado (`npm run build`).
3. Enviar automaticamente os ficheiros compilados para o servidor da Hostinger.

---

## 6. Teste de Validação Técnica (cURL)

Pode validar o funcionamento do registo através do terminal ou Postman:

```bash
curl -X POST https://www.sobrevivente.eu/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tiago Ferreira",
    "email": "tiago.ferreira@exemplo.pt",
    "password": "SenhaUltraSegura2026!",
    "region": "Guarda",
    "experienceLevel": "Intermédio"
  }'
```

### Resposta de Sucesso Esperada (HTTP 201 Created):
```json
{
  "ok": true,
  "message": "Inscrição realizada com sucesso no servidor Hostinger (MySQL)!",
  "user": {
    "id": "mysql_1",
    "name": "Tiago Ferreira",
    "email": "tiago.ferreira@exemplo.pt",
    "region": "Guarda",
    "experienceLevel": "Intermédio",
    "createdAt": "2026-10-22T13:45:00.000Z",
    "badges": ["Membro Fundador"],
    "xp": 100
  }
}
```

Em caso de tentativa com email duplicado, o sistema responderá com código **HTTP 409 Conflict**:
```json
{
  "ok": false,
  "error": "Este endereço de email já se encontra registado na comunidade."
}
```
