import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
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
import translations from './translations'; // Default import
import { useInViewAnimation, revealVariants, staggerContainer } from '../hooks/useInViewAnimation';
import './Landing.css';

// Import images
import founder1 from '../assets/eminatr1x.webp';
import founder2 from '../assets/cabs.webp';
import creator1 from '../assets/ladymufa.webp';
import yagod from '../assets/yagod.webp';
import lizard from '../assets/lizard.webp';
import spadex from '../assets/spadex.webp';
import creator1dory from '../assets/1dory.webp';
import camululis from '../assets/camululis.webp';
import oza from '../assets/oza.webp';
import seven from '../assets/seven.webp';

const PLACEHOLDER_CREATORS = [
  { id: 'p1', display_name: 'Yagod', photo_url: yagod, twitter: 'https://x.com/YagodNFT', badge: 'NFT Sentinel' },
  { id: 'p2', display_name: 'Lizard', photo_url: lizard, twitter: 'https://x.com/TheLizardQueenT', badge: 'Tactical Lead' },
  { id: 'p3', display_name: 'Spadex', photo_url: spadex, twitter: 'https://x.com/FSpadexx', badge: 'High-Impact' },
  { id: 'p4', display_name: '1Dory', photo_url: creator1dory, twitter: 'https://x.com/1dory_gg', badge: 'Web3 Catalyst' },
  { id: 'p5', display_name: 'Camululis', photo_url: camululis, twitter: 'https://x.com/camululis', badge: 'Cultural Core' },
  { id: 'p6', display_name: 'Oza', photo_url: oza, twitter: 'https://x.com/SoyOzarux', badge: 'Visionary' },
  { id: 'p7', display_name: 'Seven', photo_url: seven, twitter: 'https://x.com/Its7Keys', badge: 'Meta Strategist' },
];

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

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  
  // Robust translation selection with fallback
  const t: any = (translations as any)[language] || (translations as any)['en'];

  const statsRef = useRef(null);
  const { scrollYProgress: statsScroll } = useScroll({
    target: statsRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: globalScroll } = useScroll();
  const heroOpacity = useTransform(globalScroll, [0, 0.2], [1, 0]);
  const heroScale = useTransform(globalScroll, [0, 0.2], [1, 0.95]);

  const handleEnterApp = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="landing-container">
      {/* Background System */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="nebula-glow top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20" />
        <div className="nebula-glow bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-600/10" />
        <div className="nebula-glow top-[30%] right-[20%] w-[40%] h-[40%] bg-purple-600/10" />
      </div>

      {/* Navbar */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">{t?.nav?.title || "Umbra Hub"}</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-black uppercase tracking-widest hover:text-indigo-400 transition-colors">{t?.nav?.method}</button>
            <button onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-black uppercase tracking-widest hover:text-indigo-400 transition-colors">{t?.nav?.talents}</button>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black hover:bg-white/10 transition-all uppercase"
            >
              {language}
            </button>
            <button 
              onClick={handleEnterApp}
              className="px-8 py-3 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10"
            >
              {user ? (t?.nav?.dashboard || "Command Center") : (t?.nav?.login || "Login")}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-20">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-label"
          >
            {t?.hero?.label}
          </motion.div>
          <h1 className="hero-text mb-8">
            {t?.hero?.title1} <br/>
            <span className="gradient-text">{t?.hero?.title2}</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            {t?.hero?.desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={handleEnterApp}
              className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-indigo-600/40"
            >
              {t?.hero?.cta1} <ChevronRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-md rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              {t?.hero?.cta2}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <div className="text-center group">
              <AnimatedCounter target={100} suffix="M+" />
              <div className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mt-4 group-hover:text-indigo-400 transition-colors">Global Reach</div>
            </div>
            <div className="text-center group">
              <AnimatedCounter target={500} suffix="K+" />
              <div className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mt-4 group-hover:text-indigo-400 transition-colors">Engagement Peak</div>
            </div>
            <div className="text-center group">
              <AnimatedCounter target={20} suffix="+" />
              <div className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mt-4 group-hover:text-indigo-400 transition-colors">Elite Creators</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Method Section - Clean Bento */}
      <section id="about" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="section-label">{t?.about?.label}</span>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                The <span className="gradient-text">Standard.</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
               whileHover={{ y: -10 }}
               className="premium-card md:col-span-2 min-h-[450px] flex flex-col justify-between"
            >
               <div className="flex justify-between items-start">
                  <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                    <Target className="h-8 w-8 text-indigo-500" />
                  </div>
               </div>
               <div>
                  <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">{t?.about?.p1_title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed italic">"{t?.about?.p1_desc}"</p>
               </div>
            </motion.div>

            <motion.div 
               whileHover={{ y: -10 }}
               className="premium-card bg-purple-600/[0.03] space-y-8"
            >
               <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl w-fit">
                  <Zap className="h-8 w-8 text-purple-500" />
               </div>
               <h3 className="text-3xl font-black uppercase tracking-tighter">{t?.about?.p2_title}</h3>
               <p className="text-slate-400 leading-relaxed text-sm italic">"{t?.about?.p2_desc}"</p>
            </motion.div>

            <motion.div 
               whileHover={{ y: -10 }}
               className="premium-card bg-rose-600/[0.03] space-y-8"
            >
               <div className="p-4 bg-rose-600/10 border border-rose-500/20 rounded-2xl w-fit">
                  <TrendingUp className="h-8 w-8 text-rose-500" />
               </div>
               <h3 className="text-3xl font-black uppercase tracking-tighter">Exponential_Growth</h3>
               <p className="text-slate-400 leading-relaxed text-sm italic">"Leveraging data transparency to lock in sustainable creator momentum."</p>
            </motion.div>

            <motion.div 
               whileHover={{ y: -10 }}
               className="premium-card md:col-span-2 bg-slate-900 border-none relative group"
            >
               <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative z-10">
                 <div className="flex items-center gap-3 text-indigo-400 mb-8 font-black text-xs uppercase tracking-widest">
                    <Shield className="h-4 w-4" /> Elite Governance v2.0
                 </div>
                 <h3 className="text-4xl md:text-5xl font-black mb-8 leading-none uppercase tracking-tighter">{t?.about?.p3_title}</h3>
                 <p className="text-slate-400 text-lg leading-relaxed max-w-xl italic">"{t?.about?.p3_desc}"</p>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Elite Roster Horizontal Carousel */}
      <section id="creators" className="py-40 bg-slate-950 relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <span className="section-label">{t?.showcase?.label}</span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            The <span className="gradient-text">Force.</span>
          </h2>
        </div>

        <div className="creator-carousel-container">
          <motion.div 
            className="creator-track"
            animate={{ 
              x: [0, -2240], 
            }}
            transition={{ 
              duration: 50,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...PLACEHOLDER_CREATORS, ...PLACEHOLDER_CREATORS].map((creator, i) => (
              <motion.div 
                key={`${creator.id}-${i}`}
                className="creator-card-premium group cursor-pointer"
                onClick={() => handleExternalLink(creator.twitter)}
              >
                <div className="creator-card-photo">
                  <img src={creator.photo_url} className="w-full h-full object-cover" alt={creator.display_name} />
                </div>
                <div className="creator-card-gradient" />
                
                <div className="absolute top-8 right-8 z-30 p-4 bg-white/10 rounded-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-sky-500 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </div>

                <div className="absolute bottom-10 left-10 right-10 z-30">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">{creator.badge}</div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{creator.display_name}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-32 px-6 bg-slate-900/30 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="section-label">{t?.leadership?.label}</span>
            <h2 className="text-4xl md:text-6xl font-black">{t?.leadership?.title1} <br/> {t?.leadership?.title2}</h2>
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
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{t?.cta?.title}</h2>
            <p className="text-lg text-white/80 mb-12 max-w-xl mx-auto font-medium">{t?.cta?.desc}</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="px-10 py-5 bg-white text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl" onClick={handleEnterApp}>{t?.cta?.btn1}</button>
              <button className="px-10 py-5 bg-transparent border-2 border-white/30 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all" onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })}>{t?.cta?.btn2}</button>
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
                <span className="text-lg font-black text-white">{t?.footer?.hub}</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">The unmistakable standard for creator-driven Web3 marketing excellence.</p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-black text-white tracking-tighter">{t?.footer?.hub} v2.5</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                 Restore the authority. Premium Agency Restoration Complete.
              </p>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Connect</div>
              <div className="space-y-5">
                <div
                  onClick={() => handleExternalLink('https://x.com/eminatr1x')}
                  className="flex items-center gap-3 group hover:text-white transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors flex-shrink-0">
                    <Twitter className="h-3.5 w-3.5 group-hover:text-sky-400 transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white/80 group-hover:text-white transition-colors">Official X</div>
                    <div className="text-[10px] text-slate-600">@UmbraAgency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs">{t?.footer?.rights || "© 2026 UMBRA AGENCY. ALL RIGHTS RESERVED."} - Restoration v2.5 (Safety Build)</p>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest">Premium Status: Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

