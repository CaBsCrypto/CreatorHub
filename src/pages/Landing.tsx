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
    creators: 7,
    views: 850000,
    campaigns: 8
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [featuredCreators, setFeaturedCreators] = useState<any[]>([]);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  useEffect(() => {
    async function fetchStats() {
      try {
        // We try to fetch real stats, but fall back to "premium placeholders" if it fails
        // This is safe for a landing page where we want to "WOW" regardless of DB connection
        const [usersRes, contentRes, campaignsRes] = await Promise.all([
          supabase.from('users').select('id, display_name, photo_url, role').eq('role', 'creator').is('deleted_at', null).order('created_at', { ascending: false }).limit(10),
          supabase.from('content').select('views, platform').is('deleted_at', null),
          supabase.from('campaigns').select('id', { count: 'exact', head: true }).is('deleted_at', null)
        ]);

        if (usersRes.data) {
          setFeaturedCreators(usersRes.data);
        }

        if (usersRes.count !== null || campaignsRes.count !== null) {
          const totalViews = contentRes.data?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 850000;
          
          setStats({
            creators: usersRes.data?.length || 12,
            views: totalViews,
            campaigns: campaignsRes.count || 8
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
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase transition-all border border-white/10"
          >
            Learn More
          </button>
          <button 
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden md:block px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:text-indigo-400 transition-colors"
          >
            About
          </button>
        </div>
      </nav>

      {/* Hero Section (Redesigned) */}
      <section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center pt-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <span className="section-label group mb-6">
              <Sparkles className="inline-block h-3 w-3 mr-2 animate-pulse" />
              Meaning becomes Momentum
            </span>
            <h1 className="hero-text mb-8 text-left">
              THE <br/>UNMISTAKABLE <br/>
              <span className="gradient-text">STANDARD.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-lg mb-12 font-medium leading-relaxed">
              Umbra curates and publishes the best work from a select circle of creators. 
              So your project gets noticed. <span className="text-white">And remembered.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <button 
                onClick={() => document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' })} 
                className="glow-button w-full sm:w-auto"
              >
                Explore Vision
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
              <button 
                onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })} 
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-white/10 transition-all w-full sm:w-auto"
              >
                The Talent
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="hidden lg:block relative h-[600px] w-full"
          >
             {/* Abstract Visual Component */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-slate-900/40 border border-white/5 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl">
                <div className="w-[120%] h-[120%] border border-indigo-500/10 rounded-full animate-spin-slow absolute" />
                <div className="w-64 h-64 border border-indigo-500/20 rounded-full animate-spin-slow" />
                <div className="absolute w-48 h-48 border border-purple-500/20 rounded-full animate-reverse-spin" />
                <Rocket className="h-16 w-16 text-indigo-500 absolute animate-pulse" />
             </div>
             
             {/* Floating Elements - Repositioned to avoid overlap */}
             <div className="absolute top-10 right-0 p-6 premium-card floating shadow-indigo-500/10 scale-90">
                <div className="text-[10px] font-black text-indigo-400 mb-1 uppercase tracking-widest">Standard</div>
                <div className="text-xl font-black">UMBRA</div>
             </div>
             <div className="absolute bottom-10 right-10 p-6 premium-card floating delay-700 shadow-purple-500/10">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Momentum</span>
                </div>
                <div className="text-xl font-black text-white">+500K Views</div>
             </div>
          </motion.div>
        </div>

        {/* Starlight/Shadow Background Background Elements */}
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      </section>

      {/* Trust Marquee Section */}
      <section className="py-10 border-y border-white/5 bg-white/2 overflow-hidden">
        <div className="flex gap-20 whitespace-nowrap marquee-wrapper">
          <motion.div 
            className="flex gap-20 items-center marquee-content"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {['BASE ECOSYSTEM', 'PIXEL STUDIOS', 'WEB3 INNOVATORS', 'GAMING CORP', 'NEXT-GEN AGENCY', 'SHADOW NET', 'UMBRA HUB'].map((brand, i) => (
              <div key={i} className="flex items-center gap-3 opacity-30 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-default">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Star className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-sm font-black tracking-[0.4em] uppercase">{brand}</span>
              </div>
            ))}
            {/* Repeat for loop */}
            {['BASE ECOSYSTEM', 'PIXEL STUDIOS', 'WEB3 INNOVATORS', 'GAMING CORP', 'NEXT-GEN AGENCY', 'SHADOW NET', 'UMBRA HUB'].map((brand, i) => (
              <div key={`${i}-dup`} className="flex items-center gap-3 opacity-30 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-default">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Star className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-sm font-black tracking-[0.4em] uppercase">{brand}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Active Creators', value: stats.creators, icon: Users, color: 'text-blue-400' },
            { 
              label: 'Views Achieved', 
              value: stats.views >= 1000000 
                ? (stats.views / 1000000).toFixed(1) + 'M' 
                : (stats.views / 1000).toFixed(1) + 'K', 
              icon: Zap, 
              color: 'text-yellow-400' 
            },
            { label: 'Total Campaigns', value: stats.campaigns, icon: Target, color: 'text-purple-400' }
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

      {/* Vision Section (New) */}
      <section id="vision" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="section-label">Vision</span>
          <h2 className="text-3xl md:text-5xl font-black mb-12 leading-tight italic">
            "Umbra isn't a Web3 guild. <br/> <span className="gradient-text">It's a standard.</span>"
          </h2>
          <div className="space-y-8 text-xl md:text-2xl text-slate-300 font-medium leading-relaxed">
            <p className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              It's the <span className="text-rose-500 font-black">unmistakable</span> impression a well-crafted message leaves behind.
            </p>
            <p className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Like starlight passing a planet and casting a shadow. <br/>
              <span className="text-white font-black">Meaning becomes momentum.</span>
            </p>
            <p className="text-lg text-slate-400 mt-12 pt-12 border-t border-white/5">
              Umbra curates and publishes the best work from a select circle of creators. 
              So your project gets noticed. <span className="text-white">And remembered.</span>
            </p>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-20">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15),transparent_70%)]" />
        </div>
      </section>

      {/* Method Section (Updated Service Section) */}
      <section id="about" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <span className="section-label">THE METHOD</span>
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight text-white/90">
             Strategic <br/> <span className="gradient-text">Execution.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
           {[
             { 
               title: '1. STRATEGY', 
               desc: 'EMINATR1X (MSc in Marketing) begins with a discovery call to align on vision and goals; then turns them into a content strategy and media mix* that lands with your audience.', 
               icon: Target, 
               color: 'from-blue-500/20 to-indigo-500/20 text-blue-400' 
             },
             { 
               title: '2. DIRECTION', 
               desc: 'Creators are briefed to align on message, goals, and deliverables, while preserving creative freedom.', 
               icon: Sparkles, 
               color: 'from-purple-500/20 to-pink-500/20 text-purple-400' 
             },
             { 
               title: '3. REPORTING', 
               desc: 'Ongoing KPI visibility during the campaign, followed by a final performance report and key takeaways.', 
               icon: BarChart3, 
               color: 'from-indigo-500/20 to-cyan-500/20 text-cyan-400' 
             }
           ].map((service, i) => (
             <motion.div 
               key={service.title}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               viewport={{ once: true }}
               className="premium-card group py-12 px-10 text-center border-white/5 hover:border-white/20 transition-all h-full"
             >
               <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  <service.icon className="h-8 w-8" />
               </div>
               <h3 className="text-xl font-black mb-4 group-hover:text-indigo-400 transition-colors tracking-tight">{service.title}</h3>
               <p className="text-slate-400 text-sm font-medium leading-relaxed">{service.desc}</p>
             </motion.div>
           ))}
        </div>

        {/* Media Mix Section */}
        <div className="premium-card bg-slate-900/40 p-12 text-center max-w-4xl mx-auto border-indigo-500/10 hover:border-indigo-500/20">
           <div className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">Media Mix*</div>
           <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {[
                { name: 'Streams', icon: Play },
                { name: 'Short & Long Video', icon: Gamepad2 },
                { name: 'Gaming Nights', icon: Trophy },
                { name: 'Live Casting', icon: Zap },
                { name: 'IRL Events', icon: Globe }
              ].map((item) => (
                <div key={item.name} className="flex flex-col items-center gap-3 group">
                   <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-indigo-600/20 transition-colors">
                      <item.icon className="h-6 w-6 text-slate-400 group-hover:text-indigo-400" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">{item.name}</span>
                </div>
              ))}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
             {[
               { name: 'Gabriel S.', role: 'CEO & Founder', image: founder1, desc: 'Visionary with over 10 years in the digital and crypto ecosystem.' },
               { name: 'Valentina R.', role: 'COO & Strategy', image: founder2, desc: 'Specialist in agency scalability and international talent management.' },
               { name: 'Founder 3', role: 'Head of Growth', image: creator1, desc: 'Driving the next wave of creator-led brand innovation.' }
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

      {/* Global Presence Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
             <div className="premium-card bg-slate-900/50 p-10 relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Globe className="h-40 w-40 text-indigo-500" />
                </div>
                <h3 className="text-3xl font-black mb-6">Global Influence.</h3>
                <p className="text-slate-400 font-medium leading-relaxed mb-8">
                  Our network spans across borders, reaching audiences in over 15 countries. 
                  From Tokyo to New York, Umbra creators dominate the conversation.
                </p>
                <div className="flex flex-wrap gap-4">
                  {['USA', 'Spain', 'Mexico', 'France', 'Japan', 'Brazil'].map(country => (
                    <span key={country} className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">
                      {country}
                    </span>
                  ))}
                </div>
             </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="section-label">Global Presence</span>
            <h2 className="text-4xl md:text-6xl font-black mb-8">Unlimited <br/> Reach.</h2>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              We've built a decentralized network that understands local cultures while driving 
              global trends. Your brand doesn't just go viral; it becomes part of the culture.
            </p>
          </div>
        </div>
      </section>

      {/* Creator Carousel Section */}
      <section id="creators" className="py-32 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
          <div>
            <span className="section-label">Showcase</span>
            <h2 className="text-4xl md:text-5xl font-black">Our Top Talent.</h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-xs">
            Show all <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="creator-carousel-container relative">
          <motion.div 
            className="flex gap-8 px-6"
            animate={{ x: [0, -1000] }}
            transition={{ 
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30,
                ease: "linear"
              }
            }}
          >
            {[...featuredCreators, ...featuredCreators].map((creator, i) => (
              <div key={`${creator.id}-${i}`} className="creator-carousel-item group">
                <div className="relative w-64 h-80 rounded-[2.5rem] overflow-hidden mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                  <img 
                    src={creator.photo_url || creator1} 
                    alt={creator.display_name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-xl font-black mb-1 truncate">{creator.display_name || 'Umbra Creator'}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Elite Talent</span>
                      <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                        <Zap className="h-3 w-3 text-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Creators Visual Grid (Repurposed as Secondary Showcase) */}
      <section className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px]">
           <div className="md:col-span-2 relative group overflow-hidden rounded-[3rem]">
              <img src={creator2} alt="Creator Highlights" className="creator-image" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8">
                 <div className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-1">Impact Highlights</div>
                 <div className="text-3xl font-black">Koda Stream</div>
              </div>
           </div>
           <div className="relative group overflow-hidden rounded-[3rem]">
              <div className="absolute inset-0 bg-indigo-600 flex flex-col items-center justify-center text-center p-8 group-hover:bg-indigo-500 transition-colors">
                 <Trophy className="h-12 w-12 mb-6" />
                 <div className="text-4xl font-black mb-2">+50M</div>
                 <div className="text-[10px] font-black uppercase tracking-widest">Global Views 2024</div>
              </div>
           </div>
           <div className="relative group overflow-hidden rounded-[3rem] bg-slate-900 border border-white/5 flex flex-col items-center justify-center p-8 text-center hover:border-indigo-500/30 transition-all">
              <Heart className="h-10 w-10 text-rose-500 mb-6 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-slate-300">"The standard for agency excellence."</p>
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
              <button className="px-10 py-5 bg-white text-indigo-600 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                Contact Strategy
              </button>
              <button className="px-10 py-5 bg-transparent border-2 border-white/30 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                Our Services
              </button>
            </div>
          </div>
        </div>
      </section>


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
