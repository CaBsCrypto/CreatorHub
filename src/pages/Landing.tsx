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

  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const t = translations[language];

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
        <div className="nebula-glow w-[800px] h-[800px] -top-96 -left-96 bg-indigo-600/20" />
        <div className="nebula-glow w-[600px] h-[600px] top-1/2 -right-48 bg-rose-600/10" />
        <div className="nebula-glow w-[1000px] h-[1000px] -bottom-96 left-1/2 -translate-x-1/2 bg-blue-600/10" />
      </div>
      {/* Navigation */}
      <nav className="glass-nav px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <Rocket className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter">UMBRA</span>
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
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-lg shadow-indigo-500/20"
          >
            {user ? (
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Log In
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section (Centered Authority) */}
      <section className="relative pt-40 pb-32 px-6 flex flex-col items-center overflow-hidden min-h-[85vh]">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="relative z-10 text-center max-w-5xl mx-auto"
            >
              <motion.span variants={revealVariants} className="section-label group mx-auto w-fit mb-8">
                <Sparkles className="inline-block h-3 w-3 mr-2 animate-pulse text-indigo-400" />
                {t.hero.tagline}
              </motion.span>
              <motion.h1 variants={revealVariants} className="hero-text mb-10 leading-[0.85] text-center">
                {t.hero.title1} <br />
                <span className="gradient-text">{t.hero.title2}</span>
              </motion.h1>
              <motion.p variants={revealVariants} className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 font-medium leading-relaxed">
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
             style={{ scale }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full" 
           />
           <motion.div 
             style={{ opacity, scale: useTransform(scrollYProgress, [0, 0.3], [1, 1.2]) }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 flex items-center justify-center opacity-30"
           >
              <div className="w-[150%] h-[150%] border border-indigo-500/10 rounded-full animate-spin-slow absolute" />
              <div className="w-[100%] h-[100%] border border-indigo-500/20 rounded-full animate-reverse-spin absolute" />
              <Rocket className="h-12 w-12 text-indigo-500 animate-pulse" />
           </motion.div>
        </div>

        {/* Floating elements with enhanced parallax */}
        <motion.div 
           style={{ 
             y: useTransform(scrollYProgress, [0, 0.5], [0, -100]),
             opacity: useTransform(scrollYProgress, [0, 0.2], [0.5, 0])
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
             y: useTransform(scrollYProgress, [0, 0.5], [0, 100]),
             opacity: useTransform(scrollYProgress, [0, 0.2], [0.5, 0])
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
                  <div key={i} className="flex items-center gap-3 opacity-20 hover:opacity-100 transition-all cursor-default group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
                      <Globe className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-lg font-black tracking-[0.2em] uppercase text-white/80 group-hover:text-white">{brand}</span>
                  </div>
                ))}
                {/* Repeat for loop */}
                {['BASE', 'IMMUTABLE', 'AVALANCHE', 'RONIN', 'STELLAR', 'ARBITRUM'].map((brand, i) => (
                  <div key={`${i}-dup`} className="flex items-center gap-3 opacity-20 hover:opacity-100 transition-all cursor-default group">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors">
                      <Globe className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-lg font-black tracking-[0.2em] uppercase text-white/80 group-hover:text-white">{brand}</span>
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

      {/* Vision Section (Restructured Narrative) - Sticky Scroll */}
      <section id="vision" ref={visionRef} className="vision-sticky-container">
        <div className="vision-sticky-content">
          <motion.div 
            style={{ 
              opacity: useTransform(visionScroll, [0.05, 0.15, 0.25, 0.35], [0, 1, 1, 0]),
              scale: useTransform(visionScroll, [0.05, 0.15, 0.25, 0.35], [0.8, 1, 1, 1.2]),
            }}
            className="vision-phrase-layered"
          >
            <span className="section-label mb-8">{t.vision.label}</span>
            <h2 className="text-6xl md:text-[10rem] font-black leading-none tracking-tighter uppercase whitespace-pre-line">
              {t.vision.p1} <br/>
              <span className="prism-text">{t.vision.p1_bold}</span>
            </h2>
          </motion.div>

          <motion.div 
            style={{ 
              opacity: useTransform(visionScroll, [0.4, 0.5, 0.6, 0.7], [0, 1, 1, 0]),
              y: useTransform(visionScroll, [0.4, 0.5, 0.6, 0.7], [50, 0, 0, -50]),
            }}
            className="vision-phrase-layered"
          >
            <p className="text-4xl md:text-7xl font-extralight italic leading-tight max-w-5xl mx-auto text-center">
              {t.vision.p2}
            </p>
          </motion.div>

          <motion.div 
            style={{ 
              opacity: useTransform(visionScroll, [0.75, 0.85, 0.95, 1], [0, 1, 1, 0]),
              filter: useTransform(visionScroll, [0.75, 0.85], ["blur(10px)", "blur(0px)"]),
            }}
            className="vision-phrase-layered"
          >
            <div className="space-y-8">
              <p className="text-sm md:text-base text-slate-500 tracking-[0.6em] uppercase font-black opacity-40">
                 {t.vision.p3}
              </p>
              <h3 className="text-6xl md:text-[10rem] font-black prism-text uppercase tracking-tighter leading-none">
                 {t.vision.p4}
              </h3>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Creator Showcase (Moved Up for Immediate Authority) */}
      <section id="creators" className="py-24 bg-slate-900/20 relative z-10 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
          <div>
            <span className="section-label">{t.showcase.label}</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{t.showcase.title}</h2>
          </div>
          <button 
            onClick={() => handleEnterApp()}
            className="hidden md:flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-xs group"
          >
            {t.showcase.btn} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="creator-carousel-container relative">
          <motion.div 
            className="flex gap-8 px-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              x: { repeat: Infinity, repeatType: "loop", duration: 40, ease: "linear" }
            }}
          >
            {[...PLACEHOLDER_CREATORS, ...PLACEHOLDER_CREATORS].map((creator, i) => (
              <div key={`${creator.id}-${i}`} className="creator-carousel-item" onClick={() => handleExternalLink(creator.twitter)}>
                <div className="creator-card-premium group cursor-pointer">
                  <img src={creator.photo_url || creator1} alt={creator.display_name} className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                  <div className="absolute bottom-10 left-8 right-8 z-10">
                    <div className="text-2xl font-black mb-2 tracking-tighter group-hover:text-indigo-400 transition-colors">{creator.display_name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{creator.badge}</span>
                      <Twitter className="h-4 w-4 text-white opacity-40 group-hover:opacity-100" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Command Center (Merged Methodology & Platform) */}
      <section id="about" ref={platformAnim.ref} className="py-40 px-6 relative overflow-hidden bg-slate-900/10">
        <div className="max-w-7xl mx-auto">
          {/* Methodology Lead-in */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-40 items-center">
            <div>
              <span className="section-label">{t.method.label}</span>
              <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.8] tracking-tighter uppercase">
                Strategic <br /> <span className="prism-text">Engine.</span>
              </h2>
              <div className="space-y-6">
                 {[
                   { title: t.method.step1, desc: t.method.step1_desc, icon: Target },
                   { title: t.method.step2, desc: t.method.step2_desc, icon: Activity },
                   { title: t.method.step3, desc: t.method.step3_desc, icon: Shield }
                 ].map((p, i) => (
                   <div key={i} className="flex gap-4 group">
                     <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                       <p.icon className="h-5 w-5 text-indigo-400 group-hover:text-white" />
                     </div>
                     <div>
                       <h4 className="text-sm font-black uppercase tracking-widest text-white/80">{p.title}</h4>
                       <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="premium-card bg-indigo-600/5 group">
               <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">{t.method.media_mix}</span>
               </div>
               <p className="text-xl font-medium leading-relaxed italic text-slate-200">
                 "We don't just post content; we architect cultural moments across the entire digital landscape."
               </p>
               <div className="grid grid-cols-2 gap-4 mt-8">
                  {['Streams', 'Video', 'Gaming', 'Events'].map(item => (
                    <div key={item} className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:border-indigo-500/30 transition-colors">
                      {item}
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Platform Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <span className="section-label">{t.platform.label}</span>
              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                {t.platform.title1} <br/> <span className="gradient-text">{t.platform.title2}</span>
              </h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg">
                {t.platform.desc}
              </p>
              <div className="space-y-4 pt-4">
                {[t.platform.feature1, t.platform.feature2, t.platform.feature3].map((feat, i) => (
                  <div key={i} className="flex items-center gap-4 text-white/80 group">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-wide uppercase">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group perspective-1000">
              <div className="dashboard-mockup group-hover:border-indigo-500/30 transition-all duration-700">
                <div className="mockup-sidebar">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg mb-8" />
                  {['metrics', 'magic-link', 'summary'].map((id) => (
                    <div key={id} onMouseEnter={() => setMockupFeature(id as any)} className={`mockup-item-click mb-4 ${mockupFeature === id ? 'active' : ''}`}>
                       {id === 'metrics' && <Activity className="h-2 w-2 text-white" />}
                       {id === 'magic-link' && <Star className="h-2 w-2 text-white" />}
                       {id === 'summary' && <Target className="h-2 w-2 text-white" />}
                    </div>
                  ))}
                </div>
                <div className="absolute left-[18%] top-0 bottom-0 right-0 p-8">
                  <AnimatePresence mode="wait">
                    {mockupFeature === 'metrics' && (
                      <motion.div key="metrics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           <div className="mockup-card"><div className="text-[8px] font-black text-slate-500">VIEWS</div><div className="text-xl font-black">{stats.views >= 1000 ? (stats.views/1000).toFixed(0) + 'K' : stats.views}</div></div>
                           <div className="mockup-card"><div className="text-[8px] font-black text-slate-500">CREATORS</div><div className="text-xl font-black">{stats.creators}</div></div>
                        </div>
                        <div className="bg-slate-800/30 rounded-3xl p-6 h-40 flex items-end gap-2">
                           {[0.5, 0.8, 0.6, 0.9, 0.7, 0.85, 1].map((h, i) => <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h * 100}%` }} className="flex-1 bg-indigo-500/40 rounded-t-lg" />)}
                        </div>
                      </motion.div>
                    )}
                    {mockupFeature === 'magic-link' && (
                       <motion.div key="magic-link" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                          <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black">REPORT_X.pdf</span>
                                <div className="px-2 py-0.5 bg-indigo-600 rounded-full text-[8px] font-black">LIVE</div>
                             </div>
                             <div className="h-1 bg-white/10 rounded-full w-full" />
                          </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mockup-glow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-32 px-6 bg-slate-900/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="section-label">{t.leadership.label}</span>
            <h2 className="text-4xl md:text-6xl font-black">{t.leadership.title1} <br/> {t.leadership.title2}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
             {[
               { name: 'EMINATR1X', image: founder1, desc: "I take your project's raw light and bend it into a message people can't unsee.", twitter: 'https://x.com/eminatr1x' },
               { name: 'CaBs', image: founder2, desc: 'Ready to break down complex ideas into simple explanations.', twitter: 'https://x.com/CaBsCrypto' },
               { name: 'Lady Mufa', image: creator1, desc: 'I make Web3 gaming videos, and I build pathways for women to join and thrive.', twitter: 'https://x.com/LadyMufaTV' }
             ].map((founder, i) => (
               <div key={i} className="text-center group" onClick={() => handleExternalLink(founder.twitter)}>
                 <div className="relative mb-6 cursor-pointer">
                   <img src={founder.image} alt={founder.name} className="founder-image" />
                   <div className="absolute inset-x-0 bottom-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="px-3 py-1 bg-white text-indigo-600 rounded-full text-[8px] font-black uppercase">X Profile</span>
                   </div>
                 </div>
                 <h3 className="text-2xl font-black mb-1 gradient-text">{founder.name}</h3>
                 <p className="text-slate-400 text-sm italic leading-relaxed px-4">"{founder.desc}"</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto premium-card bg-indigo-600 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="relative z-10 py-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{t.cta.title}</h2>
            <p className="text-lg text-white/80 mb-12 max-w-xl mx-auto font-medium">{t.cta.desc}</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="px-10 py-5 bg-white text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl" onClick={handleEnterApp}>{t.cta.btn1}</button>
              <button className="px-10 py-5 bg-transparent border-2 border-white/30 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all" onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })}>{t.cta.btn2}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5 text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="h-6 w-6 text-indigo-500" />
                <span className="text-lg font-black text-white">{t.footer.hub}</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">{t.nav.desc || "The standard for creator excellence."}</p>
            </div>
            {/* Detailed Brand Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-black text-white tracking-tighter">{t.footer.hub}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                The unmistakable standard for creator-driven Web3 marketing excellence.
              </p>
            </div>
            {/* Navigation */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Navigation</div>
              <div className="space-y-3">
                {[
                  { label: language === 'es' ? 'Visión' : 'Vision', id: 'vision' },
                  { label: language === 'es' ? 'El Método' : 'The Method', id: 'about' },
                  { label: language === 'es' ? 'Creadores' : 'Creators', id: 'creators' },
                ].map(link => (
                  <button
                    key={link.id}
                    onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="block text-sm hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Team / Socials */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">The Founders</div>
              <div className="space-y-5">
                {[
                  { name: 'EMINATR1X', handle: '@eminatr1x', twitter: 'https://x.com/eminatr1x' },
                  { name: 'CaBs', handle: '@CaBsCrypto', twitter: 'https://x.com/CaBsCrypto' },
                  { name: 'Lady Mufa', handle: '@LadyMufaTV', twitter: 'https://x.com/LadyMufaTV' },
                ].map(person => (
                  <div
                    key={person.name}
                    onClick={() => handleExternalLink(person.twitter)}
                    className="flex items-center gap-3 group hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors flex-shrink-0">
                      <Twitter className="h-3.5 w-3.5 group-hover:text-sky-400 transition-colors" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white/80 group-hover:text-white transition-colors">{person.name}</div>
                      <div className="text-[10px] text-slate-600">{person.handle}</div>
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
    </div>
  );
}
