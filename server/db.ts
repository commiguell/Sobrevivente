import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  region: string;
  experienceLevel: 'Iniciante' | 'Intermédio' | 'Avançado';
  createdAt: string;
  lastLoginAt: string;
  badges: string[];
  xp: number;
}

export interface DatabaseSchema {
  users: UserRecord[];
  meta: {
    version: string;
    updatedAt: string;
    totalRegistered: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure database directory and file exist
function ensureDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      users: [
        {
          id: 'usr_admin_default',
          name: 'Gonçalo Alvim',
          email: 'goncalo@sobrevivente.eu',
          passwordHash: hashPassword('sobrevivente2026', 'salt_seed_123'),
          salt: 'salt_seed_123',
          region: 'Norte Atlântico & Gerês',
          experienceLevel: 'Avançado',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          badges: ['Especialista em Nós', 'Explorador de 100km', 'Guardião da Água'],
          xp: 730,
        },
      ],
      meta: {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        totalRegistered: 1,
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DatabaseSchema;
  } catch (err) {
    console.error('Error reading database file, resetting:', err);
    const fallback: DatabaseSchema = {
      users: [],
      meta: {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        totalRegistered: 0,
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveDatabase(db: DatabaseSchema) {
  db.meta.updatedAt = new Date().toISOString();
  db.meta.totalRegistered = db.users.length;
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export const db = {
  findUserByEmail(email: string): UserRecord | undefined {
    const data = ensureDatabase();
    return data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  findUserById(id: string): UserRecord | undefined {
    const data = ensureDatabase();
    return data.users.find((u) => u.id === id);
  },

  createUser(payload: {
    name: string;
    email: string;
    password: string;
    region?: string;
    experienceLevel?: 'Iniciante' | 'Intermédio' | 'Avançado';
  }): Omit<UserRecord, 'passwordHash' | 'salt'> {
    const data = ensureDatabase();
    const existing = data.users.find(
      (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase()
    );

    if (existing) {
      throw new Error('Já existe uma conta com este endereço de email.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(payload.password, salt);

    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      passwordHash,
      salt,
      region: payload.region || 'Serra da Lousã & Centro',
      experienceLevel: payload.experienceLevel || 'Iniciante',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      badges: ['Iniciado da Raiz', 'Sentinela 72 Horas'],
      xp: 150,
    };

    data.users.push(newUser);
    saveDatabase(data);

    // Return safe user record without credentials
    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    return safeUser;
  },

  authenticate(
    email: string,
    password: string
  ): Omit<UserRecord, 'passwordHash' | 'salt'> | null {
    const data = ensureDatabase();
    const user = data.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      return null;
    }

    const computed = hashPassword(password, user.salt);
    if (computed !== user.passwordHash) {
      return null;
    }

    user.lastLoginAt = new Date().toISOString();
    saveDatabase(data);

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return safeUser;
  },

  getAllUsers(): Omit<UserRecord, 'passwordHash' | 'salt'>[] {
    const data = ensureDatabase();
    return data.users.map(({ passwordHash: _, salt: __, ...safeUser }) => safeUser);
  },

  getStats() {
    const data = ensureDatabase();
    return {
      totalUsers: data.users.length,
      lastUpdated: data.meta.updatedAt,
    };
  },
};
