import React from 'react';
import { LucideIcon, Trophy, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tier } from './RankCard';

interface JourneyMapProps {
  tiers: Tier[];
  currentRankIndex: number;
}

const JourneyMap: React.FC<JourneyMapProps> = ({ tiers, currentRankIndex }) => {
  return (
    <div className="glass-dark rounded-[3rem] p-10 relative overflow-hidden group/journey border-white/5">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter">Roadmap_Evolution</h2>
          <p className="text-sm text-slate-500 font-medium">Visualiza tu ascenso en las jerarquías de la agencia.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <Trophy className="h-4 w-4 text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            {tiers[currentRankIndex].name}
          </span>
        </div>
      </div>

      <div className="relative mt-12 pb-8">
        {/* Path Line */}
        <div className="absolute top-[39px] left-10 right-10 h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentRankIndex / (tiers.length - 1)) * 100}%` }}
            className="h-full bg-gradient-to-r from-emerald-600 via-cyan-500 to-emerald-600 rounded-full"
          />
        </div>

        <div className="relative flex justify-between items-start">
          {tiers.map((tier, idx) => {
            const isPast = idx < currentRankIndex;
            const isCurrent = idx === currentRankIndex;
            const isFuture = idx > currentRankIndex;
            const TierIcon = tier.icon;

            return (
              <div key={idx} className="flex flex-col items-center group/node relative">
                <motion.div
                  whileHover={{ scale: 1.2, y: -4 }}
                  className={`
                    relative z-10 w-20 h-20 rounded-[2rem] flex items-center justify-center border-4 transition-all duration-700 cursor-help
                    ${isPast ? 'bg-slate-950 border-emerald-500/50 shadow-2xl shadow-emerald-900/20' : ''}
                    ${isCurrent ? `bg-gradient-to-br from-emerald-600 to-cyan-600 border-white shadow-2xl shadow-emerald-500/40 ring-8 ring-emerald-500/5` : ''}
                    ${isFuture ? 'bg-slate-900 border-white/5 text-slate-700' : ''}
                  `}
                >
                  {isPast ? (
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  ) : (
                    <TierIcon className={`h-10 w-10 ${isCurrent ? 'text-white' : ''}`} />
                  )}

                  {/* Meta Popover */}
                  <div className="absolute bottom-full mb-8 opacity-0 group-hover/node:opacity-100 pointer-events-none transition-all duration-500 translate-y-4 group-hover/node:translate-y-0 z-50">
                    <div className="bg-slate-950 border border-white/10 p-6 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] min-w-[260px] backdrop-blur-3xl">
                      <div className="flex items-center gap-4 mb-5">
                        <div className={`w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20`}>
                          <TierIcon className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Nivel 0{tier.level}</p>
                          <p className="text-lg font-black text-white uppercase tracking-tighter">{tier.name}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">Min_Content</span>
                          <span className="text-emerald-400">{tier.minPosts}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">Min_Impact</span>
                          <span className="text-emerald-400">{tier.minViews.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-3 italic">Node_Benefits:</p>
                        {tier.benefits.map((benefit, bIdx) => (
                          <p key={bIdx} className="text-[10px] text-slate-300 flex items-center gap-3 py-1 font-medium">
                            <Sparkles className="h-3 w-3 text-emerald-500" />
                            {benefit}
                          </p>
                        ))}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[12px] border-transparent border-t-slate-950" />
                    </div>
                  </div>
                </motion.div>

                <div className="mt-6 text-center max-w-[100px]">
                  <p className={`text-[10px] font-black uppercase tracking-[0.3em] leading-none ${isCurrent ? 'text-emerald-400' : isPast ? 'text-white' : 'text-slate-700'}`}>
                    {tier.name.split(' ')[0]}
                  </p>
                  <p className={`text-[8px] font-bold uppercase mt-1.5 opacity-60 ${isCurrent ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {tier.name.split(' ')[1] || ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Under Construction Overlay */}
      <div className="absolute inset-0 z-40 bg-slate-950/20 backdrop-blur-[6px] flex flex-col items-center justify-center text-center p-10 transition-all duration-700 opacity-0 group-hover/journey:opacity-100">
        <div className="bg-emerald-600 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl flex items-center gap-4 border border-white/20">
           <Sparkles className="h-4 w-4" /> System_Expanding
        </div>
        <p className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
          Actualizando mapa de ruta institucional.
        </p>
      </div>
    </div>
  );
};

export default JourneyMap;
