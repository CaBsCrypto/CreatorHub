import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  AnimatePresence,
  useScroll,
  useTransform,
  useInView
} from 'framer-motion';
import { 
  Zap, Rocket, Target, 
  ArrowRight, Shield,
  BarChart3, LayoutDashboard, LogIn,
  TrendingUp, Twitter,
  Activity, Eye, Users, CheckCircle2,
  ChevronDown, Hexagon, Layers, Share2,
  PieChart, LineChart, Database, Cpu, Globe, Lock, Sparkles,
  Search, ShieldCheck, MousePointer2, X, ClipboardCheck, Network, BarChart, Server
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import translations from './translations';
import './Landing.css';

// --- DATA: PROCESS STEPS ---

const PROCESS_STEPS = [
  {
    id: 'study',
    num: '01',
    title: 'Inmersión de Proyecto',
    short: 'Estudiamos tu marca y ADN para alinear objetivos reales de mercado.',
    icon: ClipboardCheck,
    detail: {
      title: 'Fase 01: Análisis y Diagnóstico',
      content: 'Entramos a fondo en tu proyecto. Nuestro equipo estudia el mercado y tu competencia para diseñar una base sólida.',
      items: [
        'Briefing de Marca Detallado',
        'Análisis de Competencia',
        'Definición de Objetivos (KPIs)',
        'Mapeo de Audiencia Objetivo'
      ]
    }
  },
  {
    id: 'strategy',
    num: '02',
    title: 'Diseño Estratégico',
    short: 'La Guild planifica el roadmap y selecciona al equipo de creadores ideal.',
    icon: Network,
    detail: {
      title: 'Fase 02: Arquitectura de Campaña',
      content: 'Diseñamos el plan de ataque. Seleccionamos los perfiles que mejor encajan con tu mensaje para maximizar el impacto.',
      items: [
        'Selección de Team de Creadores',
        'Planificación de Canales',
        'Roadmap de Publicaciones',
        'Estrategia de Ángulos Creativos'
      ]
    }
  },
  {
    id: 'validation',
    num: '03',
    title: 'Validación de Scripts',
    short: 'Control de calidad riguroso de cada guion para asegurar la conversión.',
    icon: Layers,
    detail: {
      title: 'Fase 03: Control de Calidad Creativo',
      content: 'Nada se deja al azar. Validamos y pulimos cada script para que el mensaje sea potente, claro y efectivo.',
      items: [
        'Revisión Técnica de Scripts',
        'Ajuste de Ganchos (Hooks)',
        'Optimización de Narrativa',
        'Validación de Call to Actions'
      ]
    }
  },
  {
    id: 'execution',
    num: '04',
    title: 'Despliegue Umbra',
    short: 'Subida coordinada de contenido y monitorización de impacto live.',
    icon: Activity,
    detail: {
      title: 'Fase 04: Ejecución y Lanzamiento',
      content: 'El momento del impacto. Coordinamos la subida de contenido y monitorizamos la respuesta de la comunidad en vivo.',
      items: [
        'Gestión de Publicaciones',
        'Monitoreo de Comentarios',
        'Ajustes de Estrategia en Vivo',
        'Control de Nodos de Contenido'
      ]
    }
  },
  {
    id: 'results',
    num: '05',
    title: 'Reporte de Resultados',
    short: 'Entrega de métricas reales y análisis de ROI auditable.',
    icon: BarChart,
    detail: {
      title: 'Fase 05: Análisis y Cierre',
      content: 'Transparencia total. Entregamos un reporte detallado con los resultados obtenidos y el retorno generado.',
      items: [
        'Reporte de Métricas Final',
        'Análisis de ROI de Campaña',
        'Feedback de Rendimiento',
        'Plan de Escalado de Proyecto'
      ]
    }
  }
];

// --- SUB-COMPONENTS ---

const ProcessBox = ({ step, onClick }: { step: any, onClick: () => void }) => (
  <motion.div 
    whileHover={{ y: -12, scale: 1.02 }}
    onClick={onClick}
    className="relative p-7 md:p-10 rounded-[2.5rem] bg-transparent backdrop-blur-none cursor-pointer group transition-all duration-500 overflow-hidden min-h-[260px] flex flex-col justify-between border border-white/5 hover:border-red-500/40"
  >
    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-red-500/[0.02] blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    
    <div className="relative z-10 space-y-4">
       <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-red-600 group-hover:text-black group-hover:border-red-600 transition-all">
             <step.icon className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-mono font-black text-white/10 uppercase tracking-[0.3em] group-hover:text-red-500/40 transition-colors">STEP_{step.num}</span>
       </div>
       
       <div>
          <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tighter mb-2 group-hover:text-red-500 transition-colors">{step.title}</h3>
          <p className="text-[11px] font-medium text-white/30 leading-relaxed max-w-[200px] group-hover:text-white/50 transition-colors">{step.desc}</p>
       </div>
    </div>
  </motion.div>
);

const ProcessModal = ({ step, onClose }: { step: any, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/10 backdrop-blur-md"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="max-w-2xl w-full bg-black/60 border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 relative overflow-y-auto max-h-[90vh] backdrop-blur-xl shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
       <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px]" />
       
       <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
          <X className="h-6 w-6" />
       </button>

       <div className="space-y-10 relative z-10">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-[#030711]">
                <step.icon className="h-8 w-8" />
             </div>
             <div>
                <span className="text-xs font-black text-red-500 uppercase tracking-[0.5em]">Onboarding Protocol</span>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">{step.detail.title}</h2>
             </div>
          </div>

          <p className="text-base md:text-xl text-white/60 font-medium leading-relaxed">{step.detail.content}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {step.detail.items.map((item: string, i: number) => (
               <div key={i} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4">
                  <CheckCircle2 className="h-4 w-4 text-red-600" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/60">{item}</span>
               </div>
             ))}
          </div>

          <button onClick={onClose} className="w-full py-4 bg-red-700 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all">
             Initialize_Module
          </button>
       </div>
    </motion.div>
  </motion.div>
);

// --- MAIN PAGE ---

// --- ICONS MAPPING ---
const STEP_ICONS = [ClipboardCheck, Network, Layers, Activity, BarChart];

// --- DATA: CREATORS ---
const CREATORS = [
  { name: 'Spadex', img: '/assets/spadex.webp', handle: '@spadex' },
  { name: 'Seven', img: '/assets/seven.webp', handle: '@seven' },
  { name: 'Cabs', img: '/assets/cabs.webp', handle: '@cabs' },
  { name: 'Camululis', img: '/assets/camululis.webp', handle: '@camululis' },
  { name: 'Lady Mufa', img: '/assets/ladymufa.webp', handle: '@ladymufa' },
  { name: 'Lizard', img: '/assets/lizard.webp', handle: '@lizard' },
  { name: 'Oza', img: '/assets/oza.webp', handle: '@oza' },
  { name: 'Eminatr1x', img: '/assets/eminatr1x.webp', handle: '@eminatr1x' },
  { name: 'Yagod', img: '/assets/yagod.webp', handle: '@yagod' },
  { name: '1dory', img: '/assets/1dory.webp', handle: '@1dory' },
];

const FOUNDERS = [
  { name: 'Eminatrix', role: 'Creative Director', img: '/assets/eminatr1x.webp' },
  { name: 'Cabs', role: 'Strategic Director', img: '/assets/cabs.webp' },
  { name: 'Lady Mufa', role: 'Operations Director', img: '/assets/ladymufa.webp' },
];

// Animated counter for stats
const AnimatedCounter = ({ target, prefix = '', suffix = '', divisor = 1 }: { target: number, prefix?: string, suffix?: string, divisor?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const finalValue = Math.round(target / divisor);
    const duration = 2000;
    const steps = 60;
    const increment = finalValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= finalValue) {
        setCount(finalValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, divisor]);
  return <span>{prefix}{count}{suffix}</span>;
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [lang, setLang] = useState<'en' | 'es'>('es');
  const t = translations[lang];
  const [stats, setStats] = useState({ views: 0, campaigns: 0, creators: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });

  useEffect(() => {
    fetch('/api/public-stats')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setStatsLoaded(true);
      })
      .catch(() => setStatsLoaded(true)); // fail silently
  }, []);
  
  const handleEnterApp = () => {
    if (user) { navigate('/dashboard'); } else { navigate('/login'); }
  };

  const processSteps = t.onboarding.steps.map((step: any, index: number) => ({
    ...step,
    id: `step-${index}`,
    num: `0${index + 1}`,
    icon: STEP_ICONS[index],
    desc: step.short,
    detail: {
      title: step.detail_title,
      content: step.detail_content,
      items: step.items || []
    }
  }));

  return (
    <div className="landing-container bg-transparent selection:bg-red-500/30">
        {/* Technical Background System */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
           {/* Base Obsidian Layer */}
           <div className="absolute inset-0 bg-[#020202]" />
           
           {/* Technical Grid with Radial Mask */}
           <div className="technical-grid" />
           
           {/* Dynamic Scanline */}
           <div className="scanline" />
           
           {/* Vignette Overlay */}
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(0,0,0,0.4)_100%)]" />
           
           {/* Ambient Red Pools */}
           <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-red-600/[0.03] rounded-full blur-[150px] animate-pulse" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-900/[0.02] rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="grain-overlay opacity-[0.03]" />
      
      {/* Navbar */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-[#030711] font-black text-lg">U</div>
             <span className="text-xl font-black uppercase tracking-[0.4em] text-white">Umbra</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
             <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')} className="px-3 md:px-4 py-2 border border-white/10 rounded-xl text-[9px] md:text-[10px] font-black text-white/40 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest">
                {lang === 'en' ? 'ES' : 'EN'}
             </button>
             <button onClick={handleEnterApp} className="px-5 md:px-8 py-3 bg-white text-black rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
               {t.nav.access}
             </button>
          </div>
        </div>
      </nav>

      <section id="onboarding" className="py-20 md:py-32 px-4 md:px-8 lg:px-12 bg-transparent relative z-10 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
           <motion.div 
             animate={{ x: [0, -1920] }} 
             transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
             className="flex gap-8 pt-40 opacity-50 z-10"
           >
              {[...CREATORS, ...CREATORS, ...CREATORS, ...CREATORS, ...CREATORS].map((creator, i) => (
                <div key={i} className="flex-none w-[280px] h-[380px] rounded-[2rem] overflow-hidden relative">
                   <img src={creator.img} className="w-full h-full object-cover brightness-[0.4] contrast-[1.2] grayscale-[0.5]" alt="" />
                   <div className="absolute inset-0 bg-[#020202]/30 mix-blend-multiply" />
                </div>
              ))}
           </motion.div>
        </div>

        <div className="max-w-7xl mx-auto relative z-30">
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={lang} className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-10">
             <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                   <ShieldCheck className="h-2 w-2 text-red-500" />
                   <span className="text-[7px] font-black uppercase tracking-[0.4em] text-red-500">{t.onboarding.label}</span>
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                   {t.onboarding.title_1} <span className="text-red-500">{t.onboarding.title_2}</span>
                </h1>
             </div>
             <p className="text-xs md:text-[11px] text-white/30 font-medium max-w-sm leading-relaxed">{t.onboarding.desc}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {processSteps.map((step: any) => (
               <ProcessBox key={step.id} step={step} onClick={() => setSelectedStep(step)} />
             ))}
             
             <motion.div 
               whileHover={{ y: -12, scale: 1.02 }}
               className="p-7 md:p-10 rounded-[2.5rem] bg-transparent backdrop-blur-none flex flex-col justify-between group cursor-pointer hover:bg-red-500/[0.02] transition-all duration-500 min-h-[260px] border border-red-500/20 hover:border-red-500/50"
               onClick={handleEnterApp}
             >
                <div className="flex justify-between items-start">
                   <div className="text-[9px] font-mono font-black text-red-500/40 uppercase tracking-[0.3em]">{t.onboarding.cta_box_label}</div>
                   <Rocket className="h-4 w-4 text-red-500/60 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-tight">{t.onboarding.cta_box_title}</h3>
                <button onClick={handleEnterApp} className="w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 text-red-500 border border-red-500/20 bg-red-500/5 hover:bg-red-500/20 transition-all">
                   {t.onboarding.cta_box_btn} <ArrowRight className="h-3.5 w-3.5" />
                </button>
             </motion.div>
          </div>
        </div>
      </section>

      {/* STATS DIVIDER */}
      <section className="py-0 px-4 md:px-8 lg:px-12 bg-white/[0.02] backdrop-blur-sm border-y border-white/5 relative overflow-hidden" ref={statsRef}>
        {/* Subtle red carry-over glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-red-600/10 blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">

            {/* STAT 1: Views */}
            <div className="flex items-center gap-6 py-10 px-8">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-none">
                <Eye className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-4xl font-black text-white tracking-tighter leading-none">
                  {statsInView && statsLoaded
                    ? <AnimatedCounter target={stats.views} suffix={stats.views >= 1000000 ? 'M' : stats.views >= 1000 ? 'K' : ''} divisor={stats.views >= 1000000 ? 1000000 : stats.views >= 1000 ? 1000 : 1} prefix="+" />
                    : <span className="text-white/20">—</span>}
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mt-1">Views Generadas</div>
              </div>
            </div>

            {/* STAT 2: Campaigns */}
            <div className="flex items-center gap-6 py-10 px-8">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-none">
                <BarChart className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-4xl font-black text-white tracking-tighter leading-none">
                  {statsInView && statsLoaded
                    ? <AnimatedCounter target={stats.campaigns} prefix="+" />
                    : <span className="text-white/20">—</span>}
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mt-1">Campañas Ejecutadas</div>
              </div>
            </div>

            {/* STAT 3: Creators */}
            <div className="flex items-center gap-6 py-10 px-8">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-none">
                <Users className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-4xl font-black text-white tracking-tighter leading-none">
                  {statsInView && statsLoaded
                    ? <AnimatedCounter target={stats.creators} prefix="+" />
                    : <span className="text-white/20">—</span>}
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mt-1">Creadores Activos</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOUNDERS SECTION */}
      <section className="py-40 px-8 lg:px-12 bg-transparent relative">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-24 space-y-6">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.8em]">{t.leadership.label}</span>
              <h2 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                 {t.leadership.title_1} <br/>
                 <span className="text-red-500">{t.leadership.title_2}</span>
              </h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {FOUNDERS.map((founder, i) => (
                <div key={i} className="space-y-8 group">
                   <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/5 relative">
                      <img src={founder.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt={founder.name} />
                      <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="space-y-2">
                      <div className="text-xs font-black text-red-500 uppercase tracking-[0.4em]">{founder.role}</div>
                      <div className="text-4xl font-black text-white uppercase tracking-tighter">{founder.name}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
         {selectedStep && (
           <ProcessModal step={selectedStep} onClose={() => setSelectedStep(null)} />
         )}
      </AnimatePresence>

      <footer className="py-20 px-8 border-t border-white/5 bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-[#020202]/50 backdrop-blur-md z-[-1]" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
           <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-[#030711] font-black">U</div>
              <span>Umbra Agency v3.0</span>
           </div>
           <span>{t.footer.rights}</span>
        </div>
      </footer>
    </div>
  );
}
