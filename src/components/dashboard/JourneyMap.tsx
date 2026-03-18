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
    <div className="bg-white/50 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] p-8 relative overflow-hidden group/journey">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 leading-tight">Mi Camino en Umbra</h2>
          <p className="text-sm text-gray-500 font-medium">Visualiza tu ascenso en las jerarquías de la agencia.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100">
          <Trophy className="h-4 w-4 text-indigo-500" />
          <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
            {tiers[currentRankIndex].name}
          </span>
        </div>
      </div>

      <div className="relative mt-4">
        {/* Path Line */}
        <div className="absolute top-[34px] left-8 right-8 h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentRankIndex / (tiers.length - 1)) * 100}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
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
                  whileHover={{ scale: 1.15, y: -2 }}
                  className={`
                    relative z-10 w-16 h-16 rounded-3xl flex items-center justify-center border-4 transition-all duration-500 cursor-help
                    ${isPast ? 'bg-white border-indigo-500 shadow-lg shadow-indigo-100' : ''}
                    ${isCurrent ? `bg-gradient-to-br ${tier.color} border-white shadow-2xl ring-4 ring-indigo-50` : ''}
                    ${isFuture ? 'bg-white border-slate-100 text-slate-300' : ''}
                  `}
                >
                  {isPast ? (
                    <CheckCircle2 className="h-8 w-8 text-indigo-500" />
                  ) : (
                    <TierIcon className={`h-8 w-8 ${isCurrent ? 'text-white translate-y-[-2px]' : ''}`} />
                  )}

                  {/* Meta Popover */}
                  <div className="absolute bottom-full mb-6 opacity-0 group-hover/node:opacity-100 pointer-events-none transition-all duration-300 translate-y-4 group-hover/node:translate-y-0 z-50">
                    <div className="bg-slate-900 border border-white/10 p-5 rounded-[2rem] shadow-2xl min-w-[220px] backdrop-blur-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                          <TierIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nivel {tier.level}</p>
                          <p className="text-xs font-black text-white">{tier.name}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-white/60">Posts req.</span>
                          <span className="text-white font-bold">{tier.minPosts}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-white/60">Vistas req.</span>
                          <span className="text-white font-bold">{tier.minViews.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Privilegios:</p>
                        {tier.benefits.map((benefit, bIdx) => (
                          <p key={bIdx} className="text-[10px] text-emerald-400 flex items-center gap-1.5 py-0.5">
                            <Sparkles className="h-2.5 w-2.5" />
                            {benefit}
                          </p>
                        ))}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                </motion.div>

                <div className="mt-4 text-center max-w-[80px]">
                  <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isCurrent ? 'text-indigo-600' : isPast ? 'text-slate-900' : 'text-slate-300'}`}>
                    {tier.name.split(' ')[0]}
                  </p>
                  <p className={`text-[8px] font-bold uppercase mt-1 ${isCurrent ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {tier.name.split(' ')[1] || ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Under Construction Overlay */}
      <div className="absolute inset-0 z-40 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 transition-all duration-500 opacity-0 group-hover/journey:opacity-100">
        <div className="bg-indigo-600 text-white px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center gap-3">
           <Sparkles className="h-4 w-4" /> Próximamente
        </div>
        <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Estamos expandiendo el mapa de ruta.
        </p>
      </div>
    </div>
  );
};

export default JourneyMap;
