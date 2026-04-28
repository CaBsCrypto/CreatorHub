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
    <div className="bg-white rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-12 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">Ruta de Crecimiento</h2>
          <p className="text-sm text-slate-500 font-medium">Visualiza tu progreso y próximos beneficios en la agencia.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
          <Trophy className="h-4 w-4 text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
            {tiers[currentRankIndex].name}
          </span>
        </div>
      </div>

      <div className="relative mt-12 pb-8 overflow-x-auto no-scrollbar lg:overflow-visible">
        {/* Path Line */}
        <div className="absolute top-[39px] left-10 right-10 h-1 bg-gray-50 rounded-full overflow-hidden border border-gray-100 hidden sm:block">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentRankIndex / (tiers.length - 1)) * 100}%` }}
            className="h-full bg-indigo-600 rounded-full"
          />
        </div>

        <div className="relative flex justify-between items-start min-w-[600px] sm:min-w-0">
          {tiers.map((tier, idx) => {
            const isPast = idx < currentRankIndex;
            const isCurrent = idx === currentRankIndex;
            const isFuture = idx > currentRankIndex;
            const TierIcon = tier.icon;

            return (
              <div key={idx} className="flex flex-col items-center group/node relative">
                <motion.div
                  whileHover={{ scale: 1.1, y: -4 }}
                  className={`
                    relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-300
                    ${isPast ? 'bg-indigo-50 border-indigo-100 shadow-sm' : ''}
                    ${isCurrent ? 'bg-indigo-600 border-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50' : ''}
                    ${isFuture ? 'bg-white border-gray-100 text-slate-400' : ''}
                  `}
                >
                  {isPast ? (
                    <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                  ) : (
                    <TierIcon className={`h-8 w-8 ${isCurrent ? 'text-white' : ''}`} />
                  )}

                  {/* Benefit Popover */}
                  <div className="absolute bottom-full mb-6 opacity-0 group-hover/node:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/node:translate-y-0 z-50">
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-2xl min-w-[240px]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                          <TierIcon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nivel 0{tier.level}</p>
                          <p className="text-base font-black text-slate-900 uppercase tracking-tight">{tier.name}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">Requisito Posts</span>
                          <span className="text-indigo-600">{tier.minPosts}</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">Requisito Vistas</span>
                          <span className="text-indigo-600">{tier.minViews.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-50">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Beneficios:</p>
                        {tier.benefits.map((benefit, bIdx) => (
                          <p key={bIdx} className="text-[10px] text-slate-600 flex items-center gap-2 py-0.5 font-bold">
                            <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                            {benefit}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="mt-4 text-center">
                  <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isCurrent ? 'text-indigo-600' : 'text-slate-900'}`}>
                    {tier.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-50/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default JourneyMap;
