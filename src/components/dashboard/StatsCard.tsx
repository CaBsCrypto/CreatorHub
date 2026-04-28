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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="relative overflow-hidden glass-dark p-8 rounded-[2.5rem] border border-slate-200 group hover:border-indigo-200 transition-all duration-500"
    >
      <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-700">
        <Icon className={`h-24 w-24 ${iconColor}`} />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">{label}</p>
        <h3 className="text-4xl font-black text-white leading-none tracking-tighter">{value}</h3>
        {trend && (
          <p className="text-[10px] font-bold text-indigo-600 mt-4 flex items-center gap-2 italic">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </div>
      
      {/* Interactive Bottom Line */}
      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-600 group-hover:w-full transition-all duration-700" />
    </motion.div>
  );
};

export default StatsCard;
