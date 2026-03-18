import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = "Iniciando Umbra Creator Hub..." }: { message?: string }) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 space-y-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/5 blur-[100px] rounded-full" />
      
      <div className="relative flex items-center justify-center">
        {/* Animated outer rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute h-24 w-24 rounded-full border-2 border-dashed border-indigo-600/20" 
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute h-32 w-32 rounded-full border border-indigo-600/10" 
        />
        
        {/* Main Spinner Container */}
        <div className="relative z-10 w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-xl">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>

        {/* Floating particles */}
        <Sparkles className="absolute -top-4 -right-4 h-5 w-5 text-indigo-500/30 animate-pulse" />
      </div>

      <div className="text-center space-y-2 relative z-10">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.3em] ml-[0.3em]">Cargando</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse max-w-[200px]">
          {message}
        </p>
      </div>

      {/* Modern bottom accent */}
      <div className="absolute bottom-12 flex items-center gap-2 opacity-50">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <Sparkles className="text-white h-4 w-4" />
        </div>
        <span className="text-xs font-black text-gray-900 tracking-widest uppercase">Umbra</span>
      </div>
    </div>
  );
}
