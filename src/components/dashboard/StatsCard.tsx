import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  label, 
  value, 
  trend, 
  icon: Icon, 
  iconColor = "text-indigo-600",
  delay = 0 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative overflow-hidden bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 group hover:border-indigo-100 shadow-sm transition-all duration-300"
    >
      <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rotate-12 group-hover:rotate-0 duration-700">
        <Icon className={`h-20 w-20 ${iconColor}`} />
      </div>
      
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{label}</p>
        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 leading-none tracking-tight">{value}</h3>
        {trend && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <TrendingUp className="h-3 w-3 text-indigo-600" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">{trend}</span>
          </div>
        )}
      </div>
      
      {/* Decorative Bottom Accent */}
      <div className="absolute bottom-0 left-0 w-1 h-0 bg-indigo-600 group-hover:h-full transition-all duration-500" />
    </motion.div>
  );
};

export default StatsCard;
