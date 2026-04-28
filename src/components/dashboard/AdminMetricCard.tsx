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
      transition={{ delay, duration: 0.5 }}
      onClick={onClick}
      className={`group relative overflow-hidden bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-300 cursor-pointer ${onClick ? 'active:scale-95' : ''} hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${trend.isPositive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
              {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
      </div>
    </motion.div>
  );
});

export default AdminMetricCard;
