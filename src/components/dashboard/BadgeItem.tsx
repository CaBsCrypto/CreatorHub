import React from 'react';
import { LucideIcon, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: LucideIcon;
  unlocked: boolean;
  color: string;
}

interface BadgeItemProps {
  badge: Badge;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, isSelected, onClick, index }) => {
  const Icon = badge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`relative flex flex-col items-center text-center shrink-0 w-36 snap-center group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 drop-shadow-xl z-10' : ''}`}
    >
      <div className={`
        relative h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500
        ${badge.unlocked 
          ? `bg-gradient-to-br ${badge.color} shadow-lg shadow-indigo-100 ring-4 ${isSelected ? 'ring-indigo-500' : 'ring-white'}` 
          : `bg-white border-2 border-dashed ${isSelected ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-md' : 'border-gray-100 shadow-sm'}`}
      `}>
        <Icon className={`h-10 w-10 transition-transform duration-500 group-hover:scale-110 ${badge.unlocked ? 'text-white' : isSelected ? 'text-indigo-400' : 'text-gray-200'}`} />
        {!badge.unlocked && !isSelected && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
        )}
        {badge.unlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-md border border-gray-50"
          >
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </motion.div>
        )}
      </div>
      <div className="mt-5 px-2">
        <p className={`text-sm font-black whitespace-nowrap transition-colors ${badge.unlocked || isSelected ? 'text-gray-900' : 'text-gray-400'}`}>{badge.name}</p>
        <p className={`text-[10px] font-bold uppercase tracking-tighter mt-1 transition-colors ${isSelected ? 'text-indigo-600' : 'text-gray-400 opacity-60'}`}>
          {badge.unlocked ? 'Desbloqueado' : 'Bloqueado'}
        </p>
      </div>
    </motion.div>
  );
};

export default BadgeItem;
