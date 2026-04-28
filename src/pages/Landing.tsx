import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  AnimatePresence 
} from 'framer-motion';
import { 
  Zap, Rocket, Trophy, Target, 
  ArrowRight, Shield,
  BarChart3, LayoutDashboard, LogIn,
  TrendingUp, Twitter,
  Activity, Search, Eye, MessageSquare, Heart as HeartIcon,
  CheckCircle2, Clock, Users, Terminal, Cpu, Network, Database
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import translations from './translations';
import './Landing.css';

// Import images
import founder1 from '../assets/eminatr1x.webp';
import founder2 from '../assets/cabs.webp';
import creator1 from '../assets/ladymufa.webp';
import yagod from '../assets/yagod.webp';
import lizard from '../assets/lizard.webp';
import spadex from '../assets/spadex.webp';
import creator1dory from '../assets/1dory.webp';
import camululis from '../assets/camululis.webp';
import oza from '../assets/oza.webp';
import seven from '../assets/seven.webp';

const PLACEHOLDER_CREATORS = [
  { id: 'p1', display_name: 'Yagod', photo_url: yagod, twitter: 'https://x.com/YagodNFT', badge: 'NFT Sentinel' },
  { id: 'p2', display_name: 'Lizard', photo_url: lizard, twitter: 'https://x.com/TheLizardQueenT', badge: 'Tactical Lead' },
  { id: 'p3', display_name: 'Spadex', photo_url: spadex, twitter: 'https://x.com/FSpadexx', badge: 'High-Impact' },
  { id: 'p4', display_name: '1Dory', photo_url: creator1dory, twitter: 'https://x.com/1dory_gg', badge: 'Web3 Catalyst' },
  { id: 'p5', display_name: 'Camululis', photo_url: camululis, twitter: 'https://x.com/camululis', badge: 'Cultural Core' },
  { id: 'p6', display_name: 'Oza', photo_url: oza, twitter: 'https://x.com/SoyOzarux', badge: 'Visionary' },
  { id: 'p7', display_name: 'Seven', photo_url: seven, twitter: 'https://x.com/Its7Keys', badge: 'Meta Strategist' },
];


// --- COMPONENTES TÉCNICOS ---

const SystemStatus = () => (
  <div className="flex items-center gap-8 px-6 py-3 border-b border-emerald-500/10 bg-slate-950/50 text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      <span>System_Operational</span>
    </div>
    <div className="hidden md:flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
      <span>Network_Stable: 142ms</span>
    </div>
    <div className="hidden lg:flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
      <span>Auth_Node: Encrypted</span>
    </div>
    <div className="ml-auto flex items-center gap-4">
      <span>Coord: 19.24N / 99.12W</span>
      <span className="text-emerald-500/60">v3.0.4_Stable</span>
    </div>
  </div>
);

const DataVisualizer = () => {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const logs = [
      "> Initializing_Campaign_Scanner...",
      "> Fetching_Engagement_Data: TikTok_API",
      "> Authenticating_Creator_Node_0x42",
      "> ROI_Projection: 324%_Confirmed",
      "> Parsing_Audience_Sentiment...",
      "> Metric_Validation: PASS",
      "> Scrape_Complete: 12,492_Entries"
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLines(prev => [...prev.slice(-4), logs[i]]);
      i = (i + 1) % logs.length;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950/80 p-6 rounded-3xl border border-white/5 font-mono text-[10px] space-y-1 overflow-hidden h-40">
      {lines.map((line, idx) => (
        <div key={idx} className={idx === lines.length - 1 ? "text-emerald-400" : "text-white/20"}>
          {line}
        </div>
      ))}
      <div className="w-1 h-3 bg-emerald-500 animate-pulse inline-block ml-1" />
    </div>
  );
};

const CampaignModule = ({ title, status, icon: Icon, value }: any) => (
  <div className="bg-slate-900/50 border border-white/5 p-6 rounded-[2rem] group hover:border-emerald-500/20 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
        <Icon className="h-4 w-4 text-emerald-500" />
      </div>
      <div className="text-[8px] font-black uppercase tracking-widest text-white/20">{status}</div>
    </div>
    <div className="text-2xl font-black mb-1">{value}</div>
    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{title}</div>
  </div>
);

// --- MAIN PAGE ---

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [selectedStrategy, setSelectedStrategy] = useState<null | { title: string, detail: string, icon: any, color: string }>(null);
  
  const t: any = (translations as any)[language] || (translations as any)['en'];

  const handleEnterApp = () => {
    if (user) { navigate('/dashboard'); } else { navigate('/login'); }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="landing-container min-h-screen flex flex-col">
      <SystemStatus />

      {/* Grid Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Texture & Glow */}
      <div className="grain-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="nebula-glow top-[-10%] left-[-10%] w-[70%] h-[70%] bg-emerald-600/10" />
        <div className="nebula-glow bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/05" />
      </div>

      {/* Navbar Minimalista Técnica */}
      <nav className="z-50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="text-2xl font-black tracking-[0.3em] uppercase flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 text-base">U</div>
              <span>Umbra</span>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              <button onClick={() => document.getElementById('method')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">Protocol_Method</button>
              <button onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">Elite_Network</button>
              <button onClick={() => document.getElementById('leadership')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">Operation_Leads</button>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} className="text-[10px] font-black uppercase tracking-widest hover:text-white">{language}</button>
            <button onClick={handleEnterApp} className="px-6 py-2 bg-emerald-500 text-slate-950 rounded-lg font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Login_System</button>
          </div>
        </div>
      </nav>

      {/* HERO: COMMAND DECK (INTERFACE REAL) */}
      <main className="flex-1 relative z-10 pt-12 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Columna Izquierda: El Manifiesto Técnico */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-6">Security_Clearance_Required</div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-8">
                  The <br/>
                  <span className="gradient-text">Unmistakable</span> <br/>
                  Standard.
                </h1>
                <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
                  We don't sell visibility. We deploy <span className="text-white">proprietary data infrastructure</span> to ensure your campaign ROI is verifiable, repeatable, and absolute.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl">
                  <div className="text-2xl font-black mb-1">116K+</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60">Network_Reach</div>
                </div>
                <div className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl">
                  <div className="text-2xl font-black mb-1">x3.2</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-cyan-500/60">Avg_ROI_Index</div>
                </div>
              </div>

              <div className="space-y-4">
                 <button onClick={handleEnterApp} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-500 transition-all">
                    Initiate Audit <ArrowRight className="h-4 w-4" />
                 </button>
                 <p className="text-[9px] text-center text-white/20 font-black uppercase tracking-widest italic">Authorized_Personnel_Only</p>
              </div>
            </div>

            {/* Columna Derecha: El "Command Center" Visual */}
            <div className="lg:col-span-7">
               <div className="relative bg-slate-900/80 border border-white/10 rounded-[3rem] p-8 shadow-2xl backdrop-blur-2xl">
                  {/* Fake UI Header */}
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                      <Terminal className="h-4 w-4 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active_Campaign_Terminal</span>
                    </div>
                    <div className="flex gap-2">
                       <div className="h-2 w-12 bg-white/5 rounded-full" />
                       <div className="h-2 w-8 bg-emerald-500/20 rounded-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                     <CampaignModule title="Real-time_Engagement" status="Monitoring" icon={Activity} value="8.42%" />
                     <CampaignModule title="Active_Creator_Nodes" status="Verified" icon={Users} value="08" />
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                       <span>Diagnostic_Stream</span>
                       <span className="text-emerald-500">Live</span>
                    </div>
                    <DataVisualizer />
                    
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                       <div className="flex items-center gap-4 mb-3">
                          <Shield className="h-4 w-4 text-emerald-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Protocol_Standard_V3</span>
                       </div>
                       <div className="h-2 bg-emerald-500/20 rounded-full w-full relative overflow-hidden">
                          <motion.div 
                            animate={{ x: ['-100%', '100%'] }} 
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-y-0 w-1/3 bg-emerald-500/40" 
                          />
                       </div>
                    </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* METODOLOGÍA (MÓDULOS DE SISTEMA) */}
      <section id="method" className="py-48 px-6 bg-slate-950 relative border-t border-emerald-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-24">
            <div>
              <span className="section-label">Operational_Flow</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">The <span className="gradient-text">Methodology.</span></h2>
            </div>
            <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed italic opacity-60">"Precision is the only metric that matters."</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { id: '01', title: 'Diagnostic', icon: Search, desc: 'We scan your project\'s metadata to find cultural alignment.' },
               { id: '02', title: 'Scraping', icon: Database, desc: 'Live data harvesting across all engagement nodes.' },
               { id: '03', title: 'Validation', icon: CheckCircle2, desc: 'Unified ROI reports with absolute transparency.' },
               { id: '04', title: 'Growth', icon: TrendingUp, desc: 'Sustainable momentum through data-backed iterations.' }
             ].map((m) => (
               <div key={m.id} className="p-8 bg-slate-900/50 border border-white/5 rounded-[2.5rem] hover:border-emerald-500/20 transition-all group">
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors">
                      <m.icon className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span className="text-4xl font-black text-white/[0.03] group-hover:text-emerald-500/5 transition-colors">{m.id}</span>
                  </div>
                  <h3 className="text-xl font-black uppercase mb-4">{m.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{m.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* ELITE NETWORK (SCROLL TÉCNICO) */}
      <section id="creators" className="py-48 bg-slate-950 border-t border-emerald-500/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <span className="section-label">Verified_Nodes</span>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Elite <span className="gradient-text">Network.</span></h2>
        </div>
        <div className="flex gap-8 px-4 opacity-80 hover:opacity-100 transition-opacity">
           <motion.div 
             animate={{ x: [0, -1200] }} 
             transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
             className="flex gap-8"
           >
              {[...PLACEHOLDER_CREATORS, ...PLACEHOLDER_CREATORS].map((c, i) => (
                <div key={i} className="w-64 flex-shrink-0 bg-slate-900 border border-white/5 rounded-[2rem] p-4 group hover:border-emerald-500/20 transition-all">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 grayscale group-hover:grayscale-0 transition-all">
                    <img src={c.photo_url} className="w-full h-full object-cover" alt={c.display_name} />
                  </div>
                  <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{c.badge}</div>
                  <div className="text-lg font-black uppercase">{c.display_name}</div>
                </div>
              ))}
           </motion.div>
        </div>
      </section>

      {/* FOOTER TÉCNICO */}
      <footer className="py-16 px-8 border-t border-white/5 bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center"><Network className="h-4 w-4 text-emerald-500" /></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Umbra_Infrastructure_v3.0</span>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">© 2026 UMBRA AGENCY. ALL SYSTEMS NOMINAL.</p>
           <div className="flex gap-6">
              <Twitter className="h-4 w-4 text-white/20 hover:text-emerald-500 cursor-pointer transition-colors" />
              <Terminal className="h-4 w-4 text-white/20 hover:text-emerald-500 cursor-pointer transition-colors" />
           </div>
        </div>
      </footer>
    </div>
  );
}
