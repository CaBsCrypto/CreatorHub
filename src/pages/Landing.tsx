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
  ArrowRight, LogIn, X, CheckCircle2
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

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lang, setLang] = useState<'en' | 'es'>('es');
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
          <div className="flex items-center gap-4">
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

      {/* NEW HERO SECTION: BRAND VISION */}
      <main className="relative z-10 pt-40 pb-20 px-8 lg:px-12 min-h-screen flex flex-col justify-center">
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
      </main>

      {/* FOUNDERS SECTION: THE MINDS */}
      <section className="py-32 px-8 lg:px-12 bg-transparent relative border-t border-white/5">
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
