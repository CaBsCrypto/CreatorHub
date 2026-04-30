import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  AnimatePresence,
  useInView
} from 'framer-motion';
import { 
  Zap, Rocket, Target, 
  ArrowRight, Shield,
  BarChart3, LayoutDashboard,
  Activity, Eye, Users, CheckCircle2,
  X, ClipboardCheck, Network, Layers, BarChart, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import translations from './translations';
import './Landing.css';

// --- ICONS MAPPING ---
const STEP_ICONS = [ClipboardCheck, Network, Layers, Activity, BarChart];

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

const ProcessBox = ({ step, onClick }: { step: any, onClick: () => void }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="relative p-7 rounded-[1.5rem] bg-transparent cursor-pointer group transition-all duration-500 overflow-hidden min-h-[220px] flex flex-col justify-between border border-white/10 hover:border-red-500/40"
  >
    <div className="absolute inset-0 z-0">
      <img 
        src={step.img || ''} 
        alt={step.title}
        className="w-full h-full object-cover opacity-50 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700 brightness-[0.9]"
      />
      <div className="absolute inset-0 bg-transparent group-hover:bg-red-950/10 transition-colors" />
    </div>

    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-red-500/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    
    <div className="relative z-10 space-y-4">
       <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-black transition-all">
             <step.icon className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.3em] group-hover:text-red-500/40 transition-colors">STEP_{step.num}</span>
       </div>
       
       <div>
          <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tighter mb-2 group-hover:text-red-500 transition-colors">{step.title}</h3>
          <p className="text-[11px] font-medium text-white/40 leading-relaxed max-w-[200px] group-hover:text-white/60 transition-colors">{step.desc}</p>
       </div>
    </div>
  </motion.div>
);

const ProcessModal = ({ step, onClose }: { step: any, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/40 backdrop-blur-xl"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="max-w-2xl w-full bg-white/[0.01] border border-white/10 rounded-[3rem] p-12 relative overflow-hidden backdrop-blur-2xl shadow-2xl"
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
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">{step.detail.title}</h2>
             </div>
          </div>

          <p className="text-xl text-white/60 font-medium leading-relaxed">{step.detail.content}</p>

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

export default function OnboardingConsole() {
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
      .catch(() => setStatsLoaded(true));
  }, []);

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
    <div className="landing-container umbra-red-aesthetic">
        {/* Technical Background System */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="absolute inset-0 bg-[#020202]" />
           <div className="technical-grid" />
           <div className="scanline" />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(10,0,0,0.6)_100%)]" />
           
           <div className="absolute top-0 left-[-10%] w-[70%] h-[1000px] bg-red-600/[0.05] rounded-full blur-[180px] animate-pulse" />
           <div className="absolute top-[1500px] right-[-10%] w-[60%] h-[1200px] bg-red-900/[0.04] rounded-full blur-[150px] animate-pulse delay-300" />
           <div className="absolute bottom-0 left-[20%] w-[80%] h-[800px] bg-red-600/[0.04] rounded-full blur-[180px] animate-pulse delay-200" />
        </div>

        <div className="grain-overlay opacity-[0.03]" />
      
      {/* Navbar */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-[#030711] font-black text-lg">U</div>
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

      {/* Main Console Content */}
      <main className="relative z-10 pt-20 pb-32">
        <section className="px-8 lg:px-12 mb-20">
          {/* Background Decorative Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <motion.div 
               animate={{ x: [0, -1920] }} 
               transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
               className="flex gap-8 pt-44 opacity-10"
             >
                {[...CREATORS, ...CREATORS].map((creator, i) => (
                  <div key={i} className="flex-none w-[280px] h-[380px] rounded-[2rem] overflow-hidden relative">
                     <img src={creator.img} className="w-full h-full object-cover grayscale" alt="" />
                  </div>
                ))}
             </motion.div>
          </div>

          <div className="max-w-7xl mx-auto relative z-30">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 border-b border-white/5 pb-12">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                     <ShieldCheck className="h-4 w-4 text-red-500" />
                     <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">System_Status: Operational</span>
                  </div>
                  <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">
                     {t.onboarding.title_1} <span className="text-red-500">{t.onboarding.title_2}</span>
                  </h1>
                  <p className="text-lg text-white/30 font-medium max-w-2xl leading-relaxed">{t.onboarding.desc}</p>
               </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {processSteps.map((step: any) => (
                 <ProcessBox key={step.id} step={step} onClick={() => setSelectedStep(step)} />
               ))}
               
               {/* NEON CTA BOX */}
               <div 
                 className="p-8 rounded-[2.5rem] bg-red-600 flex flex-col justify-between group cursor-pointer hover:bg-red-500 transition-all duration-500 min-h-[250px] shadow-[0_0_50px_rgba(220,38,38,0.2)]"
                 onClick={handleEnterApp}
               >
                  <div className="flex justify-between items-start">
                     <div className="text-[10px] font-mono font-black text-black/60 uppercase tracking-[0.3em]">{t.onboarding.cta_box_label}</div>
                     <Rocket className="h-6 w-6 text-black/60" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-black leading-tight">{t.onboarding.cta_box_title}</h3>
                  <button onClick={handleEnterApp} className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 group-hover:scale-105 transition-all">
                     {t.onboarding.cta_box_btn} <ArrowRight className="h-5 w-5" />
                  </button>
               </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="px-8 lg:px-12" ref={statsRef}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* STAT 1: Views */}
              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl group-hover:bg-red-600/10 transition-all" />
                <Eye className="w-8 h-8 text-red-500 mb-6" />
                <div className="text-6xl font-black text-white tracking-tighter leading-none mb-4">
                  {statsInView && statsLoaded
                    ? <AnimatedCounter target={stats.views} suffix={stats.views >= 1000000 ? 'M' : stats.views >= 1000 ? 'K' : ''} divisor={stats.views >= 1000000 ? 1000000 : stats.views >= 1000 ? 1000 : 1} prefix="+" />
                    : <span className="text-white/10">—</span>}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Total_Views_Generated</div>
              </div>

              {/* STAT 2: Campaigns */}
              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl group-hover:bg-red-600/10 transition-all" />
                <BarChart className="w-8 h-8 text-red-500 mb-6" />
                <div className="text-6xl font-black text-white tracking-tighter leading-none mb-4">
                  {statsInView && statsLoaded
                    ? <AnimatedCounter target={stats.campaigns} prefix="+" />
                    : <span className="text-white/10">—</span>}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Active_Campaigns</div>
              </div>

              {/* STAT 3: Creators */}
              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl group-hover:bg-red-600/10 transition-all" />
                <Users className="w-8 h-8 text-red-500 mb-6" />
                <div className="text-6xl font-black text-white tracking-tighter leading-none mb-4">
                  {statsInView && statsLoaded
                    ? <AnimatedCounter target={stats.creators} prefix="+" />
                    : <span className="text-white/10">—</span>}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Verified_Creators</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
         {selectedStep && (
           <ProcessModal step={selectedStep} onClose={() => setSelectedStep(null)} />
         )}
      </AnimatePresence>

      <footer className="py-20 px-8 border-t border-white/5 bg-transparent relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
           <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-[#030711] font-black">U</div>
              <span>Umbra Command Console v3.0</span>
           </div>
           <span>{t.footer.rights}</span>
        </div>
      </footer>
    </div>
  );
}
