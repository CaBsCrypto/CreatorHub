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
  color: string;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7 }}
      onClick={onClick}
      className={`group relative overflow-hidden glass-dark p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl transition-all duration-700 cursor-pointer ${onClick ? 'active:scale-95' : ''} hover:border-indigo-200 hover:shadow-emerald-500/5`}
    >
      <div className={`absolute -right-6 -top-6 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-50 transition-all duration-1000`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-500">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider italic ${trend.isPositive ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 italic">{title}</p>
        <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{value}</h3>
      </div>
    </motion.div>
  );
});

export default AdminMetricCard;
