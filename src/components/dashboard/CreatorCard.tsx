import React from 'react';
import { Wallet } from 'lucide-react';
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
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={onViewProfile}
      className="group relative bg-white rounded-[2rem] border border-gray-100 p-6 hover:border-indigo-100 hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden shadow-sm"
    >
      {/* Subtle glow on hover */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-all duration-1000" />

      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar & Rank Badge */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 p-0.5 group-hover:border-indigo-200 transition-all duration-500">
                <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                  {(creator as any).photo_url ? (
                    <img src={(creator as any).photo_url} alt={creator.name} className="w-full h-full object-cover transition-all duration-700" />
                  ) : (
                    <span className="text-xl font-black text-indigo-400 group-hover:text-indigo-600 transition-colors">
                      {creator.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
                <RankIcon className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            {/* Name and Rank */}
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                {creator.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 w-fit">
                {creator.rank.name}
              </span>
            </div>
          </div>

          {/* Wallet Status */}
          <div className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-500 ${
            creator.paymentId
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
              : 'bg-gray-50 border-gray-100 text-slate-400'
          }`}>
            <Wallet className="h-4 w-4" />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vistas</span>
            <span className="text-2xl font-black text-slate-900 leading-none tabular-nums">
              {creator.views.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Posts</span>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-slate-900 leading-none tabular-nums">
                {creator.contentCount}
              </span>
              {creator.totalPaid !== undefined && creator.totalPaid > 0 && (
                <span className="text-[10px] font-black text-emerald-600 leading-none pb-0.5">
                  +${creator.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </motion.div>
  );
});

export default CreatorCard;
