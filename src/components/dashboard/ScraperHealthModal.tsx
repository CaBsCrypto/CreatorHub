import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ExternalLink, Clock, Server, CheckCircle2, XCircle } from 'lucide-react';
import { getPlatformIcon, getPlatformColor } from '../../utils/platformUtils';

interface ScraperHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  successRate: number;
  total: number;
  recentErrors: any[];
}

const ScraperHealthModal: React.FC<ScraperHealthModalProps> = ({ 
  isOpen, 
  onClose, 
  successRate, 
  total,
  recentErrors 
}) => {
  if (!isOpen) return null;

  const isHealthy = successRate >= 95;
  const isWarning = successRate < 95 && successRate >= 80;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" 
          onClick={onClose} 
        />
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isHealthy ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <Server className={`h-6 w-6 ${isHealthy ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-none mb-1">Diagnóstico</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Salud de APIs y Scrapers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8">
          {/* Summary Score */}
          <div className="flex items-center justify-between mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tasa de Éxito (24h)</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${isHealthy ? 'text-emerald-600' : isWarning ? 'text-amber-500' : 'text-rose-600'}`}>
                  {successRate}%
                </span>
                <span className="text-xs font-bold text-slate-700">/ 100%</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Logs</p>
              <p className="text-xl font-black text-slate-900">{total}</p>
            </div>
          </div>

          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5" /> Últimos Errores Detectados
          </h3>

          <div className="space-y-3">
            {recentErrors.length > 0 ? (
              recentErrors.map((log) => (
                <div key={log.id} className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-rose-100 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${getPlatformColor(log.platform)}`}>
                        {getPlatformIcon(log.platform, 'h-3.5 w-3.5')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none mb-1">
                          {log.platform}
                        </p>
                        <p className="text-[11px] font-bold text-rose-500 line-clamp-1">
                          {log.error_message || 'Error desconocido'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 uppercase whitespace-nowrap pt-1">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {log.url && (
                    <div className="mt-3 overflow-hidden">
                       <a 
                        href={log.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] text-indigo-400 hover:text-indigo-600 hover:underline flex items-center gap-1 truncate"
                       >
                         {log.url} <ExternalLink className="h-2 w-2" />
                       </a>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-emerald-50 rounded-[2rem]">
                <CheckCircle2 className="h-8 w-8 text-emerald-100 mx-auto mb-3" />
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">No hay errores recientes</p>
                <p className="text-[9px] font-bold text-emerald-300 uppercase tracking-tighter mt-1">Todo funciona correctamente</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
          <p className="text-[9px] font-bold text-gray-400 max-w-[180px]">
            Los errores pueden deberse a cambios en la web origen o límites de API.
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ScraperHealthModal;
