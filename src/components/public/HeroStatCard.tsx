import React from 'react';
import { motion } from 'framer-motion';

interface HeroStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'indigo' | 'purple' | 'emerald' | 'rose';
  onClick?: () => void;
}

const HeroStatCard: React.FC<HeroStatCardProps> = ({ icon, label, value, color, onClick }) => {
  const colors = {
    indigo: { bg: 'bg-white hover:bg-gray-50', border: 'border-gray-100 hover:border-indigo-100', icon: 'bg-indigo-50 text-indigo-600', text: 'text-indigo-600' },
    purple: { bg: 'bg-white hover:bg-gray-50', border: 'border-gray-100 hover:border-purple-100', icon: 'bg-purple-50 text-purple-600', text: 'text-purple-600' },
    emerald: { bg: 'bg-white hover:bg-gray-50', border: 'border-gray-100 hover:border-emerald-100', icon: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-600' },
    rose: { bg: 'bg-white hover:bg-gray-50', border: 'border-gray-100 hover:border-rose-100', icon: 'bg-rose-50 text-rose-600', text: 'text-rose-600' },
  }[color];

  return (
    <motion.button
      whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.1)" }}
      onClick={onClick}
      disabled={!onClick}
      className={`relative ${colors.bg} border ${colors.border} rounded-[2.5rem] p-5 sm:p-6 text-left w-full overflow-hidden group transition-all duration-300 shadow-sm ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-gray-50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl ${colors.icon} flex items-center justify-center mb-4 relative z-10 shadow-sm`}>
        <div className="h-4 w-4 sm:h-5 sm:w-5">{icon}</div>
      </div>
      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">{label}</p>
      <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter relative z-10">{value}</span>
    </motion.button>
  );
};

export default HeroStatCard;
