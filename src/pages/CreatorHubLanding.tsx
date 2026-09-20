import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Layers, 
  Eye, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  Users, 
  BarChart3, 
  Lock, 
  Zap, 
  ChevronRight, 
  ChevronDown,
  Share2, 
  Radio, 
  Building2,
  Calendar,
  Globe2,
  Check,
  Play,
  Sun,
  Moon,
  Shield,
  HelpCircle,
  Mail,
  Calculator,
  DollarSign,
  Flame
} from 'lucide-react';
import DemoRequestModal from '../components/landing/DemoRequestModal';

const PLATFORMS = [
  { name: 'YouTube', icon: '▶️', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', metrics: 'Views, Likes, Comments' },
  { name: 'TikTok', icon: '🎵', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', metrics: 'Views, Likes, Comments' },
  { name: 'Instagram', icon: '📸', color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20', metrics: 'Reels, Posts & Stories' },
  { name: 'X / Twitter', icon: '𝕏', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', metrics: 'Impressions, Retweets, Likes' },
  { name: 'Twitch', icon: '🟣', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', metrics: 'Peak & Avg Viewers, Duration' },
  { name: 'CoinMarketCap', icon: '🟡', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', metrics: 'Community Feed Posts' }
];

export const CreatorHubLanding: React.FC = () => {
  const navigate = useNavigate();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [stats, setStats] = useState({ views: 50000000, campaigns: 120, creators: 30 });
  const [mockActiveCampaign, setMockActiveCampaign] = useState<'all' | 'nexus' | 'cyber'>('all');
  
  // Hero fast email capture
  const [heroEmail, setHeroEmail] = useState('');
  
  // Sticky CTA visibility
  const [stickyVisible, setStickyVisible] = useState(false);
  
  // ROI Calculator state (creators slider)
  const [selectedCreatorsRoi, setSelectedCreatorsRoi] = useState(25);
  
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Theme state: light by default
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('browns_stats_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  // Sync theme with localStorage and root HTML class
  useEffect(() => {
    localStorage.setItem('browns_stats_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Scroll listener for sticky CTA bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 480) {
        setStickyVisible(true);
      } else {
        setStickyVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isLight = theme === 'light';

  useEffect(() => {
    fetch('/api/public-stats')
      .then(res => res.json())
      .then(data => {
        if (data && data.views) {
          setStats({
            views: data.views,
            campaigns: data.campaigns,
            creators: data.creators
          });
        }
      })
      .catch(err => console.log('Using default landing stats:', err));
  }, []);

  const scrollToMockup = () => {
    const el = document.getElementById('platform-demo');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className={`min-h-screen selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden transition-colors duration-500 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[140px] transition-opacity duration-700 ${
          isLight ? 'bg-indigo-300/30 opacity-60' : 'bg-indigo-600/15 opacity-100'
        }`} />
        <div className={`absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[160px] transition-opacity duration-700 ${
          isLight ? 'bg-emerald-200/40 opacity-70' : 'bg-emerald-600/10 opacity-100'
        }`} />
        <div className={`absolute top-[70%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] transition-opacity duration-700 ${
          isLight ? 'bg-purple-200/30 opacity-60' : 'bg-purple-600/10 opacity-100'
        }`} />
      </div>

      {/* Navigation */}
      <nav className={`relative z-50 border-b sticky top-0 transition-colors duration-300 ${
        isLight 
          ? 'border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xs' 
          : 'border-slate-800/80 bg-slate-950/70 backdrop-blur-xl'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className={`font-black text-lg tracking-tight uppercase flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Browns <span className="text-indigo-600 dark:text-indigo-400 font-black">Stats</span>
                <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 lowercase tracking-normal">
                  by browns.studio
                </span>
              </span>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all ${
                isLight 
                  ? 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                  : 'border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
              title={isLight ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
              aria-label="Toggle theme"
            >
              {isLight ? <Moon className="h-4 w-4 text-slate-700" /> : <Sun className="h-4 w-4 text-amber-400" />}
            </button>

            <a
              href="https://browns.studio"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden lg:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors px-3 py-2 rounded-xl ${
                isLight 
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>Browns Studio</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            <button
              onClick={() => navigate('/umbra')}
              className={`hidden md:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors px-3 py-2 rounded-xl ${
                isLight 
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>Agencia Umbra</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all ${
                isLight 
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs' 
                  : 'border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Consola
            </button>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <span>Solicitar Demo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Eyebrow Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border shadow-xs ${
            isLight 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Plataforma de Analítica & Tracking por Browns Studio</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] max-w-5xl mx-auto ${
            isLight ? 'text-slate-950' : 'text-white'
          }`}
        >
          Infraestructura de Analítica y Seguimiento de{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 dark:from-indigo-400 dark:via-indigo-200 dark:to-emerald-400">
            Creadores de Contenido
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-6 text-base sm:text-xl max-w-3xl mx-auto font-normal leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          Centraliza todas tus campañas, automatiza el tracking diario de publicaciones en cada red social y entrega reportes en vivo a tus clientes sin fricción ni capturas manuales.
        </motion.p>

        {/* High-Converting Fast Email Capture CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 max-w-xl mx-auto"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setIsDemoModalOpen(true);
            }}
            className={`p-1.5 sm:p-2 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-xl ${
              isLight 
                ? 'bg-white border-slate-300 shadow-slate-200/70 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100' 
                : 'bg-slate-900/90 border-slate-700/80 shadow-indigo-950/40 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20'
            }`}
          >
            <div className="flex items-center gap-3 px-3.5 py-2.5 flex-1 min-w-0">
              <Mail className="h-5 w-5 text-indigo-500 shrink-0" />
              <input
                type="email"
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                placeholder="Ingresa tu email corporativo..."
                className={`w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 shrink-0 group active:scale-95"
            >
              <span>Solicitar Acceso</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Secondary Action Triggers */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
            <button
              onClick={scrollToMockup}
              className={`inline-flex items-center gap-1.5 transition-colors ${
                isLight ? 'text-slate-600 hover:text-indigo-600' : 'text-slate-400 hover:text-indigo-300'
              }`}
            >
              <Play className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500" />
              <span>Ver simulación en vivo</span>
            </button>
            <span className={isLight ? 'text-slate-300' : 'text-slate-700'}>•</span>
            <button
              onClick={() => {
                const el = document.getElementById('roi-calculator');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`inline-flex items-center gap-1.5 transition-colors ${
                isLight ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Calculator className="h-3.5 w-3.5 text-emerald-500" />
              <span>Calcular ahorro de agencia</span>
            </button>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className={`mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Sin tarjeta de crédito</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Setup en 5 minutos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Monitoreo 100% desatendido</span>
          </div>
        </motion.div>

        {/* Live Interactive Platform Mockup */}
        <motion.div 
          id="platform-demo"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className={`mt-14 sm:mt-18 relative rounded-3xl border p-4 sm:p-8 shadow-2xl backdrop-blur-xl text-left overflow-hidden transition-all duration-300 ${
            isLight 
              ? 'bg-white/90 border-slate-200 shadow-slate-200/50 text-slate-900' 
              : 'bg-slate-900/80 border-slate-800 shadow-indigo-950/40 text-white'
          }`}
        >
          {/* Mock Header */}
          <div className={`flex flex-wrap items-center justify-between gap-4 pb-6 border-b ${
            isLight ? 'border-slate-100' : 'border-slate-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ml-2 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Panel de Control de Campañas & Creadores (En Vivo)
              </span>
            </div>

            {/* Interactive Campaign Filter Pill */}
            <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <button
                onClick={() => setMockActiveCampaign('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  mockActiveCampaign === 'all' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas las Campañas
              </button>
              <button
                onClick={() => setMockActiveCampaign('nexus')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  mockActiveCampaign === 'nexus' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⚡</span> Nexus Protocol
              </button>
              <button
                onClick={() => setMockActiveCampaign('cyber')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  mockActiveCampaign === 'cyber' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🎮</span> CyberRealm
              </button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className={`p-4 rounded-2xl border transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Vistas Totales</span>
                <Eye className="h-4 w-4 text-indigo-500" />
              </div>
              <p className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {mockActiveCampaign === 'all' ? '1,420,850' : mockActiveCampaign === 'nexus' ? '890,200' : '530,650'}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> Sincronizado hoy
              </span>
            </div>

            <div className={`p-4 rounded-2xl border transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Campañas Activas</span>
                <Building2 className="h-4 w-4 text-indigo-500" />
              </div>
              <p className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {mockActiveCampaign === 'all' ? '6 en curso' : '1 activa'}
              </p>
              <span className={`text-[10px] font-medium mt-1 block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {mockActiveCampaign === 'all' ? 'Nexus, CyberRealm, Aura...' : mockActiveCampaign === 'nexus' ? 'Lanzamiento Global Q3' : 'Gamenight Season Q3'}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Creadores en Campaña</span>
                <Radio className="h-4 w-4 text-emerald-500" />
              </div>
              <p className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {mockActiveCampaign === 'all' ? '28' : mockActiveCampaign === 'nexus' ? '18' : '10'}
              </p>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-medium mt-1 block">
                Cron diario activo
              </span>
            </div>

            <div className={`p-4 rounded-2xl border transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Reportes Públicos</span>
                <Share2 className="h-4 w-4 text-indigo-500" />
              </div>
              <p className={`text-2xl sm:text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>100%</p>
              <span className={`text-[10px] font-medium mt-1 block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                URLs seguras para sponsors
              </span>
            </div>
          </div>

          {/* Sample Tracked Posts Table Preview */}
          <div className={`mt-6 rounded-2xl border overflow-hidden ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${
              isLight ? 'border-slate-200 bg-slate-100/60' : 'border-slate-800'
            }`}>
              <span className={`text-xs font-black uppercase tracking-wider ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Muestra de publicaciones bajo seguimiento en vivo
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                Auto-Refresh Vercel Cron
              </span>
            </div>

            <div className={`divide-y text-xs ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {(mockActiveCampaign === 'all' 
                ? [
                    { platform: '▶️ YouTube', title: 'Review Completo del Protocolo y Tokenomics', author: '@AlexCreator', views: '45,210', likes: '2,840', campaign: 'Nexus Protocol' },
                    { platform: '📸 Instagram', title: 'Tutorial de Integración para Nuevos Usuarios', author: '@ElenaStream', views: '18,900', likes: '1,420', campaign: 'CyberRealm' },
                    { platform: '𝕏 Post', title: 'Hilo Estratégico sobre Campaña de Adopción', author: '@CryptoVision', views: '78,400', likes: '3,910', campaign: 'Nexus Protocol' }
                  ]
                : mockActiveCampaign === 'nexus'
                ? [
                    { platform: '▶️ YouTube', title: 'Review Completo del Protocolo y Tokenomics', author: '@AlexCreator', views: '45,210', likes: '2,840', campaign: 'Nexus Protocol' },
                    { platform: '𝕏 Post', title: 'Hilo Estratégico sobre Campaña de Adopción', author: '@CryptoVision', views: '78,400', likes: '3,910', campaign: 'Nexus Protocol' },
                    { platform: '🎵 TikTok', title: 'Unboxing y Configuración en 60 Segundos', author: '@PixelGamer', views: '32,150', likes: '1,980', campaign: 'Nexus Protocol' }
                  ]
                : [
                    { platform: '📸 Instagram', title: 'Tutorial de Integración para Nuevos Usuarios', author: '@ElenaStream', views: '18,900', likes: '1,420', campaign: 'CyberRealm' },
                    { platform: '🟣 Twitch', title: 'Transmisión Especial de Lanzamiento y Demo', author: '@DevLucas', views: '28,300', likes: '1,120', campaign: 'CyberRealm' },
                    { platform: '𝕏 Post', title: 'Highlights del Evento y Métricas Clave', author: '@TechReviewer', views: '14,200', likes: '890', campaign: 'CyberRealm' }
                  ]
              ).map((row, idx) => (
                <div key={idx} className={`p-3 sm:p-4 flex items-center justify-between gap-4 transition-colors ${
                  isLight ? 'hover:bg-slate-100/70' : 'hover:bg-slate-900/60'
                }`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>{row.platform}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                      }`}>
                        {row.campaign}
                      </span>
                      <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>por {row.author}</span>
                    </div>
                    <p className={`font-bold truncate ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{row.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black text-sm ${isLight ? 'text-slate-950' : 'text-white'}`}>{row.views} views</p>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>❤️ {row.likes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Real Stats Bar */}
      <section className={`border-y py-12 transition-colors ${
        isLight ? 'border-slate-200 bg-white shadow-xs' : 'border-slate-800/80 bg-slate-900/40'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className={`text-3xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                {stats.views.toLocaleString()}+
              </p>
              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Impacto y Vistas Indexadas
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                {stats.campaigns}
              </p>
              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Campañas Monitoreadas
              </p>
            </div>
            <div>
              <p className={`text-3xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                {stats.creators}
              </p>
              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Creadores Sincronizados
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                6 Redes
              </p>
              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                YouTube, X, TikTok, IG, Twitch, CMC
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI & Time Savings Calculator for Agencies */}
      <section id="roi-calculator" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
        <div className={`rounded-3xl border p-6 sm:p-12 shadow-2xl relative overflow-hidden transition-all duration-300 ${
          isLight 
            ? 'bg-gradient-to-br from-white via-indigo-50/40 to-white border-slate-200/90 shadow-indigo-100/50' 
            : 'bg-gradient-to-br from-slate-900/90 via-indigo-950/30 to-slate-900/90 border-slate-800 shadow-indigo-950/40'
        }`}>
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-4">
              <Calculator className="h-3.5 w-3.5" />
              <span>Calculadora de Retorno de Inversión</span>
            </div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4 ${
              isLight ? 'text-slate-950' : 'text-white'
            }`}>
              ¿Cuánto tiempo y dinero pierde tu agencia recopilando métricas a mano?
            </h2>
            <p className={`text-sm sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Desliza para seleccionar el número de creadores o cuentas que gestionas y comprueba el impacto inmediato de automatizar tu operación con Browns Stats.
            </p>
          </div>

          {/* Slider & Metrics Grid */}
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Slider Control */}
            <div className={`p-6 sm:p-8 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <label htmlFor="creators-slider" className={`font-bold text-sm sm:text-base flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <Users className="h-5 w-5 text-indigo-500" />
                  <span>Creadores activos bajo gestión mensual:</span>
                </label>
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-xl border border-indigo-500/20">
                  {selectedCreatorsRoi} talentos
                </span>
              </div>

              <input
                id="creators-slider"
                type="range"
                min="5"
                max="100"
                step="5"
                value={selectedCreatorsRoi}
                onChange={(e) => setSelectedCreatorsRoi(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              <div className={`flex justify-between text-[11px] font-bold mt-2 ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <span>5 creadores</span>
                <span>25 creadores</span>
                <span>50 creadores</span>
                <span>75 creadores</span>
                <span>100+ creadores</span>
              </div>
            </div>

            {/* Computed Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border text-center transition-all ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3">
                  <Clock className="h-5 w-5" />
                </div>
                <p className={`text-3xl sm:text-4xl font-black mb-1 ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  ~{Math.round(selectedCreatorsRoi * 2.5)} hrs
                </p>
                <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Ahorradas al mes en reportes
                </p>
                <p className={`text-[11px] mt-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Sin pedir capturas de pantalla ni actualizar planillas de Excel a mano.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border text-center transition-all ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
                  <Zap className="h-5 w-5" />
                </div>
                <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                  {(selectedCreatorsRoi * 120).toLocaleString()}
                </p>
                <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Sincronizaciones automáticas / mes
                </p>
                <p className={`text-[11px] mt-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Monitoreo 24/7 de vistas, likes y comentarios vía Vercel Cron.
                </p>
              </div>

              <div className={`p-6 rounded-2xl border text-center transition-all ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-3">
                  <DollarSign className="h-5 w-5" />
                </div>
                <p className={`text-3xl sm:text-4xl font-black mb-1 ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  ~${(Math.round(selectedCreatorsRoi * 2.5) * 35).toLocaleString()} USD
                </p>
                <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Valor de tiempo recuperado
                </p>
                <p className={`text-[11px] mt-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tu equipo enfocado en cerrar nuevos sponsors en vez de tareas repetitivas.
                </p>
              </div>
            </div>

            {/* Action inside calculator */}
            <div className="text-center pt-2">
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <span>Automatizar mis {selectedCreatorsRoi} Creadores</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest mb-3">
            Arquitectura Diseñada para Escalar
          </h2>
          <p className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${
            isLight ? 'text-slate-950' : 'text-white'
          }`}>
            Todo lo que una agencia necesita para gestionar sus campañas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Layers,
              title: 'Gestión Centralizada de Campañas',
              desc: 'Organiza todos tus clientes y patrocinadores en un único panel de comando. Asigna creadores específicos y filtra entregables con un clic.'
            },
            {
              icon: Clock,
              title: 'Auto-Sync Diario',
              desc: 'Motor de scraping desatendido vía Vercel Cron. Mantiene las métricas actualizadas cada 24 horas sin depender de refrescos manuales.'
            },
            {
              icon: Share2,
              title: 'Portales de Clientes',
              desc: 'Genera enlaces públicos con token o contraseña (/v/:slug) para que tus clientes auditen en tiempo real las métricas de su inversión.'
            },
            {
              icon: ShieldCheck,
              title: 'Control de Creadores & Pagos',
              desc: 'Registro de métodos de cobro en cripto (Binance / Wallets), historial de pagos y ranking de rendimiento por impacto real.'
            }
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 group ${
                  isLight 
                    ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xl shadow-xs' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>{pillar.title}</h3>
                <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Platforms Grid */}
      <section className={`py-16 sm:py-24 border-t transition-colors ${
        isLight ? 'border-slate-200 bg-slate-100/50' : 'border-slate-800/80 bg-slate-900/20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest mb-2">
              Soporte Multiplataforma
            </h2>
            <p className={`text-2xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
              Monitoreo nativo en las principales redes
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PLATFORMS.map((plat) => (
              <div
                key={plat.name}
                className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  isLight 
                    ? 'bg-white border-slate-200 shadow-xs hover:shadow-md' 
                    : `bg-slate-950/60 ${plat.border}`
                }`}
              >
                <span className="text-3xl mb-2">{plat.icon}</span>
                <span className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{plat.name}</span>
                <span className={`text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{plat.metrics}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sister Agency Section (Umbra Showcase) */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-3xl border p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl transition-all ${
          isLight
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-200 shadow-indigo-100'
            : 'border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-950 text-white'
        }`}>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4">
              <span>🌑 División de Agencia & Creatividad</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              ¿Buscas una campaña ejecutada de punta a punta?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Conoce a <strong>Umbra Guild</strong>, nuestro equipo de estrategia creativa y roster exclusivo de creadores Web3 y Tech con más de 160,000+ views de impacto directo.
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/umbra')}
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 hover:scale-105"
            >
              <span>Explorar Portafolio Umbra</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-20 sm:py-28 border-t transition-colors ${
        isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800/80 bg-slate-900/30'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider mb-4">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Preguntas Frecuentes</span>
            </div>
            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${
              isLight ? 'text-slate-950' : 'text-white'
            }`}>
              Todo lo que directores y agencias necesitan saber
            </h2>
            <p className={`mt-4 text-sm sm:text-base ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Claridad operativa y técnica antes de solicitar tu acceso o migrar tus cuentas.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: '¿Necesitamos contraseñas o permisos de administrador de los creadores?',
                a: 'No, bajo ninguna circunstancia. Browns Stats opera mediante los enlaces públicos de las publicaciones (YouTube, Instagram Reels, X/Twitter, TikTok, Twitch). Solo necesitas registrar la URL del contenido contratado y el motor se encarga del seguimiento.'
              },
              {
                q: '¿Con qué frecuencia se actualizan las métricas de las publicaciones?',
                a: 'Se actualizan automáticamente una vez al día (cada 24 horas a las 06:00 UTC) mediante nuestro motor automatizado en Vercel Cron para todas las campañas activas de los últimos 30 días. Además, puedes forzar un refresco manual en cualquier momento desde la consola.'
              },
              {
                q: '¿Puedo compartir dashboards en tiempo real directamente con mis clientes o sponsors?',
                a: 'Sí. Browns Stats te permite generar enlaces públicos únicos con token (/v/:slug) con o sin contraseña de protección. Tus clientes podrán auditar el alcance, las interacciones y el listado de posts en vivo sin necesidad de crear una cuenta ni pedirte exportaciones manuales en PDF.'
              },
              {
                q: '¿Cómo funciona la organización si gestiono múltiples campañas o marcas?',
                a: 'Puedes organizar tus campañas y creadores por cliente o división de manera totalmente independiente, manteniendo métricas y presupuestos segmentados para una auditoría sin fricciones.'
              },
              {
                q: '¿Cómo se gestionan los pagos a creadores en cripto o monedas locales?',
                a: 'Cada perfil de creador incluye campos verificados para sus métodos de liquidación preferidos (Binance Pay ID, direcciones de wallet USDT en Arbitrum/BSC o cuentas bancarias locales), además de un historial transparente de pagos asociados a cada campaña.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isLight 
                      ? 'bg-white border-slate-200 shadow-xs hover:border-slate-300' 
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors"
                  >
                    <span className={`font-bold text-base sm:text-lg ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      {faq.q}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-indigo-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`px-5 pb-5 sm:px-6 sm:pb-6 text-sm leading-relaxed border-t pt-4 ${
                          isLight ? 'text-slate-600 border-slate-100' : 'text-slate-400 border-slate-800/80'
                        }`}
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* High-Converting Bottom CTA */}
      <section className={`py-20 text-center border-t transition-colors ${
        isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-950'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider mb-4">
            <Zap className="h-3.5 w-3.5" />
            <span>Acceso Inmediato para Agencias</span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight mb-6 ${
            isLight ? 'text-slate-950' : 'text-white'
          }`}>
            Lleva el control de tus creadores al siguiente nivel
          </h2>
          <p className={`text-sm sm:text-base mb-8 max-w-xl mx-auto ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Automatiza la recolección de estadísticas de cada publicación, olvídate de pedir reportes a mano y entrega a tus clientes dashboards en vivo con tu marca.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/30 inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <span>Solicitar Demo Gratuita</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider border transition-all ${
                isLight 
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100' 
                  : 'border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Ingresar a la Consola
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-10 text-xs transition-colors ${
        isLight ? 'border-slate-200 bg-slate-100/80 text-slate-600' : 'border-slate-900 bg-slate-950 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Browns Studio. Browns Stats — Plataforma de analítica de creadores y campañas.</p>
          <div className="flex items-center gap-6">
            <a href="https://browns.studio" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-slate-300 transition-colors">
              browns.studio
            </a>
            <button onClick={() => navigate('/umbra')} className="hover:text-indigo-600 dark:hover:text-slate-300 transition-colors">
              Agencia Umbra
            </button>
            <button onClick={() => navigate('/login')} className="hover:text-indigo-600 dark:hover:text-slate-300 transition-colors">
              Consola de Acceso
            </button>
            <button onClick={toggleTheme} className="hover:text-indigo-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1">
              {isLight ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              <span>{isLight ? 'Modo Oscuro' : 'Modo Claro'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Floating CTA Bar */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl pointer-events-auto"
          >
            <div className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 transition-colors ${
              isLight 
                ? 'bg-white/95 border-slate-200/90 shadow-slate-300/60 text-slate-900' 
                : 'bg-slate-900/95 border-slate-700/80 shadow-indigo-950/80 text-white'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/30">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="font-black text-xs uppercase tracking-tight">Browns Stats</p>
                  <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Creator & Campaign Analytics by Browns Studio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95"
                >
                  <span>Solicitar Demo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                    isLight 
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100' 
                      : 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Consola
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead Capture Modal with theme awareness and prefilled email */}
      <DemoRequestModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
        theme={theme}
        initialEmail={heroEmail}
      />
    </div>
  );
};

export default CreatorHubLanding;
