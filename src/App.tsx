import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Droplets,
  Flame,
  Tent,
  Navigation,
  Radio,
  Users,
  MessageSquare,
  ShieldAlert,
  MapPin,
  ArrowRight,
  BookOpen,
  Search,
  X,
  ChevronRight,
  Download,
  Check,
  AlertTriangle,
  Menu,
  Shield,
  FileText,
  Thermometer,
  Wind,
  PhoneCall,
  UserCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  FEATURED_MANUALS,
  INITIAL_GROUPS,
  INITIAL_FORUM_QUESTIONS,
  ManualItem,
} from './data/raizData';
import { BushcraftIllustration } from './components/BotanicalIllustrations';
import { AuthModal, AuthUser } from './components/AuthModal';

type PillarType = 'manuais' | 'informacoes' | 'grupos' | 'foruns' | 'pessoas';

interface PillarRevealCardProps {
  id: string;
  delayMs?: number;
  className?: string;
  children: React.ReactNode;
}

function PillarRevealCard({ id, delayMs = 0, className = '', children }: PillarRevealCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      id={id}
      style={{
        transitionDelay: `${delayMs}ms`,
      }}
      className={`pillar-card-anim ${revealed ? 'pillar-revealed' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export default function App() {
  // Modal & Navigation States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register' | 'database'>('register');
  const [loggedUser, setLoggedUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('sobrevivente_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePillarModal, setActivePillarModal] = useState<PillarType | null>(null);
  const [selectedManualDetail, setSelectedManualDetail] = useState<ManualItem | null>(null);

  // Interactive Live Info State (District Fire Risk Simulator)
  const [selectedDistrict, setSelectedDistrict] = useState<'Braga' | 'Guarda' | 'Castelo Branco' | 'Santarém' | 'Faro'>('Guarda');

  // Interactive Member Finder Filter
  const [memberRegionFilter, setMemberRegionFilter] = useState<string>('Todas');

  // Prevent background scroll when any modal is open
  useEffect(() => {
    const isModalActive = authModalOpen || activePillarModal !== null || selectedManualDetail !== null;
    const prevOverflow = document.body.style.overflow;
    if (isModalActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prevOverflow;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [authModalOpen, activePillarModal, selectedManualDetail]);

  // Handle ESC key to close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedManualDetail) {
          setSelectedManualDetail(null);
        } else if (activePillarModal) {
          setActivePillarModal(null);
        } else if (authModalOpen) {
          setAuthModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedManualDetail, activePillarModal, authModalOpen]);

  // Export a manual as offline text file
  const handleDownloadManualTxt = (manual: ManualItem) => {
    const lines = [
      `SOBREVIVENTE.EU — MANUAL DE CAMPO: ${manual.title.toUpperCase()}`,
      `Subtítulo: ${manual.subtitle}`,
      `Categoria: ${manual.categoryLabel} | Nível: ${manual.level} | Leitura: ${manual.readTime}`,
      `Autor / Validador: ${manual.author}`,
      '----------------------------------------------------------------',
      'RESUMO:',
      manual.summary,
      '',
      'MATERIAIS E FERRAMENTAS NECESSÁRIAS:',
      ...manual.materials.map((m) => `• ${m}`),
      '',
      'PASSO A PASSO TÉCNICO:',
      ...manual.steps.map((s, idx) => `${idx + 1}. ${s.title}\n   ${s.detail}\n`),
      'AVISO DE SEGURANÇA E LEGISLAÇÃO:',
      manual.fieldNote,
      '',
      'Documento fornecido pela comunidade Sobrevivente.eu — Uso cívico e educacional.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manual-${manual.id}-sobrevivente.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // District Fire Risk Data
  const districtRiskData: Record<
    'Braga' | 'Guarda' | 'Castelo Branco' | 'Santarém' | 'Faro',
    {
      level: 'Reduzido' | 'Moderado' | 'Elevado' | 'Muito Elevado' | 'Máximo';
      color: string;
      temp: string;
      humidity: string;
      wind: string;
      fireAlert: string;
      icnfNotice: string;
    }
  > = {
    Braga: {
      level: 'Moderado',
      color: '#A8B88A',
      temp: '18°C',
      humidity: '68%',
      wind: '14 km/h NW',
      fireAlert: 'Vigilância habitual em zonas de mato no PNPG (Gerês).',
      icnfNotice: 'Queimas autorizadas mediante registo obrigatório na plataforma do ICNF.',
    },
    Guarda: {
      level: 'Muito Elevado',
      color: '#C85A3E',
      temp: '29°C',
      humidity: '24%',
      wind: '28 km/h E (Rajadas)',
      fireAlert: 'Aviso Laranja: Proibição total de queimas e fogueiras em toda a Serra da Estrela.',
      icnfNotice: 'Pernoita restrita a parques de campismo homologados. Acesso a trilhos condicionado.',
    },
    'Castelo Branco': {
      level: 'Máximo',
      color: '#E0533C',
      temp: '33°C',
      humidity: '18%',
      wind: '32 km/h NE',
      fireAlert: 'Alerta Vermelho ANEPC: Tolerância zero para equipamentos com fagulhas e fogueiras.',
      icnfNotice: 'Circulação proibida em caminhos florestais não pavimentados durante o período crítico.',
    },
    Santarém: {
      level: 'Elevado',
      color: '#D4A359',
      temp: '27°C',
      humidity: '38%',
      wind: '18 km/h W',
      fireAlert: 'Atenção aos pinhais litorais e lezírias com biomassa seca.',
      icnfNotice: 'Consulte a junta de freguesia antes de qualquer trabalho rural motorizado.',
    },
    Faro: {
      level: 'Muito Elevado',
      color: '#C85A3E',
      temp: '31°C',
      humidity: '22%',
      wind: '22 km/h SE',
      fireAlert: 'Monchique e Serra do Caldeirão em patrulhamento preventivo permanente.',
      icnfNotice: 'Fontes naturais de montanha com caudal reduzido — garanta filtragem e autonomia hídrica.',
    },
  };

  // Sample community members for Pillar 5
  const communityMembers = [
    {
      name: 'Gonçalo Tavares',
      district: 'Braga',
      focus: 'Bushcraft & Navegação de Montanha',
      exp: 'Avançado',
      badge: 'Guia de Campo',
    },
    {
      name: 'Sofia Henriques',
      district: 'Guarda',
      focus: 'Botânica Autóctone & Primeiros Socorros',
      exp: 'Intermédio',
      badge: 'Fitoterapia Rural',
    },
    {
      name: 'Tiago Resende',
      district: 'Sintra / Lisboa',
      focus: 'Comunicações Rádio PMR446 & DIY',
      exp: 'Avançado',
      badge: 'Operador Rádio',
    },
    {
      name: 'Duarte Seixas',
      district: 'Castelo Branco',
      focus: 'Construção de Abrigos & Tratamento de Água',
      exp: 'Intermédio',
      badge: 'Pioneirismo Florestal',
    },
    {
      name: 'Marta Figueira',
      district: 'Faro',
      focus: 'Gestão Hídrica & Sobrevivência Costeira',
      exp: 'Avançado',
      badge: 'Guia do Litoral',
    },
    {
      name: 'Nuno Carvalheiro',
      district: 'Porto',
      focus: 'Logística de Emergência & Mochila 72h',
      exp: 'Intermédio',
      badge: 'Resiliência Urbana',
    },
  ];

  const filteredMembers =
    memberRegionFilter === 'Todas'
      ? communityMembers
      : communityMembers.filter((m) => m.district.toLowerCase().includes(memberRegionFilter.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#16271c] text-[#E6D7C3] antialiased selection:bg-[#C85A3E]/30 selection:text-[#E6D7C3] flex flex-col relative overflow-x-hidden">
      {/* Background Studio Lighting mimicking reference image */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 65% 20%, rgba(42, 75, 52, 0.55) 0%, rgba(22, 39, 28, 0.95) 60%, #101c14 100%)',
        }}
      />

      {/* Accessible Skip Link */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#E6D7C3] focus:text-[#16271c] focus:rounded-md focus:font-semibold focus:shadow-xl"
      >
        Saltar para o conteúdo principal
      </a>

      {/* =====================================================================
          1. HEADER / TOP NAVIGATION (Clean Luxury 3-Zone Contract)
         ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#16271c]/90 backdrop-blur-md border-b border-white/10 transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-6">
          {/* Zone 1: Logo & Brand Lockup */}
          <a
            href="#inicio"
            className="flex items-center gap-3.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8B88A] rounded-lg p-1"
            aria-label="Sobrevivente.eu — Início"
          >
            <img
              src="/assets/aistudio/logo_7a6369a0.png"
              alt="Sobrevivente.eu Logótipo"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-semibold text-[#E6D7C3] tracking-wide">
                Sobrevivente<span className="text-[#A8B88A]">.eu</span>
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links to Pillars */}
          <nav
            aria-label="Navegação da comunidade"
            className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#E6D7C3]/80"
          >
            <a
              href="#manuais"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Manuais
            </a>
            <a
              href="#informacoes"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Informações Úteis
            </a>
            <a
              href="#grupos"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Grupos
            </a>
            <a
              href="#foruns"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Fóruns
            </a>
            <a
              href="#pessoas"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Encontrar Pessoas
            </a>
          </nav>

          {/* Zone 3: Quick Action / Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            {loggedUser ? (
              <button
                onClick={() => {
                  setAuthInitialTab('database');
                  setAuthModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-medium bg-[#A8B88A]/20 text-[#E6D7C3] border border-[#A8B88A]/40 rounded-full hover:bg-[#A8B88A]/35 transition-colors flex items-center gap-2"
                aria-label={`Conta de ${loggedUser.name}`}
              >
                <span className="w-2 h-2 rounded-full bg-[#A8B88A]" />
                <span className="truncate max-w-[120px]">{loggedUser.name}</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2.5">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthInitialTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-medium text-[#E6D7C3]/90 hover:text-white transition-colors whitespace-nowrap"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthInitialTab('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-medium bg-[#E6D7C3] text-[#16271c] rounded-full hover:bg-white transition-colors whitespace-nowrap font-sans font-semibold"
                >
                  Inscrever-se
                </a>
              </div>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#E6D7C3] hover:bg-white/5 border border-white/10 transition-colors"
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#132117] border-b border-white/10 px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-[#E6D7C3]/90">
              <a
                href="#manuais"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors"
              >
                Manuais Práticos
              </a>
              <a
                href="#informacoes"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors"
              >
                Informações Úteis Actualizadas
              </a>
              <a
                href="#grupos"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors"
              >
                Grupos & Núcleos
              </a>
              <a
                href="#foruns"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors"
              >
                Fóruns de Discussão
              </a>
              <a
                href="#pessoas"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-[#A8B88A] transition-colors"
              >
                Encontrar Outras Pessoas
              </a>
            </nav>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <a
                href="https://www.sobrevivente.eu/entrar"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  setAuthInitialTab('login');
                  setAuthModalOpen(true);
                }}
                className="w-full text-center py-2.5 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] text-sm font-medium hover:bg-white/5"
              >
                Entrar
              </a>
              <a
                href="https://www.sobrevivente.eu/inscrever"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  setAuthInitialTab('register');
                  setAuthModalOpen(true);
                }}
                className="w-full text-center py-2.5 rounded-full bg-[#E6D7C3] text-[#16271c] text-sm font-semibold hover:bg-white"
              >
                Inscrever-se
              </a>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          MAIN CONTENT
         ===================================================================== */}
      <main id="conteudo-principal" tabIndex={-1} className="relative z-10 flex-1 outline-none">
        {/* ===================================================================
            HERO SECTION: Minimalist Luxury, 3-phrase headline & Pedestal
           =================================================================== */}
        <section
          id="inicio"
          className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
        >
          {/* Left Column: Phrasing, Editorial Subtitle, Exact 2 Buttons */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            <span className="text-xs sm:text-sm tracking-widest uppercase text-[#A8B88A]/90 font-medium">
              Comunidade de Resiliência & Autonomia · Portugal
            </span>

            {/* Exact phrases in separate lines, original colors & format */}
            <h1
              className="font-display font-semibold tracking-tight leading-[1.08]"
              style={{ fontSize: 'clamp(2.6rem, 5.2vw, 4.4rem)' }}
            >
              <span className="block text-[#E6D7C3]">Prepara-te.</span>
              <span className="block text-[#A8B88A]">Adapta-te.</span>
              <span className="block text-[#C85A3E]">Sobrevive.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#E6D7C3]/80 leading-relaxed max-w-[52ch] font-normal">
              A comunidade independente em Portugal dedicada à partilha de manuais técnicos de campo, monitorização territorial em tempo real, núcleos regionais e entreajuda de proximidade.
            </p>

            {/* Exactly two buttons right at the start as requested */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {/* Button 1: Entrar with link www.sobrevivente.eu/entrar */}
              <a
                href="https://www.sobrevivente.eu/entrar"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthInitialTab('login');
                  setAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-medium border border-[#E6D7C3]/45 text-[#E6D7C3] hover:border-[#E6D7C3] hover:bg-white/5 transition-all duration-200 text-center whitespace-nowrap cursor-pointer shadow-sm"
              >
                Entrar
              </a>

              {/* Button 2: Inscrever-se with link www.sobrevivente.eu/inscrever */}
              <a
                href="https://www.sobrevivente.eu/inscrever"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthInitialTab('register');
                  setAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-[#E6D7C3] text-[#16271c] hover:bg-white transition-all duration-200 text-center whitespace-nowrap cursor-pointer shadow-lg shadow-black/25"
              >
                Inscrever-se
              </a>
            </div>

            {/* Subtle editorial trust anchors */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[#E6D7C3]/65">
              <span>Manuais Práticos</span>
              <span aria-hidden="true">·</span>
              <span>Dados em Tempo Real</span>
              <span aria-hidden="true">·</span>
              <span>Núcleos Regionais</span>
              <span aria-hidden="true">·</span>
              <span>100% Gratuito</span>
            </div>
          </div>

          {/* Right Column: Architectural Pedestal Showcase inspired by reference image */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[460px] aspect-[4/5] rounded-[36px] bg-gradient-to-b from-[#203a29] via-[#1a3123] to-[#122218] p-8 border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden group">
              {/* Subtle top spotlight glow */}
              <div
                className="absolute top-0 right-0 w-64 h-64 pointer-events-none rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(168, 184, 138, 0.22) 0%, transparent 70%)',
                }}
              />

              {/* Top Card Label */}
              <div className="relative z-10 flex items-center justify-between text-xs text-[#A8B88A] tracking-wider uppercase">
                <span>Comunidade Sobrevivente</span>
                <span>Portugal</span>
              </div>

              {/* Pedestal Centerpiece with Logo & Botanical Elements */}
              <div className="relative z-10 flex flex-col items-center my-auto">
                {/* 3D Geometric Pedestal block */}
                <div className="relative flex flex-col items-center">
                  {/* Floating Medallion with light reflection */}
                  <div className="relative mb-6 transform group-hover:scale-105 transition-transform duration-500">
                    <img
                      src="/assets/aistudio/logo_7a6369a0.png"
                      alt="Emblema Sobrevivente.eu em bronze na coluna arquitetónica"
                      className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.6)]"
                    />
                  </div>

                  {/* The architectural pedestal surface */}
                  <div className="w-56 sm:w-64 h-12 bg-[#264531] rounded-t-xl border-t border-x border-[#A8B88A]/30 shadow-lg flex items-center justify-center">
                    <span className="text-[11px] uppercase tracking-widest text-[#E6D7C3]/75 font-mono">
                      Autonomia · Natureza
                    </span>
                  </div>
                  {/* Pedestal base plinth */}
                  <div className="w-64 sm:w-72 h-7 bg-[#1c3324] rounded-b-lg border-b border-x border-black/40 shadow-2xl" />
                </div>
              </div>

              {/* Bottom Quote & Explorer CTA */}
              <div className="relative z-10 text-center space-y-2 pt-4 border-t border-white/10">
                <p className="text-xs text-[#E6D7C3]/75 italic font-display">
                  «O conhecimento de campo não pesa na mochila.»
                </p>
                <div className="flex items-center justify-center gap-2 text-[11px] text-[#A8B88A]">
                  <span>5 Pilares da Comunidade abaixo</span>
                  <ArrowRight className="w-3.5 h-3.5 animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION TITLE: O Que Encontra na Comunidade
           =================================================================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 pb-10 text-center">
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-[#A8B88A]">
            O que poderá encontrar na comunidade
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-[#E6D7C3] font-medium tracking-tight mt-2">
            Os 5 Pilares de Autonomia
          </h2>
          <p className="text-sm sm:text-base text-[#E6D7C3]/70 max-w-[62ch] mx-auto mt-3">
            Estrutura pensada para capacitar qualquer pessoa com conhecimento prático, dados reais sobre o território português e uma rede solidária.
          </p>
        </section>

        {/* ===================================================================
            THE 5 PILLARS: Vertical Rounded Showcase Cards (Inspired by Reference)
           =================================================================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {/* -------------------------------------------------------------
                PILLAR 1: MANUAIS
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="manuais"
              delayMs={0}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex items-center justify-center p-3">
                  <BushcraftIllustration type="water-filter" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-[#16271c]/80 backdrop-blur-sm text-[11px] text-[#A8B88A] border border-white/10 font-mono">
                    8 Manuais
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 01
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Manuais Práticos
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    Guias passo a passo testados em condições reais de terreno. Filtragem de água, fogo por fricção, abrigos térmicos, nós táticos e forrageamento seguro.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Passo a passo com materiais e ferramentas de campo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Descarregamento offline em ficheiro de texto</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Validação por técnicos de resgate e biólogos</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('manuais')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#A8B88A]" />
                  <span>Explorar Manuais de Campo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>

            {/* -------------------------------------------------------------
                PILLAR 2: INFORMAÇÕES ÚTEIS ACTUALIZADAS
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="informacoes"
              delayMs={120}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#A8B88A]">IPMA & ANEPC Live</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#C85A3E]/20 text-[#C85A3E] border border-[#C85A3E]/30 font-medium">
                      Risco Rural
                    </span>
                  </div>

                  <div className="space-y-1 my-auto">
                    <div className="text-2xl font-display font-medium text-[#E6D7C3]">
                      Perigo de Incêndio
                    </div>
                    <div className="text-xs text-[#E6D7C3]/70">
                      Atualização diária por concelho e fontes de água ativas.
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-[#E6D7C3]/60 font-mono">
                    <span>Guarda: Muito Elevado</span>
                    <span>112 / 117</span>
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 02
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Informações Úteis Actualizadas
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    Acompanhamento contínuo das condições no território português. Risco de incêndio rural diário, avisos de proteção civil, nascentes hídricas e normas ICNF.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Índice diário de risco florestal por distrito</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Regras legais de pernoita e uso do fogo em vigor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Cadastro comunitário de pontos de água potável</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('informacoes')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <Thermometer className="w-4 h-4 text-[#A8B88A]" />
                  <span>Consultar Alertas e Risco</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>

            {/* -------------------------------------------------------------
                PILLAR 3: GRUPOS & NÚCLEOS
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="grupos"
              delayMs={240}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#A8B88A]">Núcleos Regionais</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#A8B88A]/20 text-[#A8B88A] border border-[#A8B88A]/30">
                      Norte a Sul
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto">
                    <div className="text-sm font-semibold text-[#E6D7C3] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C85A3E]" />
                      <span>Gerês · Estrela · Sintra · Alentejo</span>
                    </div>
                    <p className="text-xs text-[#E6D7C3]/70">
                      Equipas autónomas que organizam treinos de campo e apoio mútuo.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-[#E6D7C3]/60 font-mono">
                    <span>6 Núcleos Ativos</span>
                    <span>Saídas Presenciais</span>
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 03
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Grupos & Núcleos
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    A sobrevivência é mais forte em comunidade. Conecte-se a núcleos locais organizados por relevo e clima em Portugal continental e ilhas.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Equipas regionais com bivaques e treinos práticos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Círculos temáticos de rádio PMR446 e primeiros socorros</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Protocolos de comunicação em caso de corte de rede</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('grupos')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#A8B88A]" />
                  <span>Ver Núcleos Regionais</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>

            {/* -------------------------------------------------------------
                PILLAR 4: FÓRUNS DE DISCUSSÃO
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="foruns"
              delayMs={120}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#A8B88A]">Bancada de Discussão</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-[#E6D7C3] font-medium">
                      Sem Publicidade
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto">
                    <div className="text-sm font-semibold text-[#E6D7C3]">
                      «Testes reais de lâminas, filtros e rádios»
                    </div>
                    <p className="text-xs text-[#E6D7C3]/70">
                      Análises sinceras de membros sem patrocínios nem links afiliados.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-[#E6D7C3]/60 font-mono">
                    <span>Perguntas Táticas</span>
                    <span>Bancada DIY</span>
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 04
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Fóruns da Comunidade
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    Espaço sério e despretensioso para esclarecer dúvidas táticas, partilhar relatórios pós-expedição e construir equipamento na bancada faça-você-mesmo.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Análises honestas de equipamento testado no terreno</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Respostas detalhadas de praticantes experientes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Relatórios de travessias e erros para não repetir</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('foruns')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#A8B88A]" />
                  <span>Explorar Fóruns e Tópicos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>

            {/* -------------------------------------------------------------
                PILLAR 5: ENCONTRAR OUTRAS PESSOAS
               ------------------------------------------------------------- */}
            <PillarRevealCard
              id="pessoas"
              delayMs={240}
              className="rounded-[32px] bg-gradient-to-b from-[#1d3525] to-[#14261a] p-7 border border-white/10 hover:border-[#A8B88A]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group md:col-span-2 lg:col-span-1"
            >
              <div className="space-y-6">
                {/* Visual Pedestal Header */}
                <div className="w-full aspect-[4/3] rounded-2xl bg-[#142318] border border-white/5 overflow-hidden relative flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#A8B88A]">Rede de Proximidade</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#E6D7C3]/15 text-[#E6D7C3] font-medium">
                      Entreajuda
                    </span>
                  </div>

                  <div className="space-y-1.5 my-auto">
                    <div className="text-sm font-semibold text-[#E6D7C3] flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#A8B88A]" />
                      <span>Companheiros de Marcha & Bivaque</span>
                    </div>
                    <p className="text-xs text-[#E6D7C3]/70">
                      Encontre pessoas da sua região para praticar com segurança.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-[#E6D7C3]/60 font-mono">
                    <span>Duplas de Autonomia</span>
                    <span>Apoio Local</span>
                  </div>
                </div>

                {/* Typography Header */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                    Pilar 05
                  </span>
                  <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold mt-1">
                    Encontrar Outras Pessoas
                  </h3>
                  <p className="text-sm text-[#E6D7C3]/75 mt-2 leading-relaxed">
                    Não precisa de treinar sozinho. Conheça outros membros no seu concelho, forme duplas de marcha e participe numa rede voluntária de auxílio mútuo em emergências.
                  </p>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2 text-xs text-[#E6D7C3]/80 pt-2 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Diretório de exploradores por concelho/distrito</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Companheiros para travessias e caminhadas de autonomia</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#A8B88A] shrink-0" />
                    <span>Rede solidária para tempestades ou falhas de energia</span>
                  </li>
                </ul>
              </div>

              {/* Card Action */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <button
                  onClick={() => setActivePillarModal('pessoas')}
                  className="w-full py-3 px-5 rounded-full bg-[#24422e] hover:bg-[#2e533b] text-[#E6D7C3] font-medium text-xs tracking-wide transition-colors flex items-center justify-center gap-2 border border-[#A8B88A]/25 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#A8B88A]" />
                  <span>Encontrar Praticantes Próximos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </PillarRevealCard>
          </div>
        </section>

        {/* ===================================================================
            COMMUNITY PHILOSOPHY & BOTTOM CONVERSION BLOCK
           =================================================================== */}
        <section className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-20">
          <div className="rounded-[36px] bg-gradient-to-b from-[#1a3324] to-[#122218] border border-white/10 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
            {/* Ambient subtle glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(168, 184, 138, 0.14) 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                Junte-se a Nós
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#E6D7C3] font-semibold">
                Comece hoje a desenvolver a sua autonomia
              </h2>
              <p className="text-sm sm:text-base text-[#E6D7C3]/80 leading-relaxed font-normal">
                Aceda gratuitamente aos manuais de campo completos, participe nas conversas do fórum, receba alertas de território e conecte-se com pessoas da sua região.
              </p>

              {/* The Two Action Buttons repeated cleanly at bottom */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthInitialTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-medium border border-[#E6D7C3]/45 text-[#E6D7C3] hover:border-[#E6D7C3] hover:bg-white/5 transition-all text-center whitespace-nowrap cursor-pointer"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthInitialTab('register');
                    setAuthModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-[#E6D7C3] text-[#16271c] hover:bg-white transition-all text-center whitespace-nowrap cursor-pointer shadow-lg shadow-black/25"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          FOOTER (Quiet, Compliant, Respectful)
         ===================================================================== */}
      <footer className="border-t border-white/10 bg-[#121f16] py-12 text-xs text-[#E6D7C3]/70">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/logo_7a6369a0.png"
                alt="Logótipo Sobrevivente.eu"
                className="w-8 h-8 object-contain"
              />
              <span className="font-display text-base font-semibold text-[#E6D7C3]">
                Sobrevivente.eu
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-[#E6D7C3]/80">
              <a href="#manuais" className="hover:text-white transition-colors">
                Manuais
              </a>
              <a href="#informacoes" className="hover:text-white transition-colors">
                Informações Úteis
              </a>
              <a href="#grupos" className="hover:text-white transition-colors">
                Grupos
              </a>
              <a href="#foruns" className="hover:text-white transition-colors">
                Fóruns
              </a>
              <a href="#pessoas" className="hover:text-white transition-colors">
                Encontrar Pessoas
              </a>
              <a
                href="https://www.sobrevivente.eu/entrar"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthInitialTab('login');
                  setAuthModalOpen(true);
                }}
                className="hover:text-white transition-colors"
              >
                Entrar
              </a>
              <a
                href="https://www.sobrevivente.eu/inscrever"
                onClick={(e) => {
                  e.preventDefault();
                  setAuthInitialTab('register');
                  setAuthModalOpen(true);
                }}
                className="hover:text-white transition-colors"
              >
                Inscrever-se
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[#E6D7C3]/50">
            <p>
              © {new Date().getFullYear()} Sobrevivente.eu — Plataforma cívica e educativa de sobrevivencialismo ético em Portugal.
            </p>
            <p className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#A8B88A]" />
              <span>Em caso de emergência real ligue sempre 112 (Emergência) ou 117 (Incêndios Florestais).</span>
            </p>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          INTERACTIVE PILLAR PREVIEW MODALS
          (Provides instant interactive access to verified data without clutter)
         ===================================================================== */}

      {/* MODAL 1: MANUAIS */}
      {activePillarModal === 'manuais' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-manuais-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 01 · Biblioteca de Campo
                </span>
                <h3 id="modal-manuais-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Manuais Práticos de Campo
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar janela de manuais"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Manuals Grid */}
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-sm text-[#E6D7C3]/80">
                Estes são os manuais práticos disponíveis na comunidade. Selecione um manual para consultar o passo a passo ou descarregá-lo para leitura offline:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {FEATURED_MANUALS.map((manual) => (
                  <div
                    key={manual.id}
                    onClick={() => setSelectedManualDetail(manual)}
                    className="p-4 rounded-2xl bg-[#1d3525]/70 hover:bg-[#1d3525] border border-white/10 hover:border-[#A8B88A]/50 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#A8B88A] font-mono">
                        <span>{manual.categoryLabel}</span>
                        <span>{manual.readTime}</span>
                      </div>
                      <h4 className="font-display text-lg text-[#E6D7C3] font-semibold mt-1 group-hover:text-white transition-colors">
                        {manual.title}
                      </h4>
                      <p className="text-xs text-[#E6D7C3]/75 mt-1 line-clamp-2">
                        {manual.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#E6D7C3]/60 pt-2 border-t border-white/5">
                      <span>Nível: {manual.level}</span>
                      <span className="text-[#A8B88A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Ler passos <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer with Direct CTAs */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between text-xs">
              <span className="text-[#E6D7C3]/70">
                Quer guardar manuais na sua mochila pessoal?
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePillarModal(null);
                    setAuthInitialTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] hover:bg-white/5"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePillarModal(null);
                    setAuthInitialTab('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: READ SPECIFIC MANUAL */}
      {selectedManualDetail && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="manual-detalhe-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedManualDetail(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] bg-[#16271c] border border-white/20 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  {selectedManualDetail.categoryLabel} · {selectedManualDetail.level}
                </span>
                <h3 id="manual-detalhe-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  {selectedManualDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedManualDetail(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar manual"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <p className="text-sm text-[#E6D7C3]/90 leading-relaxed font-normal">
                {selectedManualDetail.summary}
              </p>

              {/* Materials */}
              <div className="p-4 rounded-xl bg-[#142318] border border-white/10 space-y-2">
                <span className="text-xs uppercase tracking-wider text-[#A8B88A] font-mono font-medium">
                  Materiais e Ferramentas Necessárias:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedManualDetail.materials.map((mat, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-md bg-[#1d3525] text-xs text-[#E6D7C3] border border-white/10"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wider text-[#A8B88A] font-mono font-medium">
                  Passo a Passo Técnico:
                </span>
                <div className="space-y-3">
                  {selectedManualDetail.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[#1c3324] border border-white/5 space-y-1"
                    >
                      <div className="text-sm font-semibold text-[#E6D7C3] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#A8B88A]/20 text-[#A8B88A] text-xs flex items-center justify-center font-mono">
                          {i + 1}
                        </span>
                        <span>{st.title}</span>
                      </div>
                      <p className="text-xs text-[#E6D7C3]/75 leading-relaxed pl-7">
                        {st.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field Note / Disclaimer */}
              <div className="p-4 rounded-xl bg-[#2a1e1b] border border-[#C85A3E]/30 text-xs text-[#E6D7C3]/80 space-y-1">
                <span className="text-[#C85A3E] font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Regulamento Florestal e Segurança:
                </span>
                <p>{selectedManualDetail.fieldNote}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between">
              <button
                onClick={() => handleDownloadManualTxt(selectedManualDetail)}
                className="px-4 py-2 rounded-full border border-[#A8B88A]/40 text-[#E6D7C3] text-xs font-medium hover:bg-[#A8B88A]/10 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#A8B88A]" />
                <span>Descarregar TXT Offline</span>
              </button>

              <button
                onClick={() => setSelectedManualDetail(null)}
                className="px-5 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] text-xs font-semibold hover:bg-white transition-colors"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INFORMAÇÕES ÚTEIS */}
      {activePillarModal === 'informacoes' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-info-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 02 · Monitorização Territorial
                </span>
                <h3 id="modal-info-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Informações Úteis em Tempo Real
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar informações úteis"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: District Risk Inspector */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#A8B88A] font-mono font-medium">
                  Selecione o Distrito para Consultar o Perigo Rural IPMA:
                </span>
                <div className="flex flex-wrap gap-2 pt-2">
                  {(['Braga', 'Guarda', 'Castelo Branco', 'Santarém', 'Faro'] as const).map((dist) => (
                    <button
                      key={dist}
                      onClick={() => setSelectedDistrict(dist)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        selectedDistrict === dist
                          ? 'bg-[#E6D7C3] text-[#16271c] font-semibold shadow-md'
                          : 'bg-[#1c3324] text-[#E6D7C3]/80 hover:bg-[#23422f] border border-white/10'
                      }`}
                    >
                      {dist}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active District Dashboard Card */}
              {districtRiskData[selectedDistrict] && (
                <div className="p-6 rounded-2xl bg-[#142318] border border-white/10 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-mono text-[#A8B88A]">Boletim Territorial</span>
                      <h4 className="font-display text-xl text-[#E6D7C3] font-semibold">
                        Distrito de {selectedDistrict}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#E6D7C3]/70">Nível de Perigo:</span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${districtRiskData[selectedDistrict].color}25`,
                          color: districtRiskData[selectedDistrict].color,
                          border: `1px solid ${districtRiskData[selectedDistrict].color}40`,
                        }}
                      >
                        {districtRiskData[selectedDistrict].level}
                      </span>
                    </div>
                  </div>

                  {/* Weather Parameters */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#1c3324] border border-white/5 text-center">
                      <span className="text-[11px] text-[#A8B88A] font-mono">Temperatura</span>
                      <p className="text-base font-semibold text-[#E6D7C3] mt-0.5">
                        {districtRiskData[selectedDistrict].temp}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1c3324] border border-white/5 text-center">
                      <span className="text-[11px] text-[#A8B88A] font-mono">Humidade Relativa</span>
                      <p className="text-base font-semibold text-[#E6D7C3] mt-0.5">
                        {districtRiskData[selectedDistrict].humidity}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#1c3324] border border-white/5 text-center">
                      <span className="text-[11px] text-[#A8B88A] font-mono">Vento / Rajadas</span>
                      <p className="text-base font-semibold text-[#E6D7C3] mt-0.5">
                        {districtRiskData[selectedDistrict].wind}
                      </p>
                    </div>
                  </div>

                  {/* Directives */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#1f2821] border border-white/5 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-[#C85A3E] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#E6D7C3]">Alerta ANEPC: </span>
                        <span className="text-[#E6D7C3]/80">{districtRiskData[selectedDistrict].fireAlert}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#1f2821] border border-white/5 flex items-start gap-3">
                      <Shield className="w-4 h-4 text-[#A8B88A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#E6D7C3]">Normas ICNF: </span>
                        <span className="text-[#E6D7C3]/80">{districtRiskData[selectedDistrict].icnfNotice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Water sources reminder */}
              <div className="p-4 rounded-xl bg-[#102319] border border-[#A8B88A]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-[#A8B88A]" />
                  <span>
                    No Sobrevivente.eu mantemos um mapa colaborativo com mais de 140 fontes e nascentes catalogadas em Portugal.
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between text-xs">
              <span className="text-[#E6D7C3]/70">
                Receba alertas meteorológicos no seu telemóvel:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePillarModal(null);
                    setAuthInitialTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] hover:bg-white/5"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePillarModal(null);
                    setAuthInitialTab('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GRUPOS & NÚCLEOS */}
      {activePillarModal === 'grupos' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-grupos-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 03 · Organização Regional
                </span>
                <h3 id="modal-grupos-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Grupos & Núcleos Regionais
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar grupos"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-sm text-[#E6D7C3]/80">
                Os núcleos são círculos territoriais independentes que organizam saídas práticas de campo, testes de rádio e entreajuda:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {INITIAL_GROUPS.map((group) => (
                  <div
                    key={group.id}
                    className="p-5 rounded-2xl bg-[#1d3525]/70 border border-white/10 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#A8B88A] font-mono">
                        <span>{group.biome}</span>
                        <span>{group.members} Praticantes</span>
                      </div>
                      <h4 className="font-display text-lg text-[#E6D7C3] font-semibold mt-1">
                        {group.name}
                      </h4>
                      <p className="text-xs text-[#E6D7C3]/75 mt-1 leading-relaxed">
                        Coordenação local: {group.coordinator}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[#E6D7C3]/60">{group.nextMeetup}</span>
                      <a
                        href="https://www.sobrevivente.eu/inscrever"
                        onClick={(e) => {
                          e.preventDefault();
                          setActivePillarModal(null);
                          setAuthInitialTab('register');
                          setAuthModalOpen(true);
                        }}
                        className="text-[#A8B88A] hover:underline font-medium flex items-center gap-1"
                      >
                        Aderir ao Núcleo <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between text-xs">
              <span className="text-[#E6D7C3]/70">
                Pretende fundar um núcleo no seu concelho?
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePillarModal(null);
                    setAuthInitialTab('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white"
                >
                  Registar-se na Comunidade
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FÓRUNS */}
      {activePillarModal === 'foruns' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-foruns-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 04 · Troca de Experiências
                </span>
                <h3 id="modal-foruns-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Fóruns de Discussão & Partilha
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar fóruns"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Active Forum Topics */}
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-sm text-[#E6D7C3]/80">
                Discussões técnicas em curso entre membros da comunidade. Sem patrocínios, focado na prática:
              </p>

              <div className="space-y-3">
                {INITIAL_FORUM_QUESTIONS.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-4 rounded-xl bg-[#1d3525]/70 border border-white/10 space-y-2 hover:bg-[#1d3525] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-[#A8B88A]/20 text-[#A8B88A] font-mono">
                        {faq.categoryLabel}
                      </span>
                      <span className="text-[#E6D7C3]/60">{faq.votes} votos de membros</span>
                    </div>

                    <h4 className="font-display text-base font-semibold text-[#E6D7C3]">
                      {faq.question}
                    </h4>

                    <p className="text-xs text-[#E6D7C3]/75 leading-relaxed">
                      {faq.instructorAnswer}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#E6D7C3]/50 pt-1 border-t border-white/5 font-mono">
                      <span>Iniciado por: {faq.author} ({faq.region})</span>
                      <span>Resposta: {faq.instructorName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between text-xs">
              <span className="text-[#E6D7C3]/70">
                Participe nas discussões e publique as suas questões:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePillarModal(null);
                    setAuthInitialTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] hover:bg-white/5"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePillarModal(null);
                    setAuthInitialTab('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ENCONTRAR OUTRAS PESSOAS */}
      {activePillarModal === 'pessoas' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-pessoas-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePillarModal(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-[#16271c] border border-white/15 rounded-[28px] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#132218]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#A8B88A] font-mono">
                  Pilar 05 · Rede de Proximidade
                </span>
                <h3 id="modal-pessoas-titulo" className="font-display text-2xl text-[#E6D7C3] font-semibold">
                  Encontrar Outras Pessoas
                </h3>
              </div>
              <button
                onClick={() => setActivePillarModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#E6D7C3] transition-colors"
                aria-label="Fechar encontrar pessoas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-[#E6D7C3]/80">
                  Praticantes registados disponíveis para travessias e duplas de campo:
                </p>

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#E6D7C3]/60 font-mono">Filtrar:</span>
                  <select
                    value={memberRegionFilter}
                    onChange={(e) => setMemberRegionFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#142318] border border-white/15 text-xs text-[#E6D7C3] focus:outline-none focus:border-[#A8B88A]"
                  >
                    <option value="Todas">Todos os Distritos</option>
                    <option value="Braga">Braga</option>
                    <option value="Guarda">Guarda</option>
                    <option value="Sintra">Lisboa / Sintra</option>
                    <option value="Castelo Branco">Castelo Branco</option>
                    <option value="Faro">Faro</option>
                    <option value="Porto">Porto</option>
                  </select>
                </div>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMembers.map((member, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-[#1d3525]/70 border border-white/10 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#A8B88A] font-mono">
                        <span>{member.district}</span>
                        <span className="px-2 py-0.5 rounded bg-[#A8B88A]/15 text-[10px]">
                          {member.exp}
                        </span>
                      </div>
                      <h4 className="font-display text-base font-semibold text-[#E6D7C3] mt-1.5">
                        {member.name}
                      </h4>
                      <p className="text-xs text-[#E6D7C3]/75 mt-1">
                        {member.focus}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A8B88A]">
                      <span>{member.badge}</span>
                      <a
                        href="https://www.sobrevivente.eu/inscrever"
                        onClick={(e) => {
                          e.preventDefault();
                          setActivePillarModal(null);
                          setAuthInitialTab('register');
                          setAuthModalOpen(true);
                        }}
                        className="underline hover:text-white"
                      >
                        Conectar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#132218] flex items-center justify-between text-xs">
              <span className="text-[#E6D7C3]/70">
                Registe o seu perfil para aparecer no mapa comunitário:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.sobrevivente.eu/entrar"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePillarModal(null);
                    setAuthInitialTab('login');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full border border-[#E6D7C3]/30 text-[#E6D7C3] hover:bg-white/5"
                >
                  Entrar
                </a>
                <a
                  href="https://www.sobrevivente.eu/inscrever"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePillarModal(null);
                    setAuthInitialTab('register');
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#E6D7C3] text-[#16271c] font-semibold hover:bg-white"
                >
                  Inscrever-se
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          AUTHENTICATION & DATABASE MODAL (Entrar / Inscrever-se / Servidor DB)
         ===================================================================== */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={loggedUser}
        initialTab={authInitialTab}
        onLoginSuccess={(user) => {
          setLoggedUser(user);
          localStorage.setItem('sobrevivente_user', JSON.stringify(user));
        }}
        onLogout={() => {
          setLoggedUser(null);
          localStorage.removeItem('sobrevivente_user');
        }}
      />
    </div>
  );
}
