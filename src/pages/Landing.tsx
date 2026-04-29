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
  PieChart, LineChart, Database, Cpu, Globe, Lock, Sparkles
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import translations from './translations';
import './Landing.css';

// --- SUB-COMPONENTS: BENTO NODES ---

const NodeHeader = ({ num, title, icon: Icon }: { num: string, title: string, icon: any }) => (
  <div className="flex items-center justify-between mb-8 relative z-10">
    <div className="flex items-center gap-4">
      <div className="node-icon-wrapper">
        <Icon className="h-6 w-6 text-emerald-400" />
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Node_{num}</h4>
        <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
      </div>
    </div>
    <div className="hidden md:block">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
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
    <div className="node-artifact-glow" />
    <NodeHeader num="01" title="Strategic Decoder" icon={Database} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1 relative z-10">
      <div className="space-y-6">
        <p className="text-sm text-white/40 font-medium leading-relaxed">
          The precision diagnostic module. We analyze your project's cultural footprints to align content strategies with ROI goals.
        </p>
        <div className="space-y-2">
           {['Audience_Mapping', 'Sentiment_Analysis'].map((tag, i) => (
             <div key={i} className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/40 mr-2">
               {tag}
             </div>
           ))}
        </div>
      </div>
      <div className="bg-slate-950/40 rounded-3xl border border-white/5 flex items-center justify-center p-8">
         <div className="grid grid-cols-4 gap-2 w-full">
            {[...Array(12)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                className="h-1 bg-emerald-500/20 rounded-full" 
              />
            ))}
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
    <div className="node-artifact-glow" />
    <NodeHeader num="02" title="Talent Node" icon={Users} />
    <div className="flex-1 flex flex-col justify-end relative z-10">
       <div className="flex items-center gap-4 mb-6">
          <div className="flex -space-x-3">
             {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border border-white/10" />)}
          </div>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Verified_Elite</span>
       </div>
       <p className="text-[11px] text-white/30 font-medium leading-relaxed uppercase tracking-wide">
          Direct access to the 1% of creators who actually move the needle.
       </p>
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
    <div className="node-artifact-glow" />
    <NodeHeader num="03" title="Live Extraction" icon={Activity} />
    <div className="mt-auto relative z-10">
       <div className="h-24 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-end p-4 gap-1">
          {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
            <motion.div 
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              className="flex-1 bg-emerald-500/20 rounded-t-sm" 
            />
          ))}
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
    <div className="node-artifact-glow" />
    <NodeHeader num="04" title="ROI Consolidation" icon={Target} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center flex-1 relative z-10">
       <p className="text-sm text-white/40 font-medium leading-relaxed">
          No black boxes. Raw performance data served through unified portals, providing undisputed clarity on every dollar deployed.
       </p>
       <div className="flex justify-end gap-8">
          <div className="text-right">
             <div className="text-3xl font-black text-white tracking-tighter">100%</div>
             <div className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Audit_Accuracy</div>
          </div>
          <div className="text-right">
             <div className="text-3xl font-black text-white tracking-tighter">x3.2</div>
             <div className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Avg_Performance</div>
          </div>
       </div>
    </div>
  </motion.div>
);

// --- MAIN PAGE ---

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  
  const handleEnterApp = () => {
    if (user) { navigate('/dashboard'); } else { navigate('/login'); }
  };

  return (
    <div className="landing-container selection:bg-emerald-500/30">
      <div className="grain-overlay" />
      
      {/* Navbar: High-End Minimalist */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-emerald-500 font-black text-lg">U</div>
             <span className="text-lg font-black uppercase tracking-[0.5em] text-white">Umbra</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
             <button onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">The_Protocol</button>
             <button onClick={() => document.getElementById('system')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">The_System</button>
             <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} className="hover:text-white transition-colors">Language: {language}</button>
          </div>

          <button onClick={handleEnterApp} className="px-6 py-2.5 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all">
            Access_Console
          </button>
        </div>
      </nav>

      {/* HERO: THE OBSIDIAN CONSOLE (SPLIT LAYOUT) */}
      <section className="min-h-screen relative overflow-hidden flex items-center">
         {/* Background Grid */}
         <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.03),transparent_70%)]" />

         <div className="hero-split">
            <motion.div 
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="hero-content"
            >
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">Elite Marketing Protocol</span>
               </div>
               
               <h1 className="hero-title">
                  The <br/> 
                  <span className="text-emerald-500">Technical</span> <br/>
                  Standard.
               </h1>

               <p className="hero-subtitle">
                  We replace marketing noise with engineering precision. Our infrastructure hooks directly into platform metrics to deliver undisputed, auditable performance.
               </p>

               <div className="flex flex-col sm:flex-row gap-6 pt-6">
                  <button onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-3">
                     Initialize Protocol <ArrowRight className="h-3 w-3" />
                  </button>
                  <button onClick={handleEnterApp} className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-xl">
                     Request Audit
                  </button>
               </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.2, delay: 0.2 }}
               className="hero-visual"
            >
               <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
               <img src="/assets/obsidian-visual.png" className="w-full relative z-10 animate-float drop-shadow-[0_0_50px_rgba(16,185,129,0.1)]" alt="Obsidian Console" />
               
               {/* Floating Data Nodes */}
               <div className="absolute top-10 right-10 p-6 glass-panel border-white/5 scale-75 animate-bounce">
                  <Activity className="h-6 w-6 text-emerald-500" />
                  <div className="mt-2 text-[8px] font-black text-white/40 uppercase tracking-widest">Live_Feed_Sync</div>
               </div>
            </motion.div>
         </div>

         {/* Bottom Status Bar */}
         <div className="absolute bottom-0 w-full h-12 border-t border-white/5 bg-black/40 backdrop-blur-md flex items-center px-12 justify-between">
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">Security_Level: Elite</span>
               </div>
               <div className="hidden md:flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">System_Node: Umbra_01</span>
               </div>
            </div>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Verification_Hash: 0x82f...a6e</div>
         </div>
      </section>

      {/* THE PROTOCOL: BENTO ARTIFACTS */}
      <section id="protocol" className="py-48 px-8 lg:px-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 space-y-6">
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em]">Process_Architecture</span>
             <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">The <br/> System.</h2>
          </div>

          <div className="bento-protocol-grid">
             <Node01_Diagnostic />
             <Node02_Network />
             <Node03_Scrape />
             <Node04_Yield />
          </div>
        </div>
      </section>

      {/* FOOTER: REFINED */}
      <footer className="py-24 px-8 lg:px-24 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black font-black">U</div>
              <span className="text-lg font-black uppercase tracking-[0.4em]">Umbra Agency</span>
           </div>
           
           <div className="flex gap-12 text-[9px] font-black uppercase tracking-widest text-white/20">
              <button className="hover:text-white">Terms</button>
              <button className="hover:text-white">Privacy</button>
              <button className="hover:text-white">Audit_Request</button>
           </div>

           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">
              © 2026 UMBRA AGENCY. ALL RIGHTS RESERVED.
           </p>
        </div>
      </footer>
    </div>
  );
}
