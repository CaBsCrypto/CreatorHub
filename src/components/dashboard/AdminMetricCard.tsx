import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  color?: string;
  delay?: number;
  onClick?: () => void;
}

const AdminMetricCard = React.memo(({
  title,
  value,
  trend,
  icon: Icon,
  color,
  delay = 0,
  onClick
}: AdminMetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      onClick={onClick}
      className={`group relative overflow-hidden bg-white/[0.03] p-6 rounded-2xl border border-white/5 shadow-sm hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-95' : ''} hover:border-red-500/20`}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-700" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-950/20 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-5 w-5 text-red-500" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              trend.isPositive
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}>
              {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}%
            </div>
          )}
        </div>

        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tight leading-none">{value}</h3>
      </div>
    </motion.div>
  );
});

export default AdminMetricCard;
