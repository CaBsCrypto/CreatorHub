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
  Search, ShieldCheck, MousePointer2
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import translations from './translations';
import './Landing.css';

// --- SUB-COMPONENTS ---

const FlowStep = ({ num, title, desc, icon: Icon, detail, visual: Visual }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="flow-step">
      <div className={`space-y-8 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} transition-all duration-1000`}>
        <div className="flow-step-num">{num}</div>
        <div className="space-y-4">
           <h3 className="text-4xl font-black uppercase tracking-tighter text-white">{title}</h3>
           <p className="text-xl text-white/40 font-medium leading-relaxed max-w-md">{desc}</p>
        </div>
        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
           <div className="flex items-center gap-3 text-emerald-500">
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational_Node</span>
           </div>
           <p className="text-sm text-white/30 leading-relaxed italic">{detail}</p>
        </div>
      </div>
      <div className={`relative ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} transition-all duration-1000 delay-300`}>
         <div className="artifact-card min-h-[400px] flex items-center justify-center">
            {Visual ? <Visual /> : <div className="w-full h-full bg-slate-900/40 rounded-2xl animate-pulse" />}
            <div className="glow-point top-10 right-10" />
         </div>
      </div>
    </div>
  );
};

// --- VISUAL NODES ---

const DiagnosticVisual = () => (
  <div className="w-full space-y-6">
     <div className="flex justify-between items-center mb-8">
        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Analyzing_DNA...</div>
        <div className="text-emerald-500 text-xs font-black">84% Match</div>
     </div>
     {[1,2,3].map(i => (
       <div key={i} className="h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-6 gap-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               whileInView={{ width: `${30 + i * 20}%` }}
               className="h-full bg-emerald-500/40" 
             />
          </div>
       </div>
     ))}
  </div>
);

const NetworkVisual = () => (
  <div className="relative w-full aspect-video flex items-center justify-center">
     <Globe className="h-32 w-32 text-emerald-500/10 animate-pulse" />
     <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(8)].map((_, i) => (
          <motion.div 
            key={i}
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
            className="absolute w-2 h-2 bg-emerald-500 rounded-full"
            style={{ 
              transform: `rotate(${i * 45}deg) translateY(-60px)` 
            }}
          />
        ))}
     </div>
  </div>
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
      
      {/* Navbar: Elite Authority */}
      <nav className="glass-nav">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-[#030711] font-black text-lg">U</div>
             <span className="text-xl font-black uppercase tracking-[0.4em] text-white">Umbra</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.4em] text-white/30">
             <button onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">The_Method</button>
             <button onClick={() => document.getElementById('system')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">The_System</button>
             <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} className="hover:text-white transition-colors">{language.toUpperCase()}</button>
          </div>

          <button onClick={handleEnterApp} className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            Access_Console
          </button>
        </div>
      </nav>

      {/* HERO: THE BUSINESS CLOSER (ROI DOMINANCE) */}
      <section className="min-h-screen relative overflow-hidden flex items-center">
         <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px]" />
         
         <div className="hero-split">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1 }}
               className="hero-content"
            >
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500">Audited Web3 Performance</span>
               </div>
               
               <h1 className="hero-title">
                  Close the Gap <br/> 
                  Between Content <br/>
                  <span className="text-emerald-500">& Capital.</span>
               </h1>

               <p className="hero-subtitle">
                  Umbra doesn't do "marketing". We engineer **disruptive growth** by hooking directly into platform nodes to deliver undisputed, auditable ROI for elite brands.
               </p>

               <div className="flex flex-col sm:flex-row gap-6 pt-6">
                  <button onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })} className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center gap-3">
                     Initialize Audit <ChevronDown className="h-4 w-4" />
                  </button>
                  <button onClick={handleEnterApp} className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-xl">
                     Client Login
                  </button>
               </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.5, delay: 0.2 }}
               className="hero-visual"
            >
               <div className="absolute inset-0 bg-emerald-500/10 blur-[150px] rounded-full animate-pulse" />
               <img src="/assets/obsidian-visual.png" className="w-full relative z-10 animate-float drop-shadow-[0_0_80px_rgba(16,185,129,0.15)]" alt="ROI Engine" />
            </motion.div>
         </div>

         {/* Trust Bar */}
         <div className="absolute bottom-0 w-full h-16 border-t border-white/5 bg-black/60 backdrop-blur-xl flex items-center px-12 justify-between">
            <div className="flex items-center gap-12 text-[9px] font-black uppercase tracking-[0.5em] text-white/20">
               <span>Reach: 116.4M</span>
               <span className="hidden md:block">ROI: x3.2 Avg</span>
               <span className="hidden md:block">Nodes: 1.2K Verified</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-400">Live_Scrape_Operational</span>
            </div>
         </div>
      </section>

      {/* THE METHOD: INTERACTIVE PROTOCOL FLOW */}
      <section id="protocol" className="py-64 px-8 lg:px-24 bg-[#030711] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-40 text-center space-y-6">
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.8em]">Operational_Blueprint</span>
             <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none">The <br/> Method.</h2>
          </div>

          <div className="protocol-flow-container">
             <FlowStep 
               num="01" 
               title="Strategic Decode" 
               desc="We dismantle your current footprint to identify the technical gap between your project and its target cultural node."
               icon={Search}
               detail="Every partnership starts with a diagnostic framework of targeted questions to decode your project's unique DNA."
               visual={DiagnosticVisual}
             />
             
             <FlowStep 
               num="02" 
               title="Talent Synapse" 
               desc="Connection to the top 1% of creators. We don't hire 'influencers'; we deploy verified nodes of cultural engineering."
               icon={Users}
               detail="Our network is vetted for absolute authenticity and historical performance consistency."
               visual={NetworkVisual}
             />

             <FlowStep 
               num="03" 
               title="Live Extraction" 
               desc="Direct platform hooks. We see every view, like, and comment as it happens. No black boxes. No delayed PDFs."
               icon={Cpu}
               detail="Proprietary scraping tools that ensure 100% transparency. Every impression is audited in real-time."
               visual={() => <img src="/assets/system-schematic.png" className="w-full rounded-2xl opacity-80" alt="Scrape Schematic" />}
             />

             <FlowStep 
               num="04" 
               title="Consolidated Yield" 
               desc="The result: A unified portal where brands watch their ROI scale with technical certainty."
               icon={TrendingUp}
               detail="We transform single activations into sustainable ecosystems of growth and recurring momentum."
               visual={() => (
                 <div className="text-center space-y-4">
                    <div className="text-8xl font-black text-emerald-500 tracking-tighter">x3.2</div>
                    <div className="text-sm font-black text-white/40 uppercase tracking-[0.4em]">Efficiency_Standard</div>
                 </div>
               )}
             />
          </div>
        </div>
      </section>

      {/* FOOTER: THE CLOSER CTA */}
      <section className="py-48 px-8 lg:px-24 border-t border-white/5 bg-gradient-to-b from-[#030711] to-black">
         <div className="max-w-4xl mx-auto text-center space-y-16">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">Ready to <br/> <span className="text-emerald-500 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Initialize?</span></h2>
            <p className="text-xl text-white/40 font-medium max-w-2xl mx-auto">
               Join the elite. Umbra is a selective agency. We only partner with projects that demonstrate true disruptive potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
               <button onClick={handleEnterApp} className="px-16 py-6 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                  Contact Strategy
               </button>
               <button className="px-16 py-6 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                  Request Audit
               </button>
            </div>
         </div>
      </section>

      <footer className="py-12 px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
           <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-[#030711] font-black">U</div>
              <span>Umbra Agency v3.0</span>
           </div>
           <div className="flex gap-12">
              <button>Protocol</button>
              <button>Privacy</button>
              <button>Console</button>
           </div>
           <span>© 2026 ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  );
}
