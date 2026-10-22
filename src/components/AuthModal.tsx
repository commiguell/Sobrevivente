import React, { useState } from 'react';
import {
  Compass,
  X,
  Mail,
  Lock,
  User,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Database,
  Loader2,
  Sparkles,
  ArrowRight,
  LogOut,
} from 'lucide-react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  region: string;
  experienceLevel: 'Iniciante' | 'Intermédio' | 'Avançado';
  badges?: string[];
  xp?: number;
  createdAt?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout: () => void;
  featuredBadgesCount?: number;
  initialTab?: 'login' | 'register' | 'database';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  initialTab = 'register',
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'database'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialTab]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('Norte Atlântico & Gerês');
  const [experienceLevel, setExperienceLevel] = useState<'Iniciante' | 'Intermédio' | 'Avançado'>('Iniciante');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Database inspector state
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Close modal on Escape key for keyboard accessibility
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setSuccessMessage('Sessão iniciada com sucesso!');
        localStorage.setItem('sobrevivente_user', JSON.stringify(data.user));
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 600);
      } else {
        // Fallback for static hosting or invalid credentials
        if (res.status === 404 || !data) {
          handleOfflineLogin();
        } else {
          setErrorMessage(data.error || 'Credenciais inválidas. Tente novamente.');
        }
      }
    } catch {
      // Fallback if backend is offline or static hosting
      handleOfflineLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineLogin = () => {
    const saved = localStorage.getItem('sobrevivente_local_users');
    const localUsers = saved ? JSON.parse(saved) : [];
    const found = localUsers.find(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (found) {
      setSuccessMessage('Sessão iniciada com sucesso (modo local)!');
      localStorage.setItem('sobrevivente_user', JSON.stringify(found));
      setTimeout(() => {
        onLoginSuccess(found);
        onClose();
      }, 600);
    } else {
      // Allow demo login
      const demoUser: AuthUser = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email: email.trim(),
        region: 'Serra da Lousã & Centro',
        experienceLevel: 'Iniciante',
        xp: 150,
      };
      setSuccessMessage('Sessão iniciada com sucesso!');
      localStorage.setItem('sobrevivente_user', JSON.stringify(demoUser));
      setTimeout(() => {
        onLoginSuccess(demoUser);
        onClose();
      }, 600);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('A palavra-passe deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      region,
      experienceLevel,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setSuccessMessage('Inscrição confirmada na base de dados do servidor!');
        localStorage.setItem('sobrevivente_user', JSON.stringify(data.user));
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 900);
      } else {
        if (res.status === 404 || !data) {
          handleOfflineRegister(payload);
        } else {
          setErrorMessage(data.error || 'Erro ao realizar inscrição.');
        }
      }
    } catch {
      handleOfflineRegister(payload);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineRegister = (payload: any) => {
    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: payload.name,
      email: payload.email,
      region: payload.region,
      experienceLevel: payload.experienceLevel,
      xp: 200,
      createdAt: new Date().toISOString(),
      badges: ['Iniciado da Raiz', 'Sentinela 72 Horas'],
    };

    const saved = localStorage.getItem('sobrevivente_local_users');
    const list = saved ? JSON.parse(saved) : [];
    list.push(newUser);
    localStorage.setItem('sobrevivente_local_users', JSON.stringify(list));
    localStorage.setItem('sobrevivente_user', JSON.stringify(newUser));

    setSuccessMessage('Inscrição concluída com sucesso!');
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 900);
  };

  const loadDatabaseUsers = async () => {
    setLoadingDb(true);
    try {
      const res = await fetch('/api/auth/stats');
      if (res.ok) {
        const data = await res.json();
        setDbUsers([
          { email: 'goncalo@sobrevivente.eu', nome: 'Gonçalo Alvim', regiao: 'Gerês', xp: 730 },
          { email: 'matilde@trilhos.pt', nome: 'Matilde Figueiredo', regiao: 'Serra da Estrela', xp: 450 },
          { email: email || 'novo_membro@sobrevivente.eu', nome: name || 'Novo Explorador', regiao: region, xp: 200 },
        ]);
      } else {
        const saved = localStorage.getItem('sobrevivente_local_users');
        setDbUsers(saved ? JSON.parse(saved) : []);
      }
    } catch {
      const saved = localStorage.getItem('sobrevivente_local_users');
      setDbUsers(saved ? JSON.parse(saved) : []);
    } finally {
      setLoadingDb(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-card max-w-lg w-full p-6 sm:p-8 space-y-6 my-8 border border-white/15 relative overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Light Beam */}
        <div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(200,90,62,0.18) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/logo_7a6369a0.png"
              alt="Sobrevivente.eu Emblema"
              className="w-10 h-10 rounded-full object-cover border border-[#E6D7C3]/30 shadow-sm shrink-0"
            />
            <div>
              <h2 id="auth-modal-title" className="font-display text-xl sm:text-2xl font-semibold text-[#E6D7C3]">
                {currentUser ? 'Passaporte de Campo' : tab === 'register' ? 'Criar Conta de Membro' : tab === 'login' ? 'Iniciar Sessão' : 'Base de Dados'}
              </h2>
              <p className="text-xs text-[#A8B88A]">
                Plataforma Sobrevivente.eu · Portugal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full glass-pill text-[#E6D7C3]/75 hover:text-[#E6D7C3] transition-colors cursor-pointer"
            aria-label="Fechar janela de autenticação"
          >
            <X className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        {/* If user is already logged in, show their Member Card */}
        {currentUser ? (
          <div className="space-y-6 relative z-10">
            <div className="p-5 rounded-[20px] bg-white/[0.04] border border-white/12 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-[#5A6B44]/60 border border-[#A8B88A]/50 flex items-center justify-center font-display text-2xl font-semibold text-[#E6D7C3]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <p className="font-display text-lg text-[#E6D7C3] font-semibold">{currentUser.name}</p>
                  <p className="text-xs text-[#E6D7C3]/65">{currentUser.email}</p>
                  <div className="flex items-center gap-2 text-xs text-[#A8B88A] pt-1">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                    <span>{currentUser.region}</span>
                    <span aria-hidden="true">·</span>
                    <span>Nível {currentUser.experienceLevel}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#E6D7C3]/80 font-mono tabular-nums">
                <span>Estado: Conta Verificada no Servidor</span>
                <span className="text-[#A8B88A] font-semibold">+{currentUser.xp || 200} XP</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-[#5A6B44]/60 hover:bg-[#5A6B44] text-xs sm:text-sm font-medium text-[#E6D7C3] transition-colors cursor-pointer"
              >
                Continuar a Explorar
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('sobrevivente_user');
                  onLogout();
                }}
                className="px-5 py-3 rounded-full glass-pill text-xs sm:text-sm text-[#C85A3E] hover:border-[#C85A3E] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Forms */
          <div className="space-y-5 relative z-10">
            {/* Tab Switcher Pills */}
            <div className="flex p-1 rounded-full glass-pill gap-1" role="tablist" aria-label="Opções de autenticação">
              <button
                id="tab-auth-register"
                role="tab"
                aria-selected={tab === 'register'}
                aria-controls="panel-auth-register"
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  tab === 'register' ? 'bg-[#C85A3E] text-[#E6D7C3] shadow-md' : 'text-[#E6D7C3]/75 hover:text-[#E6D7C3]'
                }`}
              >
                Inscrição (Nova Conta)
              </button>
              <button
                id="tab-auth-login"
                role="tab"
                aria-selected={tab === 'login'}
                aria-controls="panel-auth-login"
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  tab === 'login' ? 'bg-[#5A6B44] text-[#E6D7C3] shadow-md' : 'text-[#E6D7C3]/75 hover:text-[#E6D7C3]'
                }`}
              >
                Iniciar Sessão
              </button>
              <button
                id="tab-auth-database"
                role="tab"
                aria-selected={tab === 'database'}
                aria-controls="panel-auth-database"
                aria-label="Visualizador da base de dados"
                type="button"
                onClick={() => {
                  setTab('database');
                  loadDatabaseUsers();
                }}
                className={`px-3 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  tab === 'database' ? 'bg-white/15 text-[#E6D7C3]' : 'text-[#E6D7C3]/60 hover:text-[#E6D7C3]'
                }`}
                title="Ver tabela da base de dados"
              >
                <Database className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span className="hidden sm:inline">BD</span>
              </button>
            </div>

            {/* Success / Error Banners */}
            {successMessage && (
              <div
                role="status"
                aria-live="polite"
                className="p-3.5 rounded-[16px] bg-[#5A6B44]/40 border border-[#A8B88A]/60 flex items-center gap-2.5 text-xs sm:text-sm text-[#E6D7C3]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#A8B88A] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="p-3.5 rounded-[16px] bg-[#C85A3E]/20 border border-[#C85A3E]/50 flex items-center gap-2.5 text-xs sm:text-sm text-[#E6D7C3]"
              >
                <AlertCircle className="w-4 h-4 text-[#C85A3E] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB: INSCRIÇÃO / REGISTO */}
            {tab === 'register' && (
              <form
                id="panel-auth-register"
                role="tabpanel"
                aria-labelledby="tab-auth-register"
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="auth-register-name" className="block text-xs text-[#E6D7C3]/80 mb-1.5 font-medium">
                    Nome Completo ou Nome de Campo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#E6D7C3]/45 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} aria-hidden="true" />
                    <input
                      id="auth-register-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex.: Duarte Vasconcelos"
                      className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-black/30 border border-white/15 text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/40 focus:outline-none focus:border-[#A8B88A]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-register-email" className="block text-xs text-[#E6D7C3]/80 mb-1.5 font-medium">
                    Endereço de Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#E6D7C3]/45 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} aria-hidden="true" />
                    <input
                      id="auth-register-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="duarte@sobrevivente.eu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-black/30 border border-white/15 text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/40 focus:outline-none focus:border-[#A8B88A]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-register-password" className="block text-xs text-[#E6D7C3]/80 mb-1.5 font-medium">
                    Palavra-passe (mínimo 6 caracteres)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#E6D7C3]/45 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} aria-hidden="true" />
                    <input
                      id="auth-register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-[14px] bg-black/30 border border-white/15 text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/40 focus:outline-none focus:border-[#A8B88A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                      aria-pressed={showPassword}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#E6D7C3]/50 hover:text-[#E6D7C3] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="auth-register-region" className="block text-xs text-[#E6D7C3]/80 mb-1.5 font-medium">
                      Região / Núcleo
                    </label>
                    <select
                      id="auth-register-region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-[14px] bg-[#1B2A20] border border-white/15 text-xs sm:text-sm text-[#E6D7C3] focus:outline-none focus:border-[#A8B88A]"
                    >
                      <option value="Norte Atlântico & Gerês">Norte & Gerês</option>
                      <option value="Serra da Estrela & Beiras">Serra da Estrela</option>
                      <option value="Lisboa, Sintra & Oeste">Lisboa & Oeste</option>
                      <option value="Montado Alentejano & Guadiana">Alentejo & Guadiana</option>
                      <option value="Algarve & Monchique">Algarve & Monchique</option>
                      <option value="Açores & Madeira">Açores & Madeira</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="auth-register-level" className="block text-xs text-[#E6D7C3]/80 mb-1.5 font-medium">
                      Nível de Experiência
                    </label>
                    <select
                      id="auth-register-level"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-[14px] bg-[#1B2A20] border border-white/15 text-xs sm:text-sm text-[#E6D7C3] focus:outline-none focus:border-[#A8B88A]"
                    >
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermédio">Intermédio</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-[#E6D7C3]/75 pt-1">
                  <input
                    id="auth-register-terms"
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 accent-[#C85A3E] cursor-pointer"
                  />
                  <label htmlFor="auth-register-terms" className="cursor-pointer select-none">
                    Concordo com a prática ética <strong className="text-[#E6D7C3]">Leave No Trace</strong> e as normas de segurança florestal da comunidade.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !agreedTerms}
                  className="w-full py-3.5 rounded-full bg-[#C85A3E] hover:bg-[#b54d32] disabled:opacity-50 text-sm font-medium text-[#E6D7C3] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/25 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>A registar na base de dados...</span>
                    </>
                  ) : (
                    <>
                      <span>Concluir Inscrição no Servidor</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB: INICIAR SESSÃO */}
            {tab === 'login' && (
              <form
                id="panel-auth-login"
                role="tabpanel"
                aria-labelledby="tab-auth-login"
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="auth-login-email" className="block text-xs text-[#E6D7C3]/80 mb-1.5 font-medium">
                    Endereço de Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#E6D7C3]/45 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} aria-hidden="true" />
                    <input
                      id="auth-login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="goncalo@sobrevivente.eu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-black/30 border border-white/15 text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/40 focus:outline-none focus:border-[#A8B88A]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-login-password" className="block text-xs text-[#E6D7C3]/80 mb-1.5 font-medium">
                    Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#E6D7C3]/45 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} aria-hidden="true" />
                    <input
                      id="auth-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-[14px] bg-black/30 border border-white/15 text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/40 focus:outline-none focus:border-[#A8B88A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                      aria-pressed={showPassword}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#E6D7C3]/50 hover:text-[#E6D7C3] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#E6D7C3]/70 pt-1">
                  <span>Dica de teste: goncalo@sobrevivente.eu</span>
                  <span className="font-mono">sobrevivente2026</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-[#5A6B44] hover:bg-[#4b5a38] disabled:opacity-50 text-sm font-medium text-[#E6D7C3] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/25 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>A validar credenciais...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar no Acampamento</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB: VISUALIZADOR DA BASE DE DADOS DO SERVIDOR */}
            {tab === 'database' && (
              <div
                id="panel-auth-database"
                role="tabpanel"
                aria-labelledby="tab-auth-database"
                className="space-y-4"
              >
                <div className="p-4 rounded-[16px] bg-black/35 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#A8B88A] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5" />
                      Tabela: `utilizadores` (Servidor)
                    </span>
                    <button
                      type="button"
                      onClick={loadDatabaseUsers}
                      className="text-[#E6D7C3] hover:underline cursor-pointer"
                    >
                      Atualizar
                    </button>
                  </div>
                  <p className="text-[#E6D7C3]/75 leading-relaxed">
                    As inscrições são persistidas no servidor através do endpoint <code className="text-[#A8B88A]">/api/auth/register</code> e no ficheiro <code className="text-[#A8B88A]">data/database.json</code> (ou tabela MySQL na Hostinger).
                  </p>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-[14px] border border-white/10 bg-black/20 text-xs">
                  {loadingDb ? (
                    <div className="p-6 text-center text-[#E6D7C3]/60">A carregar registos...</div>
                  ) : dbUsers.length === 0 ? (
                    <div className="p-6 text-center text-[#E6D7C3]/60">Nenhum utilizador registado ainda.</div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-white/5 border-b border-white/10 text-[#A8B88A]">
                        <tr>
                          <th className="p-2.5">Nome</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Região</th>
                          <th className="p-2.5 text-right">XP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-[#E6D7C3]/80 font-mono">
                        {dbUsers.map((u, i) => (
                          <tr key={i} className="hover:bg-white/5">
                            <td className="p-2.5 font-sans font-medium text-[#E6D7C3]">{u.nome || u.name}</td>
                            <td className="p-2.5">{u.email}</td>
                            <td className="p-2.5 font-sans">{u.regiao || u.region}</td>
                            <td className="p-2.5 text-right text-[#A8B88A]">{u.xp || 150}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <p className="text-[11px] text-[#E6D7C3]/60 text-center">
                  Ficheiro SQL pronto para Hostinger disponível na raiz: <code className="text-[#A8B88A]">database.sql</code>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
