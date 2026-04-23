import React, { useState } from 'react';
import {
  X, Search, Youtube, Instagram, Twitter,
  Globe, Zap, Users, ShieldCheck, Sparkles,
  ExternalLink, ArrowRight, RefreshCw, AlertCircle, TrendingUp, Target, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabase';

interface CreatorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORMS = [
  { id: 'twitch', label: 'Twitch', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'tiktok', label: 'TikTok', icon: Zap, color: 'text-gray-900', bg: 'bg-gray-100' }
];

export default function CreatorSearchModal({ isOpen, onClose }: CreatorSearchModalProps) {
  const [username, setUsername] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('twitch');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/analyze-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ username, platform: selectedPlatform })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error al analizar el creador');
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-3xl bg-slate-950/80 backdrop-blur-xl ring-1 ring-white/10 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-emerald-500 to-cyan-500" />
        
        {/* Modal Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
              Agent <span className="text-emerald-500">Intelligence</span>
              <Sparkles className="h-6 w-6 text-amber-400" />
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Deep profile investigation and real-time neural metrics.</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/5 text-slate-400 transition-all hover:rotate-90">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-8 pb-8 flex-1 overflow-y-auto no-scrollbar">
          {/* Search Inputs */}
          <form onSubmit={handleSearch} className="space-y-6 mb-8">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
              <div className="flex flex-wrap gap-2 mb-6">
                {PLATFORMS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedPlatform === p.id 
                      ? `bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/50` 
                      : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-white/5 shadow-sm'
                    }`}
                  >
                    <p.icon className="h-4 w-4" />
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder={selectedPlatform === 'youtube' ? "@handle or channel URL" : "Username or profile URL..."}
                  className="w-full pl-14 pr-32 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all outline-none font-mono"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={isSearching || !username}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSearching ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                  Deploy Scan
                </button>
              </div>
            </div>
          </form>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-3xl border-4 border-white/5 border-t-emerald-500 animate-spin" />
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-pulse" />
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Consulting Neural Networks...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-rose-500/5 rounded-[2rem] border border-rose-500/20 flex flex-col items-center text-center gap-3"
              >
                <AlertCircle className="h-10 w-10 text-rose-500" />
                <div>
                  <h4 className="font-black text-rose-400 uppercase text-[10px] tracking-widest mb-1">Incomplete Extraction</h4>
                  <p className="text-sm text-rose-300 font-medium">{error}</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Profile Header *                {/* Profile Header */}
                <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/10 shadow-sm relative overflow-hidden group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-900 overflow-hidden ring-4 ring-white/5 flex-shrink-0 border border-white/5">
                    {result.image ? (
                      <img src={result.image} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-500/10 text-indigo-400">
                        <Users className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-black text-white truncate uppercase tracking-tight">{result.username}</h3>
                      <button className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-3">{result.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/5 text-slate-400 border border-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        {result.platform}
                      </span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {result.region || 'Global'}
                      </span>
                    </div>
                  </div>
                </div>


                {/* Stats Grid - Monthly Focus */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 shadow-sm flex flex-col items-center text-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Agents / Subs</p>
                      <p className="text-lg font-black text-white font-mono">{typeof result.followers === 'number' ? result.followers.toLocaleString() : result.followers}</p>
                    </div>
                  </div>
                  
                  {result.platform === 'twitch' ? (
                    <>
                      <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 shadow-sm flex flex-col items-center text-center gap-2">
                        <Globe className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Peak</p>
                          <p className="text-lg font-black text-white font-mono">{result.avgViewers?.toLocaleString() || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 shadow-sm flex flex-col items-center text-center gap-2">
                        <Zap className="h-5 w-5 text-amber-400" />
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Uptime (30d)</p>
                          <p className="text-lg font-black text-white font-mono">{result.hoursStreamed}h</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 shadow-sm flex flex-col items-center text-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Reach</p>
                        <p className="text-lg font-black text-white font-mono">{result.monthlyReach?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 shadow-sm flex flex-col items-center text-center gap-2">
                    <Zap className="h-5 w-5 text-rose-400" />
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engagement</p>
                      <p className="text-lg font-black text-white uppercase tracking-tighter">{result.engagement || 'STABLE'}</p>
                    </div>
                  </div>
                </div>

                {/* AI Summary Section */}
                {result.summary && (
                  <div className="p-8 bg-indigo-600/20 border border-indigo-500/30 rounded-[2.5rem] text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl -ml-24 -mb-24" />
                    
                    <div className="relative z-10">
                      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4">
                        <Sparkles className="h-4 w-4" /> Strategic Impact Assessment
                      </h4>
                      <div className="text-lg font-medium leading-relaxed italic opacity-95 text-slate-200">
                        {result.summary}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center text-center gap-4"
              >
                <div className="w-20 h-20 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center justify-center">
                  <Search className="h-10 w-10 text-slate-700" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 max-w-xs">Initialize agent search to unlock potential stats.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
