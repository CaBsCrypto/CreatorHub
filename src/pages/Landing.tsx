import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { 
  Zap, Rocket, Trophy, Target, 
  ArrowRight, Shield,
  BarChart3, LayoutDashboard, LogIn,
  TrendingUp, Twitter,
  Activity, Search, Eye, MessageSquare, Heart as HeartIcon,
  CheckCircle2, Clock, Users
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import translations from './translations';
import './Landing.css';

// Componente de Visualización de Campaña "Live" para la Landing
const LiveCampaignMockup = () => {
  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900/80 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl overflow-hidden backdrop-blur-xl relative group">
      {/* Header del Mockup */}
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
          </div>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Campaign_Protocol_Active</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Live_Scraping_Node_04</span>
          </div>
        </div>
      </div>

      {/* Contenido del Mockup */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna 1: Diagnóstico */}
        <div className="space-y-6">
          <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
             <div className="flex items-center gap-3 mb-4">
                <Target className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">01. Diagnóstico Táctico</span>
             </div>
             <div className="space-y-2 opacity-60">
                <div className="h-1.5 bg-white/10 rounded-full w-full" />
                <div className="h-1.5 bg-white/10 rounded-full w-5/6" />
                <div className="h-1.5 bg-white/10 rounded-full w-4/6" />
             </div>
          </div>
          <div className="p-5 bg-cyan-500/5 rounded-2xl border border-cyan-500/20">
             <p className="text-[10px] font-bold text-cyan-400 mb-2 uppercase italic">Targeting_Locked</p>
             <p className="text-xs text-white/70 leading-relaxed font-medium">Analizamos la huella cultural del proyecto para alinear creadores de alto impacto.</p>
          </div>
        </div>

        {/* Columna 2: Ejecución Real-time */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Vistas</p>
              <p className="text-2xl font-black text-white">48.9K</p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Engagement</p>
              <p className="text-2xl font-black text-emerald-400">8.4%</p>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 text-center">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">ROI_Index</p>
              <p className="text-2xl font-black text-white">x3.2</p>
            </div>
          </div>
          
          <div className="bg-slate-950/80 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Feed de Contenido Verificado</span>
                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase">Live_Updates</div>
             </div>
             <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0 border border-white/10" />
                    <div className="flex-1 space-y-2">
                       <div className="h-2 bg-white/10 rounded-full w-1/2" />
                       <div className="flex gap-4">
                          <div className="h-1.5 bg-emerald-500/20 rounded-full w-12" />
                          <div className="h-1.5 bg-cyan-500/20 rounded-full w-12" />
                       </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-40" />
                  </div>
                ))}
             </div>
             {/* Data Scan Line */}
             <div className="absolute inset-x-0 top-0 h-px bg-emerald-500/20 blur-[1px] animate-scan" />
          </div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none" />
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
      <motion.div animate={{ scale: isHovered ? [1.2, 1.4, 1.2] : 1.2, opacity: isHovered ? 0.6 : 0.3 }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-emerald-500/20 blur-[20px] rounded-full" />
      <motion.div animate={{ rotate: isHovered ? 360 : 0, scale: isHovered ? 1.1 : 1 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-10 h-10 border border-emerald-400/30 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.2)]" />
      <motion.div animate={{ x: isHovered ? 4 : 0, y: isHovered ? -2 : 0, scale: isHovered ? 0.95 : 1 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="relative w-8 h-8 bg-slate-950 rounded-full z-10 border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden">
        <motion.div animate={{ opacity: isHovered ? 1 : 0.4, scale: isHovered ? 1.5 : 1 }} className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(52,211,153,0.1),transparent_70%)]" />
        <div className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-1">U</div>
      </motion.div>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [selectedStrategy, setSelectedStrategy] = useState<null | { title: string, detail: string, icon: any, color: string }>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const t: any = (translations as any)[language] || (translations as any)['en'];

  const handleEnterApp = () => {
    if (user) { navigate('/dashboard'); } else { navigate('/login'); }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="landing-container" ref={containerRef}>
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
            <button onClick={() => document.getElementById('method')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-black uppercase tracking-[0.3em] hover:text-emerald-400 transition-colors">{t?.nav?.method}</button>
            <button onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-black uppercase tracking-[0.3em] hover:text-emerald-400 transition-colors">{t?.nav?.talents}</button>
            <button onClick={() => document.getElementById('leadership')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-black uppercase tracking-[0.3em] hover:text-emerald-400 transition-colors">{t?.nav?.minds}</button>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} className="w-10 h-10 rounded-full bg-slate-900/50 border border-emerald-500/10 flex items-center justify-center text-xs font-black hover:bg-slate-900 transition-all uppercase">{language}</button>
            <button onClick={handleEnterApp} className="px-8 py-3 bg-emerald-500 text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/10">{user ? (t?.nav?.dashboard || "Command Center") : (t?.nav?.login || "Login")}</button>
          </div>
        </div>
      </nav>

      {/* BLOQUE MAESTRO: PROTOCOLO DE CAMPAÑA Y ESTÁNDAR REAL */}
      <section id="method" className="relative pt-24 pb-48 px-6 z-10">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Header Directo al Grano */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full mb-8">
               <Shield className="h-3 w-3 text-emerald-400" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Verificado por Umbra Protocol v3.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.95] mb-12">
                El Estándar <br/>
                <span className="gradient-text">Inconfundible.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-[1.6] mb-16">
                No somos una agencia de humo. Desplegamos infraestructura de datos propia para que cada vista, interacción y ROI sea **real y auditable**.
            </p>
            
            {/* Visualización de Dashboard en la Landing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <LiveCampaignMockup />
            </motion.div>
          </motion.div>

          {/* Estadísticas Crudas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-48">
            {[
              { label: t?.stats?.reach_label, value: 116, suffix: "K+", icon: Eye, color: "text-cyan-400" },
              { label: t?.stats?.creators_label, value: 8, suffix: "", icon: Users, color: "text-emerald-400" },
              { label: t?.stats?.campaigns_label, value: 3, suffix: "", icon: BarChart3, color: "text-rose-400" }
            ].map((stat, i) => (
              <div key={i} className="premium-card p-10 flex flex-col items-center text-center group">
                 <div className={`p-4 bg-white/5 rounded-2xl mb-6 group-hover:scale-110 transition-transform ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                 </div>
                 <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                 <div className="stat-label mt-4">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* El Método: Protocolo de Trabajo Real */}
          <div className="space-y-32">
            <div className="text-center">
                <span className="section-label">Flujo de Operación</span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">Cómo <span className="gradient-text">Trabajamos.</span></h2>
            </div>

            <div className="method-bento">
                <motion.div 
                  className="method-card-large group cursor-pointer card-theme-cyan"
                  onClick={() => setSelectedStrategy({ title: t?.about?.p1_title, detail: t?.about?.p1_detail, icon: Target, color: 'text-cyan-400' })}
                >
                    <div className="absolute top-8 right-10 text-8xl font-black text-white/[0.02] select-none pointer-events-none group-hover:text-cyan-500/5 transition-colors">01</div>
                    <div className="flex justify-between items-start mb-12">
                        <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl group-hover:bg-cyan-500/20 transition-colors"><Target className="h-6 w-6 text-cyan-400" /></div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/10">Fase_Diagnóstico</div>
                    </div>
                    <div>
                        <h3 className="text-3xl lg:text-5xl font-black mb-4 uppercase tracking-tighter text-white">{t?.about?.p1_title}</h3>
                        <p className="text-slate-300 text-lg leading-relaxed font-medium max-w-xl">{t?.about?.p1_desc}</p>
                    </div>
                </motion.div>

                <motion.div 
                  className="method-card-small group cursor-pointer card-theme-purple"
                  onClick={() => setSelectedStrategy({ title: t?.about?.p2_title, detail: t?.about?.p2_detail, icon: Zap, color: 'text-purple-400' })}
                >
                    <div className="absolute top-8 right-10 text-8xl font-black text-white/[0.02] select-none pointer-events-none group-hover:text-purple-500/5 transition-colors">02</div>
                    <div className="mb-12">
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl w-fit group-hover:bg-purple-500/20 transition-colors"><Activity className="h-6 w-6 text-purple-400" /></div>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <h3 className="text-2xl lg:text-3xl font-black mb-4 uppercase tracking-tighter text-white">Ejecución & Scraping</h3>
                        <p className="text-slate-300 text-base leading-relaxed font-medium">Motor propio que captura métricas en tiempo real de cada pieza de contenido.</p>
                    </div>
                </motion.div>

                <motion.div 
                  className="method-card-small group cursor-pointer card-theme-emerald"
                  onClick={() => setSelectedStrategy({ title: t?.about?.p3_title, detail: t?.about?.p3_detail, icon: Shield, color: 'text-emerald-400' })}
                >
                    <div className="absolute top-8 right-10 text-8xl font-black text-white/[0.02] select-none pointer-events-none group-hover:text-emerald-500/5 transition-colors">03</div>
                    <div className="mb-12">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-fit group-hover:bg-emerald-500/20 transition-colors"><LayoutDashboard className="h-6 w-6 text-emerald-400" /></div>
                    </div>
                    <div className="relative z-10 mt-auto">
                        <h3 className="text-2xl lg:text-3xl font-black mb-4 uppercase tracking-tighter text-white">Dashboard de ROI</h3>
                        <p className="text-slate-300 text-base leading-relaxed font-medium">Portal unificado donde las marcas ven la verdad absoluta de su inversión.</p>
                    </div>
                </motion.div>

                <motion.div 
                  className="method-card-large group cursor-pointer card-theme-emerald"
                  onClick={() => setSelectedStrategy({ title: t?.about?.p4_title, detail: t?.about?.p4_detail, icon: TrendingUp, color: 'text-emerald-400' })}
                >
                    <div className="absolute top-8 right-10 text-8xl font-black text-white/[0.02] select-none pointer-events-none group-hover:text-emerald-500/5 transition-colors">04</div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-fit mb-12 group-hover:bg-emerald-500/20 transition-colors"><TrendingUp className="h-6 w-6 text-emerald-400" /></div>
                        <div>
                            <h3 className="text-3xl lg:text-5xl font-black mb-4 uppercase tracking-tighter text-white">{t?.about?.p4_title}</h3>
                            <p className="text-slate-300 text-lg leading-relaxed font-medium max-w-xl">{t?.about?.p4_desc}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Elite Roster Carousel */}
      <section id="creators" className="py-48 bg-slate-950 relative overflow-hidden border-t border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <span className="section-label">{t?.showcase?.label}</span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">The <span className="gradient-text">Force.</span></h2>
        </div>
        <div className="creator-carousel-container">
          <motion.div className="creator-track" animate={{ x: [0, -2576] }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
            {[...PLACEHOLDER_CREATORS, ...PLACEHOLDER_CREATORS].map((creator, i) => (
              <motion.div key={`${creator.id}-${i}`} className="creator-card-premium group cursor-pointer" onClick={() => handleExternalLink(creator.twitter)}>
                <div className="creator-card-photo"><img src={creator.photo_url} className="w-full h-full object-cover" alt={creator.display_name} /></div>
                <div className="creator-card-gradient" /><div className="absolute top-10 right-10 z-30 p-4 bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-sky-500 hover:text-white"><Twitter className="h-5 w-5" /></div>
                <div className="absolute bottom-12 left-12 right-12 z-30">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-3">{creator.badge}</div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{creator.display_name}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Leadership Section */}
      <section id="leadership" className="py-40 px-6 bg-slate-900/10 border-t border-emerald-500/10">
        <div className="max-w-7xl mx-auto text-center">
            <span className="section-label">Mentes Maestras</span>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-24">Fundadores <br/> <span className="gradient-text">& Dirección.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { name: "EMINATR1X", img: founder1, twitter: "https://x.com/eminatr1x", quote: "Transformamos la luz cruda de tu proyecto en un mensaje imposible de ignorar." },
                 { name: "CaBs", img: founder2, twitter: "https://x.com/CaBsCrypto", quote: "Arquitecto de ideas complejas en ejecuciones simples y auditables." },
                 { name: "Lady Mufa", img: creator1, twitter: "https://x.com/LadyMufaTV", quote: "Construyendo el camino para que el talento femenino domine el Web3 gaming." }
               ].map((f, i) => (
                 <div key={i} className="premium-card group cursor-pointer" onClick={() => handleExternalLink(f.twitter)}>
                    <div className="founder-img-wrapper"><img src={f.img} alt={f.name} /></div>
                    <h3 className="text-3xl font-black mb-3 gradient-text uppercase">{f.name}</h3>
                    <p className="text-slate-400 text-sm italic opacity-80 leading-relaxed">"{f.quote}"</p>
                 </div>
               ))}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 border-t border-emerald-500/10 text-slate-500 bg-slate-950 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-8"><Rocket className="h-8 w-8 text-emerald-500" /><span className="text-2xl font-black text-white tracking-tighter">{t?.footer?.hub}</span></div>
              <p className="text-sm leading-relaxed max-w-sm opacity-60">El estándar auditable para el marketing de Web3 impulsado por creadores.</p>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8">Navegación</div>
              <ul className="space-y-4 text-xs font-black uppercase tracking-widest">
                <li><button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-white transition-colors">Inicio</button></li>
                <li><button onClick={() => document.getElementById('creators')?.scrollIntoView({behavior:'smooth'})} className="hover:text-white transition-colors">Talento</button></li>
                <li><button onClick={handleEnterApp} className="hover:text-white transition-colors">Acceso Operador</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex justify-between items-center">
            <p className="text-[10px] uppercase font-black tracking-widest">{t?.footer?.rights} - Protocol v3.0</p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">System_Auditable: Selective Deployment</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Estrategia */}
      <AnimatePresence>
        {selectedStrategy && (
          <div className="strategy-modal-overlay" onClick={() => setSelectedStrategy(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="strategy-modal-content" onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500" />
              <button onClick={() => setSelectedStrategy(null)} className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-white/5 text-slate-500 transition-all hover:rotate-90">
                <LogIn className="h-6 w-6 rotate-180" />
              </button>
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 bg-white/5 rounded-2xl ${selectedStrategy.color}`}><selectedStrategy.icon className="h-8 w-8" /></div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">{selectedStrategy.title}</h3>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Protocolo Oficial v3.0</div>
                </div>
              </div>
              <p className="text-xl text-slate-300 leading-relaxed font-medium mb-8">{selectedStrategy.detail}</p>
              <button onClick={() => setSelectedStrategy(null)} className="w-full py-5 bg-emerald-500 text-slate-950 rounded-full font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all">Regresar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
