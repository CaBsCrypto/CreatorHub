import React, { useMemo } from 'react';
import { X, Users, Clock, Monitor, Activity, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Content } from '../../supabase';

interface DiscordStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Content | null;
}

const DiscordStatsModal: React.FC<DiscordStatsModalProps> = ({ isOpen, onClose, session }) => {
  if (!isOpen || !session) return null;

  const metrics = [
    { 
      label: 'Duración Stream', 
      value: `${Math.floor((session.duration_minutes || 0) / 60)}h ${(session.duration_minutes || 0) % 60}m`, 
      icon: Clock, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      label: 'Usuarios Simultáneos', 
      value: (session.peek_viewers || 0).toLocaleString(), 
      icon: Users, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50' 
    },
    { 
      label: 'Usuarios Únicos', 
      value: (session.unique_viewers || 0).toLocaleString(), 
      icon: Activity, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Pantallas Compartidas', 
      value: (session.shares_count || 0).toLocaleString(), 
      icon: Monitor, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'Vistas Totales', 
      value: (session.views || session.unique_viewers || 0).toLocaleString(), 
      icon: Activity, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-md" 
          onClick={onClose} 
        />
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] bg-white shadow-2xl flex flex-col"
      >
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all z-10 shadow-sm"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar relative z-0">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Discord Session</div>
              <span className="text-gray-400 font-bold text-sm">{new Date(session.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">{session.title || 'Sesión de Juego'}</h2>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {metrics.map((m, i) => (
              <motion.div 
                key={m.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative"
              >
                <div className={`absolute -right-4 -top-4 w-16 h-16 ${m.bg} opacity-20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700`} />
                <m.icon className={`h-5 w-5 ${m.color} mb-3`} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                <p className="text-xl font-black text-gray-900 leading-none">{m.value}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Session Description (New) */}
          {session.description && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1">Notas de la Jornada</p>
              <p className="text-sm font-medium text-slate-700 leading-relaxed italic px-1">
                "{session.description}"
              </p>
            </motion.div>
          )}

          {/* Thumbnail / Capture View */}
          {session.thumbnail && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-4 w-4 text-indigo-500" />
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Captura de Resultados</span>
              </div>
              <div className="relative rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-lg bg-gray-50 aspect-video group">
                <img 
                  src={session.thumbnail} 
                  alt="Discord Result Capture" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                   <a 
                    href={session.thumbnail} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-900 shadow-xl hover:bg-gray-50 transition-all hover:translate-y-[-2px]"
                   >
                     Ver Imagen completa
                   </a>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Area */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DiscordStatsModal;
