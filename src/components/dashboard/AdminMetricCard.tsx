import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  delay?: number;
  onClick?: () => void;
}

const AdminMetricCard = React.memo(({
  title,
  value,
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
      className={`group relative overflow-hidden bg-white p-4 lg:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-95' : ''} hover:border-indigo-200`}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-600/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-4.5 w-4.5 text-indigo-600" />
          </div>
        </div>

        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-none">{value}</h3>
      </div>
    </motion.div>
  );
});

export default AdminMetricCard;
