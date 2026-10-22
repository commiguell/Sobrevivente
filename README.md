# Sobrevivente.eu — Guia de Implementação na Hostinger

Este repositório contém a aplicação web completa da plataforma **Sobrevivente.eu**, desenvolvida em React + Vite + Tailwind CSS.

---

## ⚠️ Por que ocorreu a falha na Hostinger?

Os servidores web convencionais da Hostinger (hPanel / Apache / LiteSpeed) **não conseguem interpretar ficheiros TypeScript (.tsx) ou comandos Vite diretamente**. 

Se copiou os ficheiros de código-fonte (`src/`, `package.json`, `vite.config.ts`) diretamente para a pasta `public_html/` da Hostinger, o servidor tenta servir o `index.html` em bruto que tenta carregar `/src/main.tsx`, resultando em erro 404 ou página em branco.

---

## 🚀 Como Implementar com Sucesso na Hostinger

Escolha o método correspondente ao seu tipo de alojamento na Hostinger:

---

### Método 1: Alojamento Web Normal da Hostinger (Mais Rápido e Recomendado)
Se contratou o plano de hospedagem partilhada tradicional (Single, Premium ou Business Web Hosting):

1. **Gere a versão de produção (pasta `dist`):**
   No seu computador (ou através do terminal):
   ```bash
   npm install
   npm run build
   ```
   Isto cria a pasta `dist/` com todos os ficheiros otimizados (`index.html`, pasta `assets/` e o ficheiro `.htaccess`).

2. **Aceda ao hPanel da Hostinger:**
   - Entre na sua conta Hostinger e clique no seu domínio.
   - Abra o **Gestor de Ficheiros (File Manager)**.
   - Navegue até à pasta: `public_html`.
   - Se existirem ficheiros padrão da Hostinger (ex.: `default.php`), pode apagá-los.

3. **Copie os ficheiros:**
   - Envie **o conteúdo de dentro da pasta `dist/`** diretamente para dentro de `public_html/`.
   - A sua pasta `public_html/` deve ficar com esta estrutura:
     ```text
     public_html/
     ├── .htaccess          (garante rotas e cache sem erros 404)
     ├── index.html         (o ficheiro principal compilado)
     └── assets/            (ficheiros JavaScript, CSS e imagens)
     ```

4. **Pronto!** O site fica imediatamente ativo em `https://seusite.com`.

---

### Método 2: Usar Aplicação Node.js ou VPS na Hostinger
Se contratou um plano VPS ou ativou o recurso "Aplicação Node.js" no hPanel:

1. **Configuração da Aplicação no hPanel:**
   - **Node.js Version:** 20.x ou superior
   - **Application Root:** `/home/uXXXX/public_html` (ou a pasta do seu projeto)
   - **Application Startup File:** `server.js`

2. **No Terminal SSH da Hostinger:**
   ```bash
   npm install
   npm run build
   npm start
   ```
   O ficheiro `server.js` já está preparado para servir a pasta `dist` na porta atribuída pela Hostinger.

---

### Método 3: Envio Automático do GitHub para a Hostinger via FTP (GitHub Actions)
Se preferir que a Hostinger atualize automaticamente sempre que fizer um `git push` no GitHub, crie o ficheiro `.github/workflows/deploy.yml` com a ação FTP Deploy da Hostinger.
