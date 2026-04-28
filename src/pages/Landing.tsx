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
  PieChart, LineChart, Database, Cpu, Globe, Lock
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import translations from './translations';
import './Landing.css';

// --- SUB-COMPONENTS: BENTO NODES ---

const NodeHeader = ({ num, title, icon: Icon }: { num: string, title: string, icon: any }) => (
  <div className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-4">
      <div className="node-icon-wrapper">
        <Icon className="h-6 w-6 text-emerald-400" />
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Node_{num}</h4>
        <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
      </div>
    </div>
    <div className="hidden md:block text-right">
      <div className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest">Active_Status</div>
      <div className="flex gap-1 mt-1">
        {[1,2,3].map(i => <div key={i} className="w-3 h-1 bg-emerald-500/20 rounded-full" />)}
      </div>
    </div>
  </div>
);

const Node01_Diagnostic = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bento-node node-large group"
  >
    <NodeHeader num="01" title="Strategic Decoder" icon={Database} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
      <div className="space-y-6">
        <p className="text-sm text-white/40 font-medium leading-relaxed">
          We replace generic meetings with a precision diagnostic. Our engine decodes your project DNA to map cultural footprints.
        </p>
        <div className="space-y-3">
          {['Target_Audience_Node', 'Market_Sentiment_Sync', 'ROI_Projection_V3'].map((item, i) => (
            <div key={i} className="h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center px-4 gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative bg-slate-950/50 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden">
         <Hexagon className="h-32 w-32 text-emerald-500/10 animate-pulse" />
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-px h-full bg-emerald-500/5 absolute left-1/2" />
            <div className="h-px w-full bg-emerald-500/5 absolute top-1/2" />
         </div>
      </div>
    </div>
  </motion.div>
);

const Node02_Network = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.1 }}
    className="bento-node node-small group"
  >
    <NodeHeader num="02" title="Talent Synapse" icon={Globe} />
    <div className="flex-1 flex flex-col">
       <p className="text-sm text-white/40 font-medium mb-8">
         Connecting your project to our elite verified creator network.
       </p>
       <div className="data-node-viz">
          <div className="pulse-line top-1/4" />
          <div className="pulse-line top-1/2" />
          <div className="pulse-line top-3/4" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="grid grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40" 
                  />
                ))}
             </div>
          </div>
       </div>
    </div>
  </motion.div>
);

const Node03_Scrape = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.2 }}
    className="bento-node node-small group"
  >
    <NodeHeader num="03" title="Live Scrape" icon={Cpu} />
    <div className="flex-1 flex flex-col">
       <div className="space-y-4 mb-8">
          {[
            { label: "TikTok_API", val: "84%" },
            { label: "Twitch_Live", val: "92%" },
            { label: "X_Impressions", val: "65%" }
          ].map((m, i) => (
            <div key={i} className="space-y-1">
               <div className="flex justify-between text-[8px] font-black uppercase text-white/40">
                  <span>{m.label}</span>
                  <span>{m.val}</span>
               </div>
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/40" style={{ width: m.val }} />
               </div>
            </div>
          ))}
       </div>
       <div className="mt-auto p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Extracting_Live_Nodes...</span>
       </div>
    </div>
  </motion.div>
);

const Node04_Yield = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.3 }}
    className="bento-node node-large group"
  >
    <NodeHeader num="04" title="ROI Yield" icon={TrendingUp} />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center flex-1">
       <div className="md:col-span-2">
          <h4 className="text-4xl font-black uppercase tracking-tighter mb-4 text-emerald-500">Consolidated Growth.</h4>
          <p className="text-sm text-white/40 font-medium leading-relaxed">
            Data transparency is our core. We deliver undisputed results through unified portals, providing a crystal-clear summary of your campaign's performance.
          </p>
       </div>
       <div className="glass-panel text-center group-hover:glow-emerald transition-all">
          <div className="text-4xl font-black text-white tracking-tighter">x3.2</div>
          <div className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mt-2">Avg_Performance_Yield</div>
       </div>
    </div>
  </motion.div>
);

// --- MAIN PAGE ---

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const t: any = (translations as any)[language] || (translations as any)['en'];

  const handleEnterApp = () => {
    if (user) { navigate('/dashboard'); } else { navigate('/login'); }
  };

  return (
    <div className="landing-container selection:bg-emerald-500/30">
      <div className="grain-overlay" />
      
      {/* Navbar Minimalista de Élite */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-[#030711] font-black text-xl">U</div>
             <span className="text-xl font-black uppercase tracking-[0.4em]">Umbra</span>
          </div>
          
          <div className="hidden md:flex items-center gap-12 text-[10px] font-black uppercase tracking-widest text-white/40">
             <button onClick={() => document.getElementById('system')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">The_System</button>
             <button onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">The_Protocol</button>
             <button onClick={() => document.getElementById('network')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">Elite_Network</button>
          </div>

          <div className="flex items-center gap-6">
             <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">{language}</button>
             <button onClick={handleEnterApp} className="px-8 py-3 bg-white text-[#030711] rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Command_Center</button>
          </div>
        </div>
      </nav>

      {/* HERO: EL CENTRO DE MANDO (ESTILO CINEMÁTICO INMERSIVO) */}
      <section className="min-h-screen relative flex flex-col items-center justify-center px-8 overflow-hidden">
         {/* Background Visual */}
         <div className="hero-bg-visual">
            <img src="/assets/hero-bg.png" className="w-full h-full object-cover" alt="System Background" />
         </div>
         <div className="absolute inset-0 bg-gradient-to-b from-[#030711]/40 via-[#030711]/80 to-[#030711]" />

         <div className="max-w-6xl mx-auto text-center space-y-12 relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
            >
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">System_Status: Operational_V3.0</span>
            </motion.div>
            
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="space-y-4"
            >
               <h1 className="hero-title">
                  The <span className="text-emerald-500">Unmistakable</span> <br/>
                  Standard.
               </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto font-medium leading-relaxed"
            >
              We replace marketing noise with <span className="text-white">technical certainty</span>. Our infrastructure hooks directly into platform metrics to deliver undisputed ROI.
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6 }}
               className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
            >
               <button onClick={() => document.getElementById('system')?.scrollIntoView({ behavior: 'smooth' })} className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  Initialize Audit <ChevronDown className="h-4 w-4" />
               </button>
               <button onClick={handleEnterApp} className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-xl">
                  Access Portal
               </button>
            </motion.div>
         </div>

         {/* Bottom Scroll Indicator */}
         <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-12 flex flex-col items-center gap-2"
         >
            <div className="w-px h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">Scroll_To_Decode</span>
         </motion.div>
      </section>

      {/* EL SISTEMA: BENTO PROTOCOL GRID */}
      <section id="system" className="py-48 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
             <div className="space-y-4">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">System_Infrastructure</span>
                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">The <br/> Protocol.</h2>
             </div>
             <p className="text-lg text-white/40 font-medium leading-relaxed max-w-sm mb-4">
                Our process isn't a secret. It's an engineering flow designed to <span className="text-white">minimize risk</span> and maximize resonance.
             </p>
          </div>

          <div className="bento-protocol-grid">
             <Node01_Diagnostic />
             <Node02_Network />
             <Node03_Scrape />
             <Node04_Yield />
          </div>
        </div>
      </section>

      {/* EXPLICA EL SISTEMA: NARRATIVA VISUAL */}
      <section id="protocol" className="py-48 px-8 bg-[#030711] border-t border-white/5 overflow-hidden">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
               <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight">Engineering <br/> Cultural <br/> Impact.</h2>
               <div className="space-y-8">
                  {[
                    { title: "Platform Integration", desc: "Our system hooks directly into platform APIs for absolute data accuracy." },
                    { title: "Sentiment Calibration", desc: "We align content nodes with real-time cultural sentiment spikes." },
                    { title: "Audited ROI", desc: "Every view is verified and consolidated into live client portals." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                       <div className="w-1.5 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                       <div>
                          <h4 className="text-xl font-black uppercase mb-2">{item.title}</h4>
                          <p className="text-sm text-white/40 leading-relaxed font-medium">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="relative animate-float">
               <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />
               <img src="/assets/system-nodes.png" className="w-full relative z-10 drop-shadow-2xl rounded-[4rem] border border-white/10" alt="System Visualization" />
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 px-8 border-t border-white/5 bg-[#030711]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-[#030711] font-black">U</div>
                 <span className="text-lg font-black uppercase tracking-widest">Umbra Hub</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed font-medium">The unmistakable standard for auditable Web3 performance. Built for high-impact brand/creator synergy.</p>
           </div>
           <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-8">Navigation</h5>
              <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-white/40">
                 <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Manifesto</button></li>
                 <li><button onClick={() => document.getElementById('system')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">The Protocol</button></li>
                 <li><button onClick={handleEnterApp} className="hover:text-white transition-colors">Command Center</button></li>
              </ul>
           </div>
           <div className="text-right flex flex-col justify-end">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">System_Stable: Selective Deployment</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">© 2026 UMBRA AGENCY. ALL RIGHTS RESERVED.</p>
           </div>
        </div>
      </footer>
    </div>
  );
}
