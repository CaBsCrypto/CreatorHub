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

const AdminMetricCard: React.FC<AdminMetricCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color, 
  delay = 0,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer ${onClick ? 'active:scale-95' : ''}`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.08] rounded-full transition-opacity duration-500`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        
        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.15em]">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
      </div>
    </motion.div>
  );
};

export default AdminMetricCard;
