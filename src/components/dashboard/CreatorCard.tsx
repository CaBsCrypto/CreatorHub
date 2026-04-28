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
  
  const roleIndicator = userRole === 'admin' 
    ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
    : userRole === 'manager' 
      ? 'border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
      : 'border-slate-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onClick={onViewProfile}
      className={`group relative glass-dark rounded-[2.5rem] border ${roleIndicator} p-8 hover:border-emerald-500/40 transition-all duration-700 cursor-pointer overflow-hidden`}
    >
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
      
      {/* Glow Effect */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-50 transition-all duration-1000`} />

      <div className="relative z-10 flex flex-col">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-5">
            {/* Avatar & Rank Badge */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 p-1 group-hover:border-indigo-200 transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3">
                <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden">
                  {(creator as any).photo_url ? (
                    <img src={(creator as any).photo_url} alt={creator.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700" />
                  ) : (
                    <span className="text-2xl font-black text-indigo-600/50 group-hover:text-indigo-600 transition-colors">
                      {creator.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center border-4 border-slate-950 shadow-2xl group-hover:scale-110 transition-transform">
                <RankIcon className="h-4 w-4 text-slate-950" />
              </div>
            </div>

            {/* Name and ID */}
            <div className="flex flex-col gap-1.5">
              <h3 className="text-2xl font-black text-white tracking-tighter leading-none group-hover:text-indigo-600 transition-colors">
                {creator.name}
              </h3>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-white text-slate-950 italic">
                  {creator.rank.name}_PROTOCOL
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-[10px] font-black text-slate-600 font-mono tracking-widest uppercase">NODE_ID: <span className="text-indigo-600/40">{creator.creator_id.slice(0, 8)}</span></span>
              </div>
            </div>
          </div>

          {/* Wallet / Status */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl border transition-all duration-500 ${
            creator.paymentId 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
              : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">Views_Aggregated</span>
            <span className="text-3xl font-black text-white leading-none tracking-tighter tabular-nums">
              {creator.views.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">Content_Nodes</span>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-white leading-none tracking-tighter tabular-nums">
                {creator.contentCount}
              </span>
              {creator.totalPaid !== undefined && creator.totalPaid > 0 && (
                <div className="flex flex-col items-end pb-0.5">
                  <span className="text-[10px] font-black text-indigo-600 leading-none">
                    +${creator.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Reveal Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
      </div>
    </motion.div>
  );
});

export default CreatorCard;
