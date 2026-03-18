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
      transition={{ delay }}
      className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className={`h-16 w-16 ${iconColor}`} />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 leading-none">{value}</h3>
        {trend && (
          <p className="text-[10px] font-bold text-indigo-500 mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
