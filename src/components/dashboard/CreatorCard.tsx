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
  onEditAudience?: () => void;
  onViewProfile?: () => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, index, onEditAudience, onViewProfile }) => {
  const RankIcon = creator.rank.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onViewProfile}
      className="group bg-white rounded-[2.5rem] border border-gray-100 p-6 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 relative overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-95"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${creator.rank.color} opacity-5 group-hover:opacity-10 rounded-full -mr-8 -mt-8 transition-opacity duration-500`} />

      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
        {/* Avatar & Rank */}
        <div className="relative shrink-0">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${creator.rank.color} p-1 shadow-lg`}>
            <div className="w-full h-full bg-white rounded-[1.25rem] flex items-center justify-center overflow-hidden">
              <User className="h-10 w-10 text-gray-200" />
            </div>
          </div>
          <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-gradient-to-br ${creator.rank.color} flex items-center justify-center border-2 border-white shadow-md`}>
            <RankIcon className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{creator.name}</h3>
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gradient-to-r ${creator.rank.color} text-white`}>
              {creator.rank.name}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium flex items-center justify-center sm:justify-start gap-1.5">
            <Globe className="h-3 w-3" /> ID: {creator.creator_id.slice(0, 8)}...
          </p>

          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-black text-gray-900 leading-none">{creator.views.toLocaleString()}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Vistas Totales</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-gray-900 leading-none">{creator.contentCount}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Posts</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-emerald-600 leading-none">${creator.estimatedValue.toFixed(2)}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">ROI Est.</span>
            </div>
            {creator.totalPaid !== undefined && creator.totalPaid > 0 && (
              <>
                <div className="w-[1px] h-8 bg-gray-100" />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-indigo-600 leading-none">${creator.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Pagado</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment & Actions */}
        <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${creator.paymentId ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} transition-colors`}>
            <Wallet className={`h-3.5 w-3.5 ${creator.paymentId ? 'text-emerald-500' : 'text-amber-500'}`} />
            <div className="flex flex-col">
              <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${creator.paymentId ? 'text-emerald-700' : 'text-amber-700'}`}>
                {creator.paymentMethod === 'binance' ? 'Binance Pay' : 'Wallet'}
              </span>
              {creator.paymentId && (
                <span className="text-[7px] font-bold text-emerald-600/80 mt-0.5 font-mono">
                  {creator.paymentId.length > 10 
                    ? `${creator.paymentId.slice(0, 6)}...${creator.paymentId.slice(-4)}` 
                    : creator.paymentId}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
             Ver Perfil <ExternalLink className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreatorCard;
