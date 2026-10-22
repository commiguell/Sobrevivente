import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./server/db.ts";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const isProduction = process.env.NODE_ENV === "production";
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.post("/api/auth/register", (req, res) => {
  try {
    const { name, email, password, region, experienceLevel } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        error: "Nome, email e palavra-passe s\xE3o campos obrigat\xF3rios."
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        error: "A palavra-passe deve ter pelo menos 6 caracteres."
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        ok: false,
        error: "Por favor introduza um endere\xE7o de email v\xE1lido."
      });
    }
    const user = db.createUser({
      name,
      email,
      password,
      region,
      experienceLevel
    });
    console.log(`[AUTH] Novo utilizador registado: ${user.name} (${user.email}) - Regi\xE3o: ${user.region}`);
    return res.status(201).json({
      ok: true,
      message: "Inscri\xE7\xE3o realizada com sucesso!",
      user
    });
  } catch (error) {
    console.error("[AUTH ERROR] Registo:", error.message);
    return res.status(400).json({
      ok: false,
      error: error.message || "Erro ao processar inscri\xE7\xE3o."
    });
  }
});
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        error: "Email e palavra-passe s\xE3o obrigat\xF3rios."
      });
    }
    const user = db.authenticate(email, password);
    if (!user) {
      return res.status(401).json({
        ok: false,
        error: "Credenciais inv\xE1lidas. Verifique o email e a palavra-passe."
      });
    }
    console.log(`[AUTH] Sess\xE3o iniciada: ${user.name} (${user.email})`);
    return res.json({
      ok: true,
      message: "Sess\xE3o iniciada com sucesso!",
      user
    });
  } catch (error) {
    console.error("[AUTH ERROR] Login:", error.message);
    return res.status(500).json({
      ok: false,
      error: "Erro no servidor ao autenticar utilizador."
    });
  }
});
app.get("/api/auth/stats", (req, res) => {
  const stats = db.getStats();
  return res.json({ ok: true, stats });
});
app.get("/api/health", (req, res) => {
  return res.json({ status: "ok", service: "sobrevivente-eu-api", timestamp: /* @__PURE__ */ new Date() });
});
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Sobrevivente.eu a correr em http://localhost:${PORT} (${isProduction ? "PROD" : "DEV"})`);
  });
}
startServer().catch((err) => {
  console.error("[SERVER CRASH]", err);
});
