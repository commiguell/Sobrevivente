import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.ts';
import {
  isMySqlConfigured,
  testMySqlConnection,
  registerUserInHostingerMySql,
} from './server/mysql.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Parse JSON request bodies
app.use(express.json());

// CORS headers for development flexibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// 0. API: Verificação de Estado MySQL Hostinger
// ==========================================
app.get('/api/database/status', async (req, res) => {
  const status = await testMySqlConnection();
  return res.json({
    isMySqlConfigured,
    ...status,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 1. API: Registo de Novo Utilizador (MySQL Hostinger / Fallback)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, region, experienceLevel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Nome, email e palavra-passe são campos obrigatórios.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        error: 'A palavra-passe deve ter pelo menos 6 caracteres.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        ok: false,
        error: 'Por favor introduza um endereço de email válido.',
      });
    }

    // Se a base de dados MySQL da Hostinger estiver configurada no .env:
    if (isMySqlConfigured) {
      const mysqlUser = await registerUserInHostingerMySql({
        nome: name,
        email,
        password,
        regiao: region,
        nivelExperiencia: experienceLevel,
      });

      console.log(
        `[AUTH-MYSQL-HOSTINGER] Novo utilizador registado na BD: ${mysqlUser.nome} (${mysqlUser.email})`
      );

      return res.status(201).json({
        ok: true,
        message: 'Inscrição realizada com sucesso no servidor Hostinger (MySQL)!',
        user: {
          id: `mysql_${mysqlUser.id}`,
          name: mysqlUser.nome,
          email: mysqlUser.email,
          region: mysqlUser.regiao,
          experienceLevel: mysqlUser.nivelExperiencia,
          createdAt: mysqlUser.dataRegisto,
          badges: ['Membro Fundador'],
          xp: 100,
        },
      });
    }

    // Fallback para ambiente local de desenvolvimento sem MySQL Hostinger ativo:
    const user = db.createUser({
      name,
      email,
      password,
      region,
      experienceLevel,
    });

    console.log(`[AUTH-LOCAL] Novo utilizador registado: ${user.name} (${user.email}) - Região: ${user.region}`);

    return res.status(201).json({
      ok: true,
      message: 'Inscrição realizada com sucesso!',
      user,
    });
  } catch (error: any) {
    console.error('[AUTH ERROR] Registo:', error.message);
    return res.status(400).json({
      ok: false,
      error: error.message || 'Erro ao processar inscrição.',
    });
  }
});

// ==========================================
// 2. API: Login / Iniciar Sessão
// ==========================================
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Email e palavra-passe são obrigatórios.',
      });
    }

    const user = db.authenticate(email, password);
    if (!user) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciais inválidas. Verifique o email e a palavra-passe.',
      });
    }

    console.log(`[AUTH] Sessão iniciada: ${user.name} (${user.email})`);

    return res.json({
      ok: true,
      message: 'Sessão iniciada com sucesso!',
      user,
    });
  } catch (error: any) {
    console.error('[AUTH ERROR] Login:', error.message);
    return res.status(500).json({
      ok: false,
      error: 'Erro no servidor ao autenticar utilizador.',
    });
  }
});

// ==========================================
// 3. API: Estatísticas e Lista de Membros
// ==========================================
app.get('/api/auth/stats', (req, res) => {
  const stats = db.getStats();
  return res.json({ ok: true, stats });
});

app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok', service: 'sobrevivente-eu-api', timestamp: new Date() });
});

// ==========================================
// Servir Frontend (Vite middleware no dev / dist em prod)
// ==========================================
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Sobrevivente.eu a correr em http://localhost:${PORT} (${isProduction ? 'PROD' : 'DEV'})`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER CRASH]', err);
});
