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
import founder1 from '../assets/eminatr1x.png';
import founder2 from '../assets/cabs.png';
import creator1 from '../assets/ladymufa.png';
import creator2 from '../assets/creator_2.png'; 
import yagod from '../assets/yagod.png';
import lizard from '../assets/lizard.png';
import spadex from '../assets/spadex.png';
import creator1dory from '../assets/1dory.png';
import camululis from '../assets/camululis.png';
import oza from '../assets/oza.png';
import seven from '../assets/seven.png';

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
  { id: 'p1', display_name: 'Yagod', photo_url: yagod, twitter: 'https://x.com/YagodNFT' },
  { id: 'p2', display_name: 'Lizard', photo_url: lizard, twitter: 'https://x.com/TheLizardQueenT' },
  { id: 'p3', display_name: 'Spadex', photo_url: spadex, twitter: 'https://x.com/FSpadexx' },
  { id: 'p4', display_name: '1Dory', photo_url: creator1dory, twitter: 'https://x.com/1dory_gg' },
  { id: 'p5', display_name: 'Camululis', photo_url: camululis, twitter: 'https://x.com/camululis' },
  { id: 'p6', display_name: 'Oza', photo_url: oza, twitter: 'https://x.com/SoyOzarux' },
  { id: 'p7', display_name: 'Seven', photo_url: seven, twitter: 'https://x.com/Its7Keys' },
];

const handleExternalLink = (url: string) => {
  if (!url || url === '#') return;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export default function Landing() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    creators: 7,
    views: 850000,
    campaigns: 8
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [featuredCreators, setFeaturedCreators] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mockupFeature, setMockupFeature] = useState<'roi' | 'creators' | 'reporting'>('roi');

  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const t = translations[language];

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  // Animation hooks for new sections
  const heroAnim = useInViewAnimation(0.1);
  const platformAnim = useInViewAnimation(0.2);
  const statsAnim = useInViewAnimation(0.2);
  const visionAnim = useInViewAnimation(0.3);

  useEffect(() => {
    async function fetchStats() {
      try {
        // We try to fetch real stats, but fall back to "premium placeholders" if it fails
        // This is safe for a landing page where we want to "WOW" regardless of DB connection
        const [usersRes, contentRes, campaignsRes] = await Promise.all([
          supabase.from('users').select('id, display_name, photo_url, role').eq('role', 'creator').is('deleted_at', null).order('created_at', { ascending: false }).limit(10),
          supabase.from('content').select('views, platform').is('deleted_at', null),
          supabase.from('campaigns').select('id', { count: 'exact', head: true }).is('deleted_at', null)
        ]);

        if (usersRes.data) {
          setFeaturedCreators(usersRes.data);
        }

        if (usersRes.count !== null || campaignsRes.count !== null) {
          const totalViews = contentRes.data?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 850000;
          
          setStats({
            creators: usersRes.data?.length || 12,
            views: totalViews,
            campaigns: campaignsRes.count || 8
          });
        }
      } catch (err) {
        console.warn("Using placeholder stats for landing page");
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 z-20 cursor-default"
              onClick={() => document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Scroll</span>
              <ChevronDown className="h-5 w-5 scroll-indicator" />
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
           className="absolute bottom-[20%] left-[8%] hidden xl:block p-6 premium-card floating delay-700 scale-75"
        >
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Momentum</span>
            </div>
            <div className="text-xl font-black text-white">
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

      {/* Vision Section (Cinematic Overhaul) */}
      <section id="vision" ref={visionAnim.ref} className="py-40 px-6 relative overflow-hidden">
        <div className="nebula-canvas">
          <div className="light-leak w-96 h-96 bg-indigo-600 top-0 -left-20" />
          <div className="light-leak w-[500px] h-[500px] bg-purple-600 bottom-0 -right-20 opacity-10" />
          <div className="light-leak w-64 h-64 bg-cyan-500 top-1/2 left-1/3 opacity-10" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="section-label mb-16 inline-block">{t.vision.label}</span>
          
          <motion.div 
            initial="hidden"
            animate={visionAnim.controls}
            variants={staggerContainer}
            className="space-y-16"
          >
            <motion.div variants={revealVariants} className="cinematic-phrase max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-black mb-6 leading-[0.9] tracking-tighter">
                {t.vision.p1.split(' ').map((word, i) => (
                  <motion.span key={i} variants={wordRevealVariants} className="inline-block mr-3">
                    {word}
                  </motion.span>
                ))}
                <br/> 
                <motion.span 
                  variants={wordRevealVariants}
                  className="text-indigo-400 glow-text block mt-4"
                  style={{ textShadow: '0 0 50px rgba(99, 102, 241, 0.3)' }}
                >
                  {t.vision.p1_bold}
                </motion.span>
              </h2>
            </motion.div>

            <motion.div variants={revealVariants} className="cinematic-divider" />

            <motion.div variants={revealVariants} className="cinematic-phrase px-4">
              <p className="text-3xl md:text-5xl font-extralight italic leading-tight text-spotlight max-w-4xl mx-auto">
                {t.vision.p2}
              </p>
            </motion.div>

            <motion.div variants={revealVariants} className="cinematic-divider" />

            <motion.div variants={revealVariants} className="cinematic-phrase px-4">
              <div className="space-y-10">
                <p className="text-xs md:text-sm text-slate-500 tracking-[0.5em] uppercase font-black opacity-60">
                   {t.vision.p3}
                </p>
                <h3 className="text-4xl md:text-7xl font-black prism-text uppercase tracking-tighter leading-none">
                   {t.vision.p4}
                </h3>
              </div>
            </motion.div>

            <motion.div variants={revealVariants} className="mt-32 pt-16 border-t border-white/5 max-w-lg mx-auto">
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                 {t.vision.p5} <br/>
                 <span className="text-white font-bold opacity-80">{t.vision.p5_end}</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Method Section (Updated Service Section) */}
      <section id="about" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-32">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-label"
          >
            {t.method.label}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black mb-8 leading-tight text-white/90 tracking-tighter"
          >
             {t.method.title1} <br/> <span className="gradient-text">{t.method.title2}</span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"
          />
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32"
        >
           {[
             { 
               title: t.method.step1, 
               desc: t.method.step1_desc, 
               icon: Target, 
               color: 'text-blue-400',
               glow: 'shadow-blue-500/20'
             },
             { 
               title: t.method.step2, 
               desc: t.method.step2_desc, 
               icon: Sparkles, 
               color: 'text-purple-400',
               glow: 'shadow-purple-500/20'
             },
             { 
               title: t.method.step3, 
               desc: t.method.step3_desc, 
               icon: BarChart3, 
               color: 'text-cyan-400',
               glow: 'shadow-cyan-500/20'
             }
           ].map((service) => (
             <motion.div 
               key={service.title}
               variants={revealVariants}
               className="service-card-premium group"
             >
               <div className="service-icon-container">
                  <service.icon className={`h-10 w-10 ${service.color}`} />
                  <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${service.glow}`} />
               </div>
               <h3 className="text-2xl font-black mb-6 group-hover:text-indigo-400 transition-colors tracking-tighter uppercase">{service.title}</h3>
               <p className="text-slate-400 text-base font-medium leading-relaxed mb-auto">{service.desc}</p>
               
               <div className="mt-10 flex items-center gap-2 text-indigo-400/50 group-hover:text-indigo-400 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Phase 0{service.title[0]}</span>
                  <div className="flex-1 h-px bg-white/5 group-hover:bg-indigo-500/20 transition-all" />
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
               </div>
             </motion.div>
           ))}
        </motion.div>

        {/* Media Mix Section - Redesigned as "Capabilities Grid" */}
        <div className="relative mt-32">
          <div className="absolute inset-x-0 -top-24 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          <div className="text-center mb-20">
            <h4 className="text-sm font-black uppercase tracking-[0.6em] text-indigo-400 mb-4">{t.method.media_mix}</h4>
            <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Full Spectrum Execution.</h3>
            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              We don't just post content; we architect cultural moments across the entire digital landscape.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[
               { name: 'Streams', icon: Play, desc: t.method.capabilities.streams },
               { name: 'Short & Long Video', icon: Gamepad2, desc: t.method.capabilities.video },
               { name: 'Gaming Nights', icon: Trophy, desc: t.method.capabilities.gaming },
               { name: 'Live Casting', icon: Zap, desc: t.method.capabilities.casting },
               { name: 'Event Organization', icon: Globe, desc: t.method.capabilities.events }
             ].map((item, i) => (
               <motion.div 
                 key={item.name}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className={`capability-card-large group ${i === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
               >
                  <div className="capability-icon-large">
                    <item.icon />
                  </div>
                  <h5 className="text-2xl font-black mb-4 tracking-tighter text-white uppercase">{item.name}</h5>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    {item.desc}
                  </p>
                  
                  {/* Subtle background glow for each card */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full group-hover:bg-indigo-600/20 transition-all duration-700" />
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* NEW: Platform Command Center Section (The Preview) */}
      <section ref={platformAnim.ref} className="py-32 px-6 relative overflow-hidden bg-slate-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial="hidden"
              animate={platformAnim.controls}
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.span variants={revealVariants} className="section-label">{t.platform.label}</motion.span>
              <motion.h2 variants={revealVariants} className="text-4xl md:text-6xl font-black leading-tight">
                {t.platform.title1} <br/> <span className="gradient-text">{t.platform.title2}</span>
              </motion.h2>
              <motion.p variants={revealVariants} className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg">
                {t.platform.desc}
              </motion.p>
              
              <motion.div variants={revealVariants} className="space-y-4 pt-4">
                {[t.platform.feature1, t.platform.feature2, t.platform.feature3].map((feat, i) => (
                  <div key={i} className="flex items-center gap-4 text-white/80 group">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                      <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-wide uppercase">{feat}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div 
              initial="hidden"
              animate={platformAnim.controls}
              variants={{
                hidden: { opacity: 0, x: 50, rotateY: 10 },
                visible: { opacity: 1, x: 0, rotateY: 0, transition: { duration: 1.2, ease: "easeOut" } }
              }}
              className="relative group perspective-1000"
            >
              {/* Dashboard Mockup (Visual CSS Art) */}
              <div className="dashboard-mockup group-hover:border-indigo-500/30 transition-all duration-700">
                <div className="mockup-sidebar">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg mb-8 shadow-lg shadow-indigo-500/20" />
                  <div 
                    onMouseEnter={() => setMockupFeature('roi')}
                    className={`mockup-item-click mb-4 ${mockupFeature === 'roi' ? 'active' : ''}`} 
                  >
                    <BarChart className="h-2 w-2 text-white" />
                  </div>
                  <div 
                    onMouseEnter={() => setMockupFeature('creators')}
                    className={`mockup-item-click mb-4 ${mockupFeature === 'creators' ? 'active' : ''}`} 
                  >
                    <Users className="h-2 w-2 text-white" />
                  </div>
                  <div 
                    onMouseEnter={() => setMockupFeature('reporting')}
                    className={`mockup-item-click mb-4 ${mockupFeature === 'reporting' ? 'active' : ''}`} 
                  >
                    <Activity className="h-2 w-2 text-white" />
                  </div>
                  {[1, 2].map(i => <div key={i} className="mockup-item opacity-40 mb-4" />)}
                </div>
                <div className="absolute left-[18%] top-0 bottom-0 right-0 p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col gap-1">
                      <div className="h-4 bg-white/10 rounded-full w-32" />
                      <div className="h-2 bg-white/5 rounded-full w-20" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5" />
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-indigo-400" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {mockupFeature === 'roi' && (
                      <motion.div 
                        key="roi"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="mockup-card">
                            <TrendingUp className="h-4 w-4 text-emerald-400 mb-2" />
                            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Growth ROI</div>
                            <div className="text-xl font-black text-white">+24.8%</div>
                          </div>
                          <div className="mockup-card">
                            <Zap className="h-4 w-4 text-amber-400 mb-2" />
                            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Efficiency</div>
                            <div className="text-xl font-black text-white">99.2%</div>
                          </div>
                        </div>
                        <div className="bg-slate-800/30 rounded-[2rem] border border-white/5 p-6 h-48 flex flex-col justify-end gap-3 overflow-hidden relative">
                           <div className="absolute top-4 left-6 text-[8px] font-black uppercase text-indigo-500/50 tracking-widest">Performance Matrix</div>
                           <div className="flex items-end gap-2 h-full">
                              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.75, 1, 0.85, 0.95].map((h, i) => (
                                <motion.div 
                                  key={i} 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h * 100}%` }}
                                  transition={{ delay: i * 0.05, duration: 1 }}
                                  className="flex-1 bg-gradient-to-t from-indigo-600 via-indigo-500/40 to-transparent rounded-t-lg" 
                                />
                              ))}
                           </div>
                        </div>
                      </motion.div>
                    )}

                    {mockupFeature === 'creators' && (
                      <motion.div 
                        key="creators"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                         <div className="text-xs font-black text-white/50 uppercase tracking-widest mb-2">Global Network Status</div>
                         {[1, 2, 3].map(i => (
                           <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                              <div className="w-10 h-10 rounded-xl bg-slate-800" />
                              <div className="flex-1">
                                 <div className="h-3 bg-white/10 rounded w-24 mb-2" />
                                 <div className="h-2 bg-white/5 rounded w-16" />
                              </div>
                              <div className="w-12 h-2 bg-emerald-500/20 rounded-full" />
                           </div>
                         ))}
                      </motion.div>
                    )}

                    {mockupFeature === 'reporting' && (
                      <motion.div 
                        key="reporting"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                         <div className="mockup-card border-indigo-500/30 bg-indigo-500/5">
                            <div className="flex justify-between items-center mb-4">
                               <div className="text-[10px] font-black text-indigo-400">CAMPAIGN_SUMMARY_A4.pdf</div>
                               <div className="h-2 w-10 bg-indigo-500 rounded-full" />
                            </div>
                            <div className="space-y-2">
                               <div className="h-1 bg-white/20 rounded-full w-full" />
                               <div className="h-1 bg-white/20 rounded-full w-[90%]" />
                               <div className="h-1 bg-white/20 rounded-full w-[95%]" />
                               <div className="h-1 bg-white/20 rounded-full w-[80%]" />
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="flex-1 h-24 bg-white/5 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center">
                               <CheckCircle2 className="h-6 w-6 text-indigo-500 mb-2" />
                               <div className="text-[8px] font-black text-slate-500">VERIFIED</div>
                            </div>
                            <div className="flex-1 h-24 bg-white/5 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center">
                               <Globe className="h-6 w-6 text-emerald-500 mb-2" />
                               <div className="text-[8px] font-black text-slate-500">DISTRIBUTED</div>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Floating pointer to simulate interaction */}
                <motion.div 
                  animate={{ 
                    x: mockupFeature === 'roi' ? 0 : mockupFeature === 'creators' ? 0 : 0, 
                    y: mockupFeature === 'roi' ? 80 : mockupFeature === 'creators' ? 120 : 160 
                  }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="absolute left-8 pointer-events-none"
                >
                  <MousePointer2 className="h-6 w-6 text-white drop-shadow-lg" />
                </motion.div>
                <div className="mockup-glow" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-32 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="section-label">{t.leadership.label}</span>
            <h2 className="text-4xl md:text-6xl font-black">{t.leadership.title1} <br/> {t.leadership.title2}</h2>
          </motion.div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto"
          >
             {[
               { name: 'EMINATR1X', role: 'Co-Founder', image: founder1, desc: "I take your project's raw light and bend it into a message people can't unsee.", twitter: 'https://x.com/eminatr1x' },
               { name: 'CaBs', role: 'Co-Founder', image: founder2, desc: 'Ready to break down complex ideas into simple explanations.', twitter: 'https://x.com/CaBsCrypto' },
               { name: 'Lady Mufa', role: 'Co-Founder', image: creator1, desc: 'I make Web3 gaming videos, and I build pathways for women to join and thrive.', twitter: 'https://x.com/LadyMufaTV' }
             ].map((founder, i) => (
               <motion.div 
                 key={i}
                 variants={revealVariants}
                 className="text-center group"
               >
                 <div 
                   onClick={() => handleExternalLink(founder.twitter)}
                   className="relative mb-6 cursor-pointer"
                 >
                   <div className="absolute -inset-2 bg-indigo-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   <img src={founder.image} alt={founder.name} className="founder-image relative z-10" />
                   {/* Subtle Action Overlay */}
                   <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="px-3 py-1 bg-white/90 backdrop-blur-md text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform">
                       X Profile
                     </div>
                   </div>
                 </div>
                 <h3 className="text-2xl font-black mb-1 tracking-tight gradient-text">{founder.name}</h3>
                 <div 
                   onClick={() => handleExternalLink(founder.twitter)}
                   className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors mb-4 group/tw cursor-pointer"
                 >
                   <Twitter className="h-3 w-3 group-hover/tw:text-sky-400 transition-colors" />
                   <span className="text-[10px] font-bold">@{founder.twitter.split('/').pop()}</span>
                 </div>
                  <p className="text-slate-400 font-medium px-4 text-sm italic leading-relaxed">
                    <span className="text-indigo-400/60 text-sm font-black not-italic">"</span>
                    {founder.desc}
                    <span className="text-indigo-400/60 text-sm font-black not-italic">"</span>
                  </p>
               </motion.div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* Global Presence Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
             <div className="premium-card bg-slate-900/50 p-10 relative group overflow-hidden">
                {/* World Map Pings representation */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                   {[
                     { t: '20%', l: '30%', d: 0 },
                     { t: '45%', l: '65%', d: 0.5 },
                     { t: '60%', l: '20%', d: 1 },
                     { t: '30%', l: '80%', d: 1.5 },
                     { t: '70%', l: '50%', d: 2 },
                   ].map((p, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, scale: 0 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       transition={{ delay: p.d, duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
                       className="absolute w-3 h-3 bg-indigo-500 rounded-full blur-[2px]"
                       style={{ top: p.t, left: p.l }}
                     >
                        <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping" />
                     </motion.div>
                   ))}
                </div>

                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Globe className="h-40 w-40 text-indigo-500" />
                </div>
                <h3 className="text-3xl font-black mb-6">{t.global.card_title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed mb-8">
                  {t.global.card_desc}
                </p>
                <div className="flex flex-wrap gap-4">
                  {['USA', 'Spain', 'Mexico', 'France', 'Japan', 'Brazil'].map((country, i) => (
                    <motion.span 
                      key={country} 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-indigo-600/10 transition-colors"
                    >
                      {country}
                    </motion.span>
                  ))}
                </div>
             </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="section-label">{t.global.label}</span>
            <h2 className="text-4xl md:text-6xl font-black mb-8">{t.global.title}</h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              {t.global.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Creator Carousel Section */}
      <section id="creators" className="py-32 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
          <div>
            <span className="section-label">{t.showcase.label}</span>
            <h2 className="text-4xl md:text-5xl font-black">{t.showcase.title}</h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-xs">
            {t.showcase.btn} <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="creator-carousel-container relative">
          <motion.div 
            className="flex gap-8 px-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear"
              }
            }}
          >
            {[...PLACEHOLDER_CREATORS, ...PLACEHOLDER_CREATORS].map((creator, i) => (
              <div key={`${creator.id}-${i}`} className="creator-carousel-item group">
                <div 
                  onClick={() => handleExternalLink(creator.twitter)}
                  className="block relative w-64 h-80 rounded-[2.5rem] overflow-hidden mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-indigo-500/20"
                >
                  <img 
                    src={creator.photo_url || creator1} 
                    alt={creator.display_name} 
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-xl font-black mb-1 truncate">{creator.display_name || 'Umbra Creator'}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{t.showcase.badge}</span>
                      <div className="p-2 bg-white/10 rounded-full backdrop-blur-md group-hover:bg-indigo-600 transition-colors">
                        <Twitter className="h-3.5 w-3.5 text-white opacity-40 group-hover:opacity-100 transition-all" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle Action Overlay */}
                  <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-4 py-2 bg-white text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform">
                      View Profile
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Creators Visual Grid (Repurposed as Secondary Showcase) */}
      <section className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
           <motion.div 
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="md:col-span-2 relative group overflow-hidden rounded-[3rem]"
           >
              <img src={creator2} alt="Creator Highlights" className="creator-image" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8">
                 <div className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-1">{t.showcase.secondary_label}</div>
                 <div className="text-3xl font-black">{t.showcase.secondary_title}</div>
              </div>
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative group overflow-hidden rounded-[3rem]"
           >
              <div className="absolute inset-0 bg-indigo-600 flex flex-col items-center justify-center text-center p-8 group-hover:bg-indigo-500 transition-colors">
                 <Trophy className="h-12 w-12 mb-6" />
                 <div className="text-4xl font-black mb-2">+50M</div>
                 <div className="text-[10px] font-black uppercase tracking-widest">Global Views 2024</div>
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative group overflow-hidden rounded-[3rem] bg-slate-900 border border-white/5 flex flex-col items-center justify-center p-8 text-center hover:border-indigo-500/30 transition-all shadow-2xl shadow-indigo-500/5 group"
           >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Heart className="h-24 w-24 text-rose-500" />
              </div>
              <Heart className="h-10 w-10 text-rose-500 mb-6 group-hover:scale-110 transition-transform relative z-10" />
              <p className="font-bold text-slate-300 relative z-10 leading-relaxed italic">"The unmistakable standard for <br/> agency excellence and <br/> creator empowerment."</p>
              <div className="mt-8 flex flex-col items-center gap-1 relative z-10">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Sarah M.</div>
                <div className="text-[8px] font-bold uppercase tracking-widest text-slate-600">Leading Strategy Officer</div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto premium-card bg-indigo-600 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 py-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{t.cta.title}</h2>
            <p className="text-lg text-white/80 mb-12 max-w-xl mx-auto font-medium">
              {t.cta.desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                className="px-10 py-5 bg-white text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                onClick={() => document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t.cta.btn1}
              </button>
              <button 
                className="px-10 py-5 bg-transparent border-2 border-white/30 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t.cta.btn2}
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5 text-slate-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            {/* Brand */}
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
