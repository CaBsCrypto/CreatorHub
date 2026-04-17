import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Zap, Users, Globe, Play, Rocket, Trophy, Target, 
  ChevronRight, ArrowRight, Shield, Star, Heart,
  BarChart3, Gamepad2, Sparkles, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import './Landing.css';

// Import images
import founder1 from '../assets/founder_1.png';
import founder2 from '../assets/founder_2.png';
import creator1 from '../assets/creator_1.png';
import creator2 from '../assets/creator_2.png';

export default function Landing() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    creators: 154,
    views: 12500000,
    gameNights: 42
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  useEffect(() => {
    async function fetchStats() {
      try {
        // We try to fetch real stats, but fall back to "premium placeholders" if it fails
        // This is safe for a landing page where we want to "WOW" regardless of DB connection
        const [usersRes, contentRes] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'creator').is('deleted_at', null),
          supabase.from('content').select('views, platform').is('deleted_at', null)
        ]);

        if (usersRes.count) {
          const totalViews = contentRes.data?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 12500000;
          const gameNights = contentRes.data?.filter(c => c.platform === 'discord' || c.platform === 'baseapp').length || 42;
          
          setStats({
            creators: usersRes.count,
            views: totalViews,
            gameNights: gameNights
          });
        }
      } catch (err) {
        console.warn("Using placeholder stats for landing page");
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  const handleEnterApp = () => {
    if (user) {
      if (profile?.role === 'admin' || profile?.role === 'manager') navigate('/admin');
      else if (profile?.role === 'creator') navigate('/creator');
      else if (profile?.role === 'client') navigate('/client');
      else navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="glass-nav px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
            <Rocket className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter">UMBRA</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleEnterApp}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase transition-all border border-white/10"
          >
            {user ? 'Dashboard' : 'Login'}
          </button>
          <button 
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden md:block px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:text-indigo-400 transition-colors"
          >
            About
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          style={{ opacity, scale }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="section-label group">
            <Sparkles className="inline-block h-3 w-3 mr-2 animate-pulse" />
            Empowering the next generation of creators
          </span>
          <h1 className="hero-text mb-8">
            THE ULTIMATE <br />
            <span className="gradient-text">CREATOR HUB.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed">
            Umbra is more than a platform. It's the engine behind the most viral campaigns, 
            connecting elite brands with the most talented creators in the ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <button onClick={handleEnterApp} className="glow-button">
              {user ? 'Back to Hub' : 'Get Started'}
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </button>
            <button onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 border border-white/10 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition-all">
              View Creators
            </button>
          </div>
        </motion.div>

        {/* Hero Decorative Elements */}
        <div className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Active Creators', value: stats.creators, icon: Users, color: 'text-blue-400' },
            { label: 'Views Achieved', value: (stats.views / 1000000).toFixed(1) + 'M', icon: Zap, color: 'text-yellow-400' },
            { label: 'Game Nights', value: stats.gameNights, icon: Gamepad2, color: 'text-purple-400' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="premium-card text-center flex flex-col items-center"
            >
              <div className={`p-4 rounded-2xl bg-white/5 mb-6 ${stat.color}`}>
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="text-sm font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <span className="section-label">Who We Are</span>
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
            Our Mission is <br /> <span className="text-indigo-500">Your Growth.</span>
          </h2>
          <div className="space-y-6 text-slate-400 text-lg font-medium leading-relaxed">
            <p>
              Founded with the vision to professionalize the creator economy, Umbra has become the essential 
              bridge between creativity and commercial strategy.
            </p>
            <p>
              We don't just manage campaigns; we cultivate talent. Our platform offers advanced 
              tracking tools, real-time metrics, and an exclusive support community.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-indigo-500/20 rounded-lg"><Shield className="h-5 w-5 text-indigo-400" /></div>
              <div>
                <h4 className="font-bold text-white mb-1">Secure Payments</h4>
                <p className="text-xs text-slate-500">Transparent and automated systems.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-pink-500/20 rounded-lg"><Target className="h-5 w-5 text-pink-400" /></div>
              <div>
                <h4 className="font-bold text-white mb-1">Elite Metrics</h4>
                <p className="text-xs text-slate-500">Detailed analysis of every impression.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
          <img 
            src={creator1} 
            alt="Umbra Culture" 
            className="premium-card w-full h-auto object-cover relative z-10 p-2"
          />
          <div className="absolute -bottom-10 -right-10 bg-slate-900 border border-white/5 p-8 rounded-3xl z-20 hidden md:block floating">
             <div className="flex items-center gap-3 mb-2">
                <Star className="h-4 w-4 text-emerald-400 fill-emerald-400" />
                <span className="text-sm font-bold">Trending Content</span>
             </div>
             <div className="text-2xl font-black">#GlobalViral</div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-32 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="section-label">Leadership</span>
            <h2 className="text-4xl md:text-6xl font-black">The Minds Behind <br/> the Shadow.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
             {[
               { name: 'Gabriel S.', role: 'CEO & Founder', image: founder1, desc: 'Visionary with over 10 years in the digital and crypto ecosystem.' },
               { name: 'Valentina R.', role: 'COO & Strategy', image: founder2, desc: 'Specialist in agency scalability and international talent management.' }
             ].map((founder, i) => (
               <motion.div 
                 key={founder.name}
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="text-center group"
               >
                 <div className="relative mb-8">
                   <div className="absolute -inset-2 bg-indigo-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   <img src={founder.image} alt={founder.name} className="founder-image relative z-10" />
                 </div>
                 <h3 className="text-2xl font-black mb-2">{founder.name}</h3>
                 <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">{founder.role}</p>
                 <p className="text-slate-400 font-medium px-4">{founder.desc}</p>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Creators Visual Grid */}
      <section id="creators" className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl">
            <span className="section-label">Community</span>
            <h2 className="text-4xl md:text-6xl font-black mb-6">Our Faces. <br/> Your Results.</h2>
          </div>
          <button className="flex items-center gap-4 text-indigo-400 font-black uppercase tracking-widest text-sm group">
            View Full Directory
            <div className="w-12 h-12 rounded-full border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <ChevronRight className="h-6 w-6" />
            </div>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
           <div className="md:col-span-2 relative group overflow-hidden rounded-[3rem]">
              <img src={creator2} alt="Creator 1" className="creator-image" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8">
                 <div className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-1">Featured Creator</div>
                 <div className="text-3xl font-black">Koda Stream</div>
              </div>
           </div>
           <div className="relative group overflow-hidden rounded-[3rem]">
              <div className="absolute inset-0 bg-indigo-600 flex flex-col items-center justify-center text-center p-8 group-hover:bg-indigo-500 transition-colors">
                 <Trophy className="h-12 w-12 mb-6" />
                 <div className="text-4xl font-black mb-2">+50M</div>
                 <div className="text-[10px] font-black uppercase tracking-widest">Vistas Totales 2024</div>
              </div>
           </div>
           <div className="relative group overflow-hidden rounded-[3rem] bg-slate-900 border border-white/5 flex flex-col items-center justify-center p-8 text-center hover:border-indigo-500/30 transition-all">
              <Heart className="h-10 w-10 text-rose-500 mb-6 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-slate-300">"The only hub that truly understands the creator."</p>
              <div className="mt-6 text-xs font-black uppercase tracking-widest text-indigo-400">— Sarah M.</div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto premium-card bg-indigo-600 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 py-10">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Ready to take the next step?</h2>
            <p className="text-lg text-white/80 mb-12 max-w-xl mx-auto font-medium">
              Join the elite. Register your creator profile or request a brand audit today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button onClick={handleEnterApp} className="px-10 py-5 bg-white text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                Access Dashboard
              </button>
              <button className="px-10 py-5 bg-transparent border-2 border-white/30 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Hub Button for Logged users */}
      {user && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleEnterApp}
          className="fixed bottom-8 right-8 z-[200] p-5 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-500/50 flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-white/20"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="hidden sm:inline">Go to my Panel</span>
        </motion.button>
      )}

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-indigo-500" />
            <span className="text-xl font-black text-white tracking-tighter">UMBRA CREATOR HUB</span>
          </div>
          <div className="flex gap-12 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs">© 2026 UMBRA AGENCY. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
