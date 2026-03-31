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

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, index, userRole, onEditAudience, onViewProfile }) => {
  const RankIcon = creator.rank.icon;
  
  // Refined border classes based on role with soft shadows
  const borderClass = userRole === 'admin' 
    ? 'border-rose-200 shadow-sm shadow-rose-50/50' 
    : userRole === 'manager' 
      ? 'border-amber-200 shadow-sm shadow-amber-50/50' 
      : 'border-slate-100 shadow-sm shadow-slate-50/50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onViewProfile}
      className={`group bg-white rounded-[2.5rem] border ${borderClass} p-6 sm:p-7 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:border-indigo-200 transition-all duration-500 relative overflow-hidden cursor-pointer hover:-translate-y-1`}
    >
      {/* Decorative gradient blob */}
      <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${creator.rank.color} opacity-[0.03] group-hover:opacity-10 rounded-full transition-opacity duration-700 blur-2xl`} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Avatar & Rank Badge */}
            <div className="relative shrink-0">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${creator.rank.color} p-[2.5px] shadow-sm transform group-hover:rotate-3 transition-transform duration-500`}>
                <div className="w-full h-full bg-white rounded-[0.85rem] flex items-center justify-center overflow-hidden">
                  <User className="h-7 w-7 text-gray-200 group-hover:text-gray-300 transition-colors" />
                </div>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-gradient-to-br ${creator.rank.color} flex items-center justify-center border-2 border-white shadow-md`}>
                <RankIcon className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            {/* Name and ID */}
            <div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight tracking-tight">
                  {creator.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r ${creator.rank.color} text-white shadow-sm`}>
                    {creator.rank.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                   <Globe className="h-3 w-3 text-gray-300" />
                   <span className="text-[10px] font-bold text-gray-400/80 font-mono tracking-tighter">ID: {creator.creator_id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet / Payment Indicator */}
          <div className={`flex items-center justify-center w-10 h-10 rounded-2xl border transition-all duration-300 ${
            creator.paymentId 
              ? 'bg-amber-50 border-amber-100 text-amber-500 shadow-sm shadow-amber-100/50' 
              : 'bg-slate-50 border-slate-100 text-slate-300'
          }`}>
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        {/* Metrics Section - Vertical Stack matching screenshot */}
        <div className="flex flex-col gap-5 flex-1">
          {/* Main Metric: Views */}
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900 leading-none tracking-tight">
              {creator.views.toLocaleString()}
            </span>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase mt-1.5 tracking-[0.1em]">
              Vistas Totales
            </span>
          </div>

          {/* Posts */}
          <div className="flex flex-col">
            <span className="text-xl font-black text-gray-800 leading-none">
              {creator.contentCount}
            </span>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase mt-1.5 tracking-[0.1em]">
              Posts
            </span>
          </div>

          {/* ROI Est. */}
          <div className="flex flex-col">
            <span className="text-xl font-black text-emerald-600 leading-none">
              ${creator.estimatedValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase mt-1.5 tracking-[0.1em]">
              ROI Est.
            </span>
          </div>

          {/* Pagado - Conditional */}
          {creator.totalPaid !== undefined && creator.totalPaid > 0 && (
            <div className="flex flex-col animate-in fade-in slide-in-from-top-2 duration-700">
              <span className="text-xl font-black text-indigo-600 leading-none">
                ${creator.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase mt-1.5 tracking-[0.1em]">
                Pagado
              </span>
            </div>
          )}
        </div>

        {/* Bottom Action Hint */}
        <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
           Ver Perfil completo <ExternalLink className="h-3.5 w-3.5" />
        </div>
      </div>
    </motion.div>
  );
};

export default CreatorCard;
