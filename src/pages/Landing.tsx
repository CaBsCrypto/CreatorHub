import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Zap, Users, Globe, Play, Rocket, Trophy, Target, 
  ChevronRight, ArrowRight, Shield, Star, Heart,
  BarChart3, Gamepad2, Sparkles, LayoutDashboard, LogIn,
  MousePointer2, CheckCircle2, TrendingUp
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import { translations } from './translations';
import { useInViewAnimation, revealVariants, staggerContainer } from '../hooks/useInViewAnimation';
import './Landing.css';

// Import images
import founder1 from '../assets/founder_1.png';
import founder2 from '../assets/founder_2.png';
import creator1 from '../assets/creator_1.png';
import creator2 from '../assets/creator_2.png';

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

        {/* Background Visual Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none opacity-40">
           {/* Orbital Component (Centered and Large) */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 flex items-center justify-center opacity-30">
              <div className="w-[150%] h-[150%] border border-indigo-500/10 rounded-full animate-spin-slow absolute" />
              <div className="w-[100%] h-[100%] border border-indigo-500/20 rounded-full animate-reverse-spin absolute" />
              <Rocket className="h-12 w-12 text-indigo-500 animate-pulse" />
           </div>
        </div>

        {/* Floating elements placed relative to the text but out of the way */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 1 }}
           className="absolute top-[20%] right-[10%] hidden xl:block p-6 premium-card floating scale-75 opacity-50"
        >
            <div className="text-[10px] font-black text-indigo-400 mb-1 uppercase tracking-widest">Standard</div>
            <div className="text-xl font-black">UMBRA</div>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 1.2 }}
           className="absolute bottom-[20%] left-[8%] hidden xl:block p-6 premium-card floating delay-700 scale-75 opacity-50"
        >
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Momentum</span>
            </div>
            <div className="text-xl font-black text-white">
              +{stats.views >= 1000000 
                ? (stats.views / 1000000).toFixed(1) + 'M' 
                : (stats.views / 1000).toFixed(0) + 'K'} Views
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
                animate={{ x: [0, -1000] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
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
            { label: 'Active Creators', value: stats.creators, icon: Users, color: 'text-blue-400', suffix: '+' },
            { 
              label: 'Views Achieved', 
              value: stats.views >= 1000000 
                ? (stats.views / 1000000).toFixed(1)
                : (stats.views / 1000).toFixed(1), 
              icon: Zap, 
              color: 'text-yellow-400',
              suffix: stats.views >= 1000000 ? 'M' : 'K'
            },
            { label: 'Total Campaigns', value: stats.campaigns, icon: Target, color: 'text-purple-400', suffix: '' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              variants={revealVariants}
              className="premium-card text-center flex flex-col items-center group"
            >
              <div className={`p-4 rounded-2xl bg-white/5 mb-6 ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-indigo-500/5`}>
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="flex items-baseline gap-1">
                <div className="stat-value">{stat.value}</div>
                <span className="text-2xl font-black text-indigo-400">{stat.suffix}</span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
                {stat.label === 'Active Creators' ? t.stats.creators : 
                 stat.label === 'Views Achieved' ? t.stats.views : 
                 t.stats.campaigns}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Vision Section (Cinematic Refinement) */}
      <section id="vision" ref={visionAnim.ref} className="py-32 px-6 relative overflow-hidden bg-slate-950/40">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="section-label mb-12">{t.vision.label}</span>
          
          <motion.div 
            initial="hidden"
            animate={visionAnim.controls}
            variants={staggerContainer}
            className="space-y-24"
          >
            <motion.div variants={revealVariants} className="cinematic-phrase">
              <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
                {t.vision.p1} <br/> 
                <span className="text-indigo-400 glow-text">{t.vision.p1_bold}</span>
              </h2>
            </motion.div>

            <motion.div variants={revealVariants} className="w-px h-24 bg-gradient-to-b from-indigo-500/50 to-transparent mx-auto" />

            <motion.div variants={revealVariants} className="cinematic-phrase">
              <p className="text-2xl md:text-4xl font-light italic leading-relaxed text-slate-300">
                {t.vision.p2}
              </p>
            </motion.div>

            <motion.div variants={revealVariants} className="w-px h-24 bg-gradient-to-b from-indigo-500/50 to-transparent mx-auto" />

            <motion.div variants={revealVariants} className="cinematic-phrase">
              <div className="space-y-8">
                <p className="text-lg md:text-xl text-slate-400 tracking-[0.2em] uppercase font-black">
                   {t.vision.p3}
                </p>
                <h3 className="text-3xl md:text-5xl font-black gradient-text">
                   {t.vision.p4}
                </h3>
              </div>
            </motion.div>

            <motion.div variants={revealVariants} className="mt-24 pt-24 border-t border-white/5 max-w-2xl mx-auto">
              <p className="text-slate-400 leading-relaxed">
                 {t.vision.p5} <br/>
                 <span className="text-white font-bold">{t.vision.p5_end}</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-10">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.2),transparent_70%)] animate-pulse" />
        </div>
      </section>

      {/* Method Section (Updated Service Section) */}
      <section id="about" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <span className="section-label">{t.method.label}</span>
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight text-white/90">
             {t.method.title1} <br/> <span className="gradient-text">{t.method.title2}</span>
          </h2>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24"
        >
           {[
             { 
               title: t.method.step1, 
               desc: t.method.step1_desc, 
               icon: Target, 
               color: 'from-blue-500/20 to-indigo-500/20 text-blue-400' 
             },
             { 
               title: t.method.step2, 
               desc: t.method.step2_desc, 
               icon: Sparkles, 
               color: 'from-purple-500/20 to-pink-500/20 text-purple-400' 
             },
             { 
               title: t.method.step3, 
               desc: t.method.step3_desc, 
               icon: BarChart3, 
               color: 'from-indigo-500/20 to-cyan-500/20 text-cyan-400' 
             }
           ].map((service) => (
             <motion.div 
               key={service.title}
               variants={revealVariants}
               className="premium-card group py-12 px-10 text-center border-white/5 hover:border-white/20 transition-all h-full"
             >
               <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <service.icon className="h-8 w-8" />
               </div>
               <h3 className="text-xl font-black mb-4 group-hover:text-indigo-400 transition-colors tracking-tight">{service.title}</h3>
               <p className="text-slate-400 text-sm font-medium leading-relaxed">{service.desc}</p>
             </motion.div>
           ))}
        </motion.div>

        {/* Media Mix Section */}
        <div className="premium-card bg-slate-900/40 p-12 text-center max-w-4xl mx-auto border-indigo-500/10 hover:border-indigo-500/20">
           <div className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">{t.method.media_mix}</div>
           <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {[
                { name: 'Streams', icon: Play },
                { name: 'Short & Long Video', icon: Gamepad2 },
                { name: 'Gaming Nights', icon: Trophy },
                { name: 'Live Casting', icon: Zap },
                { name: 'Event Organization', icon: Globe }
              ].map((item) => (
                <div key={item.name} className="flex flex-col items-center gap-3 group">
                   <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-indigo-600/20 transition-colors">
                      <item.icon className="h-6 w-6 text-slate-400 group-hover:text-indigo-400" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">{item.name}</span>
                </div>
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
                  <div className="mockup-item-active mb-4" />
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="mockup-item opacity-40" />)}
                </div>
                <div className="absolute left-[18%] top-0 bottom-0 right-0 p-8 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-6 bg-white/10 rounded-full w-40" />
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/5" />
                      <div className="w-8 h-8 rounded-full bg-white/5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mockup-card">
                      <TrendingUp className="h-4 w-4 text-indigo-400 mb-2" />
                      <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                      <div className="h-2 bg-indigo-500/40 rounded w-full" />
                    </div>
                    <div className="mockup-card">
                      <BarChart3 className="h-4 w-4 text-emerald-400 mb-2" />
                      <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                      <div className="h-2 bg-emerald-500/40 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="bg-slate-800/30 rounded-[2rem] border border-white/5 p-6 h-40 flex flex-col justify-end gap-3">
                    <div className="flex items-end gap-1 h-full">
                       {[0.3, 0.5, 0.8, 0.4, 0.6, 0.9, 0.7].map((h, i) => (
                         <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400/20 rounded-t-sm" style={{ height: `${h * 100}%` }} />
                       ))}
                    </div>
                    <div className="h-2 bg-white/5 rounded-full w-full" />
                  </div>
                </div>
                {/* Floating pointer to simulate interaction */}
                <motion.div 
                  animate={{ x: [200, 400, 300], y: [150, 100, 200] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute pointer-events-none"
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
               { role: 'CEO & Founder', image: founder1, desc: 'Visionary leadership with over 10 years in the digital and crypto ecosystem.' },
               { role: 'COO & Strategy', image: founder2, desc: 'Specialist in agency scalability and international talent management.' },
               { role: t.leadership.founder3_role, image: creator1, desc: t.leadership.founder3_desc }
             ].map((founder, i) => (
               <motion.div 
                 key={i}
                 variants={revealVariants}
                 className="text-center group"
               >
                 <div className="relative mb-8">
                   <div className="absolute -inset-2 bg-indigo-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   <img src={founder.image} alt="Board Member" className="founder-image relative z-10" />
                 </div>
                 <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{founder.role}</h3>
                 <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-4 opacity-50">Board Member</p>
                 <p className="text-slate-400 font-medium px-4">{founder.desc}</p>
               </motion.div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* Global Presence Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
             <div className="premium-card bg-slate-900/50 p-10 relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Globe className="h-40 w-40 text-indigo-500" />
                </div>
                <h3 className="text-3xl font-black mb-6">{t.global.card_title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed mb-8">
                  {t.global.card_desc}
                </p>
                <div className="flex flex-wrap gap-4">
                  {['USA', 'Spain', 'Mexico', 'France', 'Japan', 'Brazil'].map(country => (
                    <span key={country} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">
                      {country}
                    </span>
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
            animate={{ x: [0, -1000] }}
            transition={{ 
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear"
              }
            }}
          >
            {[...featuredCreators, ...featuredCreators].map((creator, i) => (
              <div key={`${creator.id}-${i}`} className="creator-carousel-item group">
                <div className="relative w-64 h-80 rounded-[2.5rem] overflow-hidden mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                  <img 
                    src={creator.photo_url || creator1} 
                    alt={creator.display_name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-xl font-black mb-1 truncate">{creator.display_name || 'Umbra Creator'}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{t.showcase.badge}</span>
                      <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                        <Zap className="h-3 w-3 text-yellow-400" />
                      </div>
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
              <button className="px-10 py-5 bg-white text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                {t.cta.btn1}
              </button>
              <button className="px-10 py-5 bg-transparent border-2 border-white/30 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                {t.cta.btn2}
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-indigo-500" />
            <span className="text-xl font-black text-white tracking-tighter">{t.footer.hub}</span>
          </div>
          <div className="flex gap-12 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs">{t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}
