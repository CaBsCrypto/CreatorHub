import React from 'react';
import { User, Wallet, TrendingUp, BarChart3, ExternalLink, Globe, Award, Zap, Trophy, Flame, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreatorCardProps {
  creator: {
    creator_id: string;
    name: string;
    paymentMethod?: string;
    paymentId?: string;
    views: number;
    engagement: number;
    contentCount: number;
    estimatedValue: number;
    totalPaid?: number;
    rank: {
      name: string;
      level: number;
      color: string;
      icon: any;
    };
  };
  index: number;
  userRole?: string;
  onEditAudience?: () => void;
  onViewProfile?: () => void;
}

const CreatorCard = React.memo(({ creator, index, userRole, onEditAudience, onViewProfile }: CreatorCardProps) => {
  const RankIcon = creator.rank.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      onClick={onViewProfile}
      className={`group relative bg-white rounded-[2rem] border border-gray-100 p-8 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer overflow-hidden`}
    >
      <div className={`absolute -top-24 -right-24 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-all duration-700`} />

      <div className="relative z-10 flex flex-col">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 p-1 group-hover:border-indigo-100 transition-all duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                  {(creator as any).photo_url ? (
                    <img src={(creator as any).photo_url} alt={creator.name} className="w-full h-full object-cover transition-all duration-500" />
                  ) : (
                    <span className="text-2xl font-black text-indigo-200 group-hover:text-indigo-600 transition-colors">
                      {creator.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                <RankIcon className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">
                {creator.name}
              </h3>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-50 text-slate-500">
                  {creator.rank.name}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-[10px] font-black text-slate-400 font-mono tracking-widest uppercase">ID: <span className="text-indigo-600/60">{creator.creator_id.slice(0, 8)}</span></span>
              </div>
            </div>
          </div>

          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl border transition-all duration-300 ${
            creator.paymentId 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
              : 'bg-gray-50 border-gray-100 text-slate-300'
          }`}>
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vistas Totales</span>
            <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter tabular-nums">
              {creator.views.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contenidos</span>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter tabular-nums">
                {creator.contentCount}
              </span>
              {creator.totalPaid !== undefined && creator.totalPaid > 0 && (
                <div className="flex flex-col items-end pb-0.5">
                  <span className="text-[10px] font-black text-emerald-600 leading-none">
                    +${creator.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </motion.div>
  );
});

export default CreatorCard;
