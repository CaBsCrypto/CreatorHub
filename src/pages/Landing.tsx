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
  Activity
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import translations from './translations';
import { useInViewAnimation, revealVariants, staggerContainer } from '../hooks/useInViewAnimation';
import './Landing.css';

// Shadow Line Component for Hero Interaction
const ShadowLine = ({ mousePos }: { type: string; mousePos: { x: number; y: number } }) => {
  const calculateShadow = () => {
    const dx = mousePos.x - 0.5;
    const dy = mousePos.y - 0.5;
    const skew = dx * 40;
    const opacity = 0.4 - dy * 0.2;
    return { skew, opacity, dx, dy };
  };

  const { skew, opacity, dx, dy } = calculateShadow();

  return (
    <div className="relative flex flex-col items-center group">
      <div className="w-[3px] h-48 bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 shadow-[0_0_35px_rgba(254,240,138,0.4)] relative z-10" />
      <motion.div 
        animate={{ skewX: skew, scaleY: 1 + Math.abs(dx) }}
        style={{ opacity }}
        className="absolute top-48 w-16 h-32 border-b-[3px] border-x-[3px] border-emerald-500/40 rounded-b-sm blur-[1px] transform-origin-top"
      />
    </div>
  );
};

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
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
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
      <div className="stat-value">{decimals > 1 ? display.toFixed(decimals) : (decimals > 0 ? display.toFixed(1) : Math.round(display))}</div>
      <span className="text-2xl font-black text-emerald-400">{suffix}</span>
    </div>
  );
}

const UmbraLogo = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative flex items-center justify-center w-16 h-16 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The Corona (Atmospheric Glow) */}
      <motion.div 
        animate={{ 
          scale: isHovered ? [1.2, 1.4, 1.2] : 1.2,
          opacity: isHovered ? 0.6 : 0.3,
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-emerald-500/20 blur-[20px] rounded-full"
      />

      {/* The Eclipse Corona (Sharp Rim) */}
      <motion.div 
        animate={{ 
          rotate: isHovered ? 360 : 0,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-10 h-10 border border-emerald-400/30 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.2)]"
      />

      {/* The Obsidian Disc (The Umbra) */}
      <motion.div 
        animate={{ 
          x: isHovered ? 4 : 0,
          y: isHovered ? -2 : 0,
          scale: isHovered ? 0.95 : 1
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative w-8 h-8 bg-slate-950 rounded-full z-10 border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden"
      >
        {/* Internal Light Leak */}
        <motion.div 
          animate={{ 
            opacity: isHovered ? 1 : 0.4,
            scale: isHovered ? 1.5 : 1
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(52,211,153,0.1),transparent_70%)]"
        />
        
        {/* Subtle Brand Mark (U) inside the shadow */}
        <div className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-1">U</div>
      </motion.div>

      {/* The Shadow Line Projection */}
      <motion.div 
        animate={{ 
          height: isHovered ? 40 : 20,
          opacity: isHovered ? 0.4 : 0.1,
          skewX: -20
        }}
        className="absolute top-10 left-1/2 w-[1px] bg-gradient-to-b from-emerald-500 to-transparent blur-[1px] origin-top"
      />

      {/* Precision Flare */}
      <motion.div 
        animate={{ 
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0
        }}
        className="absolute -top-1 -right-1 w-2 h-2 bg-white blur-[2px] rounded-full z-20 shadow-[0_0_10px_white]"
      />
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const t: any = (translations as any)[language] || (translations as any)['en'];

  const statsRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -300]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  const handleEnterApp = () => {
    if (user) { navigate('/dashboard'); } else { navigate('/login'); }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="landing-container">
      {/* Texture & Glow */}
      <div className="grain-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="nebula-glow top-[-10%] left-[-10%] w-[70%] h-[70%] bg-emerald-600/10" />
        <div className="nebula-glow bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/05" />
      </div>

      {/* Navbar */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-full relative z-50">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <UmbraLogo />
            <span className="text-2xl font-black tracking-[0.2em] relative overflow-hidden uppercase">
              <span className="relative z-10">Umbra</span>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-500 group-hover:w-full transition-all duration-500" />
            </span>
          </motion.div>
          <div className="hidden lg:flex items-center gap-10">
            <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-black uppercase tracking-[0.3em] hover:text-emerald-400 transition-colors">{t?.nav?.method}</button>
            <button onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-black uppercase tracking-[0.3em] hover:text-emerald-400 transition-colors">{t?.nav?.talents}</button>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black hover:bg-white/10 transition-all uppercase">{language}</button>
            <button onClick={handleEnterApp} className="px-8 py-3 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10">{user ? (t?.nav?.dashboard || "Command Center") : (t?.nav?.login || "Login")}</button>
          </div>
        </div>
      </nav>

      {/* Hero Section V3 (Refined Asymmetric Split) */}
      <section className="hero-split-layout relative z-10">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-32 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
            <span className="section-label">{t?.hero?.label}</span>
            <h1 className="hero-text mb-10">
              {t?.hero?.title1} <br/>
              <span className="gradient-text">{t?.hero?.title2}</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-xl mb-14 font-medium leading-[1.6]">
              {t?.hero?.desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <button onClick={handleEnterApp} className="px-12 py-5 bg-emerald-600 text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-4 hover:scale-105 transition-all shadow-2xl shadow-emerald-600/50">{t?.hero?.cta1} <ArrowRight className="h-4 w-4" /></button>
              <button onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })} className="px-12 py-5 bg-white/5 border border-white/10 backdrop-blur-md rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">{t?.hero?.cta2}</button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            style={{ y: useTransform(scrollYProgress, [0, 1], [-50, -350]) }}
            transition={{ duration: 1.5, ease: "easeOut" }} 
            className="hidden lg:flex hero-visual-element items-center justify-center cursor-crosshair group"
            onMouseMove={handleMouseMove}
            ref={containerRef}
          >
            <div className="data-prism opacity-20 border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/[0.02] transition-all duration-700" />
            
            {/* The Interactive Shadow Line */}
            <div className="relative z-10 scale-[1.2] -mt-20">
              <ShadowLine mousePos={mousePos} />
            </div>
            
            {/* Logo Placeholder / Centerpiece */}
            <div className="absolute top-2 flex flex-col items-center gap-2 z-20">
              <UmbraLogo />
              <div className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">Umbra_Agency</div>
            </div>

            <div className="absolute bottom-10 text-center space-y-1">
              <div className="text-[10px] font-black tracking-[1.2em] text-white/20 uppercase">Umbra Brand Identity</div>
              <div className="text-[8px] font-bold tracking-[0.4em] text-emerald-500/40 uppercase italic">Interactive Standard</div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Stats Section - Verified Data */}
      <section ref={statsRef} className="stat-container relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-0">
            <div className="text-center group lg:border-r border-white/5">
              <AnimatedCounter target={116} suffix="K+" decimals={0} />
              <div className="stat-label">{t?.stats?.reach_label}</div>
            </div>
            <div className="text-center group lg:border-r border-white/5">
              <AnimatedCounter target={8} suffix="" />
              <div className="stat-label">{t?.stats?.creators_label}</div>
            </div>
            <div className="text-center group">
              <AnimatedCounter target={3} suffix="" />
              <div className="stat-label">{t?.stats?.campaigns_label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Method Section - Premium Bento Grid */}
      <section id="about" className="py-48 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24">
            <span className="section-label">{t?.about?.label}</span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">The <span className="gradient-text">Standard.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div whileHover={{ y: -10 }} className="premium-card min-h-[400px] flex flex-col justify-between group">
               <div className="absolute top-10 right-12 text-7xl font-black text-white/[0.03] select-none pointer-events-none group-hover:text-emerald-500/10 transition-colors">01</div>
               <div className="p-5 bg-emerald-600/5 border border-emerald-500/10 rounded-3xl w-fit"><Target className="h-8 w-8 text-emerald-500" /></div>
               <div><h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">{t?.about?.p1_title}</h3><p className="text-slate-400 text-lg leading-relaxed font-medium italic opacity-80">"{t?.about?.p1_desc}"</p></div>
            </motion.div>
            <motion.div whileHover={{ y: -10 }} className="premium-card min-h-[400px] flex flex-col justify-between group">
               <div className="absolute top-10 right-12 text-7xl font-black text-white/[0.03] select-none pointer-events-none group-hover:text-purple-500/10 transition-colors">02</div>
               <div className="p-5 bg-purple-600/5 border border-purple-500/10 rounded-3xl w-fit"><Zap className="h-8 w-8 text-purple-500" /></div>
               <div><h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">{t?.about?.p2_title}</h3><p className="text-slate-400 text-lg leading-relaxed font-medium italic opacity-80">"{t?.about?.p2_desc}"</p></div>
            </motion.div>
            <motion.div whileHover={{ y: -10 }} className="premium-card min-h-[400px] flex flex-col justify-between group">
               <div className="absolute top-10 right-12 text-7xl font-black text-white/[0.03] select-none pointer-events-none group-hover:text-rose-500/10 transition-colors">03</div>
               <div className="p-5 bg-rose-600/5 border border-rose-500/10 rounded-3xl w-fit"><TrendingUp className="h-8 w-8 text-rose-500" /></div>
               <div><h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">{t?.about?.p4_title}</h3><p className="text-slate-400 text-lg leading-relaxed font-medium italic opacity-80">"{t?.about?.p4_desc}"</p></div>
            </motion.div>
            <motion.div whileHover={{ y: -10 }} className="premium-card min-h-[400px] flex flex-col justify-between group bg-slate-900 border-none">
               <div className="absolute top-10 right-12 text-7xl font-black text-white/[0.03] select-none pointer-events-none group-hover:text-emerald-500/10 transition-colors">04</div>
               <div className="relative z-10 flex flex-col h-full justify-between">
                 <div>
                   <div className="p-5 bg-emerald-600/10 border border-emerald-500/20 rounded-3xl w-fit mb-8"><Shield className="h-4 w-4" /></div>
                   <h3 className="text-4xl font-black mb-6 uppercase tracking-tighter">{t?.about?.p3_title}</h3>
                 </div>
                 <p className="text-slate-400 text-lg leading-relaxed font-medium italic opacity-80">"{t?.about?.p3_desc}"</p>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Elite Roster Carousel */}
      <section id="creators" className="py-48 bg-slate-950 relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <span className="section-label">{t?.showcase?.label}</span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">The <span className="gradient-text">Force.</span></h2>
        </div>
        <div className="creator-carousel-container">
          <motion.div className="creator-track" animate={{ x: [0, -2240] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
            {[...PLACEHOLDER_CREATORS, ...PLACEHOLDER_CREATORS].map((creator, i) => (
              <motion.div key={`${creator.id}-${i}`} className="creator-card-premium group cursor-pointer" onClick={() => handleExternalLink(creator.twitter)}>
                <div className="creator-card-photo"><img src={creator.photo_url} className="w-full h-full object-cover" alt={creator.display_name} /></div>
                <div className="creator-card-gradient" /><div className="absolute top-10 right-10 z-30 p-4 bg-white/5 rounded-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-sky-500 hover:text-white"><Twitter className="h-5 w-5" /></div>
                <div className="absolute bottom-12 left-12 right-12 z-30">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-3">{creator.badge}</div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{creator.display_name}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Leadership Asymmetric Bento */}
      <section className="py-40 px-6 bg-slate-900/10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-center">
            <span className="section-label">{t?.leadership?.label}</span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">{t?.leadership?.title1} <br/> <span className="gradient-text">{t?.leadership?.title2}</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="premium-card group cursor-pointer" onClick={() => handleExternalLink('https://x.com/eminatr1x')}>
                <div className="founder-img-wrapper"><img src={founder1} alt="EMINATR1X" /></div>
                <h3 className="text-3xl font-black mb-3 gradient-text">EMINATR1X</h3>
                <p className="text-slate-400 text-sm italic opacity-80 leading-relaxed">"I take your project's raw light and bend it into a message people can't unsee."</p>
             </div>
             <div className="premium-card group cursor-pointer" onClick={() => handleExternalLink('https://x.com/CaBsCrypto')}>
                <div className="founder-img-wrapper"><img src={founder2} alt="CaBs" /></div>
                <h3 className="text-3xl font-black mb-3 gradient-text">CaBs</h3>
                <p className="text-slate-400 text-sm italic opacity-80 leading-relaxed">"Ready to break down complex ideas into simple explanations."</p>
             </div>
             <div className="premium-card group cursor-pointer" onClick={() => handleExternalLink('https://x.com/LadyMufaTV')}>
                <div className="founder-img-wrapper"><img src={creator1} alt="Lady Mufa" /></div>
                <h3 className="text-3xl font-black mb-3 gradient-text">Lady Mufa</h3>
                <p className="text-slate-400 text-sm italic opacity-80 leading-relaxed">"Building pathways for women to thrive and join the Web3 gaming scene."</p>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto premium-card bg-emerald-600 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-cyan-600 to-emerald-700 opacity-90" />
          <div className="relative z-10 py-12">
            <h2 className="text-4xl md:text-7xl font-black mb-10 leading-tight tracking-tighter uppercase">{t?.cta?.title}</h2>
            <p className="text-lg text-white/80 mb-14 max-w-xl mx-auto font-medium">{t?.cta?.desc}</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="px-12 py-5 bg-white text-emerald-600 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl" onClick={handleEnterApp}>{t?.cta?.btn1}</button>
              <button className="px-12 py-5 bg-transparent border-2 border-white/20 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all" onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })}>{t?.cta?.btn2}</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 border-t border-white/5 text-slate-500 bg-slate-950 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-8"><Rocket className="h-8 w-8 text-emerald-500" /><span className="text-2xl font-black text-white tracking-tighter">{t?.footer?.hub}</span></div>
              <p className="text-sm leading-relaxed max-w-sm opacity-60">The unmistakable standard for creator-driven Web3 marketing excellence. Building the future of cultural resonance.</p>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">Navigation</div>
              <ul className="space-y-4 text-xs font-black uppercase tracking-widest">
                <li><button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-white transition-colors">Back to top</button></li>
                <li><button onClick={() => document.getElementById('creators')?.scrollIntoView({behavior:'smooth'})} className="hover:text-white transition-colors">The Force</button></li>
                <li><button onClick={handleEnterApp} className="hover:text-white transition-colors">Command Center</button></li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">Connect</div>
              <div onClick={() => handleExternalLink('https://x.com/eminatr1x')} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors"><Twitter className="h-4 w-4 group-hover:text-cyan-400 transition-colors" /></div>
                <div><div className="text-sm font-black text-white/80 group-hover:text-white transition-colors">Official X</div><div className="text-[10px] opacity-40">@UmbraAgency</div></div>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] uppercase font-black tracking-widest">{t?.footer?.rights} - Restoration v2.6 (Ultimate Finish)</p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">System_Stable: Selective Deployment</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

