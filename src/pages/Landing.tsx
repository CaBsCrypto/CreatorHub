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
  TrendingUp, Activity, Eye, Users, CheckCircle2,
  ChevronDown, Hexagon, Layers, X, Network,
  PieChart, Sparkles, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import translations from './translations';
import './Landing.css';

const FOUNDERS = [
  { name: 'Eminatrix', role: 'Creative Director', img: '/assets/eminatr1x.webp' },
  { name: 'Cabs', role: 'Strategic Director', img: '/assets/cabs.webp' },
  { name: 'Lady Mufa', role: 'Operations Director', img: '/assets/ladymufa.webp' },
];

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

const DetailModal = ({ item, onClose }: { item: any, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[150] flex items-center justify-center px-6 bg-black/80 backdrop-blur-xl"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="max-w-3xl w-full bg-[#050505] border border-white/10 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
       <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/[0.05] blur-[100px]" />
       
       <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
          <X className="h-6 w-6" />
       </button>

       <div className="space-y-10 relative z-10">
          <div className="flex items-center gap-6">
             <div className="w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center text-[#030711]">
                <item.icon className="h-10 w-10" />
             </div>
             <div>
                <span className="text-xs font-black text-red-500 uppercase tracking-[0.5em]">Strategic Node</span>
                <h2 className="text-5xl font-black uppercase tracking-tighter text-white">{item.detail.title}</h2>
             </div>
          </div>

          <p className="text-xl text-white/60 font-medium leading-relaxed max-w-2xl">{item.detail.content}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {item.detail.items.map((listItem: string, i: number) => (
               <div key={i} className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-red-500/20 transition-all">
                  <CheckCircle2 className="h-5 w-5 text-red-600" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/80 group-hover:text-red-500 transition-colors">{listItem}</span>
               </div>
             ))}
          </div>

          <button onClick={onClose} className="w-full py-5 bg-red-700 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-[0_0_40px_rgba(220,38,38,0.2)]">
             Confirm_Protocol
          </button>
       </div>
    </motion.div>
  </motion.div>
);

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lang, setLang] = useState<'en' | 'es'>('es');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const t = translations[lang];

  const handleEnterApp = () => {
    if (user) { navigate('/dashboard'); } else { navigate('/login'); }
  };

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
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
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

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="pt-40 pb-20 px-8 lg:px-12 min-h-screen flex flex-col justify-center">
           <div className="max-w-7xl mx-auto w-full">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-12"
              >
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-[1px] w-20 bg-red-600" />
                      <span className="text-[10px] font-black uppercase tracking-[1em] text-red-500">The_Shadow_Standard</span>
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none text-white">
                       Beyond <br/>
                       <span className="text-red-500 italic">Influence.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white/40 font-medium max-w-2xl leading-relaxed">
                       Umbra es la infraestructura técnica detrás de los creadores más grandes. No somos solo una agencia, somos el sistema operativo de tu crecimiento.
                    </p>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                      onClick={() => navigate('/onboarding')}
                      className="group px-12 py-6 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-red-500 transition-all shadow-[0_0_50px_rgba(220,38,38,0.3)] flex items-center justify-center gap-4"
                    >
                       Ver Consola de Comando <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                    <button 
                      onClick={handleEnterApp}
                      className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-4"
                    >
                       Acceso Cliente <LogIn className="h-5 w-5" />
                    </button>
                 </div>

                 {/* Decorative Branding Line */}
                 <div className="pt-20 opacity-20">
                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[1em] text-white/40 whitespace-nowrap overflow-hidden">
                       <span>Transparency</span>
                       <div className="h-1 w-1 bg-red-500 rounded-full" />
                       <span>Performance</span>
                       <div className="h-1 w-1 bg-red-500 rounded-full" />
                       <span>Authority</span>
                       <div className="h-1 w-1 bg-red-500 rounded-full" />
                       <span>Innovation</span>
                       <div className="h-1 w-1 bg-red-500 rounded-full" />
                       <span>Transparency</span>
                    </div>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* CREATOR CAROUSEL SECTION */}
        <section className="py-24 border-t border-b border-white/5 overflow-hidden">
           <div className="max-w-7xl mx-auto px-8 lg:px-12 mb-12 flex justify-between items-end">
              <div className="space-y-4">
                 <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.8em]">{t.showcase.label}</span>
                 <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white">{t.showcase.title}</h2>
              </div>
           </div>

           <div className="relative">
              <motion.div 
                animate={{ x: [0, -1920] }} 
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="flex gap-8"
              >
                 {[...CREATORS, ...CREATORS].map((creator, i) => (
                   <div key={i} className="flex-none w-[320px] h-[450px] rounded-[3rem] overflow-hidden relative group border border-white/10 grayscale hover:grayscale-0 transition-all duration-700">
                      <img src={creator.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={creator.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030711] via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                      <div className="absolute bottom-10 left-10 space-y-2">
                         <div className="text-xs font-black text-red-500 uppercase tracking-[0.4em]">Elite_Talent</div>
                         <div className="text-3xl font-black text-white uppercase tracking-tighter">{creator.name}</div>
                         <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">{creator.handle}</div>
                      </div>
                   </div>
                 ))}
              </motion.div>
           </div>
        </section>

        {/* STRATEGY BENTO GRID (The Method) */}
        <section className="py-32 px-8 lg:px-12 border-b border-white/5 bg-transparent">
          <div className="max-w-7xl mx-auto">
             <div className="mb-20 space-y-6">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.8em]">Operational_Strategy</span>
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white">The Umbra <span className="text-red-500 italic">Method.</span></h2>
             </div>

             <div className="grid grid-cols-12 gap-8">
                {STRATEGY_NODES.map((node) => (
                   <StrategyNode 
                    key={node.id} 
                    node={node} 
                    onClick={() => setSelectedNode(node)} 
                   />
                ))}
             </div>
          </div>
        </section>

        {/* FOUNDERS SECTION: THE MINDS */}
        <section className="py-32 px-8 lg:px-12 bg-transparent relative">
          <div className="max-w-7xl mx-auto">
             <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-32">
                <div className="space-y-6">
                   <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.8em]">{t.leadership.label}</span>
                   <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white">
                      {t.leadership.title_1} <br/>
                      <span className="text-red-500">{t.leadership.title_2}</span>
                   </h2>
                </div>
                <p className="text-white/30 text-lg max-w-sm font-medium leading-relaxed mb-4">
                   Un equipo de fundadores dedicados a redefinir el estándar de autoridad en la industria de creadores.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {FOUNDERS.map((founder, i) => (
                  <div key={i} className="space-y-8 group">
                     <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/5 relative bg-zinc-900">
                        <img src={founder.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt={founder.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
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
      </main>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
         {selectedNode && (
           <DetailModal item={selectedNode} onClose={() => setSelectedNode(null)} />
         )}
      </AnimatePresence>

      <footer className="py-20 px-8 border-t border-white/5 bg-transparent relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
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
