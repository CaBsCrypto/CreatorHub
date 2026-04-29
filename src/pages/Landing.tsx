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
    id: 'diagnostic',
    num: '01',
    title: 'Auditoría de ADN',
    short: 'Desmantelamos tu posicionamiento para identificar ángulos de ataque y ROI.',
    icon: ClipboardCheck,
    detail: {
      title: 'Fase 01: Auditoría Técnica de ADN',
      content: 'No aceptamos proyectos a ciegas. Realizamos un desglose técnico de tu marca para alinear objetivos financieros con nuestra infraestructura.',
      items: [
        'Alineación de KPIs de Negocio',
        'Mapeo de ADN de Audiencia',
        'Análisis de Sentimiento Competitivo',
        'Validación de Infraestructura'
      ]
    }
  },
  {
    id: 'selection',
    num: '02',
    title: 'Vetting de Élite',
    short: 'Filtrado algorítmico del top 1% de creadores y nodos de talento verificados.',
    icon: Network,
    detail: {
      title: 'Fase 02: Sincronización de Talento',
      content: 'Olvida a los "influencers" genéricos. Desplegamos nodos de talento auditados por su capacidad real de conversión y autenticidad.',
      items: [
        'Auditoría de Autenticidad Real',
        'Verificación de ROI Histórico',
        'Matching de Afinidad Técnica',
        'Conexión Directa de Nodos'
      ]
    }
  },
  {
    id: 'strategy',
    num: '03',
    title: 'Despliegue Umbra',
    short: 'Ingeniería de contenido y ejecución estratégica de alto rendimiento.',
    icon: Layers,
    detail: {
      title: 'Fase 03: Integración Estratégica',
      content: 'Creamos el puente entre el capital de marca y la resonancia cultural. Ingeniería de contenido diseñada para convertir.',
      items: [
        'Briefing Técnico de Nodos',
        'Optimización de Hooks por Plataforma',
        'Sincronización de Timelines',
        'Protocolos de Mitigación de Riesgos'
      ]
    }
  },
  {
    id: 'monitoring',
    num: '04',
    title: 'Extracción de Datos',
    short: 'Scraping en tiempo real y monitoreo quirúrgico de cada interacción.',
    icon: Activity,
    detail: {
      title: 'Fase 04: Monitoreo Quirúrgico Live',
      content: 'Acceso directo a las APIs y herramientas de scraping. Visualiza el rendimiento de tu capital mientras ocurre, sin cajas negras.',
      items: [
        'Scraping de Datos en Tiempo Real',
        'Tracking de Sentimiento de Engagement',
        'Nodos de Rendimiento por Plataforma',
        'Dashboards de Transparencia Total'
      ]
    }
  },
  {
    id: 'yield',
    num: '05',
    title: 'Consolidación de ROI',
    short: 'Entrega de resultados auditables y escalado estratégico de capital.',
    icon: BarChart,
    detail: {
      title: 'Fase 05: Rendimiento de Capital',
      content: 'La entrega final. Consolidamos todas las métricas en un reporte indiscutible diseñado para el escalado de negocio.',
      items: [
        'Reportes de ROI Auditados',
        'Análisis de Momentum de Crecimiento',
        'Proyecciones de Escalado Futuro',
        'Liquidación de Performance Directa'
      ]
    }
  }
];

// --- SUB-COMPONENTS ---

const ProcessBox = ({ step, onClick }: { step: any, onClick: () => void }) => (
  <motion.div 
    whileHover={{ y: -5, borderColor: 'rgba(16, 185, 129, 0.4)' }}
    onClick={onClick}
    className="relative p-7 rounded-[1.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl cursor-pointer group transition-all duration-500 overflow-hidden min-h-[220px] flex flex-col justify-between"
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

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedStep, setSelectedStep] = useState<any>(null);
  
  const handleEnterApp = () => {
    if (user) { navigate('/dashboard'); } else { navigate('/login'); }
  };

  return (
    <div className="landing-container selection:bg-emerald-500/30">
      <div className="grain-overlay" />
      
      {/* Navbar: Elite Authority */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-[#030711] font-black text-lg">U</div>
             <span className="text-xl font-black uppercase tracking-[0.4em] text-white">Umbra</span>
          </div>
          <button onClick={handleEnterApp} className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
            Consola_de_Acceso
          </button>
        </div>
      </nav>

      {/* THE GATEWAY: ONBOARDING PROTOCOL AT THE ABSOLUTE TOP (ULTRA-COMPACT) */}
      <section id="onboarding" className="pt-4 pb-20 px-8 lg:px-12 bg-[#030711] relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-6"
          >
             <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                   <ShieldCheck className="h-2 w-2 text-emerald-500" />
                   <span className="text-[7px] font-black uppercase tracking-[0.4em] text-emerald-500">Acceso_al_Sistema</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">
                   Protocolo de <span className="text-emerald-500">Onboarding.</span>
                </h1>
             </div>
             <p className="text-[11px] text-white/30 font-medium max-w-xs leading-tight">
                Ejecuta las fases a continuación para inicializar tu proyecto. Cada nodo representa un estándar operativo obligatorio para el éxito.
             </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {PROCESS_STEPS.map((step) => (
               <ProcessBox key={step.id} step={step} onClick={() => setSelectedStep(step)} />
             ))}
             
             {/* Call to Action Box (Unified & Compact) */}
             <div className="p-7 rounded-[1.5rem] bg-emerald-600 flex flex-col justify-between group cursor-pointer hover:bg-emerald-500 transition-all duration-500 min-h-[220px] shadow-[0_0:40px_rgba(16,185,129,0.2)]">
                <div className="flex justify-between items-start">
                   <div className="text-[9px] font-mono font-black text-[#030711] uppercase tracking-[0.3em]">INICIALIZAR_AUDITORIA</div>
                   <Rocket className="h-4 w-4 text-[#030711]/40" />
                </div>
                
                <h3 className="text-2xl font-black uppercase tracking-tighter text-[#030711] leading-tight">¿Listo para finalizar tu entrada?</h3>
                
                <button onClick={handleEnterApp} className="w-full py-3.5 bg-[#030711] text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                   Confirmar_Onboarding <ArrowRight className="h-3.5 w-3.5" />
                </button>
             </div>
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
           <span>© 2026 TODOS LOS DERECHOS RESERVADOS.</span>
        </div>
      </footer>
    </div>
  );
}
