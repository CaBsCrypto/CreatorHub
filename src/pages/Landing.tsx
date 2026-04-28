import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  AnimatePresence,
  useScroll,
  useTransform
} from 'framer-motion';
import { 
  Zap, Rocket, Target, 
  ArrowRight, Shield,
  BarChart3, LayoutDashboard, LogIn,
  TrendingUp, Twitter,
  Activity, Eye, Users, CheckCircle2,
  ChevronDown, Hexagon, Layers, Share2,
  PieChart, LineChart
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import translations from './translations';
import './Landing.css';

// --- COMPONENTES DE ALTA FIDELIDAD ---

const DiagnosticPanel = () => (
  <div className="w-full bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden">
    <div className="flex items-center justify-between mb-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
          <Hexagon className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest">Protocol_Input_Module</h4>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Vercel_Edge_Sync: Active</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-black text-emerald-400">01 / 04</div>
        <div className="text-[8px] text-white/20 uppercase font-black tracking-widest mt-1">Stage_Initialization</div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
       <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Campaign_Objective</label>
            <div className="h-14 bg-slate-950/50 rounded-2xl border border-white/5 flex items-center px-6 text-sm font-bold text-white/60">
               Brand Resonance & Cultural Impact
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Target_Audience_Node</label>
            <div className="h-14 bg-slate-950/50 rounded-2xl border border-white/5 flex items-center px-6 text-sm font-bold text-white/60">
               Web3 Native / Gaming Core / Latam
            </div>
          </div>
       </div>
       <div className="flex flex-col justify-center items-center p-8 bg-emerald-500/[0.02] rounded-[2rem] border border-emerald-500/10">
          <PieChart className="h-32 w-32 text-emerald-500/20 mb-6" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Simulating_Predictive_ROI...</p>
       </div>
    </div>
  </div>
);

const ExecutionPanel = () => (
  <div className="w-full bg-slate-950 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-8">
      <Activity className="h-8 w-8 text-cyan-500/20 group-hover:text-cyan-500 transition-colors duration-1000" />
    </div>
    
    <div className="flex items-center gap-6 mb-12">
      <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
        <Layers className="h-6 w-6 text-cyan-400" />
      </div>
      <h3 className="text-3xl font-black uppercase tracking-tighter">Real-time Data Extraction</h3>
    </div>

    <div className="space-y-6">
       {[
         { label: "TikTok_Engagement_Scrape", val: "8.42%", progress: 84 },
         { label: "Twitter_Impression_Node", val: "1.2M", progress: 92 },
         { label: "Twitch_Live_Retention", val: "42.1%", progress: 65 }
       ].map((m, i) => (
         <div key={i} className="space-y-2">
            <div className="flex justify-between items-end">
               <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{m.label}</span>
               <span className="text-xs font-black text-white">{m.val}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: `${m.progress}%` }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" 
               />
            </div>
         </div>
       ))}
    </div>
    
    {/* Grid Background */}
    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:20px_20px]" />
  </div>
);

// --- MAIN PAGE ---

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const t: any = (translations as any)[language] || (translations as any)['en'];

  const handleEnterApp = () => {
    if (user) { navigate('/dashboard'); } else { navigate('/login'); }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="landing-container bg-[#030711] text-white selection:bg-emerald-500/30">
      <div className="grain-overlay" />
      
      {/* Navbar Minimalista de Élite */}
      <nav className="fixed top-0 w-full z-[100] bg-[#030711]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl">U</div>
             <span className="text-xl font-black uppercase tracking-[0.4em]">Umbra</span>
          </div>
          
          <div className="hidden md:flex items-center gap-12 text-[10px] font-black uppercase tracking-widest text-white/40">
             <button onClick={() => document.getElementById('manifesto')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">Manifesto</button>
             <button onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">The_Protocol</button>
             <button onClick={() => document.getElementById('network')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">Elite_Network</button>
          </div>

          <div className="flex items-center gap-6">
             <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">{language}</button>
             <button onClick={handleEnterApp} className="px-8 py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Command_Center</button>
          </div>
        </div>
      </nav>

      {/* HERO: EL MANIFIESTO (TIPO WHITEBOARD) */}
      <section id="manifesto" className="min-h-screen pt-48 pb-32 px-8 relative flex flex-col items-center justify-center">
         <div className="max-w-5xl mx-auto text-center space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 border border-white/10 rounded-full"
            >
               <Shield className="h-3 w-3 text-emerald-400" />
               <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/60">Audited_By_Umbra_V3</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.85] text-white"
            >
              The <span className="text-emerald-500">Real</span> <br/>
              Standard.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-white/40 max-w-3xl mx-auto font-medium leading-relaxed"
            >
              We replace marketing noise with <span className="text-white">technical certainty</span>. Our infrastructure hooks directly into platform metrics to deliver undisputed ROI.
            </motion.p>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.6 }}
               className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
            >
               <button onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })} className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-3">
                  View Protocol <ChevronDown className="h-4 w-4" />
               </button>
               <button onClick={handleEnterApp} className="px-12 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                  Access Portal
               </button>
            </motion.div>
         </div>

         {/* Background Grid Accent */}
         <div className="absolute inset-0 -z-10 opacity-20 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:100px_100px]" />
      </section>

      {/* PROTOCOLO: EL TRABAJO REAL (ANATOMÍA DE CAMPAÑA) */}
      <section id="protocol" className="py-48 px-8 border-t border-white/5 bg-slate-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
             <div className="space-y-16">
                <div>
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-6 block">Stage_01: Analytics</span>
                   <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-8">Campaign <br/> Anatomy.</h2>
                   <p className="text-lg text-white/40 font-medium leading-relaxed max-w-md">
                      Our process isn't a secret. It's an <span className="text-white">engineering flow</span> designed to minimize risk and maximize resonance.
                   </p>
                </div>

                <div className="space-y-12">
                   {[
                     { step: "01", title: "Strategic Briefing", desc: "Digital decode of project DNA and cultural objectives." },
                     { step: "02", title: "Talent Engineering", desc: "Cross-referencing engagement nodes with target sentiment." },
                     { step: "03", title: "Live Execution", desc: "Real-time performance scraping and content validation." }
                   ].map((s, i) => (
                     <div key={i} className="flex gap-8 group">
                        <span className="text-4xl font-black text-white/10 group-hover:text-emerald-500/40 transition-colors">{s.step}</span>
                        <div>
                           <h4 className="text-xl font-black uppercase mb-2">{s.title}</h4>
                           <p className="text-sm text-white/40 font-medium">{s.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="space-y-12">
                <DiagnosticPanel />
                <ExecutionPanel />
             </div>
          </div>
        </div>
      </section>

      {/* METRICS: LA VERDAD DE LOS DATOS */}
      <section className="py-32 px-8 bg-emerald-600">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
            <div className="text-center md:text-left">
               <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">Numbers <br/> don't lie.</h2>
               <p className="text-emerald-100 font-bold opacity-80 text-sm uppercase tracking-widest">Global_Consolidated_Impact_Metrics</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
               <div className="text-center md:text-right">
                  <div className="text-7xl font-black text-white tracking-tighter">116K</div>
                  <div className="text-[10px] font-black text-emerald-950 uppercase tracking-widest opacity-60">Verified_Reach</div>
               </div>
               <div className="text-center md:text-right">
                  <div className="text-7xl font-black text-white tracking-tighter">x3.2</div>
                  <div className="text-[10px] font-black text-emerald-950 uppercase tracking-widest opacity-60">Avg_ROI_Yield</div>
               </div>
               <div className="text-center md:text-right">
                  <div className="text-7xl font-black text-white tracking-tighter">100%</div>
                  <div className="text-[10px] font-black text-emerald-950 uppercase tracking-widest opacity-60">Data_Transparency</div>
               </div>
            </div>
         </div>
      </section>

      {/* NETWORK: ELITE NODES */}
      <section id="network" className="py-48 px-8 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto mb-32 text-center">
           <span className="section-label">Verified_Partners</span>
           <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter">The Elite <br/> <span className="text-emerald-500">Network.</span></h2>
        </div>

        <div className="flex gap-8 overflow-hidden py-12">
           <motion.div 
             animate={{ x: [0, -1400] }}
             transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
             className="flex gap-12"
           >
              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                <div key={i} className="w-80 h-[28rem] bg-white/5 border border-white/10 rounded-[3rem] p-4 flex flex-col group hover:border-emerald-500/20 transition-all">
                   <div className="flex-1 bg-slate-900 rounded-[2rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white/5 font-black text-8xl italic">U</div>
                   </div>
                   <div className="p-6">
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Protocol_Verified_Node</div>
                      <div className="text-2xl font-black uppercase tracking-tighter">Creator_Node_{i}</div>
                   </div>
                </div>
              ))}
           </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 px-8 border-t border-white/5 bg-[#030711]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 bg-white/5 rounded-lg border border-white/10" />
                 <span className="text-lg font-black uppercase tracking-widest">Umbra Hub</span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed font-medium">The unmistakable standard for auditable Web3 performance. Built for high-impact brand/creator synergy.</p>
           </div>
           <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-8">Navigation</h5>
              <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-white/40">
                 <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Manifesto</button></li>
                 <li><button onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">The Protocol</button></li>
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
