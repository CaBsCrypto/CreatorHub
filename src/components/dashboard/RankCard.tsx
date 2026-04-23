import React from 'react';
import { LucideIcon, Lock, CheckCircle2, Globe, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Tier {
  name: string;
  level: number;
  minPosts: number;
  minViews: number;
  color: string;
  icon: LucideIcon;
  benefits: string[];
}

interface RankCardProps {
  tiers: Tier[];
  currentRankIndex: number;
  previewRankIndex: number | null;
  onPreviewRank: (index: number | null) => void;
  totalPosts: number;
  totalViews: number;
}

const RankCard = React.memo(({
  tiers,
  currentRankIndex,
  previewRankIndex,
  onPreviewRank,
  totalPosts,
  totalViews
}: RankCardProps) => {
  const activeRank = previewRankIndex !== null ? tiers[previewRankIndex] : tiers[currentRankIndex];
  const nextRank = currentRankIndex < tiers.length - 1 ? tiers[currentRankIndex + 1] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden transition-all duration-700 bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/10 group h-full flex flex-col justify-between min-h-[350px] shadow-2xl`}
    >
      {/* Decorative patterns & Glows */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl opacity-50 transition-all duration-1000 group-hover:scale-150 group-hover:bg-emerald-500/20" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />
      
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-1000 group-hover:rotate-12">
        <Globe className="h-40 w-40 text-emerald-500" />
      </div>
      
      <div className="relative z-10 space-y-6">
        {/* Header with Serial ID */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-500/20 tracking-widest uppercase">
                Umbra Passport
              </span>
              <span className="text-[9px] font-black text-slate-500 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 tracking-[0.3em] uppercase">
                UBR-0{activeRank.level}
              </span>
            </div>
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase">{activeRank.name}</h3>
          </div>
          <div className="p-4 bg-emerald-500/10 backdrop-blur-xl rounded-2xl border border-emerald-500/20 shadow-xl group-hover:scale-110 transition-transform duration-500">
            <activeRank.icon className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-3">
          {activeRank.benefits.map((benefit, i) => {
            const isUnlocked = currentRankIndex >= (previewRankIndex !== null ? previewRankIndex : currentRankIndex);
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-700 ${
                isUnlocked ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-slate-900/50 border-white/5 opacity-40'
              }`}>
                {isUnlocked ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Lock className="h-3 w-3 text-slate-500" />
                )}
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest truncate">{benefit}</span>
              </div>
            );
          })}
        </div>

        {/* Improved Progress Bar */}
        <div className="space-y-3 pt-4">
          <div className="flex justify-between items-end text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            <div className="flex flex-col gap-1">
              <span className="opacity-40 italic">Next evolution</span>
              <span className="text-emerald-500">{nextRank?.name || 'MAX_LEVEL'}</span>
            </div>
            {nextRank && (
              <div className="text-right">
                <span className="text-white">{totalPosts} / {nextRank.minPosts}P</span>
                <span className="mx-2 opacity-20">|</span>
                <span className="text-white">{Math.round(totalViews/1000)}k / {Math.round(nextRank.minViews/1000)}k V</span>
              </div>
            )}
          </div>
          <div className="h-2 bg-slate-950 rounded-full border border-white/5 relative overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, Math.max(5, 
                  nextRank 
                    ? ((totalPosts / nextRank.minPosts) * 100)
                    : 100
                ))}%` 
              }}
              className="h-full bg-gradient-to-r from-emerald-600 to-cyan-500 rounded-full relative"
            >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_2s_linear_infinite]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tier Switcher */}
      <div className="mt-8 flex items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-2 p-2 bg-slate-950/50 backdrop-blur-md rounded-[1.5rem] border border-white/5 overflow-x-auto no-scrollbar">
          {tiers.map((tier, idx) => {
            const TierIcon = tier.icon;
            const isSelected = previewRankIndex === idx || (previewRankIndex === null && currentRankIndex === idx);
            const isLocked = idx > currentRankIndex;

            return (
              <button
                key={idx}
                onClick={() => onPreviewRank(idx)}
                className={`relative flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-500 ${
                  isSelected 
                    ? 'bg-white text-slate-950 scale-110 shadow-xl' 
                    : 'text-slate-600 hover:text-emerald-400 hover:bg-white/5'
                }`}
              >
                <TierIcon className={`h-5 w-5 ${isLocked && !isSelected ? 'opacity-30 grayscale' : ''}`} />
                {isLocked && (
                  <div className="absolute -top-1 -right-1 p-0.5 bg-slate-900 rounded-full border border-white/10">
                    <Lock className="h-2 w-2 text-slate-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {previewRankIndex !== null && previewRankIndex !== currentRankIndex && (
          <button 
            onClick={() => onPreviewRank(null)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-[9px] font-black text-white uppercase tracking-widest rounded-xl border border-white/10 transition-all flex items-center gap-3"
          >
            <RefreshCw className="h-3 w-3 text-emerald-500" />
            Reset_System
          </button>
        )}
      </div>

      {/* Under Construction Overlay */}
      <div className="absolute inset-0 z-50 bg-slate-950/40 backdrop-blur-[8px] flex flex-col items-center justify-center p-10 text-center group/overlay transition-all duration-700 hover:backdrop-blur-[12px]">
        <div className="w-20 h-20 bg-slate-900/80 border border-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover/overlay:scale-110 group-hover/overlay:border-emerald-500/30 transition-all duration-1000">
          <Lock className="h-10 w-10 text-emerald-500 animate-pulse" />
        </div>
        <h4 className="text-2xl font-black text-white tracking-tighter mb-3 uppercase">Node_Access_Locked</h4>
        <div className="px-6 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-2xl border border-white/20 mb-6">
          Initializing Protocol
        </div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] max-w-[240px] leading-relaxed italic">
          Activando beneficios exclusivos por rango y recompensas de red.
        </p>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </motion.div>
  );
});

export default RankCard;
