import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScraperHealth } from '../../hooks/useScraperHealth';
import ScraperHealthModal from './ScraperHealthModal';

const ScraperHealthWidget: React.FC = () => {
  const { successRate, errorCount, total, recentErrors, loading } = useScraperHealth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
        <Loader2 className="h-3.5 w-3.5 text-slate-300 animate-spin" />
        <div className="h-2 w-16 bg-slate-100 rounded-full" />
      </div>
    );
  }

  const isHealthy = successRate >= 95;
  const isWarning = successRate < 95 && successRate >= 80;
  
  return (
    <>
      <motion.button 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border transition-all duration-300 shadow-sm cursor-pointer group active:scale-95 ${
          isHealthy 
            ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 hover:bg-emerald-100/50' 
            : isWarning 
              ? 'bg-amber-50/50 border-amber-100 text-amber-700 hover:bg-amber-100/50' 
              : 'bg-rose-50/50 border-rose-100 text-rose-700 hover:bg-rose-100/50'
        }`}
      >
        <div className="relative">
          {isHealthy ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
              isHealthy ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />
        </div>
        
        <div className="flex flex-col items-start translate-y-[-1px]">
          <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">
            Scrapers: {successRate}%
          </span>
          {errorCount > 0 && (
            <span className="text-[8px] font-bold opacity-70 uppercase tracking-tighter">
              {errorCount} errores (24h)
            </span>
          )}
        </div>
      </motion.button>

      <ScraperHealthModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        successRate={successRate}
        total={total}
        recentErrors={recentErrors}
      />
    </>
  );
};

export default ScraperHealthWidget;
