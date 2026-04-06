import React from 'react';
import { X, Zap, Clock, User, Fingerprint, Database, ChevronRight, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
}

const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ isOpen, onClose, log }) => {
  if (!isOpen || !log) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, { 
      day: '2-digit', month: 'long', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
  };

  const renderJson = (data: any) => {
    if (!data) return <span className="text-gray-400 italic">No hay metadatos adicionales.</span>;
    return (
      <pre className="text-[11px] font-mono p-4 bg-slate-900 text-indigo-300 rounded-2xl overflow-x-auto border border-slate-800 shadow-inner">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  const getLogIcon = (action: string) => {
    switch (action) {
      case 'SOFT_DELETE': return <History className="h-6 w-6 text-rose-500" />;
      case 'RESTORE': return <Zap className="h-6 w-6 text-emerald-500" />;
      case 'PAYMENT_REGISTERED': return <Zap className="h-6 w-6 text-indigo-500" />;
      default: return <Zap className="h-6 w-6 text-indigo-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-8 pb-4 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center">
                {getLogIcon(log.action)}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 leading-tight tracking-tight uppercase">Detalle de Actividad</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    log.action === 'SOFT_DELETE' ? 'bg-rose-50 text-rose-600' :
                    log.action === 'RESTORE' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-indigo-50 text-indigo-600'
                  }`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          <div className="p-8 pt-4 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin">
            {/* Human Summary Section */}
            <div className="bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
              <p className="text-base text-gray-900 font-medium leading-relaxed">
                <span className="font-black text-indigo-600">{log.admin?.display_name || 'Sistema'}</span> 
                {' '}
                {typeof log.details === 'string' 
                  ? log.details 
                  : ((log.details as any)?.name || 'realizó una modificación técnica')
                }
              </p>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-start gap-4">
                <Clock className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha y Hora</p>
                  <p className="text-sm font-bold text-gray-700">{formatDate(log.created_at)}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-start gap-4">
                <Database className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Entidad Relacionada</p>
                  <p className="text-sm font-bold text-gray-700 uppercase">{log.target_type || 'General'}</p>
                </div>
              </div>
            </div>

            {/* Technical Metadata Section */}
            {log.metadata && (
                <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Fingerprint className="h-4 w-4 text-indigo-500" />
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Metadata Técnica (JSON)</h3>
                </div>
                {renderJson(log.metadata)}
                </div>
            )}

            {/* Target ID Section */}
            {log.target_id && (
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
                   <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-indigo-400" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Referencia</span>
                   </div>
                   <code className="text-[10px] font-mono text-gray-500 bg-white px-3 py-1 rounded-lg shadow-sm">{log.target_id}</code>
                </div>
            )}
          </div>

          <div className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
            >
              Cerrar Detalle
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuditLogDetailModal;
