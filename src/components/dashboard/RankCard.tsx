import React from 'react';
import { LucideIcon, Lock, CheckCircle2, Globe, RefreshCw, Zap } from 'lucide-react';
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05, duration: 0.5 }}
      className="relative overflow-hidden bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 group h-full flex flex-col justify-between min-h-[350px] shadow-sm hover:border-indigo-100 transition-all duration-300"
    >
      {/* Decorative Elements */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:bg-indigo-100 transition-all duration-1000" />
      
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 tracking-widest uppercase">
                Creator Passport
              </span>
              <span className="text-[9px] font-black text-slate-400 px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-100 tracking-widest uppercase">
                LVL-0{activeRank.level}
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{activeRank.name}</h3>
          </div>
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
            <activeRank.icon className="h-6 w-6 text-indigo-600" />
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-2">
          {activeRank.benefits.map((benefit, i) => {
            const isUnlocked = currentRankIndex >= (previewRankIndex !== null ? previewRankIndex : currentRankIndex);
            return (
              <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-300 ${
                isUnlocked ? 'bg-indigo-50/30 border-indigo-50' : 'bg-gray-50 border-gray-100 opacity-50'
              }`}>
                {isUnlocked ? (
                  <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                ) : (
                  <Lock className="h-3 w-3 text-slate-400" />
                )}
                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tight truncate">{benefit}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 pt-4">
          <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-widest">
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 italic">Siguiente Rango</span>
              <span className="text-indigo-600">{nextRank?.name || 'NIVEL MÁXIMO'}</span>
            </div>
            {nextRank && (
              <div className="text-right">
                <span className="text-slate-900 font-mono">{totalPosts} / {nextRank.minPosts}P</span>
                <span className="mx-2 text-slate-200">|</span>
                <span className="text-slate-900 font-mono">{Math.round(totalViews/1000)}k / {Math.round(nextRank.minViews/1000)}k V</span>
              </div>
            )}
          </div>
          <div className="h-2 bg-gray-50 rounded-full border border-gray-100 relative overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, Math.max(5, 
                  nextRank 
                    ? ((totalPosts / nextRank.minPosts) * 100)
                    : 100
                ))}%` 
              }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Tier Switcher */}
      <div className="mt-8 flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
          {tiers.map((tier, idx) => {
            const TierIcon = tier.icon;
            const isSelected = previewRankIndex === idx || (previewRankIndex === null && currentRankIndex === idx);
            const isLocked = idx > currentRankIndex;

            return (
              <button
                key={idx}
                onClick={() => onPreviewRank(idx)}
                className={`relative flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-300 ${
                  isSelected 
                    ? 'bg-white text-indigo-600 shadow-md border border-gray-100' 
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-white'
                }`}
              >
                <TierIcon className={`h-5 w-5 ${isLocked && !isSelected ? 'opacity-30' : ''}`} />
                {isLocked && (
                  <div className="absolute -top-1 -right-1 p-0.5 bg-white rounded-full border border-gray-100">
                    <Lock className="h-2 w-2 text-slate-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {previewRankIndex !== null && previewRankIndex !== currentRankIndex && (
          <button 
            onClick={() => onPreviewRank(null)}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest rounded-xl border border-gray-100 transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="h-3 w-3 text-indigo-500" />
            Reiniciar
          </button>
        )}
      </div>

      {/* Modern Overlay for Future Features */}
      <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
        <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-5 shadow-xl">
          <Zap className="h-8 w-8 text-indigo-600 animate-pulse" />
        </div>
        <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase">Próximamente</h4>
        <div className="px-5 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100 mb-4">
          Sistema de Beneficios
        </div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight max-w-[200px] leading-relaxed italic opacity-70">
          Estamos activando las recompensas exclusivas por rango.
        </p>
      </div>
    </motion.div>
  );
});

export default RankCard;
