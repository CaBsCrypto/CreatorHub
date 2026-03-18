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

const RankCard: React.FC<RankCardProps> = ({
  tiers,
  currentRankIndex,
  previewRankIndex,
  onPreviewRank,
  totalPosts,
  totalViews
}) => {
  const activeRank = previewRankIndex !== null ? tiers[previewRankIndex] : tiers[currentRankIndex];
  const nextRank = currentRankIndex < tiers.length - 1 ? tiers[currentRankIndex + 1] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 }}
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden bg-gradient-to-br transition-all duration-700 ${activeRank.color} p-6 rounded-3xl shadow-2xl border border-white/20 group h-full flex flex-col justify-between min-h-[300px] shadow-[0_20px_50px_rgba(0,0,0,0.2)]`}
      style={{
        boxShadow: activeRank.color.includes('indigo') ? '0 20px 50px -12px rgba(79, 70, 229, 0.4)' : 
                   activeRank.color.includes('rose') ? '0 20px 50px -12px rgba(225, 29, 72, 0.4)' :
                   activeRank.color.includes('teal') ? '0 20px 50px -12px rgba(13, 148, 136, 0.4)' :
                   '0 20px 50px -12px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Decorative patterns & Glows */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-50 transition-all duration-700 group-hover:scale-150" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-all duration-700 group-hover:rotate-12">
        <Globe className="h-28 w-28 text-white" />
      </div>
      
      <div className="relative z-10 space-y-4">
        {/* Header with Serial ID */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-white px-2.5 py-1 bg-black/20 backdrop-blur-md rounded-lg border border-white/10 tracking-[0.2em] uppercase">
                UBR-{activeRank.level}-ID
              </span>
              {previewRankIndex !== null && previewRankIndex !== currentRankIndex && (
                <span className="text-[9px] font-black text-yellow-300 uppercase tracking-widest px-2.5 py-1 bg-black/30 rounded-lg border border-yellow-500/30 animate-pulse">
                  Vista Previa
                </span>
              )}
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">{activeRank.name}</h3>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg">
            <activeRank.icon className="h-6 w-6 text-white animate-pulse" />
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-2">
          {activeRank.benefits.map((benefit, i) => {
            const isUnlocked = currentRankIndex >= (previewRankIndex !== null ? previewRankIndex : currentRankIndex);
            return (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-500 ${
                isUnlocked ? 'bg-white/10 border-white/20' : 'bg-black/10 border-white/5 opacity-50'
              }`}>
                {isUnlocked ? (
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-300" />
                ) : (
                  <Lock className="h-2.5 w-2.5 text-white/40" />
                )}
                <span className="text-[8px] font-bold text-white uppercase tracking-tighter truncate">{benefit}</span>
              </div>
            );
          })}
        </div>

        {/* Improved Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-end text-[9px] font-black text-white uppercase tracking-widest">
            <div className="flex flex-col">
              <span className="opacity-60 font-medium">Próximo Nivel</span>
              {nextRank?.name || 'Máximo Nivel'}
            </div>
            {nextRank && (
              <div className="text-right">
                <span className="text-white">{totalPosts} / {nextRank.minPosts}P</span>
                <span className="mx-1.5 opacity-30">|</span>
                <span className="text-white">{Math.round(totalViews/1000)}k / {Math.round(nextRank.minViews/1000)}k V</span>
              </div>
            )}
          </div>
          <div className="h-2.5 bg-black/20 rounded-full border border-white/5 relative overflow-hidden ring-1 ring-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, Math.max(8, 
                  nextRank 
                    ? ((totalPosts / nextRank.minPosts) * 100)
                    : 100
                ))}%` 
              }}
              className="h-full bg-gradient-to-r from-transparent via-white/40 to-white rounded-full relative"
            >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tier Switcher with Icons */}
      <div className="mt-5 space-y-4 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1.5 bg-black/10 backdrop-blur-md rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
            {tiers.map((tier, idx) => {
              const TierIcon = tier.icon;
              const isSelected = previewRankIndex === idx || (previewRankIndex === null && currentRankIndex === idx);
              const isLocked = idx > currentRankIndex;

              return (
                <button
                  key={idx}
                  onClick={() => onPreviewRank(idx)}
                  className={`relative flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-300 ${
                    isSelected 
                      ? 'bg-white text-indigo-600 shadow-xl scale-110 border border-white' 
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <TierIcon className={`h-4 w-4 ${isLocked && !isSelected ? 'opacity-30 grayscale' : ''}`} />
                  {isLocked && (
                    <div className="absolute -top-1 -right-1 p-0.5 bg-black/40 rounded-full ring-1 ring-white/20">
                      <Lock className="h-2 w-2 text-white/60" />
                    </div>
                  )}
                  {isSelected && (
                    <motion.div layoutId="tier-indicator" className="absolute -bottom-1 w-1 h-1 bg-indigo-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          
          {previewRankIndex !== null && previewRankIndex !== currentRankIndex && (
            <button 
              onClick={() => onPreviewRank(null)}
              className="whitespace-nowrap px-4 py-2 bg-white/10 hover:bg-white/20 text-[9px] font-black text-white uppercase tracking-widest rounded-xl border border-white/10 transition-all active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RankCard;
