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
      className="relative overflow-hidden bg-white p-8 rounded-[2rem] border border-gray-100 group hover:border-indigo-100 transition-all shadow-sm hover:shadow-md"
    >
      <div className="relative z-10">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{value}</h3>
        {trend && (
          <p className="text-[10px] font-bold text-indigo-600 mt-4 flex items-center gap-2 italic">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </div>
      
      {/* Interactive Bottom Line */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-indigo-600 group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
};

export default StatsCard;
