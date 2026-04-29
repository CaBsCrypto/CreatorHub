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
    whileHover={{ y: -5, borderColor: 'rgba(16, 185, 129, 0.4)' }}
    onClick={onClick}
    className="relative p-7 rounded-[1.5rem] bg-white/[0.06] border border-white/10 backdrop-blur-3xl cursor-pointer group transition-all duration-500 overflow-hidden min-h-[220px] flex flex-col justify-between"
  >
    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-emerald-500/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    
    <div className="relative z-10 space-y-4">
       <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
             <step.icon className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.3em]">STEP_{step.num}</span>
       </div>
       
       <div className="space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-emerald-400 transition-colors">{step.title}</h3>
          <p className="text-[11px] text-white/40 font-medium leading-relaxed line-clamp-2">{step.short}</p>
       </div>
    </div>

    <div className="relative z-10 pt-4 flex items-center gap-2 text-[7px] font-black uppercase tracking-widest text-emerald-500/40 opacity-0 group-hover:opacity-100 transition-opacity">
       Initialize_Module <ArrowRight className="h-2 w-2" />
    </div>
  </motion.div>
);

const ProcessModal = ({ step, onClose }: { step: any, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="max-w-2xl w-full bg-slate-950 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px]" />
       
       <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
          <X className="h-6 w-6" />
       </button>

       <div className="space-y-10 relative z-10">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-[#030711]">
                <step.icon className="h-8 w-8" />
             </div>
             <div>
                <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.5em]">Onboarding Protocol</span>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">{step.detail.title}</h2>
             </div>
          </div>

          <p className="text-xl text-white/60 font-medium leading-relaxed">{step.detail.content}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {step.detail.items.map((item: string, i: number) => (
               <div key={i} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/60">{item}</span>
               </div>
             ))}
          </div>

          <button onClick={onClose} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all">
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

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [lang, setLang] = useState<'en' | 'es'>('es');
  const t = translations[lang];
  
  const handleEnterApp = () => {
    if (user) { navigate('/dashboard'); } else { navigate('/login'); }
  };

  const processSteps = t.onboarding.steps.map((step: any, index: number) => ({
    ...step,
    id: `step-${index}`,
    num: `0${index + 1}`,
    icon: STEP_ICONS[index]
  }));

  return (
    <div className="landing-container selection:bg-emerald-500/30">
      <div className="grain-overlay" />
      
      {/* Navbar */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-[#030711] font-black text-lg">U</div>
             <span className="text-xl font-black uppercase tracking-[0.4em] text-white">Umbra</span>
          </div>
          
          <div className="flex items-center gap-6">
             <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')} className="px-4 py-2 border border-white/10 rounded-xl text-[10px] font-black text-white/40 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest">
                {lang === 'en' ? 'ES' : 'EN'}
             </button>
             <button onClick={handleEnterApp} className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
               {t.nav.access}
             </button>
          </div>
        </div>
      </nav>

      {/* ONBOARDING PROTOCOL WITH DYNAMIC SOCIAL PROOF BACKGROUND */}
      <section id="onboarding" className="pt-4 pb-32 px-8 lg:px-12 bg-[#030711] relative z-10 overflow-hidden">
        {/* BACKGROUND SOCIAL PROOF: HIGH-VISIBILITY INFINITE CAROUSEL */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {/* Dynamic Overlays */}
           <div className="absolute inset-0 bg-gradient-to-b from-[#030711] via-transparent to-[#030711] z-20" />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#030711_95%)] z-20" />
           <div className="absolute inset-0 bg-emerald-900/10 z-15" />
           
           <motion.div 
             animate={{ x: [0, -1920] }} 
             transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
             className="flex gap-4 pt-32 opacity-30 z-10"
           >
              {[...CREATORS, ...CREATORS, ...CREATORS, ...CREATORS].map((creator, i) => (
                <div key={i} className="flex-none w-[350px] h-[450px] rounded-[2rem] overflow-hidden grayscale brightness-[0.2] contrast-[1.1]">
                   <img src={creator.img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
           </motion.div>
        </div>

        <div className="max-w-7xl mx-auto relative z-30">
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} key={lang} className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-6">
             <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                   <ShieldCheck className="h-2 w-2 text-emerald-500" />
                   <span className="text-[7px] font-black uppercase tracking-[0.4em] text-emerald-500">{t.onboarding.label}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
                   {t.onboarding.title_1} <span className="text-emerald-500">{t.onboarding.title_2}</span>
                </h1>
             </div>
             <p className="text-[11px] text-white/30 font-medium max-w-xs leading-tight">{t.onboarding.desc}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {processSteps.map((step: any) => (
               <ProcessBox key={step.id} step={step} onClick={() => setSelectedStep(step)} />
             ))}
             
             <div className="p-7 rounded-[1.5rem] bg-emerald-600 flex flex-col justify-between group cursor-pointer hover:bg-emerald-500 transition-all duration-500 min-h-[220px] shadow-[0_0:40px_rgba(16,185,129,0.2)]">
                <div className="flex justify-between items-start">
                   <div className="text-[9px] font-mono font-black text-[#030711] uppercase tracking-[0.3em]">{t.onboarding.cta_box_label}</div>
                   <Rocket className="h-4 w-4 text-[#030711]/40" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-[#030711] leading-tight">{t.onboarding.cta_box_title}</h3>
                <button onClick={handleEnterApp} className="w-full py-3.5 bg-[#030711] text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
                   {t.onboarding.cta_box_btn} <ArrowRight className="h-3.5 w-3.5" />
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* FOUNDERS SECTION */}
      <section className="py-40 px-8 lg:px-12 bg-black relative">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-24 space-y-6">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.8em]">{t.leadership.label}</span>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white">
                 {t.leadership.title_1} <br/>
                 <span className="text-emerald-500">{t.leadership.title_2}</span>
              </h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {FOUNDERS.map((founder, i) => (
                <div key={i} className="space-y-8 group">
                   <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/5 relative">
                      <img src={founder.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt={founder.name} />
                      <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div className="space-y-2">
                      <div className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em]">{founder.role}</div>
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

      <footer className="py-20 px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
           <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-[#030711] font-black">U</div>
              <span>Umbra Agency v3.0</span>
           </div>
           <span>{t.footer.rights}</span>
        </div>
      </footer>
    </div>
  );
}
