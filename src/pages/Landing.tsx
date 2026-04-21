import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  AnimatePresence 
} from 'framer-motion';
import { 
  Zap, Users, Globe, Play, Rocket, Trophy, Target, 
  ChevronRight, ArrowRight, Shield, Star, Heart,
  BarChart3, Gamepad2, Sparkles, LayoutDashboard, LogIn,
  MousePointer2, CheckCircle2, TrendingUp, Twitter, ChevronDown,
  Activity, BarChart
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import { translations } from './translations';
import { useInViewAnimation, revealVariants, staggerContainer } from '../hooks/useInViewAnimation';
import './Landing.css';

// Import images
import founder1 from '../assets/eminatr1x.webp';
import founder2 from '../assets/cabs.webp';
import creator1 from '../assets/ladymufa.webp';
import creator2 from '../assets/creator_2.webp'; 
import yagod from '../assets/yagod.webp';
import lizard from '../assets/lizard.webp';
import spadex from '../assets/spadex.webp';
import creator1dory from '../assets/1dory.webp';
import camululis from '../assets/camululis.webp';
import oza from '../assets/oza.webp';
import seven from '../assets/seven.webp';

const wordRevealVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};


// --- Animated Counter Sub-component ---
function AnimatedCounter({ target, suffix, decimals = 0 }: { target: number; suffix: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    let animationId = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = performance.now();
        const duration = 2000;
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(eased * target);
          if (progress < 1) { animationId = requestAnimationFrame(tick); }
        };
        animationId = requestAnimationFrame(tick);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => { observer.disconnect(); cancelAnimationFrame(animationId); };
  }, [target]);
  return (
    <div ref={divRef} className="flex items-baseline gap-1 justify-center">
      <div className="stat-value">{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}</div>
      <span className="text-2xl font-black text-indigo-400">{suffix}</span>
    </div>
  );
}

const PLACEHOLDER_CREATORS = [
  { id: 'p1', display_name: 'Yagod', photo_url: yagod, twitter: 'https://x.com/YagodNFT', badge: 'NFT Sentinel' },
  { id: 'p2', display_name: 'Lizard', photo_url: lizard, twitter: 'https://x.com/TheLizardQueenT', badge: 'Tactical Lead' },
  { id: 'p3', display_name: 'Spadex', photo_url: spadex, twitter: 'https://x.com/FSpadexx', badge: 'High-Impact' },
  { id: 'p4', display_name: '1Dory', photo_url: creator1dory, twitter: 'https://x.com/1dory_gg', badge: 'Web3 Catalyst' },
  { id: 'p5', display_name: 'Camululis', photo_url: camululis, twitter: 'https://x.com/camululis', badge: 'Cultural Core' },
  { id: 'p6', display_name: 'Oza', photo_url: oza, twitter: 'https://x.com/SoyOzarux', badge: 'Visionary' },
  { id: 'p7', display_name: 'Seven', photo_url: seven, twitter: 'https://x.com/Its7Keys', badge: 'Meta Strategist' },
];

const handleExternalLink = (url: string) => {
  if (!url || url === '#') return;
  window.open(url, '_blank', 'noopener,noreferrer');
};

// --- Character Reveal Component ---
function CharacterReveal({ text, active }: { text: string; active: boolean }) {
  const [displayText, setDisplayText] = useState('');
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%@#$";
  
  useEffect(() => {
    if (!active) {
      setDisplayText('');
      return;
    }
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => 
        text.split("")
          .map((char, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      
      iteration += 1 / 3;
      if (iteration >= text.length) clearInterval(interval);
    }, 30);
    
    return () => clearInterval(interval);
  }, [active, text]);

  return <>{displayText}</>;
}

export default function Landing() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    creators: 8,
    views: 103000,
    campaigns: 3
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [featuredCreators, setFeaturedCreators] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mockupFeature, setMockupFeature] = useState<'metrics' | 'magic-link' | 'summary'>('metrics');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const t = translations[language];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const visionRef = useRef(null);
  const { scrollYProgress: visionScroll } = useScroll({
    target: visionRef,
    offset: ["start start", "end end"]
  });

  // Global scroll for hero/navbar
  const { scrollYProgress: globalScroll } = useScroll();
  const heroOpacity = useTransform(globalScroll, [0, 0.2], [1, 0]);
  const heroScale = useTransform(globalScroll, [0, 0.2], [1, 0.9]);

  // Animation hooks for other visibility-based sections
  const platformAnim = useInViewAnimation(0.2);
  const statsAnim = useInViewAnimation(0.2);
  const creatorsAnim = useInViewAnimation(0.1);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, contentRes, campaignsRes] = await Promise.all([
          supabase.from('users').select('id, display_name, photo_url, role').eq('role', 'creator').is('deleted_at', null).order('created_at', { ascending: false }).limit(10),
          supabase.from('content').select('views, platform').is('deleted_at', null),
          supabase.from('campaigns').select('id', { count: 'exact', head: true }).is('deleted_at', null)
        ]);

        if (usersRes.data) {
          setFeaturedCreators(usersRes.data);
        }

        const totalViewsFromDB = contentRes.data?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
        
        // We use the User-Provided Actuals as the reliable floor
        setStats({
          creators: Math.max(usersRes.data?.length || 0, 8),
          views: Math.max(totalViewsFromDB, 103000),
          campaigns: Math.max(campaignsRes.count || 0, 3) 
        });
      } catch (err) {
        console.warn("Using actual stats fallback for landing page");
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
    
    // Page load duration
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterApp = () => {
    if (user) {
      if (profile?.role === 'admin' || profile?.role === 'manager') navigate('/admin');
      else if (profile?.role === 'creator') navigate('/creator');
      else if (profile?.role === 'client') navigate('/client');
      else navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-container scroll-smooth">
      <div className="grain-overlay" />


      {/* Page Entrance Shutter */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
            className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center animate-pulse shadow-2xl shadow-indigo-500/50">
                <Rocket className="text-white h-10 w-10" />
              </div>
              <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full bg-indigo-500"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Nebula System */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="matrix-grid opacity-30" />
        <div className="nebula-glow w-[800px] h-[800px] -top-96 -left-96 bg-emerald-600/10" />
        <div className="nebula-glow w-[600px] h-[600px] top-1/2 -right-48 bg-cyan-600/5" />
        <div className="nebula-glow w-[1000px] h-[1000px] -bottom-96 left-1/2 -translate-x-1/2 bg-teal-600/5" />
      </div>
      
      {/* Top System Bar */}
      <div className="system-top-bar">
        <div className="system-top-label">
           <span>{t.system.version}</span>
           <div className="w-[1px] h-3 bg-white/10" />
           <span className="text-emerald-500 animate-pulse">{t.system.status}</span>
        </div>
        <div className="system-top-label">
           <span>{new Date().toLocaleTimeString()}</span>
           <div className="w-[1px] h-3 bg-white/10" />
           <span>{t.system.latency}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="glass-nav px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Rocket className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">Umbra</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center p-1 bg-white/5 rounded-full border border-white/10 mr-4">
             <button 
               onClick={() => setLanguage('en')}
               className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
             >EN</button>
             <button 
               onClick={() => setLanguage('es')}
               className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${language === 'es' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
             >ES</button>
          </div>
          <button 
            onClick={() => document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase transition-all border border-white/10"
          >
            {t.nav.learnMore}
          </button>
          
          <button 
            onClick={handleEnterApp}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-lg shadow-emerald-500/20"
          >
            {user ? (
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                DASHBOARD
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                LOG IN
              </span>
            )}
          </button>

        </div>
      </nav>

      {/* Hero Section (Centered Authority) */}
      <section className="relative pt-40 pb-32 px-6 flex flex-col items-center overflow-hidden min-h-[85vh]">
            {/* Hero Scanner HUD (Cursor Follow) */}
            <motion.div 
              className="scanner-hud hidden lg:block"
              style={{ x: mousePos.x, y: mousePos.y, left: -64, top: -64 }}
            >
              <div className="scanner-ring" />
              <div className="scanner-line" style={{ transform: 'rotate(0deg)', top: -80, left: 64 }} />
              <div className="scanner-line" style={{ transform: 'rotate(90deg)', top: 64, left: 200 }} />
              <div className="absolute top-4 left-4 text-[8px] font-black text-emerald-500 font-mono">SCANNING_COORDS // {mousePos.x},{mousePos.y}</div>
            </motion.div>
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="relative z-10 text-center max-w-5xl mx-auto"
            >
              <motion.span variants={revealVariants} className="section-label group mx-auto w-fit mb-8">
                <Sparkles className="inline-block h-3 w-3 mr-2 animate-pulse text-emerald-400" />
                {t.hero.tagline}
              </motion.span>
              <motion.h1 variants={revealVariants} className="hero-text mb-10 leading-[0.85] text-center">
                {t.hero.title1} <br />
                <span className="gradient-text">{t.hero.title2}</span>
              </motion.h1>
              <motion.p variants={revealVariants} className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-14 font-medium leading-relaxed">
                {t.hero.desc}
              </motion.p>
              <motion.div variants={revealVariants} className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                <button 
                  onClick={() => document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="glow-button px-10"
                >
                  {t.hero.btn1}
                  <ArrowRight className="inline-block ml-2 h-5 w-5" />
                </button>
                <button 
                  onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="px-10 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/10 transition-all font-sans"
                >
                  {t.hero.btn2}
                </button>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              style={{ opacity: heroOpacity, scale: heroScale }}
              className="mt-16 md:mt-24"
            >
              <div 
                className="flex flex-col items-center gap-2 text-slate-600 z-20 cursor-default"
                onClick={() => document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Scroll</span>
                <ChevronDown className="h-5 w-5 scroll-indicator" />
              </div>
            </motion.div>

        {/* Background Visual Elements with Parallax */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none opacity-40">
           {/* Orbital Component (Centered and Large) */}
           <motion.div 
             style={{ scale: heroScale }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full" 
           />
           <motion.div 
             style={{ opacity: heroOpacity, scale: useTransform(globalScroll, [0, 0.3], [1, 1.2]) }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 flex items-center justify-center opacity-30"
           >
              <div className="w-[150%] h-[150%] border border-emerald-500/10 rounded-full animate-spin-slow absolute" />
              <div className="w-[100%] h-[100%] border border-emerald-500/20 rounded-full animate-reverse-spin absolute" />
              <Rocket className="h-12 w-12 text-emerald-500 animate-pulse" />
           </motion.div>
        </div>

        {/* Floating elements with enhanced parallax */}
        <motion.div 
           style={{ 
             y: useTransform(globalScroll, [0, 0.5], [0, -100]),
             opacity: useTransform(globalScroll, [0, 0.2], [0.5, 0])
           }}
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 0.5, scale: 1 }}
           transition={{ delay: 1 }}
           className="absolute top-[20%] right-[10%] hidden xl:block p-6 premium-card floating scale-75"
        >
            <div className="text-[10px] font-black text-indigo-400 mb-1 uppercase tracking-widest">Standard</div>
            <div className="text-xl font-black">UMBRA</div>
        </motion.div>
        
        <motion.div 
           style={{ 
             y: useTransform(globalScroll, [0, 0.5], [0, 100]),
             opacity: useTransform(globalScroll, [0, 0.2], [0.5, 0])
           }}
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 0.5, scale: 1 }}
           transition={{ delay: 1.2 }}
           className="absolute bottom-[20%] left-[8%] hidden xl:block p-8 premium-card floating-premium delay-700 scale-75"
        >
            <div className="flex items-center gap-3 mb-3">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <span className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em]">Momentum</span>
            </div>
            <div className="text-2xl font-black text-white tracking-widest">
              +{stats.views >= 1000000 
                ? (stats.views / 1000000).toFixed(1) + 'M' 
                : (stats.views / 1000).toFixed(0) + 'K'} {translations[language].stats.views}
            </div>
        </motion.div>
      </section>

      {/* Trust Marquee Section */}
      <section className="py-8 border-y border-white/5 bg-white/[0.01] overflow-hidden relative">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
            <div className="text-[9px] font-bold tracking-[0.4em] text-slate-600 mb-6 uppercase inline-block">
              {t.trust.title}
            </div>
            
            <div className="flex gap-20 whitespace-nowrap marquee-wrapper w-full">
              <motion.div 
                className="flex gap-20 items-center marquee-content"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ 
                  duration: 40, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                {['BASE', 'IMMUTABLE', 'AVALANCHE', 'RONIN', 'STELLAR', 'ARBITRUM'].map((brand, i) => (
                  <div key={i} className="decryption-log-item group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors">
                      <Globe className="h-4 w-4 text-slate-400 group-hover:text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-[0.2em] uppercase text-white/80 group-hover:text-white">{brand}</span>
                      <span className="decrypt-status">{t.system.decrypted}</span>
                    </div>
                  </div>
                ))}
                {/* Repeat for loop */}
                {['BASE', 'IMMUTABLE', 'AVALANCHE', 'RONIN', 'STELLAR', 'ARBITRUM'].map((brand, i) => (
                  <div key={`${i}-dup`} className="decryption-log-item group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors">
                      <Globe className="h-4 w-4 text-slate-400 group-hover:text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black tracking-[0.2em] uppercase text-white/80 group-hover:text-white">{brand}</span>
                      <span className="decrypt-status">{t.system.decrypted}</span>
                    </div>
                  </div>
                ))}
                </motion.div>
              </div>
          </motion.div>
        </section>

      {/* Stats Section */}
      <section ref={statsAnim.ref} className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          animate={statsAnim.controls}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { label: 'Active Creators', rawTarget: stats.creators, decimals: 0, icon: Users, color: 'text-blue-400', suffix: '+' },
            { 
              label: 'Views Achieved', 
              rawTarget: stats.views >= 1000000 
                ? stats.views / 1000000 
                : Math.round(stats.views / 1000),
              decimals: stats.views >= 1000000 ? 1 : 0,
              icon: Zap, 
              color: 'text-yellow-400',
              suffix: stats.views >= 1000000 ? 'M' : 'K'
            },
            { label: 'Total Campaigns', rawTarget: stats.campaigns, decimals: 0, icon: Target, color: 'text-purple-400', suffix: '' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              variants={revealVariants}
              className="premium-card text-center flex flex-col items-center group"
            >
              <div className={`p-4 rounded-2xl bg-white/5 mb-6 ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-indigo-500/5`}>
                <stat.icon className="h-8 w-8" />
              </div>
              <AnimatedCounter target={stat.rawTarget} suffix={stat.suffix} decimals={stat.decimals} />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
                {stat.label === 'Active Creators' ? t.stats.creators : 
                 stat.label === 'Views Achieved' ? t.stats.views : 
                 t.stats.campaigns}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Vision Section (Axiom Restructure) - Sticky Scroll Focus */}
      <section id="vision" ref={visionRef} className="vision-sticky-container">
        <div className="matrix-grid opacity-20" />
        
        {/* Cinematic Scan Line */}
        <motion.div 
          style={{ 
            top: useTransform(visionScroll, [0, 1], ["0%", "100%"]),
            opacity: useTransform(visionScroll, [0, 0.1, 0.9, 1], [0, 1, 1, 0])
          }}
          className="scan-line-vision"
        />

        {/* Diagnostic Micro-Labels */}
        <div className="absolute inset-0 pointer-events-none z-20">
           <motion.div 
             style={{ opacity: useTransform(visionScroll, [0, 0.1], [0, 1]) }}
             className="status-diagnostic top-20 left-20"
           >
              <div className="diagnostic-label">Access_Protocol</div>
              <div className="diagnostic-value">UMBRA_CORE_v.4.1.2</div>
           </motion.div>
           <motion.div 
             style={{ opacity: useTransform(visionScroll, [0.4, 0.5], [0, 1]) }}
             className="status-diagnostic bottom-40 right-20"
           >
              <div className="diagnostic-label">Sync_Status</div>
              <div className="diagnostic-value text-emerald-400">Stable_Axiom</div>
           </motion.div>
        </div>

        <div className="vision-sticky-content">
          {/* Axiom 01: The Standard */}
          <motion.div 
            style={{ 
              opacity: useTransform(visionScroll, [0, 0.1, 0.25, 0.35], [0, 1, 1, 0]),
              x: useTransform(visionScroll, [0, 0.1, 0.25, 0.35], [-100, 0, 0, 100]),
              filter: useTransform(visionScroll, [0.25, 0.35], ["blur(0px)", "blur(20px)"]),
            }}
            className="axiom-slide"
          >
            <div className="axiom-card">
              <span className="section-label mb-8">Axiom_01</span>
              <h2 className="axiom-title">
                {t.vision.p1} <br/>
                <span className="prism-text drop-shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                  <CharacterReveal text={t.vision.p1_bold} active={true} />
                </span>
              </h2>
            </div>
          </motion.div>

          {/* Axiom 02: The Impression */}
          <motion.div 
            style={{ 
              opacity: useTransform(visionScroll, [0.35, 0.45, 0.6, 0.7], [0, 1, 1, 0]),
              y: useTransform(visionScroll, [0.35, 0.45, 0.6, 0.7], [100, 0, 0, -100]),
              scale: useTransform(visionScroll, [0.35, 0.45, 0.6, 0.7], [0.8, 1, 1, 0.9]),
            }}
            className="axiom-slide"
          >
            <div className="axiom-card border-emerald-500/10">
              <span className="section-label mb-8">Axiom_02</span>
              <p className="axiom-description">
                <CharacterReveal text={t.vision.p2} active={true} />
              </p>
            </div>
          </motion.div>

          {/* Axiom 03: The Momentum */}
          <motion.div 
            style={{ 
              opacity: useTransform(visionScroll, [0.7, 0.8, 0.95, 1], [0, 1, 1, 0]),
              scale: useTransform(visionScroll, [0.7, 0.8, 0.95, 1], [0.5, 1, 1, 1.5]),
            }}
            className="axiom-slide"
          >
            <div className="axiom-card bg-emerald-600/[0.03] border-emerald-500/20">
              <div className="axiom-inner">
                <span className="section-label mb-8">Axiom_03</span>
                <p className="text-base md:text-xl text-emerald-400 tracking-[0.8em] uppercase font-black opacity-60 mb-12">
                   {t.vision.p3}
                </p>
                <h3 className="text-6xl md:text-9xl font-black prism-text uppercase tracking-tighter leading-none drop-shadow-[0_0_80px_rgba(34,211,238,0.4)]">
                   {t.vision.p4}
                </h3>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Elite Roster Bento Showcase (The Force) */}
      <section id="creators" className="py-40 bg-[#020617] relative z-10 overflow-hidden">
        <div className="absolute inset-0 matrix-grid opacity-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-20">
          <div className="mb-24">
            <span className="section-label">{t.showcase.label}</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
              The <span className="gradient-text">Force.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Featured Lead Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bento-card p-0 h-[600px] group cursor-pointer overflow-hidden border-emerald-500/10"
              onClick={() => handleExternalLink(PLACEHOLDER_CREATORS[0].twitter)}
            >
              <div className="absolute inset-0 z-10 glitch-hover">
                <img src={PLACEHOLDER_CREATORS[0].photo_url} className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110 grayscale group-hover:grayscale-0" />
              </div>
              
              <div className="creator-diagnostic-overlay">
                <div className="diagnostic-grid">
                  <div className="diagnostic-stat-item">
                    <div className="flex justify-between items-center text-[10px] font-black text-emerald-400 mb-2">
                       <span>{t.diagnostics.engagement}</span>
                       <span className="text-white">+98%</span>
                    </div>
                    <div className="diag-bar-container"><div className="diag-bar-fill w-[98%]" /></div>
                  </div>
                  <div className="diagnostic-stat-item">
                    <div className="flex justify-between items-center text-[10px] font-black text-emerald-400 mb-2">
                       <span>{t.diagnostics.resonance}</span>
                       <span className="text-white">+94%</span>
                    </div>
                    <div className="diag-bar-container"><div className="diag-bar-fill w-[94%]" /></div>
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent z-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="diagnostic-tag">NODE: ACTIVE</div>
                    <div className="diagnostic-tag">ROLE: LEAD_OPERATOR</div>
                  </div>
                  <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">{PLACEHOLDER_CREATORS[0].display_name}</h3>
                  <div className="flex gap-4">
                     <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest">NFT Specialist</div>
                     <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest">Alpha Intel</div>
                  </div>
              </div>

              <div className="absolute top-10 right-10 p-4 rounded-2xl bg-[#020617]/80 backdrop-blur-md border border-emerald-500/20 z-30">
                 <Twitter className="h-6 w-6 text-emerald-400" />
              </div>
            </motion.div>

            {/* Tactical Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
              {PLACEHOLDER_CREATORS.slice(1, 5).map((creator, i) => (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bento-card group p-0 overflow-hidden cursor-pointer h-[287px] border-white/5"
                  onClick={() => handleExternalLink(creator.twitter)}
                >
                  <div className="absolute inset-0 glitch-hover z-10">
                    <img src={creator.photo_url} className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-110 grayscale hover:grayscale-0" />
                  </div>
                  
                  <div className="creator-diagnostic-overlay p-6">
                    <div className="diagnostic-stat-item">
                      <div className="text-[8px] font-black text-emerald-400 mb-1">{t.diagnostics.reach}</div>
                      <div className="text-xs font-black text-white">{(85 + (i * 3))}%</div>
                      <div className="diag-bar-container mt-2"><div className="diag-bar-fill" style={{ width: `${85 + (i * 3)}%` }} /></div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent z-20" />
                  <div className="absolute top-6 right-6 z-30">
                    <div className="diagnostic-tag">ID: 00{i+1}</div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 z-30">
                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">{creator.badge}</div>
                    <div className="text-lg font-black uppercase tracking-tighter">{creator.display_name}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Row Marquee for High-Density feel */}
            <div className="col-span-4 mt-8 bento-card p-8 flex items-center justify-between group bg-emerald-600/5 border-emerald-500/10">
               <div className="space-y-2">
                 <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Momentum</div>
                 <div className="text-2xl font-black uppercase tracking-tighter">Scale with the standard.</div>
               </div>
               <button 
                 onClick={handleEnterApp}
                 className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all"
               >
                 View Roster
               </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* The Command Center (Merged Methodology & Platform) */}
      <section id="about" ref={platformAnim.ref} className="py-40 px-6 relative overflow-hidden bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          {/* Bento Methodology */}
          <div className="mb-40">
            <div className="mb-16">
              <span className="section-label">{t.method.label}</span>
              <h2 className="text-4xl md:text-5xl font-black leading-[0.8] tracking-tighter uppercase">
                Strategic <br /> <span className="prism-text">Engine.</span>
              </h2>
            </div>
            
            <div className="bento-grid">
              {/* Main Strategy Card - Large */}
              <div className="bento-card col-span-4 lg:col-span-2 group">
                 <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-10 shadow-2xl shadow-indigo-600/30">
                   <Target className="h-8 w-8 text-white" />
                 </div>
                 <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">{t.method.step1}</h3>
                 <p className="text-slate-400 font-medium leading-relaxed mb-8">{t.method.step1_desc}</p>
                 <div className="mt-auto flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                   Live Discovery <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
              </div>

              {/* Data Card - Half */}
              <div className="bento-card col-span-4 lg:col-span-1 group">
                 <div className="w-12 h-12 rounded-xl bg-rose-600/10 flex items-center justify-center mb-8 border border-rose-500/20 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                   <Activity className="h-6 w-6 text-rose-400 group-hover:text-white" />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-widest text-white/90 mb-3">{t.method.step2}</h4>
                 <p className="text-xs text-slate-500 leading-relaxed">{t.method.step2_desc}</p>
              </div>

              {/* Security/Trust Card - Half */}
              <div className="bento-card col-span-4 lg:col-span-1 group">
                 <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:bg-emerald-600 transition-colors">
                   <Shield className="h-6 w-6 text-emerald-400 group-hover:text-white" />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-widest text-white/90 mb-3">{t.method.step3}</h4>
                 <p className="text-xs text-slate-500 leading-relaxed">{t.method.step3_desc}</p>
              </div>

              {/* Media Mix - Landscape */}
              <div className="bento-card col-span-4 flex-row gap-12 items-center hidden lg:flex">
                 <div className="shrink-0 space-y-1">
                   <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{t.method.media_mix}</div>
                   <div className="text-3xl font-black uppercase tracking-tighter">Hyper <br/> Distribution.</div>
                 </div>
                 <div className="flex-1 grid grid-cols-4 gap-4">
                    {Object.entries(t.method.capabilities).slice(0, 4).map(([key, val]) => (
                      <div key={key} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-colors">
                         <div className="text-[10px] font-black text-white/80 uppercase mb-2">{key}</div>
                         <div className="text-[9px] text-slate-500 leading-tight line-clamp-2">{val as string}</div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* Platform Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <span className="section-label">{t.platform.label}</span>
              <h2 className="text-4xl md:text-6xl font-black leading-[0.8] tracking-tighter uppercase">
                {t.platform.title1} <br/> <span className="gradient-text">{t.platform.title2}</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                {t.platform.desc}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                {[t.platform.feature1, t.platform.feature2, t.platform.feature3].map((feat, i) => (
                  <div key={i} className="flex items-center gap-4 text-white/80 group bento-card p-4 rounded-2xl bg-white/[0.02]">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 group-hover:text-white" />
                    </div>
                    <span className="text-xs font-black tracking-widest uppercase">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group perspective-1000 lg:col-span-1">
              <div className="dashboard-mockup group-hover:border-emerald-500/30 transition-all duration-700 min-h-[500px]">
                <div className="mockup-sidebar border-emerald-500/5">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg mb-8 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                  {['metrics', 'magic-link', 'summary'].map((id) => (
                    <div key={id} onMouseEnter={() => setMockupFeature(id as any)} className={`mockup-item-click mb-4 ${mockupFeature === id ? 'bg-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-110' : 'bg-white/5 opacity-40 hover:opacity-100 hover:bg-emerald-500/20'}`}>
                       {id === 'metrics' && <Activity className="h-4 w-4 text-white" />}
                       {id === 'magic-link' && <Sparkles className="h-4 w-4 text-white" />}
                       {id === 'summary' && <Target className="h-4 w-4 text-white" />}
                    </div>
                  ))}
                </div>
                <div className="absolute left-[18%] top-0 bottom-0 right-0 p-10">
                  <AnimatePresence mode="wait">
                    {mockupFeature === 'metrics' && (
                      <motion.div key="metrics" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="h-full flex flex-col">
                        <div className="grid grid-cols-2 gap-6 mb-8 text-white">
                           <div className="mockup-card border-emerald-500/10"><div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">REALTIME VIEWS</div><div className="text-3xl font-black">{stats.views >= 1000 ? (stats.views/1000).toFixed(0) + 'K' : stats.views}</div></div>
                           <div className="mockup-card border-cyan-500/10"><div className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest">OPERATORS</div><div className="text-3xl font-black">{stats.creators}</div></div>
                        </div>
                        <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-[2rem] p-8 flex-1 flex items-end gap-3">
                           {[0.5, 0.8, 0.6, 0.9, 0.7, 0.85, 1, 0.6, 0.8].map((h, i) => <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h * 100}%` }} className="flex-1 bg-emerald-500/40 rounded-t-xl transition-all duration-1000" />)}
                        </div>
                      </motion.div>
                    )}
                    {/* ... other mockup cases keep basic logic but get emerald update nearby ... */}
                    {mockupFeature === 'magic-link' && (
                       <motion.div key="magic-link" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                          <div className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Neural Auth Module</div>
                          {[1,2,3].map(i => (
                            <div key={i} className="bg-emerald-600/[0.03] border border-emerald-500/10 rounded-[1.5rem] p-6 group/item hover:bg-emerald-600/10 transition-all">
                               <div className="flex justify-between items-center mb-4">
                                  <div className="h-2 w-32 bg-emerald-500/20 rounded-full" />
                                  <div className="px-4 py-1 bg-emerald-600 rounded-full text-[9px] font-black uppercase">Active Node</div>
                               </div>
                               <div className="h-1.5 bg-emerald-500/10 rounded-full w-full" />
                            </div>
                          ))}
                       </motion.div>
                    )}
                    {mockupFeature === 'summary' && (
                       <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 h-full flex flex-col justify-center">
                          <div className="text-center space-y-6">
                             <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                               <Trophy className="h-10 w-10 text-emerald-400" />
                             </div>
                             <div className="text-3xl font-black uppercase tracking-tighter">Campaign ROI</div>
                             <div className="text-6xl font-black prism-text drop-shadow-[0_0_40px_rgba(16,185,129,0.4)]">+248%</div>
                          </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mockup-glow bg-emerald-500/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Influence Section (Lost Section Restored) */}
      <section className="py-40 px-6 relative overflow-hidden border-y border-white/5 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="order-2 lg:order-1">
               <div className="relative aspect-square max-w-md mx-auto p-12">
                 <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
                 <div className="absolute inset-0 border border-emerald-500/10 rounded-full animate-spin-slow" />
                 <div className="absolute inset-10 border border-cyan-500/10 rounded-full animate-reverse-spin" />
                 <div className="absolute inset-0 matrix-grid opacity-20 mask-[radial-gradient(circle_at_50%_50%,black,transparent_70%)]" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Globe className="h-40 w-40 text-emerald-500 opacity-20" />
                 </div>
                 {/* Visual representative points */}
                 {[
                   { t: '5%', l: '20%' }, { t: '30%', l: '70%' }, { t: '60%', l: '10%' }, { t: '80%', l: '60%' }, { t: '20%', l: '40%' }
                 ].map((pos, i) => (
                   <motion.div 
                     key={i}
                     initial={{ scale: 0 }}
                     whileInView={{ scale: 1 }}
                     transition={{ delay: i * 0.2, repeat: Infinity, repeatDelay: 3 }}
                     style={{ top: pos.t, left: pos.l }}
                     className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,1)]"
                   />
                 ))}
               </div>
            </div>
            
            <div className="space-y-8 order-1 lg:order-2">
              <span className="section-label">{t.global.label}</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.85]">
                {t.global.title.split('.')[0]}. <br /> <span className="prism-text">{t.global.title.split('.')[1] || 'Reach.'}</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                {t.global.desc}
              </p>
              
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                  <div className="p-8 bento-card group hover:border-emerald-500/30 transition-all border-emerald-500/5">
                     <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 font-sans">{t.global.card_title}</div>
                     <div className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors font-medium">
                       {t.global.card_desc}
                     </div>
                  </div>
                  <div className="p-8 bento-card border-emerald-500/5 group hover:border-emerald-500/30 transition-all bg-emerald-600/5">
                     <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Market Impact</div>
                     <div className="text-4xl font-black mb-2 tracking-tighter">15+</div>
                     <div className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.4em]">Countries Active</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-slate-900/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="section-label">{t.leadership.label}</span>
            <h2 className="text-4xl md:text-6xl font-black">{t.leadership.title1} <br/> {t.leadership.title2}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[
               { id: 'OP-01', name: 'EMINATR1X', image: founder1, role: 'ARCHITECT', desc: "I take your project's raw light and bend it into a message people can't unsee.", twitter: 'https://x.com/eminatr1x' },
               { id: 'OP-02', name: 'CaBs', image: founder2, role: 'STRATEGIST', desc: 'Ready to break down complex ideas into simple explanations.', twitter: 'https://x.com/CaBsCrypto' },
               { id: 'OP-03', name: 'Lady Mufa', image: creator1, role: 'CULTURE', desc: 'I make Web3 gaming videos, and I build pathways for women to join and thrive.', twitter: 'https://x.com/LadyMufaTV' }
             ].map((founder, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.2 }}
                 className="founder-bento-card" 
                 onClick={() => handleExternalLink(founder.twitter)}
               >
                 <div className="flex justify-between items-center mb-6 px-2">
                   <div className="diagnostic-tag">{founder.id}</div>
                   <div className="diagnostic-tag">STATUS: ONLINE</div>
                 </div>
                 
                 <div className="founder-img-wrapper matrix-border">
                   <img src={founder.image} alt={founder.name} />
                   <div className="absolute top-6 right-6 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all">
                     <Twitter className="h-4 w-4 text-white" />
                   </div>
                 </div>
                 
                 <div className="px-2">
                   <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">{founder.role}</div>
                   <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter text-white group-hover:text-emerald-400 transition-colors">{founder.name}</h3>
                   <p className="text-slate-500 text-sm italic leading-relaxed group-hover:text-slate-300 transition-colors">"{founder.desc}"</p>
                 </div>
               </motion.div>
             ))}
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto cta-matrix-card group">
          <div className="absolute inset-0 matrix-grid opacity-10" />
          <div className="data-stream-container opacity-20">
             {[...Array(6)].map((_, i) => (
              <div key={i} className="data-column" style={{ left: `${(i * 20)+5}%`, animationDuration: '20s' }}>
                {Array(20).fill(0).map(() => Math.random().toString(36).substring(2, 4)).join(' ')}
              </div>
            ))}
          </div>
          
          <div className="relative z-10 text-center">
            <span className="section-label mb-8">Ready to Node?</span>
            <h2 className="text-5xl md:text-8xl font-black mb-10 leading-[0.8] tracking-tighter uppercase whitespace-pre-line">
              Take the next <br /> <span className="prism-text">Step.</span>
            </h2>
            <p className="text-xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">{t.cta.desc}</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                className="px-12 py-5 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 hover:scale-105 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)]" 
                onClick={handleEnterApp}
              >
                {t.cta.btn1}
              </button>
              <button 
                className="px-12 py-5 bg-transparent border border-emerald-500/20 text-emerald-500 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500/10 transition-all" 
                onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t.cta.btn2}
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-32 px-8 border-t border-white/5 text-slate-500 bg-slate-950 relative overflow-hidden">
        <div className="matrix-grid opacity-5" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-8 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tighter uppercase">Umbra Agency</span>
              </div>
              <p className="text-base text-slate-500 leading-relaxed max-w-md font-medium mb-8">
                The unmistakable standard for creator-driven Web3 marketing excellence. Elevating projects above the noise through strategic cultural alignment.
              </p>
              <div className="flex items-center gap-6">
                 <div className="diagnostic-tag">VERSION: 4.1.0</div>
                 <div className="diagnostic-tag">REGION: GLOBAL</div>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-8 font-mono">_Navigation</div>
              <div className="space-y-4">
                {[
                  { label: language === 'es' ? 'Visión' : 'Vision', id: 'vision' },
                  { label: language === 'es' ? 'El Método' : 'The Method', id: 'about' },
                  { label: language === 'es' ? 'Creadores' : 'Creators', id: 'creators' },
                ].map(link => (
                  <button
                    key={link.id}
                    onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="block text-sm font-black uppercase tracking-widest hover:text-emerald-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Operators */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-8 font-mono">_Operators</div>
              <div className="space-y-6">
                {[
                  { name: 'EMINATR1X', handle: '@eminatr1x', twitter: 'https://x.com/eminatr1x' },
                  { name: 'CaBs', handle: '@CaBsCrypto', twitter: 'https://x.com/CaBsCrypto' },
                  { name: 'Lady Mufa', handle: '@LadyMufaTV', twitter: 'https://x.com/LadyMufaTV' },
                ].map(person => (
                  <div
                    key={person.name}
                    onClick={() => handleExternalLink(person.twitter)}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-600/20 transition-all flex-shrink-0 border border-white/5 group-hover:border-emerald-500/30">
                      <Twitter className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white px-2 py-0.5 bg-white/5 rounded-md mb-1">{person.name}</div>
                      <div className="text-[10px] text-slate-600 font-mono tracking-tighter">{person.handle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs">{t.footer.rights}</p>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global System HUD */}
      {!authLoading && (
        <motion.div 
          initial={{ y: 100, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="fixed-system-hud hidden lg:flex"
        >
          <div className="hud-item pr-4 border-r border-white/10">
            <div className="hud-label">{t.system.feed}</div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <div className="hud-value">STREAM_ACTIVE</div>
            </div>
          </div>
          <div className="hud-item">
            <div className="hud-label">{t.stats.views}</div>
            <div className="hud-value">
              {stats.views >= 1000000 
                ? (stats.views / 1000000).toFixed(1) + 'M' 
                : (stats.views / 1000).toFixed(0) + 'K'}
            </div>
          </div>
          <div className="hud-separator" />
          <div className="hud-item">
            <div className="hud-label">{t.diagnostics.status}</div>
            <div className="hud-value text-emerald-400">{t.diagnostics.active}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
