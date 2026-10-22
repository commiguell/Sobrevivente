import React, { useState, useMemo } from 'react';
import {
  Compass,
  Droplets,
  Flame,
  Tent,
  Sprout,
  HeartPulse,
  Navigation,
  Lasso,
  ShieldAlert,
  Bookmark,
  Heart,
  MessageSquare,
  Share2,
  MapPin,
  Clock,
  SlidersHorizontal,
  Check,
  Plus,
  RotateCcw,
  Download,
  ArrowRight,
  ChevronRight,
  Search,
  User,
  BookOpen,
  Users,
  Backpack,
  Home,
  X,
  Star,
  AlertTriangle,
  Calendar,
  ThumbsUp,
  Send,
  Layers,
  Award,
} from 'lucide-react';
import {
  CATEGORIES,
  FEATURED_MANUALS,
  TECHNIQUE_CARDS,
  INITIAL_FEED_POSTS,
  INITIAL_GROUPS,
  INITIAL_FORUM_QUESTIONS,
  INITIAL_EVENTS,
  INITIAL_KIT_72H,
  TESTIMONIALS,
  INITIAL_BADGES,
  CategoryId,
  ManualItem,
  FeedPost,
  KitChecklistItem,
  BadgeItem,
} from './data/raizData';
import { BushcraftIllustration } from './components/BotanicalIllustrations';
import { AuthModal, AuthUser } from './components/AuthModal';

export default function App() {
  // Navigation & Modal States
  const [activeMobileTab, setActiveMobileTab] = useState<'inicio' | 'manuais' | 'comunidade' | 'kit' | 'perfil'>('inicio');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loggedUser, setLoggedUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('sobrevivente_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Category & Manuals Filtering
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlySavedManuals, setOnlySavedManuals] = useState(false);
  const [savedManualIds, setSavedManualIds] = useState<string[]>(['filtro-bio-areia', 'abrigo-termico-leanto']);
  const [activeManualModal, setActiveManualModal] = useState<ManualItem | null>(null);

  // Technique Showcase (Product-style card) State
  const [activeTechIndex, setActiveTechIndex] = useState(0);
  const [savedTechIds, setSavedTechIds] = useState<string[]>(['tech-water']);
  const [techToast, setTechToast] = useState<string | null>(null);

  // Social Network & Badges State
  const [socialTab, setSocialTab] = useState<'feed' | 'grupos' | 'forum' | 'eventos' | 'conquistas'>('feed');
  const [badges, setBadges] = useState<BadgeItem[]>(INITIAL_BADGES);
  const [featuredBadgeIds, setFeaturedBadgeIds] = useState<string[]>([
    'badge-knots',
    'badge-100km',
    'badge-water',
  ]);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(INITIAL_FEED_POSTS);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostRegion, setNewPostRegion] = useState('Serra da Lousã · Coimbra');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [forumQuestions, setForumQuestions] = useState(INITIAL_FORUM_QUESTIONS);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [events, setEvents] = useState(INITIAL_EVENTS);

  // Interactive Regional Map State
  const [selectedBiomeId, setSelectedBiomeId] = useState<string>('grp-norte');

  // 72h Kit Checklist State
  const [kitItems, setKitItems] = useState<KitChecklistItem[]>(INITIAL_KIT_72H);
  const [kitFilter, setKitFilter] = useState<'todos' | 'em-falta' | 'prontos'>('todos');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemWeight, setNewItemWeight] = useState('150');

  // Final CTA Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterRegion, setNewsletterRegion] = useState('Norte & Gerês');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  // Category Icon Resolver (Thin line icons)
  const renderCategoryIcon = (id: CategoryId, className = 'w-4 h-4') => {
    const props = { className, strokeWidth: 1.5 };
    switch (id) {
      case 'todas':
        return <Compass {...props} />;
      case 'agua':
        return <Droplets {...props} />;
      case 'fogo':
        return <Flame {...props} />;
      case 'abrigo':
        return <Tent {...props} />;
      case 'alimentacao':
        return <Sprout {...props} />;
      case 'primeiros-socorros':
        return <HeartPulse {...props} />;
      case 'orientacao':
        return <Navigation {...props} />;
      case 'nos-e-cordas':
        return <Lasso {...props} />;
      case 'preparacao-urbana':
        return <ShieldAlert {...props} />;
    }
  };

  // Filtered Manuals
  const filteredManuals = useMemo(() => {
    return FEATURED_MANUALS.filter((manual) => {
      const matchesCat = selectedCategory === 'todas' || manual.category === selectedCategory;
      const matchesSaved = !onlySavedManuals || savedManualIds.includes(manual.id);
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        manual.title.toLowerCase().includes(q) ||
        manual.subtitle.toLowerCase().includes(q) ||
        manual.categoryLabel.toLowerCase().includes(q);
      return matchesCat && matchesSaved && matchesSearch;
    });
  }, [selectedCategory, onlySavedManuals, savedManualIds, searchQuery]);

  const toggleSaveManual = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedManualIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Technique Card Helpers
  const activeTechnique = TECHNIQUE_CARDS[activeTechIndex];
  const toggleSaveTech = (id: string) => {
    const isSaved = savedTechIds.includes(id);
    setSavedTechIds((prev) => (isSaved ? prev.filter((i) => i !== id) : [...prev, id]));
    setTechToast(isSaved ? 'Técnica removida da sua mochila.' : 'Técnica guardada na sua mochila de campo.');
    setTimeout(() => setTechToast(null), 2800);
  };

  // Social Feed Handlers
  const togglePostLike = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    const authorName = loggedUser ? loggedUser.name : 'Explorador Convidado';
    setFeedPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: `c-${Date.now()}`,
                  author: authorName,
                  role: 'Comunidade Sobrevivente.eu',
                  text,
                  timeAgo: 'Agora mesmo',
                },
              ],
            }
          : post
      )
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  // Badge Helpers & XP Calculation
  const renderBadgeIcon = (iconKey: BadgeItem['iconKey'], className = 'w-5 h-5') => {
    const props = { className, strokeWidth: 1.5 };
    switch (iconKey) {
      case 'knots':
        return <Lasso {...props} />;
      case 'explorer100':
        return <Compass {...props} />;
      case 'water':
        return <Droplets {...props} />;
      case 'fire':
        return <Flame {...props} />;
      case 'shelter':
        return <Tent {...props} />;
      case 'kit72':
        return <Backpack {...props} />;
      case 'botany':
        return <Sprout {...props} />;
      case 'polar':
        return <Navigation {...props} />;
    }
  };

  const unlockedBadges = useMemo(() => badges.filter((b) => b.unlocked), [badges]);
  const featuredBadges = useMemo(
    () => badges.filter((b) => b.unlocked && featuredBadgeIds.includes(b.id)),
    [badges, featuredBadgeIds]
  );
  const totalExplorerXp = useMemo(
    () => unlockedBadges.reduce((sum, b) => sum + b.xp, 0),
    [unlockedBadges]
  );
  const explorerRankTitle = useMemo(() => {
    if (totalExplorerXp >= 1200) return 'Mestre de Campo';
    if (totalExplorerXp >= 700) return 'Explorador Veterano';
    return 'Trilheiro Iniciado';
  }, [totalExplorerXp]);

  const togglePinBadge = (badgeId: string) => {
    setFeaturedBadgeIds((prev) => {
      if (prev.includes(badgeId)) {
        return prev.filter((id) => id !== badgeId);
      }
      if (prev.length >= 3) {
        setBadgeToast('Pode exibir até 3 insígnias em destaque no topo do perfil (substituímos a mais antiga).');
        setTimeout(() => setBadgeToast(null), 3200);
        return [...prev.slice(1), badgeId];
      }
      return [...prev, badgeId];
    });
  };

  const handleUnlockBadge = (badgeId: string) => {
    const target = badges.find((b) => b.id === badgeId);
    if (!target || target.unlocked) return;
    setBadges((prev) =>
      prev.map((b) =>
        b.id === badgeId ? { ...b, unlocked: true, progressCurrent: b.progressTarget } : b
      )
    );
    if (featuredBadgeIds.length < 3 && !featuredBadgeIds.includes(badgeId)) {
      setFeaturedBadgeIds((prev) => [...prev, badgeId]);
    }
    setBadgeToast(`Nova conquista desbloqueada: "${target.title}" (+${target.xp} XP)!`);
    setTimeout(() => setBadgeToast(null), 3500);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const authorName = loggedUser ? loggedUser.name : 'Diogo Santarém';
    const myBadgeTitles = featuredBadges.map((b) => b.title);
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      author: authorName,
      handle: `@${authorName.toLowerCase().replace(/\s+/g, '.')}`,
      region: newPostRegion,
      timeAgo: 'Agora mesmo',
      categoryLabel: 'Relato de Campo',
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      illustration: 'post-estrela',
      likes: 1,
      likedByMe: true,
      savedByMe: false,
      coordinates: '40.1125° N, 8.2451° W',
      authorBadges: myBadgeTitles,
      comments: [],
    };
    setFeedPosts((prev) => [newPost, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostForm(false);
  };

  const toggleGroupJoin = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 }
          : g
      )
    );
  };

  const toggleQuestionVote = (qId: string) => {
    setForumQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, voted: !q.voted, votes: q.voted ? q.votes - 1 : q.votes + 1 } : q
      )
    );
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setForumQuestions((prev) => [
      {
        id: `fq-${Date.now()}`,
        author: loggedUser ? loggedUser.name : 'Membro da Comunidade',
        region: 'Portugal',
        categoryLabel: 'Questão Técnica',
        question: newQuestionText.trim(),
        instructorAnswer:
          'Questão recebida pela equipa de instrutores Sobrevivente.eu. Um especialista em hidrologia ou sobrevivência responderá após validação técnica.',
        instructorName: 'Conselho Técnico Sobrevivente.eu',
        votes: 1,
        voted: true,
      },
      ...prev,
    ]);
    setNewQuestionText('');
  };

  const toggleEventEnroll = (evId: string) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === evId
          ? {
              ...ev,
              enrolled: !ev.enrolled,
              spotsLeft: ev.enrolled ? ev.spotsLeft + 1 : Math.max(0, ev.spotsLeft - 1),
            }
          : ev
      )
    );
  };

  // 72-Hour Kit Calculations & Handlers
  const kitStats = useMemo(() => {
    const total = kitItems.length;
    const completed = kitItems.filter((i) => i.checked).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    const currentWeightGrams = kitItems.filter((i) => i.checked).reduce((acc, i) => acc + i.weightGrams, 0);
    const totalWeightGrams = kitItems.reduce((acc, i) => acc + i.weightGrams, 0);
    return {
      total,
      completed,
      percentage,
      currentWeightKg: (currentWeightGrams / 1000).toFixed(2),
      totalWeightKg: (totalWeightGrams / 1000).toFixed(2),
    };
  }, [kitItems]);

  const filteredKitItems = useMemo(() => {
    if (kitFilter === 'em-falta') return kitItems.filter((i) => !i.checked);
    if (kitFilter === 'prontos') return kitItems.filter((i) => i.checked);
    return kitItems;
  }, [kitItems, kitFilter]);

  const toggleKitItem = (id: string) => {
    setKitItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const handleAddCustomKitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemLabel.trim()) return;
    const weight = Math.max(10, parseInt(newItemWeight, 10) || 150);
    setKitItems((prev) => [
      ...prev,
      {
        id: `k-custom-${Date.now()}`,
        category: 'Luz, Fogo & Ferramentas',
        label: newItemLabel.trim(),
        spec: 'Item personalizado adicionado à sua mochila 72h',
        weightGrams: weight,
        essential: false,
        checked: true,
      },
    ]);
    setNewItemLabel('');
  };

  const handleExportKitTxt = () => {
    const lines = [
      'SOBREVIVENTE.EU — CHECKLIST KIT DE AUTONOMIA 72 HORAS',
      `Progresso: ${kitStats.completed}/${kitStats.total} (${kitStats.percentage}%) | Peso atual: ${kitStats.currentWeightKg} kg`,
      '------------------------------------------------------------',
      ...kitItems.map(
        (i) => `[${i.checked ? 'X' : ' '}] ${i.label} (${i.weightGrams}g) — ${i.category}`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kit-72h-sobrevivente-eu.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Newsletter Validation
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail.trim())) {
      setNewsletterError('Por favor, introduza um endereço de email válido (ex.: nome@dominio.pt).');
      return;
    }
    setNewsletterError('');
    setNewsletterSubmitted(true);
  };

  // Auth Handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) return;
    const displayName = authName.trim() || authEmail.split('@')[0];
    setLoggedUser({ name: displayName, region: 'Serra da Lousã' });
    setAuthModalOpen(false);
  };

  const scrollToSection = (id: string, tab: typeof activeMobileTab) => {
    setActiveMobileTab(tab);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative bg-[#1F2E24] text-[#E6D7C3] pb-20 md:pb-0 selection:bg-[#C85A3E]/30">
      {/* =====================================================================
          ORGANIC BLURRED FOREST BACKGROUND WITH TEXTURES & FILTERED LIGHT
         ===================================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Subtle organic botanical & stone reference layer */}
        <img
          src="/assets/aistudio/cores_3_667e4b9d.jfif"
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-[0.13] scale-110 blur-[64px]"
        />
        {/* Filtered canopy light & deep teal/olive ambient gradients */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 18% 12%, rgba(90, 107, 68, 0.34) 0%, transparent 45%),
              radial-gradient(circle at 84% 22%, rgba(13, 59, 78, 0.48) 0%, transparent 52%),
              radial-gradient(circle at 50% 62%, rgba(200, 90, 62, 0.11) 0%, transparent 48%),
              radial-gradient(circle at 20% 85%, rgba(13, 59, 78, 0.42) 0%, transparent 50%),
              linear-gradient(180deg, rgba(22, 34, 26, 0.86) 0%, rgba(31, 46, 36, 0.92) 50%, rgba(18, 28, 22, 0.97) 100%)
            `,
          }}
        />
        {/* Subtle botanical leaf vein SVG overlay */}
        <svg className="absolute top-0 right-0 w-[680px] h-[680px] opacity-[0.06] text-[#A8B88A]" viewBox="0 0 400 400" fill="none">
          <path d="M380 20 C240 80, 120 200, 20 380" stroke="currentColor" strokeWidth="1.5" />
          <path d="M300 65 C295 140, 270 190, 220 240" stroke="currentColor" strokeWidth="1" />
          <path d="M230 120 C220 200, 185 260, 120 310" stroke="currentColor" strokeWidth="1" />
          <path d="M300 65 C220 65, 160 95, 110 140" stroke="currentColor" strokeWidth="1" />
          <path d="M230 120 C150 130, 90 165, 45 220" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* =====================================================================
          1. NAVBAR TRANSLÚCIDA (3-ZONE TOP BAR CONTRACT)
         ===================================================================== */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-16 md:h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title (Single line wordmark with site medallion logo) */}
          <a
            href="#inicio"
            className="flex items-center gap-3 text-[#E6D7C3] hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 group"
          >
            <img
              src="/assets/aistudio/logo_7a6369a0.png"
              alt="Sobrevivente.eu Emblema"
              className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border border-[#E6D7C3]/30 shadow-md shadow-black/40 group-hover:scale-105 transition-transform"
            />
            <span className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#E6D7C3]">
              Sobrevivente.eu
            </span>
          </a>

          {/* Zone 2: 4 Clean Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#E6D7C3]/85">
            <a
              href="#manuais"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Manuais
            </a>
            <a
              href="#comunidade"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Comunidade
            </a>
            <a
              href="#kits"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Kits
            </a>
            <a
              href="#mapa"
              className="hover:text-[#E6D7C3] underline-offset-8 hover:underline decoration-[#A8B88A] transition-colors whitespace-nowrap shrink-0"
            >
              Mapa
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#5A6B44]/40 hover:bg-[#5A6B44]/65 text-[#E6D7C3] border border-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
            >
              <User className="w-4 h-4 text-[#A8B88A]" strokeWidth={1.5} />
              <span>{loggedUser ? loggedUser.name : 'Entrar / Inscrição'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN CONTENT CONTAINER
         ===================================================================== */}
      <main className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-8 pt-6 sm:pt-12 pb-20 space-y-20 sm:space-y-28">
        {/* ===================================================================
            2. HERO SECTION
           =================================================================== */}
        <section id="inicio" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Value Proposition & Dual CTAs */}
          <div className="lg:col-span-7 glass-card p-7 sm:p-11 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle radial highlight */}
            <div
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(168,184,138,0.16) 0%, transparent 70%)' }}
            />

            <div className="space-y-6 relative z-10">
              <p className="text-xs sm:text-sm tracking-wide text-[#A8B88A] font-medium">
                Biblioteca de Campo · Rede Social de Autonomia · Portugal
              </p>

              {/* Title in 3 separate lines as requested */}
              <h1
                className="font-display font-semibold text-[#E6D7C3] tracking-tight leading-[1.12]"
                style={{ fontSize: 'clamp(2.5rem, 4.4vw, 4.1rem)' }}
              >
                <span className="block">Prepara-te.</span>
                <span className="block text-[#A8B88A]">Adapta-te.</span>
                <span className="block text-[#C85A3E]">Sobrevive.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#E6D7C3]/85 leading-relaxed max-w-[60ch] font-normal">
                Conhecimento prático partilhado por biólogos, guias de montanha e técnicos de proteção civil. Aprenda a filtrar água, construir abrigos térmicos, orientar-se sem rede e preparar a sua família com serenidade e profundo respeito pela natureza.
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 space-y-6 relative z-10">
              {/* Primary Pill CTA + Secondary Sage Button */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-7 py-3.5 rounded-full bg-[#C85A3E] hover:bg-[#b54d32] text-[#E6D7C3] font-medium text-sm sm:text-base transition-all shadow-lg shadow-black/25 flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Juntar-me à comunidade</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>

                <a
                  href="#manuais"
                  className="px-6 py-3.5 rounded-full bg-[#A8B88A]/18 hover:bg-[#A8B88A]/28 text-[#E6D7C3] border border-[#A8B88A]/40 font-medium text-sm sm:text-base transition-colors whitespace-nowrap shrink-0"
                >
                  Explorar manuais
                </a>
              </div>

              {/* Quiet unboxed proof summary */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#E6D7C3]/70 tabular-nums">
                <span>148 manuais revistos por especialistas</span>
                <span aria-hidden="true">·</span>
                <span>12.400 membros em Portugal</span>
                <span aria-hidden="true">·</span>
                <span>Princípios Leave No Trace</span>
              </div>
            </div>
          </div>

          {/* Right Column: Organic Glassmorphism Field Card Showcase (Inspired by Leafora reference) */}
          <div className="lg:col-span-5 glass-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs text-[#A8B88A]">Caderno de Campo em Destaque</p>
                <h2 className="font-display text-xl text-[#E6D7C3] mt-0.5">
                  Autonomia nas Primeiras 72 Horas
                </h2>
              </div>
              <button
                onClick={() => setActiveManualModal(FEATURED_MANUALS[0])}
                className="p-2.5 rounded-full glass-pill text-[#E6D7C3]/80 hover:text-[#E6D7C3] transition-colors cursor-pointer"
                title="Abrir Manual Completo"
              >
                <BookOpen className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Atmospheric Illustration Frame */}
            <div className="relative rounded-[18px] overflow-hidden border border-white/12 aspect-[16/10] mb-5 bg-[#142018]">
              <BushcraftIllustration type="water-filter" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142018]/90 via-transparent to-transparent" />
              <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-[#A8B88A]">Hidrologia de Emergência · Nível Iniciante</p>
                  <p className="font-display text-base text-[#E6D7C3]">
                    Tripé Bio-Areia & Carvão Ativo
                  </p>
                </div>
                <span className="text-xs font-mono text-[#E6D7C3]/80 tabular-nums">99,2% limpidez</span>
              </div>
            </div>

            {/* 4 Pillars Mini-Grid (Water, Fire, Shelter, Navigation) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedCategory('agua');
                  scrollToSection('manuais', 'manuais');
                }}
                className="p-3.5 rounded-[16px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-[#A8B88A] mb-1">
                  <Droplets className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs font-mono tabular-nums">24 guias</span>
                </div>
                <p className="text-sm font-medium text-[#E6D7C3]">Água Potável</p>
                <p className="text-xs text-[#E6D7C3]/65 mt-0.5">Captação e fervura</p>
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('abrigo');
                  scrollToSection('manuais', 'manuais');
                }}
                className="p-3.5 rounded-[16px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-[#A8B88A] mb-1">
                  <Tent className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs font-mono tabular-nums">22 guias</span>
                </div>
                <p className="text-sm font-medium text-[#E6D7C3]">Abrigo Térmico</p>
                <p className="text-xs text-[#E6D7C3]/65 mt-0.5">Toldos e cama de solo</p>
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================
            3. CHIPS DE CATEGORIA COM ÍCONES + 4. MANUAIS EM DESTAQUE
           =================================================================== */}
        <section id="manuais" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs sm:text-sm text-[#A8B88A] font-medium mb-1">
                01. Biblioteca Técnica de Campo
              </p>
              <h2 className="font-display text-2xl sm:text-4xl text-[#E6D7C3] font-semibold">
                Manuais Práticos por Disciplina
              </h2>
            </div>

            {/* Search & Saved Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#E6D7C3]/50 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Procurar técnica, planta, nó..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full glass-pill text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/45 focus:outline-none focus:border-[#A8B88A]"
                />
              </div>

              <button
                onClick={() => setOnlySavedManuals(!onlySavedManuals)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                  onlySavedManuals
                    ? 'bg-[#C85A3E] text-[#E6D7C3] border-[#C85A3E]'
                    : 'glass-pill text-[#E6D7C3]/85 hover:text-[#E6D7C3]'
                }`}
              >
                <Bookmark className="w-4 h-4" strokeWidth={1.5} />
                <span>Guardados ({savedManualIds.length})</span>
              </button>
            </div>
          </div>

          {/* Interactive Category Filter Chips (8 requested categories + Todos) */}
          <div
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2"
            role="tablist"
            aria-label="Categorias de manuais de sobrevivência"
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-[18px] text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                    active
                      ? 'bg-[#5A6B44]/65 text-[#E6D7C3] border-[#A8B88A]/60 shadow-md shadow-black/20'
                      : 'bg-white/[0.04] hover:bg-white/[0.09] text-[#E6D7C3]/75 hover:text-[#E6D7C3] border-white/10'
                  }`}
                >
                  <span className={active ? 'text-[#E6D7C3]' : 'text-[#A8B88A]'}>
                    {renderCategoryIcon(cat.id, 'w-4 h-4')}
                  </span>
                  <span>{cat.label}</span>
                  <span className="text-xs opacity-65 font-mono tabular-nums">{cat.count}</span>
                </button>
              );
            })}
          </div>

          {/* Active Category Context Description */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#E6D7C3]/70 border-b border-white/10 pb-3">
            <span>
              {CATEGORIES.find((c) => c.id === selectedCategory)?.description}
            </span>
            <span className="font-mono tabular-nums whitespace-nowrap ml-4">
              {filteredManuals.length} {filteredManuals.length === 1 ? 'manual visível' : 'manuais visíveis'}
            </span>
          </div>

          {/* Featured Manuals Grid */}
          {filteredManuals.length === 0 ? (
            <div className="glass-card p-10 text-center space-y-3">
              <p className="font-display text-xl text-[#E6D7C3]">
                Nenhum manual corresponde aos filtros selecionados.
              </p>
              <p className="text-sm text-[#E6D7C3]/70">
                Experimente limpar a pesquisa ou selecionar "Todos os Manuais".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('todas');
                  setOnlySavedManuals(false);
                  setSearchQuery('');
                }}
                className="mt-2 px-5 py-2.5 rounded-full bg-[#5A6B44]/50 hover:bg-[#5A6B44]/75 text-sm text-[#E6D7C3] border border-white/15 cursor-pointer"
              >
                Repor filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredManuals.map((manual) => {
                const isSaved = savedManualIds.includes(manual.id);
                return (
                  <article
                    key={manual.id}
                    onClick={() => setActiveManualModal(manual)}
                    className="glass-card-interactive p-5 flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Card Illustration */}
                      <div className="relative rounded-[16px] overflow-hidden border border-white/10 aspect-[4/3] mb-4 bg-[#142018]">
                        <BushcraftIllustration
                          type={manual.illustration}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={(e) => toggleSaveManual(manual.id, e)}
                          aria-label={isSaved ? 'Remover dos guardados' : 'Guardar manual'}
                          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-[#C85A3E] text-[#E6D7C3] border-[#C85A3E]'
                              : 'bg-black/45 text-[#E6D7C3]/85 border-white/15 hover:bg-black/65'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" strokeWidth={1.5} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      {/* Clean Unboxed Metadata (Zero-Pill Discipline) */}
                      <div className="flex items-center gap-1.5 text-xs text-[#A8B88A] mb-2">
                        <span>{manual.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            manual.level === 'Avançado'
                              ? 'text-[#C85A3E] font-medium'
                              : 'text-[#E6D7C3]/80'
                          }
                        >
                          {manual.level}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{manual.readTime}</span>
                      </div>

                      {/* Primary Title */}
                      <h3 className="font-display text-lg text-[#E6D7C3] font-semibold leading-snug group-hover:text-[#A8B88A] transition-colors">
                        {manual.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#E6D7C3]/75 mt-2 line-clamp-3 leading-relaxed">
                        {manual.summary}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#E6D7C3]/70">
                      <span className="truncate max-w-[180px]">{manual.author.split('·')[0]}</span>
                      <span className="text-[#A8B88A] font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform whitespace-nowrap">
                        Ler guia <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================================================================
            6. FICHA-EXEMPLO DE TÉCNICA (ESTILO CARTÃO DE PRODUTO / LEAFORA REF)
           =================================================================== */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm text-[#A8B88A] font-medium mb-1">
                02. Ficha Técnica Interativa
              </p>
              <h2 className="font-display text-2xl sm:text-4xl text-[#E6D7C3] font-semibold">
                Anatomia de uma Técnica de Campo
              </h2>
            </div>

            {/* Technique Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-full glass-pill self-start">
              {TECHNIQUE_CARDS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTechIndex(idx)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTechIndex === idx
                      ? 'bg-[#5A6B44] text-[#E6D7C3] shadow-sm'
                      : 'text-[#E6D7C3]/70 hover:text-[#E6D7C3]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product-Style Technique Card (Directly inspired by reference image 2 bottom-left card) */}
          <div className="glass-card p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Visual Showcase with Circular Organic Halo */}
            <div className="lg:col-span-5 relative rounded-[20px] overflow-hidden border border-white/12 bg-[#15221A] flex flex-col justify-between p-6 min-h-[320px]">
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs text-[#A8B88A] font-medium">
                  {activeTechnique.categoryLabel}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSaveTech(activeTechnique.id)}
                    aria-label="Guardar ficha técnica"
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                      savedTechIds.includes(activeTechnique.id)
                        ? 'bg-[#C85A3E] border-[#C85A3E] text-[#E6D7C3]'
                        : 'glass-pill text-[#E6D7C3]/80 hover:text-[#E6D7C3]'
                    }`}
                  >
                    <Heart
                      className="w-4 h-4"
                      strokeWidth={1.5}
                      fill={savedTechIds.includes(activeTechnique.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              </div>

              <div className="my-auto py-4">
                <BushcraftIllustration
                  type={activeTechnique.illustration}
                  className="w-full h-52 object-contain"
                />
              </div>

              {/* Dots indicator */}
              <div className="flex items-center justify-center gap-2 relative z-10">
                {TECHNIQUE_CARDS.map((t, i) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTechIndex(i)}
                    aria-label={`Ver técnica ${t.name}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      i === activeTechIndex ? 'w-6 bg-[#A8B88A]' : 'w-2 bg-white/25'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Specification Sheet with 4 Attribute Columns */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl text-[#E6D7C3] font-semibold">
                    {activeTechnique.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A8B88A] italic mt-1">
                    {activeTechnique.scientificOrTechSubtitle}
                  </p>
                </div>

                {/* Unboxed Rating & Condition Row */}
                <div className="flex items-center gap-4 text-xs sm:text-sm text-[#E6D7C3]/85 tabular-nums">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#C85A3E]" strokeWidth={1.5} fill="#C85A3E" />
                    <strong>{activeTechnique.rating}</strong> ({activeTechnique.reviewsCount} validações em campo)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Condição ideal: {activeTechnique.lightCondition}</span>
                </div>

                <p className="text-sm sm:text-base text-[#E6D7C3]/85 leading-relaxed">
                  {activeTechnique.description}
                </p>

                {/* 4 Attribute Columns with Thin-Line Icons & Vertical Hairline Dividers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/12 border-y border-white/12 py-5">
                  <div className="px-3 py-2 sm:py-0 flex flex-col items-start sm:items-center sm:text-center">
                    <SlidersHorizontal className="w-5 h-5 text-[#A8B88A] mb-2" strokeWidth={1.5} />
                    <span className="text-xs text-[#E6D7C3]/60">Dificuldade</span>
                    <span className="text-sm font-semibold text-[#E6D7C3] mt-0.5">
                      {activeTechnique.attributes.dificuldade.label}
                    </span>
                    <span className="text-[11px] text-[#E6D7C3]/65 mt-0.5">
                      {activeTechnique.attributes.dificuldade.sub}
                    </span>
                  </div>

                  <div className="px-3 py-2 sm:py-0 flex flex-col items-start sm:items-center sm:text-center">
                    <Layers className="w-5 h-5 text-[#A8B88A] mb-2" strokeWidth={1.5} />
                    <span className="text-xs text-[#E6D7C3]/60">Material</span>
                    <span className="text-sm font-semibold text-[#E6D7C3] mt-0.5">
                      {activeTechnique.attributes.material.label}
                    </span>
                    <span className="text-[11px] text-[#E6D7C3]/65 mt-0.5">
                      {activeTechnique.attributes.material.sub}
                    </span>
                  </div>

                  <div className="px-3 py-2 sm:py-0 flex flex-col items-start sm:items-center sm:text-center">
                    <Clock className="w-5 h-5 text-[#A8B88A] mb-2" strokeWidth={1.5} />
                    <span className="text-xs text-[#E6D7C3]/60">Tempo</span>
                    <span className="text-sm font-semibold text-[#E6D7C3] mt-0.5 tabular-nums">
                      {activeTechnique.attributes.tempo.label}
                    </span>
                    <span className="text-[11px] text-[#E6D7C3]/65 mt-0.5">
                      {activeTechnique.attributes.tempo.sub}
                    </span>
                  </div>

                  <div className="px-3 py-2 sm:py-0 flex flex-col items-start sm:items-center sm:text-center">
                    <ShieldAlert className="w-5 h-5 text-[#C85A3E] mb-2" strokeWidth={1.5} />
                    <span className="text-xs text-[#E6D7C3]/60">Risco</span>
                    <span className="text-sm font-semibold text-[#E6D7C3] mt-0.5">
                      {activeTechnique.attributes.risco.label}
                    </span>
                    <span className="text-[11px] text-[#E6D7C3]/65 mt-0.5">
                      {activeTechnique.attributes.risco.sub}
                    </span>
                  </div>
                </div>

                {/* Quick Steps Summary */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-medium text-[#A8B88A]">Resumo de Execução:</p>
                  <ol className="space-y-1.5 text-xs sm:text-sm text-[#E6D7C3]/80">
                    {activeTechnique.stepsPreview.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="font-mono text-xs text-[#A8B88A] tabular-nums mt-0.5">
                          0{i + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div>
                  <span className="text-xs text-[#E6D7C3]/60 block">Acesso Livre na Biblioteca</span>
                  <span className="font-display text-lg text-[#E6D7C3] font-semibold">
                    Ficha Verificada #0{activeTechIndex + 1}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSaveTech(activeTechnique.id)}
                    className="px-5 py-3 rounded-full bg-[#5A6B44]/55 hover:bg-[#5A6B44]/80 text-[#E6D7C3] text-sm font-medium border border-[#A8B88A]/40 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Backpack className="w-4 h-4" strokeWidth={1.5} />
                    <span>
                      {savedTechIds.includes(activeTechnique.id) ? 'Na Mochila ✓' : 'Guardar na Mochila'}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveManualModal(FEATURED_MANUALS[activeTechIndex])}
                    className="px-6 py-3 rounded-full bg-[#C85A3E] hover:bg-[#b54d32] text-[#E6D7C3] text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Ver Manual Completo</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {techToast && (
                <p className="text-xs text-[#A8B88A] font-medium">{techToast}</p>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================================
            5. REDE SOCIAL (FEED, GRUPOS REGIONAIS, FÓRUM, SAÍDAS DE CAMPO)
           =================================================================== */}
        <section id="comunidade" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs sm:text-sm text-[#A8B88A] font-medium mb-1">
                03. Rede Social & Entreajuda de Campo
              </p>
              <h2 className="font-display text-2xl sm:text-4xl text-[#E6D7C3] font-semibold">
                Comunidade Viva em Todo o Território
              </h2>
            </div>

            {/* Interactive Social Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-full glass-pill overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSocialTab('feed')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  socialTab === 'feed'
                    ? 'bg-[#C85A3E] text-[#E6D7C3]'
                    : 'text-[#E6D7C3]/75 hover:text-[#E6D7C3]'
                }`}
              >
                Diário de Campo ({feedPosts.length})
              </button>
              <button
                onClick={() => setSocialTab('grupos')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  socialTab === 'grupos'
                    ? 'bg-[#C85A3E] text-[#E6D7C3]'
                    : 'text-[#E6D7C3]/75 hover:text-[#E6D7C3]'
                }`}
              >
                Grupos Regionais ({groups.length})
              </button>
              <button
                onClick={() => setSocialTab('forum')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  socialTab === 'forum'
                    ? 'bg-[#C85A3E] text-[#E6D7C3]'
                    : 'text-[#E6D7C3]/75 hover:text-[#E6D7C3]'
                }`}
              >
                Fórum de Perguntas ({forumQuestions.length})
              </button>
              <button
                onClick={() => setSocialTab('eventos')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  socialTab === 'eventos'
                    ? 'bg-[#C85A3E] text-[#E6D7C3]'
                    : 'text-[#E6D7C3]/75 hover:text-[#E6D7C3]'
                }`}
              >
                Saídas de Campo ({events.length})
              </button>
              <button
                onClick={() => setSocialTab('conquistas')}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  socialTab === 'conquistas'
                    ? 'bg-[#C85A3E] text-[#E6D7C3]'
                    : 'text-[#E6D7C3]/75 hover:text-[#E6D7C3]'
                }`}
              >
                <Award className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Insígnias & Perfil ({unlockedBadges.length}/{badges.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: FEED DE CAMPO */}
          {socialTab === 'feed' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#E6D7C3]/75">
                  Relatos verificados de treino, abrigos, etnobotânica e travessias partilhados pelos membros.
                </p>
                <button
                  onClick={() => setShowNewPostForm(!showNewPostForm)}
                  className="px-4 py-2 rounded-full bg-[#5A6B44]/55 hover:bg-[#5A6B44]/80 text-xs sm:text-sm font-medium text-[#E6D7C3] border border-[#A8B88A]/40 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  <span>Partilhar Relato de Campo</span>
                </button>
              </div>

              {/* New Post Form */}
              {showNewPostForm && (
                <form onSubmit={handleCreatePost} className="glass-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-[#E6D7C3]">Novo Registo no Diário</h3>
                    <button
                      type="button"
                      onClick={() => setShowNewPostForm(false)}
                      className="text-xs text-[#E6D7C3]/60 hover:text-[#E6D7C3] cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Título da experiência (ex.: Filtro de carvão na Serra da Cabreira)"
                      className="px-4 py-2.5 rounded-[14px] bg-black/25 border border-white/15 text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/40 focus:outline-none focus:border-[#A8B88A]"
                    />
                    <input
                      type="text"
                      value={newPostRegion}
                      onChange={(e) => setNewPostRegion(e.target.value)}
                      placeholder="Localização / Serra"
                      className="px-4 py-2.5 rounded-[14px] bg-black/25 border border-white/15 text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/40 focus:outline-none focus:border-[#A8B88A]"
                    />
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Descreva os materiais naturais utilizados, condições meteorológicas e aprendizagens..."
                    className="w-full px-4 py-2.5 rounded-[14px] bg-black/25 border border-white/15 text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/40 focus:outline-none focus:border-[#A8B88A]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#C85A3E] hover:bg-[#b54d32] text-sm font-medium text-[#E6D7C3] cursor-pointer"
                    >
                      Publicar no Feed
                    </button>
                  </div>
                </form>
              )}

              {/* Feed Posts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {feedPosts.map((post) => (
                  <article key={post.id} className="glass-card p-6 flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#5A6B44]/50 border border-white/15 flex items-center justify-center font-display text-base font-semibold text-[#E6D7C3]">
                            {post.author.charAt(0)}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-[#E6D7C3]">{post.author}</span>
                              <span className="text-xs text-[#E6D7C3]/55">{post.handle}</span>
                            </div>
                            {post.authorBadges && post.authorBadges.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#C85A3E] font-medium mt-0.5">
                                <Award className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                                <span>{post.authorBadges.join(' · ')}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-[#A8B88A] mt-0.5">
                              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                              <span>{post.region}</span>
                              <span aria-hidden="true">·</span>
                              <span>{post.timeAgo}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#E6D7C3]/55 tabular-nums hidden sm:inline">
                          {post.coordinates}
                        </span>
                      </div>

                      {/* Post Visual */}
                      <div className="rounded-[18px] overflow-hidden border border-white/12 aspect-[16/9] bg-[#142018]">
                        <BushcraftIllustration type={post.illustration} className="w-full h-full object-cover" />
                      </div>

                      {/* Post Copy */}
                      <div className="space-y-2">
                        <p className="text-xs text-[#A8B88A]">{post.categoryLabel}</p>
                        <h3 className="font-display text-xl text-[#E6D7C3] font-semibold">
                          {post.title}
                        </h3>
                        <p className="text-sm text-[#E6D7C3]/80 leading-relaxed">
                          {post.content}
                        </p>
                      </div>
                    </div>

                    {/* Interactions & Comments */}
                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <button
                            onClick={() => togglePostLike(post.id)}
                            className={`flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                              post.likedByMe ? 'text-[#C85A3E]' : 'text-[#E6D7C3]/75 hover:text-[#E6D7C3]'
                            }`}
                          >
                            <Heart
                              className="w-4 h-4"
                              strokeWidth={1.5}
                              fill={post.likedByMe ? 'currentColor' : 'none'}
                            />
                            <span className="tabular-nums">{post.likes} gostos</span>
                          </button>

                          <span className="flex items-center gap-2 text-xs sm:text-sm text-[#E6D7C3]/75 tabular-nums">
                            <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                            <span>{post.comments.length} comentários</span>
                          </span>
                        </div>

                        <span className="text-xs text-[#A8B88A] flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                          Relato Verificado
                        </span>
                      </div>

                      {/* Existing Comments */}
                      <div className="space-y-2.5 bg-black/20 rounded-[16px] p-3.5 border border-white/8">
                        {post.comments.map((c) => (
                          <div key={c.id} className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[#E6D7C3]">
                              <span className="font-semibold">{c.author}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#A8B88A]">{c.role}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#E6D7C3]/50">{c.timeAgo}</span>
                            </div>
                            <p className="text-[#E6D7C3]/80 leading-relaxed">{c.text}</p>
                          </div>
                        ))}

                        {/* Add Comment Input */}
                        <form onSubmit={(e) => handleAddComment(post.id, e)} className="pt-2 flex gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            placeholder="Escrever comentário técnico..."
                            className="flex-1 bg-white/[0.05] border border-white/12 rounded-full px-3.5 py-1.5 text-xs text-[#E6D7C3] placeholder:text-[#E6D7C3]/45 focus:outline-none focus:border-[#A8B88A]"
                          />
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-full bg-[#5A6B44]/60 hover:bg-[#5A6B44] text-xs text-[#E6D7C3] font-medium cursor-pointer"
                          >
                            Enviar
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: GRUPOS REGIONAIS */}
          {socialTab === 'grupos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map((grp) => (
                <div key={grp.id} className="glass-card p-6 flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#A8B88A]">
                      <span>{grp.biome}</span>
                      <span className="font-mono tabular-nums">{grp.members} membros</span>
                    </div>
                    <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold">
                      {grp.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#E6D7C3]/75">
                      Coordenação de campo: <strong className="text-[#E6D7C3]">{grp.coordinator}</strong>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[16px] bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-[#E6D7C3]/85 flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-[#C85A3E] shrink-0" strokeWidth={1.5} />
                    <span>Próxima saída: {grp.nextMeetup}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#E6D7C3]/65">
                      Canal rádio regional: PMR446 Canal 8
                    </span>
                    <button
                      onClick={() => toggleGroupJoin(grp.id)}
                      className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                        grp.joined
                          ? 'bg-[#5A6B44]/40 text-[#A8B88A] border border-[#A8B88A]/40'
                          : 'bg-[#C85A3E] hover:bg-[#b54d32] text-[#E6D7C3]'
                      }`}
                    >
                      {grp.joined ? 'Membro do Grupo ✓' : 'Aderir ao Grupo Regional'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: FÓRUM DE PERGUNTAS */}
          {socialTab === 'forum' && (
            <div className="space-y-6">
              <form onSubmit={handleAskQuestion} className="glass-card p-5 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Coloque uma dúvida técnica aos instrutores (ex.: conservação de água, nós, botânica)..."
                  className="flex-1 px-4 py-3 rounded-full bg-black/25 border border-white/15 text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/45 focus:outline-none focus:border-[#A8B88A]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-[#C85A3E] hover:bg-[#b54d32] text-sm font-medium text-[#E6D7C3] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Publicar Pergunta
                </button>
              </form>

              <div className="space-y-4">
                {forumQuestions.map((fq) => (
                  <div key={fq.id} className="glass-card p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-[#A8B88A]">
                          <span>{fq.categoryLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span>Perguntado por {fq.author} ({fq.region})</span>
                        </div>
                        <h3 className="font-display text-lg sm:text-xl text-[#E6D7C3] font-semibold">
                          {fq.question}
                        </h3>
                      </div>

                      <button
                        onClick={() => toggleQuestionVote(fq.id)}
                        className={`px-3.5 py-2 rounded-full text-xs font-mono tabular-nums flex items-center gap-1.5 border transition-colors shrink-0 cursor-pointer ${
                          fq.voted
                            ? 'bg-[#5A6B44]/60 text-[#E6D7C3] border-[#A8B88A]'
                            : 'glass-pill text-[#E6D7C3]/75 hover:text-[#E6D7C3]'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>{fq.votes}</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-[16px] bg-white/[0.04] border border-white/10 space-y-1.5">
                      <p className="text-xs font-medium text-[#A8B88A]">
                        Resposta Técnica Verificada · {fq.instructorName}
                      </p>
                      <p className="text-sm text-[#E6D7C3]/85 leading-relaxed">
                        {fq.instructorAnswer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EVENTOS E SAÍDAS DE CAMPO */}
          {socialTab === 'eventos' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((ev) => (
                <div key={ev.id} className="glass-card p-6 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#A8B88A]">
                      <span>{ev.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>Nível {ev.level}</span>
                    </div>
                    <h3 className="font-display text-xl text-[#E6D7C3] font-semibold leading-snug">
                      {ev.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#E6D7C3]/75 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#C85A3E] shrink-0" strokeWidth={1.5} />
                      <span>{ev.location}</span>
                    </p>
                    <p className="text-xs text-[#E6D7C3]/65">
                      Orientação: {ev.instructor}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <span className="text-xs font-mono text-[#E6D7C3]/75 tabular-nums">
                      {ev.spotsLeft} de {ev.totalSpots} vagas livres
                    </span>
                    <button
                      onClick={() => toggleEventEnroll(ev.id)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        ev.enrolled
                          ? 'bg-[#5A6B44]/50 text-[#A8B88A] border border-[#A8B88A]/40'
                          : 'bg-[#C85A3E] hover:bg-[#b54d32] text-[#E6D7C3]'
                      }`}
                    >
                      {ev.enrolled ? 'Vaga Reservada ✓' : 'Reservar Vaga'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: INSÍGNIAS & PERFIL DE UTILIZADOR (SISTEMA DE CONQUISTAS) */}
          {socialTab === 'conquistas' && (
            <div className="space-y-8">
              {/* User Public Profile Showcase Card with Featured Badges */}
              <div className="glass-card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#5A6B44]/55 border border-[#A8B88A]/50 flex items-center justify-center font-display text-2xl font-semibold text-[#E6D7C3] shrink-0">
                    {(loggedUser ? loggedUser.name : 'Diogo Santarém').charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#A8B88A]">
                      <span>{explorerRankTitle}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{totalExplorerXp} XP</span>
                    </div>
                    <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold">
                      {loggedUser ? loggedUser.name : 'Diogo Santarém'}
                    </h3>
                    <p className="text-xs text-[#E6D7C3]/70">
                      Núcleo Serra da Lousã · {unlockedBadges.length} de {badges.length} insígnias conquistadas
                    </p>
                  </div>
                </div>

                {/* Featured Badges Displayed on Profile */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#A8B88A] font-medium">
                      Insígnias em Exibição no Perfil ({featuredBadges.length}/3):
                    </span>
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="text-[#E6D7C3]/75 hover:text-[#E6D7C3] underline underline-offset-4 cursor-pointer"
                    >
                      Abrir Passaporte Completo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {featuredBadges.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-[16px] bg-white/[0.05] border border-[#A8B88A]/40 flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#5A6B44]/50 border border-white/15 flex items-center justify-center text-[#E6D7C3] shrink-0">
                          {renderBadgeIcon(b.iconKey, 'w-4 h-4')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#E6D7C3] truncate">{b.title}</p>
                          <p className="text-[11px] text-[#A8B88A] font-mono tabular-nums">+{b.xp} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {badgeToast && (
                <div className="p-4 rounded-[16px] bg-[#5A6B44]/45 border border-[#A8B88A]/60 text-xs sm:text-sm text-[#E6D7C3] flex items-center justify-between">
                  <span>{badgeToast}</span>
                  <button onClick={() => setBadgeToast(null)} className="text-xs opacity-75 hover:opacity-100 cursor-pointer">
                    Fechar
                  </button>
                </div>
              )}

              {/* All Community Badges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge) => {
                  const isPinned = featuredBadgeIds.includes(badge.id);
                  const pct = Math.min(100, Math.round((badge.progressCurrent / badge.progressTarget) * 100));
                  return (
                    <div
                      key={badge.id}
                      className={`glass-card p-6 flex flex-col justify-between space-y-5 transition-all ${
                        badge.unlocked ? 'border-[#A8B88A]/35' : 'opacity-80'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                              badge.unlocked
                                ? 'bg-[#5A6B44]/55 border-[#A8B88A]/50 text-[#E6D7C3]'
                                : 'bg-black/30 border-white/10 text-[#E6D7C3]/45'
                            }`}
                          >
                            {renderBadgeIcon(badge.iconKey, 'w-6 h-6')}
                          </div>

                          <div className="text-right text-xs text-[#A8B88A] font-mono tabular-nums">
                            <span>{badge.rarity}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{badge.xp} XP</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-xs text-[#A8B88A]">
                            <span>{badge.category}</span>
                            <span aria-hidden="true"> · </span>
                            <span>{badge.unlocked ? 'Conquistada ✓' : 'Em progresso'}</span>
                          </div>
                          <h4 className="font-display text-xl text-[#E6D7C3] font-semibold">
                            {badge.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-[#E6D7C3]/75 leading-relaxed">
                            {badge.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 space-y-3">
                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-[#E6D7C3]/70 font-mono tabular-nums">
                            <span>Progresso de campo</span>
                            <span>
                              {badge.progressCurrent}/{badge.progressTarget} {badge.unit}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pct}%`,
                                background: badge.unlocked ? '#A8B88A' : '#C85A3E',
                              }}
                            />
                          </div>
                        </div>

                        {badge.unlocked ? (
                          <button
                            onClick={() => togglePinBadge(badge.id)}
                            className={`w-full py-2.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                              isPinned
                                ? 'bg-[#5A6B44]/60 text-[#E6D7C3] border-[#A8B88A]'
                                : 'glass-pill text-[#E6D7C3]/80 hover:text-[#E6D7C3]'
                            }`}
                          >
                            {isPinned ? 'Exibida no Perfil ✓' : 'Exibir no Perfil'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnlockBadge(badge.id)}
                            className="w-full py-2.5 rounded-full bg-[#C85A3E]/85 hover:bg-[#C85A3E] text-xs font-medium text-[#E6D7C3] transition-colors cursor-pointer"
                          >
                            Validar Conquista em Campo →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ===================================================================
            7. CHECKLIST INTERATIVA "KIT DE 72 HORAS" COM BARRA DE PROGRESSO
           =================================================================== */}
        <section id="kits" className="space-y-8 scroll-mt-24">
          <div className="glass-card p-6 sm:p-10 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-[#A8B88A] font-medium">
                  04. Ferramenta de Prontidão Familiar & Individual
                </p>
                <h2 className="font-display text-2xl sm:text-4xl text-[#E6D7C3] font-semibold">
                  Checklist Interativa: Kit de 72 Horas
                </h2>
                <p className="text-sm sm:text-base text-[#E6D7C3]/75 max-w-[65ch]">
                  Configure e audite a sua mochila de autonomia para 3 dias. O peso total é calculado em tempo real para garantir mobilidade confortável em terreno variado.
                </p>
              </div>

              {/* Filter & Export Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1 p-1 rounded-full glass-pill">
                  <button
                    onClick={() => setKitFilter('todos')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      kitFilter === 'todos' ? 'bg-[#5A6B44] text-[#E6D7C3]' : 'text-[#E6D7C3]/70'
                    }`}
                  >
                    Todos ({kitStats.total})
                  </button>
                  <button
                    onClick={() => setKitFilter('em-falta')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      kitFilter === 'em-falta' ? 'bg-[#C85A3E] text-[#E6D7C3]' : 'text-[#E6D7C3]/70'
                    }`}
                  >
                    Em falta ({kitStats.total - kitStats.completed})
                  </button>
                  <button
                    onClick={() => setKitFilter('prontos')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      kitFilter === 'prontos' ? 'bg-[#5A6B44] text-[#E6D7C3]' : 'text-[#E6D7C3]/70'
                    }`}
                  >
                    Prontos ({kitStats.completed})
                  </button>
                </div>

                <button
                  onClick={handleExportKitTxt}
                  className="px-4 py-2 rounded-full glass-pill text-xs font-medium text-[#E6D7C3] hover:border-[#A8B88A] flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Exportar TXT</span>
                </button>

                <button
                  onClick={() => setKitItems(INITIAL_KIT_72H)}
                  className="p-2 rounded-full glass-pill text-[#E6D7C3]/70 hover:text-[#E6D7C3] cursor-pointer"
                  title="Repor estado padrão"
                >
                  <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Progress Bar & Telemetry Strip */}
            <div className="p-5 rounded-[20px] bg-black/25 border border-white/12 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl sm:text-2xl font-semibold text-[#E6D7C3] tabular-nums">
                    {kitStats.percentage}% concluído
                  </span>
                  <span className="text-[#E6D7C3]/65 tabular-nums">
                    ({kitStats.completed} de {kitStats.total} equipamentos verificados)
                  </span>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs tabular-nums text-[#A8B88A]">
                  <span>Peso na mochila: <strong>{kitStats.currentWeightKg} kg</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Peso total previsto: {kitStats.totalWeightKg} kg</span>
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${kitStats.percentage}%`,
                    background: 'linear-gradient(90deg, #5A6B44 0%, #A8B88A 60%, #C85A3E 100%)',
                  }}
                />
              </div>
            </div>

            {/* Checklist Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredKitItems.map((item) => (
                <label
                  key={item.id}
                  onClick={() => toggleKitItem(item.id)}
                  className={`p-4 rounded-[18px] border transition-all flex items-start justify-between gap-4 cursor-pointer select-none ${
                    item.checked
                      ? 'bg-[#5A6B44]/22 border-[#A8B88A]/35 text-[#E6D7C3]'
                      : 'bg-white/[0.03] border-white/10 text-[#E6D7C3]/85 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                        item.checked
                          ? 'bg-[#C85A3E] border-[#C85A3E] text-[#E6D7C3]'
                          : 'border-white/30 bg-black/20'
                      }`}
                    >
                      {item.checked && <Check className="w-3.5 h-3.5" strokeWidth={2.2} />}
                    </div>

                    <div className="space-y-1">
                      <p
                        className={`text-sm font-medium leading-snug ${
                          item.checked ? 'line-through decoration-[#A8B88A]/60 text-[#E6D7C3]/75' : 'text-[#E6D7C3]'
                        }`}
                      >
                        {item.label}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#E6D7C3]/60">
                        <span className="text-[#A8B88A]">{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.spec}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-[#E6D7C3]/65 tabular-nums whitespace-nowrap shrink-0">
                    {item.weightGrams} g
                  </span>
                </label>
              ))}
            </div>

            {/* Add Custom Item to Kit */}
            <form onSubmit={handleAddCustomKitItem} className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                placeholder="Adicionar equipamento personalizado ao seu Kit (ex.: Filtro Sawyer Mini, Medicação)..."
                className="flex-1 px-4 py-2.5 rounded-full bg-black/25 border border-white/15 text-xs sm:text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/45 focus:outline-none focus:border-[#A8B88A]"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={newItemWeight}
                  onChange={(e) => setNewItemWeight(e.target.value)}
                  className="w-24 px-3.5 py-2.5 rounded-full bg-black/25 border border-white/15 text-xs sm:text-sm font-mono tabular-nums text-[#E6D7C3] focus:outline-none"
                  title="Peso em gramas"
                />
                <span className="text-xs text-[#E6D7C3]/60">g</span>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#5A6B44]/60 hover:bg-[#5A6B44] text-xs sm:text-sm font-medium text-[#E6D7C3] whitespace-nowrap cursor-pointer"
                >
                  + Adicionar Item
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ===================================================================
            MAPA DE BIOMAS E ZONAS DE TREINO EM PORTUGAL (NAV LINK #MAPA)
           =================================================================== */}
        <section id="mapa" className="space-y-8 scroll-mt-24">
          <div>
            <p className="text-xs sm:text-sm text-[#A8B88A] font-medium mb-1">
              05. Cartografia & Biomas Portugueses
            </p>
            <h2 className="font-display text-2xl sm:text-4xl text-[#E6D7C3] font-semibold">
              Mapa de Núcleos Regionais e Ecossistemas
            </h2>
          </div>

          <div className="glass-card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              {groups.map((g) => {
                const isSelected = selectedBiomeId === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedBiomeId(g.id)}
                    className={`w-full text-left p-4 rounded-[18px] border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#5A6B44]/45 border-[#A8B88A]/60'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-[#A8B88A]">
                      <span>{g.biome}</span>
                      <span className="font-mono tabular-nums">{g.members} membros</span>
                    </div>
                    <p className="font-display text-lg text-[#E6D7C3] font-semibold mt-1">
                      {g.name}
                    </p>
                    <p className="text-xs text-[#E6D7C3]/75 mt-1">{g.nextMeetup}</p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 rounded-[20px] bg-[#142018] border border-white/12 p-6 space-y-5">
              {(() => {
                const activeGroup = groups.find((g) => g.id === selectedBiomeId) || groups[0];
                return (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                      <div>
                        <span className="text-xs text-[#A8B88A]">Bioma Selecionado</span>
                        <h3 className="font-display text-2xl text-[#E6D7C3] font-semibold">
                          {activeGroup.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => toggleGroupJoin(activeGroup.id)}
                        className="px-4 py-2 rounded-full bg-[#C85A3E] hover:bg-[#b54d32] text-xs font-medium text-[#E6D7C3] cursor-pointer"
                      >
                        {activeGroup.joined ? 'Inscrito neste Núcleo ✓' : 'Juntar-me a este Núcleo'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                      <div className="p-3.5 rounded-[14px] bg-white/[0.04] border border-white/8">
                        <span className="text-[#E6D7C3]/60 block text-xs">Flora Dominante</span>
                        <strong className="text-[#E6D7C3] mt-1 block">
                          {activeGroup.id === 'grp-norte'
                            ? 'Carvalho-alvarinho, Azevinho, Vidoeiro'
                            : activeGroup.id === 'grp-beiras'
                            ? 'Pinheiro-silvestre, Zimbro, Urze'
                            : activeGroup.id === 'grp-alentejo'
                            ? 'Azinheira, Sobreiro, Esteva'
                            : 'Pinheiro-manso, Sabina, Carrasco'}
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-[14px] bg-white/[0.04] border border-white/8">
                        <span className="text-[#E6D7C3]/60 block text-xs">Disponibilidade Hídrica</span>
                        <strong className="text-[#E6D7C3] mt-1 block">
                          {activeGroup.id === 'grp-alentejo'
                            ? 'Sazonal · Requer captação de orvalho'
                            : 'Abundante · Linhas de água graníticas'}
                        </strong>
                      </div>
                      <div className="p-3.5 rounded-[14px] bg-white/[0.04] border border-white/8">
                        <span className="text-[#E6D7C3]/60 block text-xs">Coordenador Regional</span>
                        <strong className="text-[#E6D7C3] mt-1 block">{activeGroup.coordinator}</strong>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#E6D7C3]/75 leading-relaxed">
                      Cada núcleo regional organiza treinos mensais gratuitos de orientação cartográfica, identificação botânica e revisão de equipamento de emergência em parceria com associações florestais locais.
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </section>

        {/* ===================================================================
            8. TESTEMUNHOS + NÚMEROS DA COMUNIDADE
           =================================================================== */}
        <section className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm text-[#A8B88A] font-medium mb-1">
                06. Impacto Real & Prova Comunitária
              </p>
              <h2 className="font-display text-2xl sm:text-4xl text-[#E6D7C3] font-semibold">
                Vozes da Comunidade Sobrevivente.eu
              </h2>
            </div>
          </div>

          {/* Community Quantitative Metrics Bar (Tabular Numerals) */}
          <div className="glass-card p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/12">
            <div className="pt-3 sm:pt-0 sm:px-4 first:pl-0">
              <p className="font-display text-3xl sm:text-4xl font-semibold text-[#E6D7C3] tabular-nums">
                12.480
              </p>
              <p className="text-xs sm:text-sm text-[#A8B88A] mt-1">
                Membros ativos em Portugal
              </p>
              <p className="text-xs text-[#E6D7C3]/60 mt-0.5">
                Continente, Açores e Madeira
              </p>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-4">
              <p className="font-display text-3xl sm:text-4xl font-semibold text-[#E6D7C3] tabular-nums">
                148
              </p>
              <p className="text-xs sm:text-sm text-[#A8B88A] mt-1">
                Manuais técnicos ilustrados
              </p>
              <p className="text-xs text-[#E6D7C3]/60 mt-0.5">
                Revistos por especialistas de campo
              </p>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-4">
              <p className="font-display text-3xl sm:text-4xl font-semibold text-[#E6D7C3] tabular-nums">
                18
              </p>
              <p className="text-xs sm:text-sm text-[#A8B88A] mt-1">
                Núcleos regionais autónomos
              </p>
              <p className="text-xs text-[#E6D7C3]/60 mt-0.5">
                Com rede de rádio PMR446 local
              </p>
            </div>

            <div className="pt-3 sm:pt-0 sm:px-4">
              <p className="font-display text-3xl sm:text-4xl font-semibold text-[#E6D7C3] tabular-nums">
                310+
              </p>
              <p className="text-xs sm:text-sm text-[#A8B88A] mt-1">
                Saídas de campo realizadas
              </p>
              <p className="text-xs text-[#E6D7C3]/60 mt-0.5">
                Zero incidentes · Ética ecológica
              </p>
            </div>
          </div>

          {/* Attributable Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.id}
                className="glass-card p-6 sm:p-7 flex flex-col justify-between space-y-6"
              >
                <p className="text-sm sm:text-base text-[#E6D7C3]/90 leading-relaxed italic font-display">
                  “{t.quote}”
                </p>

                <footer className="pt-4 border-t border-white/10 space-y-1">
                  <div className="font-semibold text-sm text-[#E6D7C3]">{t.name}</div>
                  <div className="text-xs text-[#A8B88A]">
                    {t.role} · {t.region}
                  </div>
                  <div className="text-xs text-[#E6D7C3]/60 pt-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#C85A3E] shrink-0" strokeWidth={1.5} />
                    <span>{t.outcome}</span>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        {/* ===================================================================
            9. CTA FINAL: REGISTO POR EMAIL
           =================================================================== */}
        <section className="glass-card p-8 sm:p-12 relative overflow-hidden">
          <div
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(200,90,62,0.18) 0%, transparent 70%)' }}
          />

          <div className="max-w-2xl space-y-6 relative z-10">
            <p className="text-xs sm:text-sm text-[#A8B88A] font-medium">
              Comece Hoje a Sua Jornada de Autonomia
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-[#E6D7C3] font-semibold leading-tight">
              Receba o Caderno PDF “Kit 72h & Flora Ibérica” e junte-se ao seu grupo regional.
            </h2>
            <p className="text-sm sm:text-base text-[#E6D7C3]/80 leading-relaxed">
              Sem spam nem alarmismo. Apenas um boletim quinzenal com novos manuais práticos, calendário de saídas de campo na sua região e alertas sazonais de segurança florestal.
            </p>

            {newsletterSubmitted ? (
              <div className="p-5 rounded-[18px] bg-[#5A6B44]/40 border border-[#A8B88A]/50 space-y-1">
                <p className="font-display text-lg text-[#E6D7C3] font-semibold">
                  Bem-vindo ao Sobrevivente.eu!
                </p>
                <p className="text-xs sm:text-sm text-[#E6D7C3]/85">
                  Enviámos o manual inicial e o convite do núcleo <strong>{newsletterRegion}</strong> para{' '}
                  <span className="underline">{newsletterEmail}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} noValidate className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="O seu melhor email (ex.: tiago@dominio.pt)"
                    className="flex-1 px-5 py-3.5 rounded-full bg-black/30 border border-white/15 text-sm text-[#E6D7C3] placeholder:text-[#E6D7C3]/45 focus:outline-none focus:border-[#A8B88A]"
                  />

                  <select
                    value={newsletterRegion}
                    onChange={(e) => setNewsletterRegion(e.target.value)}
                    aria-label="Selecione a sua região"
                    className="px-4 py-3.5 rounded-full bg-black/30 border border-white/15 text-sm text-[#E6D7C3] focus:outline-none focus:border-[#A8B88A]"
                  >
                    <option value="Norte & Gerês" className="bg-[#1F2E24]">Norte & Gerês</option>
                    <option value="Beiras & Serra da Estrela" className="bg-[#1F2E24]">Beiras & Serra da Estrela</option>
                    <option value="Lisboa, Sintra & Oeste" className="bg-[#1F2E24]">Lisboa, Sintra & Oeste</option>
                    <option value="Alentejo & Costa Vicentina" className="bg-[#1F2E24]">Alentejo & Costa Vicentina</option>
                    <option value="Algarve & Serra de Monchique" className="bg-[#1F2E24]">Algarve & Monchique</option>
                    <option value="Açores & Madeira" className="bg-[#1F2E24]">Açores & Madeira</option>
                  </select>

                  <button
                    type="submit"
                    className="px-7 py-3.5 rounded-full bg-[#C85A3E] hover:bg-[#b54d32] text-[#E6D7C3] font-medium text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Criar Conta Gratuita</span>
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
                {newsletterError && (
                  <p className="text-xs text-[#C85A3E] pl-2">{newsletterError}</p>
                )}
              </form>
            )}
          </div>
        </section>
      </main>

      {/* =====================================================================
          RODAPÉ COM LINKS, REDES E AVISO DE SEGURANÇA
         ===================================================================== */}
      <footer className="relative z-10 border-t border-white/12 bg-[#142018]/90 backdrop-blur-xl pb-24 md:pb-12 pt-12">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 space-y-10">
          {/* Safety Notice Box (Aviso de Segurança e Ética Florestal) */}
          <div className="p-5 rounded-[20px] bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-[#C85A3E] shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="space-y-1 text-xs text-[#E6D7C3]/75 leading-relaxed">
              <p className="font-semibold text-[#E6D7C3]">
                Aviso de Segurança, Ética Florestal e Responsabilidade Legal
              </p>
              <p>
                Os manuais do Sobrevivente.eu têm carácter estritamente educativo e formativo. Em Portugal, a realização de fogueiras, queimas ou uso de fogareiros em espaço florestal está sujeita às normas do ICNF e ao Índice de Perigo de Incêndio Rural (IPMA). Nunca colha plantas ou cogumelos silvestres sem confirmação taxonómica absoluta nem substitua cuidados médicos profissionais em situações de emergência (ligue 112).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/logo_7a6369a0.png"
                  alt="Sobrevivente.eu Emblema"
                  className="w-8 h-8 rounded-full object-cover border border-[#E6D7C3]/25"
                />
                <span className="font-display text-xl font-semibold text-[#E6D7C3]">
                  Sobrevivente.eu
                </span>
              </div>
              <p className="text-xs text-[#E6D7C3]/65 leading-relaxed">
                Plataforma de sobrevivencialismo sereno, bushcraft ético e resiliência comunitária.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#A8B88A]">Biblioteca de Manuais</p>
              <ul className="space-y-1.5 text-xs text-[#E6D7C3]/70">
                <li><a href="#manuais" onClick={() => setSelectedCategory('agua')} className="hover:text-[#E6D7C3]">Purificação de Água</a></li>
                <li><a href="#manuais" onClick={() => setSelectedCategory('fogo')} className="hover:text-[#E6D7C3]">Ignição e Fogo Primitivo</a></li>
                <li><a href="#manuais" onClick={() => setSelectedCategory('abrigo')} className="hover:text-[#E6D7C3]">Abrigos Naturais & Tarp</a></li>
                <li><a href="#manuais" onClick={() => setSelectedCategory('orientacao')} className="hover:text-[#E6D7C3]">Cartografia Militar 1:25.000</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#A8B88A]">Comunidade & Campo</p>
              <ul className="space-y-1.5 text-xs text-[#E6D7C3]/70">
                <li><a href="#comunidade" onClick={() => setSocialTab('grupos')} className="hover:text-[#E6D7C3]">Núcleos Regionais</a></li>
                <li><a href="#comunidade" onClick={() => setSocialTab('eventos')} className="hover:text-[#E6D7C3]">Calendário de Saídas</a></li>
                <li><a href="#kits" className="hover:text-[#E6D7C3]">Configurador Kit 72 Horas</a></li>
                <li><a href="#mapa" className="hover:text-[#E6D7C3]">Código Leave No Trace</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#A8B88A]">Ligações & Redes</p>
              <ul className="space-y-1.5 text-xs text-[#E6D7C3]/70">
                <li>Canal Rádio Comunitário: PMR446 C8/S12</li>
                <li>Instagram · YouTube · Mastodon PT</li>
                <li>Contacto: campo@sobrevivente.eu</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E6D7C3]/55">
            <span>© 2026 Sobrevivente.eu · Todos os direitos reservados.</span>
            <span>Desenhado em comunhão com a floresta autóctone portuguesa.</span>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          MOBILE: NAVEGAÇÃO INFERIOR FIXA (INÍCIO, MANUAIS, COMUNIDADE, KIT, PERFIL)
          Respects <=15% viewport height cap (h-14 = 56px)
         ===================================================================== */}
      <nav
        aria-label="Navegação móvel inferior"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#16231B]/90 backdrop-blur-xl border-t border-white/15 px-2 flex items-center justify-around"
      >
        <button
          onClick={() => scrollToSection('inicio', 'inicio')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
            activeMobileTab === 'inicio' ? 'text-[#C85A3E]' : 'text-[#E6D7C3]/70'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" strokeWidth={1.6} />
          <span>Início</span>
        </button>

        <button
          onClick={() => scrollToSection('manuais', 'manuais')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
            activeMobileTab === 'manuais' ? 'text-[#C85A3E]' : 'text-[#E6D7C3]/70'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" strokeWidth={1.6} />
          <span>Manuais</span>
        </button>

        <button
          onClick={() => scrollToSection('comunidade', 'comunidade')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
            activeMobileTab === 'comunidade' ? 'text-[#C85A3E]' : 'text-[#E6D7C3]/70'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" strokeWidth={1.6} />
          <span>Comunidade</span>
        </button>

        <button
          onClick={() => scrollToSection('kits', 'kit')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
            activeMobileTab === 'kit' ? 'text-[#C85A3E]' : 'text-[#E6D7C3]/70'
          }`}
        >
          <Backpack className="w-4 h-4 mb-0.5" strokeWidth={1.6} />
          <span>Kit</span>
        </button>

        <button
          onClick={() => {
            setActiveMobileTab('perfil');
            setAuthModalOpen(true);
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
            activeMobileTab === 'perfil' ? 'text-[#C85A3E]' : 'text-[#E6D7C3]/70'
          }`}
        >
          <User className="w-4 h-4 mb-0.5" strokeWidth={1.6} />
          <span>Perfil</span>
        </button>
      </nav>

      {/* =====================================================================
          MODAL 1: LEITOR DE MANUAL COMPLETO
         ===================================================================== */}
      {activeManualModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveManualModal(null)}
        >
          <div
            className="glass-card max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#A8B88A]">
                  <span>{activeManualModal.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>Nível {activeManualModal.level}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeManualModal.readTime}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-[#E6D7C3] font-semibold">
                  {activeManualModal.title}
                </h2>
                <p className="text-xs text-[#E6D7C3]/70">{activeManualModal.author}</p>
              </div>

              <button
                onClick={() => setActiveManualModal(null)}
                className="p-2 rounded-full glass-pill text-[#E6D7C3]/75 hover:text-[#E6D7C3] cursor-pointer"
                aria-label="Fechar manual"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="rounded-[18px] overflow-hidden border border-white/12 aspect-[16/9] bg-[#142018]">
              <BushcraftIllustration
                type={activeManualModal.illustration}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-sm sm:text-base text-[#E6D7C3]/85 leading-relaxed">
              {activeManualModal.summary}
            </p>

            {/* Materials Needed */}
            <div className="p-4 rounded-[18px] bg-white/[0.04] border border-white/10 space-y-2">
              <h3 className="font-display text-base text-[#A8B88A] font-semibold">
                Recursos e Materiais Necessários
              </h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#E6D7C3]/85">
                {activeManualModal.materials.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#C85A3E]">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-4">
              <h3 className="font-display text-lg text-[#E6D7C3] font-semibold">
                Protocolo Passo a Passo
              </h3>
              {activeManualModal.steps.map((st, i) => (
                <div key={i} className="p-4 rounded-[16px] bg-black/25 border border-white/10 space-y-1">
                  <p className="text-sm font-semibold text-[#E6D7C3]">{st.title}</p>
                  <p className="text-xs sm:text-sm text-[#E6D7C3]/80 leading-relaxed">{st.detail}</p>
                </div>
              ))}
            </div>

            {/* Safety / Field Note */}
            <div className="p-4 rounded-[16px] bg-[#C85A3E]/15 border border-[#C85A3E]/40 text-xs sm:text-sm text-[#E6D7C3] space-y-1">
              <p className="font-semibold text-[#C85A3E]">Nota de Segurança de Campo:</p>
              <p>{activeManualModal.fieldNote}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => toggleSaveManual(activeManualModal.id)}
                className="px-5 py-2.5 rounded-full bg-[#5A6B44]/60 hover:bg-[#5A6B44] text-xs sm:text-sm font-medium text-[#E6D7C3] flex items-center gap-2 cursor-pointer"
              >
                <Bookmark className="w-4 h-4" strokeWidth={1.5} />
                <span>
                  {savedManualIds.includes(activeManualModal.id)
                    ? 'Guardado nos Favoritos ✓'
                    : 'Guardar Manual'}
                </span>
              </button>

              <button
                onClick={() => setActiveManualModal(null)}
                className="px-6 py-2.5 rounded-full bg-[#C85A3E] text-xs sm:text-sm font-medium text-[#E6D7C3] cursor-pointer"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: POPUP DE LOGIN & INSCRIÇÃO COM BASE DE DADOS DO SERVIDOR
         ===================================================================== */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={loggedUser}
        onLoginSuccess={(u) => {
          setLoggedUser(u);
          setBadgeToast(`Bem-vindo, ${u.name}! Inscrição verificada na base de dados.`);
          setTimeout(() => setBadgeToast(null), 3500);
        }}
        onLogout={() => {
          setLoggedUser(null);
          setBadgeToast('Sessão terminada.');
          setTimeout(() => setBadgeToast(null), 2500);
        }}
      />
    </div>
  );
}
