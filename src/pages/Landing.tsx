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
    title: 'Diagnostic Audit',
    short: 'Initial onboarding and DNA analysis of the brand/project.',
    icon: ClipboardCheck,
    detail: {
      title: 'Phase 01: The Diagnostic Framework',
      content: 'Every partnership begins with a mandatory technical audit. We dismantle your current positioning to identify structural gaps.',
      items: [
        'KPI Alignment & ROI Definition',
        'Audience DNA Mapping',
        'Competitive Sentiment Analysis',
        'Infrastructure Readiness Check'
      ]
    }
  },
  {
    id: 'selection',
    num: '02',
    title: 'Node Selection',
    short: 'Filtering the top 1% of creators through our elite vetting engine.',
    icon: Network,
    detail: {
      title: 'Phase 02: Talent Synapse',
      content: 'We don\'t use "influencers". We deploy verified creator nodes. Our selection process is strictly data-driven.',
      items: [
        'Historical ROI Verification',
        'Audience Authenticity Audit',
        'Platform Affinity Matching',
        'Direct Node Connection (No Middlemen)'
      ]
    }
  },
  {
    id: 'strategy',
    num: '03',
    title: 'Integration',
    short: 'Content planning and campaign infrastructure deployment.',
    icon: Layers,
    detail: {
      title: 'Phase 03: Strategic Integration',
      content: 'Creating the bridge between brand capital and cultural resonance. We engineer content that converts.',
      items: [
        'Content Node Briefing',
        'Platform Hook Optimization',
        'Timeline Synchronization',
        'Risk Mitigation Protocols'
      ]
    }
  },
  {
    id: 'monitoring',
    num: '04',
    title: 'Live Scrape',
    short: 'Real-time monitoring and technical performance tracking.',
    icon: Activity,
    detail: {
      title: 'Phase 04: Real-Time Extraction',
      content: 'Direct hooks into platform APIs. We monitor every impression and engagement as it happens.',
      items: [
        'Live Data Scraping',
        'Engagement Sentiment Tracking',
        'Platform Performance Nodes',
        'Transparency Dashboards'
      ]
    }
  },
  {
    id: 'yield',
    num: '05',
    title: 'ROI Yield',
    short: 'Consolidated performance reporting and capital growth.',
    icon: BarChart,
    detail: {
      title: 'Phase 05: Capital Consolidation',
      content: 'The final yield. We consolidate all performance metrics into an undisputed, auditable report.',
      items: [
        'Audited ROI Reports',
        'Growth Momentum Analysis',
        'Future Scaling Projections',
        'Direct Performance Payouts'
      ]
    }
  }
];

// --- SUB-COMPONENTS ---

const ProcessBox = ({ step, onClick }: { step: any, onClick: () => void }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className="relative p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl cursor-pointer group transition-all duration-500 overflow-hidden"
  >
    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-emerald-500/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    
    <div className="relative z-10 space-y-6">
       <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
             <step.icon className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Step_{step.num}</span>
       </div>
       
       <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-3">{step.title}</h3>
          <p className="text-sm text-white/40 font-medium leading-relaxed">{step.short}</p>
       </div>

       <div className="pt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-emerald-500/60 opacity-0 group-hover:opacity-100 transition-opacity">
          Click_For_Details <ArrowRight className="h-2 w-2" />
       </div>
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
            Access_Console
          </button>
        </div>
      </nav>

      {/* HERO: THE INITIALIZATION GATEWAY */}
      <section className="min-h-[70vh] relative overflow-hidden flex items-center pt-20">
         <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px]" />
         
         <div className="max-w-7xl mx-auto px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="space-y-8">
               <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500">Gateway to Elite Growth</span>
               </div>
               
               <h1 className="text-[4rem] md:text-[6.5rem] font-black uppercase tracking-tighter leading-[0.85] text-white">
                  Initialize <br/>
                  The <span className="text-emerald-500">Protocol.</span>
               </h1>

               <p className="text-xl text-white/40 font-medium max-w-xl leading-relaxed">
                  Welcome to the Umbra engineering flow. This is the **Onboarding Gateway** where we transform brand vision into auditable cultural impact.
               </p>

               <div className="flex gap-6">
                  <button onClick={() => document.getElementById('onboarding')?.scrollIntoView({ behavior: 'smooth' })} className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center gap-3">
                     Enter System Protocol <ChevronDown className="h-4 w-4" />
                  </button>
               </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="relative hidden lg:block">
               <div className="absolute inset-0 bg-emerald-500/10 blur-[150px] rounded-full animate-pulse" />
               <img src="/assets/obsidian-visual.png" className="w-full relative z-10 animate-float" alt="ROI Engine" />
            </motion.div>
         </div>
      </section>

      {/* THE GATEWAY: ONBOARDING PROTOCOL GRID */}
      <section id="onboarding" className="pb-40 px-8 lg:px-12 bg-[#030711] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
             <div className="space-y-4">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.8em]">System_Entry_Point</span>
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">The Onboarding.</h2>
             </div>
             <p className="text-lg text-white/30 font-medium max-w-xs mb-4">
                Click on any phase to decode our operational methodology and data-flow infrastructure.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {PROCESS_STEPS.map((step) => (
               <ProcessBox key={step.id} step={step} onClick={() => setSelectedStep(step)} />
             ))}
             
             {/* Call to Action Box */}
             <div className="p-10 rounded-[2rem] bg-emerald-600 flex flex-col justify-between group cursor-pointer hover:bg-emerald-500 transition-all duration-500 shadow-[0_0:50px_rgba(16,185,129,0.2)]">
                <div className="text-[10px] font-black text-[#030711] uppercase tracking-[0.5em] mb-4">Elite_Access</div>
                <h3 className="text-3xl font-black uppercase tracking-tighter text-[#030711] leading-none mb-10">Ready to Finalize Your Entry?</h3>
                <button onClick={handleEnterApp} className="w-full py-4 bg-[#030711] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                   Confirm_Onboarding <ArrowRight className="h-4 w-4" />
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
           <span>© 2026 ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  );
}
