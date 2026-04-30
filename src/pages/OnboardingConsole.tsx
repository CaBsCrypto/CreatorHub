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

// --- STRATEGY DATA ---
const STRATEGY_NODES = [
  {
    id: 'branding',
    title: 'Identity Node',
    label: 'Branding Lab',
    desc: 'Engineering high-authority identities through cinematic design and luxury aesthetics.',
    icon: Layers,
    size: 'node-large',
    detail: {
      title: 'Phase Alpha: Branding Lab',
      content: 'We engineer bespoke brand artifacts that command respect. Our process moves beyond generic design toward high-fidelity visual ecosystems.',
      items: ['Custom UI/UX Engineering', 'Cinematic Brand Motion', 'Authority Alignment', 'Luxury Token Design']
    }
  },
  {
    id: 'performance',
    title: 'Growth Engine',
    label: 'Performance Audit',
    desc: 'Optimizing conversion nodes through real-time data and ROI synchronization.',
    icon: BarChart3,
    size: 'node-small',
    detail: {
      title: 'Phase Beta: Growth System',
      content: 'Every campaign is an experiment in precision. We monitor every click and view to ensure maximum return on investment through technical analysis.',
      items: ['Live KPI Monitoring', 'Predictive Analysis', 'ROI Optimization', 'Data Synchronization']
    }
  },
  {
    id: 'guild',
    title: 'Talent Node',
    label: 'Elite Guild',
    desc: 'Access to the most influential nodes in the digital creator ecosystem.',
    icon: Users,
    size: 'node-small',
    detail: {
      title: 'Phase Gamma: The Guild',
      content: 'Our guild is a synchronized network of elite talent. We select nodes that represent the absolute standard of engagement and influence.',
      items: ['Selective Profiling', 'Exclusive Talent Network', 'Influence Mapping', 'Engagement Guarantee']
    }
  },
  {
    id: 'distribution',
    title: 'Global Sync',
    label: 'Node Distribution',
    desc: 'Massive impact through a synchronized network of global publication nodes.',
    icon: Network,
    size: 'node-large',
    detail: {
      title: 'Phase Delta: Global Sync',
      content: 'We deploy content across a global architecture, ensuring a synchronized impact that saturates your target market with precision timing.',
      items: ['Global Network Sync', 'Multi-channel Deployment', 'Node Saturation', 'Impact Monitoring']
    }
  }
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

const StrategyNode = ({ node, onClick }: { node: any, onClick: () => void }) => (
  <motion.div
    whileHover={{ y: -5 }}
    onClick={onClick}
    className={`${node.size} artifact-card group cursor-pointer relative min-h-[340px] flex flex-col justify-between`}
  >
    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/[0.03] blur-[80px] group-hover:bg-red-600/[0.07] transition-all duration-700" />
    
    <div className="relative z-10 space-y-6">
      <div className="flex justify-between items-start">
        <div className="node-icon-wrapper">
          <node.icon className="h-6 w-6 text-red-500" />
        </div>
        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100 transition-opacity">NODE_TYPE: {node.id}</span>
      </div>

      <div>
        <div className="text-xs font-black text-red-500 uppercase tracking-[0.3em] mb-2">{node.label}</div>
        <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-red-500 transition-colors">{node.title}</h3>
      </div>
      
      <p className="text-base text-white/40 font-medium leading-relaxed max-w-sm group-hover:text-white/60 transition-colors">{node.desc}</p>
    </div>

    <div className="data-node-viz mt-10 relative">
       <div className="pulse-line" />
       <div className="pulse-line delay-700" style={{ top: '30%' }} />
       <div className="pulse-line delay-1000" style={{ top: '60%' }} />
       <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  </motion.div>
);

const ProcessBox = ({ step, onClick }: { step: any, onClick: () => void }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="relative p-7 rounded-[1.5rem] bg-white/[0.02] cursor-pointer group transition-all duration-500 overflow-hidden min-h-[220px] flex flex-col justify-between border border-white/10 hover:border-red-500/40"
  >
    <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_100%)]" />
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
          <p className="text-[11px] font-medium text-white/40 leading-relaxed max-w-[200px] group-hover:text-white/60 transition-colors">{step.short}</p>
       </div>
    </div>
  </motion.div>
);

const DetailModal = ({ item, onClose, type = 'protocol' }: { item: any, onClose: () => void, type?: 'protocol' | 'strategy' }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[150] flex items-center justify-center px-6 bg-black/90 backdrop-blur-xl"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="max-w-3xl w-full bg-[#050505] border border-red-500/20 rounded-[3rem] p-10 md:p-12 relative overflow-hidden shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
       <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/[0.08] blur-[120px] -z-10" />
       
       <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors bg-white/5 p-2 rounded-full z-20">
          <X className="h-6 w-6" />
       </button>

       <div className="space-y-10 relative z-10">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-red-600 flex items-center justify-center text-[#030711] shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                <item.icon className="h-8 w-8 md:h-10 md:h-10" />
             </div>
             <div>
                <span className="text-[10px] md:text-xs font-black text-red-500 uppercase tracking-[0.5em]">{type === 'protocol' ? 'Phase_Protocol' : 'Strategic_Node'}</span>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
                   {type === 'protocol' ? item.detail_title : item.detail.title}
                </h2>
             </div>
          </div>

          <p className="text-lg md:text-xl text-white/60 font-medium leading-relaxed max-w-2xl">
             {type === 'protocol' ? item.detail_content : item.detail.content}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {(type === 'protocol' ? item.detail_items : item.detail.items).map((listItem: string, i: number) => (
               <div key={i} className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-all">
                  <CheckCircle2 className="h-5 w-5 text-red-600" />
                  <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/80 group-hover:text-red-500 transition-colors">{listItem}</span>
               </div>
             ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-5 bg-red-700 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-[0_0_40px_rgba(220,38,38,0.2)]">
               Initialize_Node_Sync
            </button>
            <button onClick={onClose} className="px-10 py-5 bg-white/5 text-white/40 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:text-white hover:bg-white/10 transition-all">
               Abort_Protocol
            </button>
          </div>
       </div>
    </motion.div>
  </motion.div>
);

export default function OnboardingConsole() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<{item: any, type: 'protocol' | 'strategy'} | null>(null);
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
    icon: STEP_ICONS[index],
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
        </div>

        <div className="grain-overlay opacity-[0.02]" />
      
      {/* Navbar */}
      <nav className="glass-nav border-white/5">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
             <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-[#030711] font-black text-lg group-hover:scale-110 transition-transform">U</div>
             <span className="text-xl font-black uppercase tracking-[0.4em] text-white">Umbra</span>
          </div>
          
          <div className="flex items-center gap-6">
             <button onClick={() => setLang(lang === 'en' ? 'es' : 'en')} className="px-4 py-2 border border-white/10 rounded-xl text-[10px] font-black text-white/40 hover:text-white hover:border-white/20 transition-all uppercase tracking-widest">
                {lang === 'en' ? 'ES' : 'EN'}
             </button>
             <button onClick={handleEnterApp} className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
               {t.nav.access}
             </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-20">
        
        {/* HERO SECTION */}
        <section className="px-8 lg:px-12 pt-8 pb-16 border-b border-white/5">
          <div className="max-w-7xl mx-auto relative">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                  <ShieldCheck className="h-4 w-4 text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">Command_Console_Active</span>
               </div>
               <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                  Technical <br/>
                  <span className="text-red-500 italic">Onboarding.</span>
               </h1>
               <p className="text-xl text-white/30 font-medium max-w-2xl leading-relaxed">
                  Initializing project audit and synchronization. Execute the strategy nodes and protocol phases below to confirm your entry into the Umbra network.
               </p>
            </motion.div>
          </div>
        </section>

        {/* CREATOR CAROUSEL SECTION */}
        <section className="py-16 border-b border-white/5 overflow-hidden relative">
           <div className="absolute inset-0 bg-red-600/[0.01] pointer-events-none" />
           <div className="max-w-7xl mx-auto px-8 lg:px-12 mb-8 flex justify-between items-end">
              <div className="space-y-2">
                 <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.8em]">{t.showcase.label}</span>
                 <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-white">{t.showcase.title}</h2>
              </div>
           </div>

           <div className="relative">
              <motion.div 
                animate={{ x: [0, -3520] }} 
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="flex gap-6 px-4"
              >
                 {[...CREATORS, ...CREATORS, ...CREATORS].map((creator, i) => (
                   <motion.div 
                     key={i} 
                     whileHover={{ scale: 1.02 }}
                     className="flex-none w-[300px] h-[420px] rounded-[3rem] overflow-hidden relative group border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer bg-zinc-900"
                   >
                      <img src={creator.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={creator.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030711] via-transparent to-transparent opacity-60 group-hover:opacity-95 transition-opacity" />
                      <div className="absolute bottom-10 left-10 space-y-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                         <div className="text-[9px] font-black text-red-500 uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-opacity">Elite_Talent</div>
                         <div className="text-3xl font-black text-white uppercase tracking-tighter">{creator.name}</div>
                         <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{creator.handle}</div>
                      </div>
                   </motion.div>
                 ))}
              </motion.div>
              <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-[#020202] to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-[#020202] to-transparent z-10 pointer-events-none" />
           </div>
        </section>

        {/* STRATEGY BENTO GRID (The Method) */}
        <section className="py-20 px-8 lg:px-12 border-b border-white/5 bg-transparent relative">
          <div className="absolute top-0 left-1/4 w-1/2 h-full bg-red-600/[0.02] blur-[120px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
             <div className="mb-12 space-y-4">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.8em]">Operational_Strategy</span>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">The Umbra <span className="text-red-500 italic">Method.</span></h2>
             </div>

             <div className="grid grid-cols-12 gap-6 lg:gap-8">
                {STRATEGY_NODES.map((node) => (
                   <StrategyNode 
                    key={node.id} 
                    node={node} 
                    onClick={() => setSelectedItem({item: node, type: 'strategy'})} 
                   />
                ))}
             </div>
          </div>
        </section>

        {/* ONBOARDING PROTOCOL SECTION */}
        <section className="py-20 px-8 lg:px-12 border-b border-white/5">
          <div className="max-w-7xl mx-auto">
             <div className="mb-12 space-y-4">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.8em]">System_Immersion</span>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">Onboarding <span className="text-red-500 italic">Protocol.</span></h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processSteps.map((step: any) => (
                  <ProcessBox key={step.id} step={step} onClick={() => setSelectedItem({item: step, type: 'protocol'})} />
                ))}
                
                {/* NEON CTA BOX */}
                <div 
                   className="p-8 rounded-[3rem] bg-red-600 flex flex-col justify-between group cursor-pointer hover:bg-red-500 transition-all duration-500 min-h-[300px] shadow-[0_0_60px_rgba(220,38,38,0.25)] border border-red-500 relative overflow-hidden"
                   onClick={handleEnterApp}
                >
                   <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative z-10 flex justify-between items-start">
                      <div className="text-[10px] font-mono font-black text-black/60 uppercase tracking-[0.3em]">{t.onboarding.cta_box_label}</div>
                      <Rocket className="h-8 w-8 text-black/60" />
                   </div>
                   <h3 className="relative z-10 text-4xl font-black uppercase tracking-tighter text-black leading-tight mb-8">{t.onboarding.cta_box_title}</h3>
                   <button onClick={handleEnterApp} className="relative z-10 w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 group-hover:scale-[1.02] transition-all">
                      {t.onboarding.cta_box_btn} <ArrowRight className="h-5 w-5" />
                   </button>
                </div>
             </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-20 px-8 lg:px-12 bg-transparent" ref={statsRef}>
          <div className="max-w-7xl mx-auto">
             <div className="mb-12 space-y-4 text-center">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.8em]">Network_Performance</span>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">Live <span className="text-red-500 italic">Metrics.</span></h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[4rem] relative overflow-hidden group hover:border-red-500/30 transition-all shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/[0.03] blur-3xl group-hover:bg-red-600/[0.07] transition-all" />
                <Eye className="w-10 h-10 text-red-500 mb-8" />
                <div className="text-6xl font-black text-white tracking-tighter leading-none mb-4">
                  {statsInView && statsLoaded
                    ? <AnimatedCounter target={stats.views} suffix={stats.views >= 1000000 ? 'M' : stats.views >= 1000 ? 'K' : ''} divisor={stats.views >= 1000000 ? 1000000 : stats.views >= 1000 ? 1000 : 1} prefix="+" />
                    : <span className="text-white/10">SYNCING...</span>}
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20 group-hover:text-red-500 transition-colors">Total_Network_Views</div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[4rem] relative overflow-hidden group hover:border-red-500/30 transition-all shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/[0.03] blur-3xl group-hover:bg-red-600/[0.07] transition-all" />
                <BarChart className="w-10 h-10 text-red-500 mb-8" />
                <div className="text-6xl font-black text-white tracking-tighter leading-none mb-4">
                  {statsInView && statsLoaded
                    ? <AnimatedCounter target={stats.campaigns} prefix="+" />
                    : <span className="text-white/10">SYNCING...</span>}
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20 group-hover:text-red-500 transition-colors">Active_Campaign_Nodes</div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[4rem] relative overflow-hidden group hover:border-red-500/30 transition-all shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/[0.03] blur-3xl group-hover:bg-red-600/[0.07] transition-all" />
                <Users className="w-10 h-10 text-red-500 mb-8" />
                <div className="text-6xl font-black text-white tracking-tighter leading-none mb-4">
                  {statsInView && statsLoaded
                    ? <AnimatedCounter target={stats.creators} prefix="+" />
                    : <span className="text-white/10">SYNCING...</span>}
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.6em] text-white/20 group-hover:text-red-500 transition-colors">Elite_Creator_Nodes</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
         {selectedItem && (
           <DetailModal 
            item={selectedItem.item} 
            type={selectedItem.type} 
            onClose={() => setSelectedItem(null)} 
           />
         )}
      </AnimatePresence>

      <footer className="py-12 px-8 border-t border-white/5 bg-transparent relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
           <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-[#030711] font-black">U</div>
              <span>Umbra Command Console v3.0</span>
           </div>
           <div className="flex gap-8">
              <span className="hover:text-white cursor-pointer transition-colors">Access_Terms</span>
              <span className="hover:text-white cursor-pointer transition-colors">Support_Sync</span>
           </div>
           <span>{t.footer.rights}</span>
        </div>
      </footer>
    </div>
  );
}
