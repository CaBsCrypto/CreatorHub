import React from 'react';
import { X, Zap, Clock, User, Fingerprint, Database, DollarSign, History, Wallet, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
  users?: any[];
  payments?: any[];
  campaigns?: any[];
}

const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ isOpen, onClose, log, users = [], payments = [], campaigns = [] }) => {
  if (!isOpen || !log) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, { 
      day: '2-digit', month: 'long', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
  };

  const safeDetails = (details: any): string => {
    if (typeof details === 'string') return details;
    if (details && typeof details === 'object') return details.name || 'realizó una modificación técnica';
    return 'realizó una modificación técnica';
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
      case 'PAYMENT_REGISTERED': return <DollarSign className="h-6 w-6 text-emerald-500" />;
      case 'CHANGE_ROLE': return <User className="h-6 w-6 text-amber-500" />;
      case 'METRICS_ADJUSTED': return <Zap className="h-6 w-6 text-blue-500" />;
      default: return <Zap className="h-6 w-6 text-indigo-500" />;
    }
  };

  // --- Resolve payment details ---
  const payment = log.action === 'PAYMENT_REGISTERED' && log.target_id
    ? payments.find(p => p.id === log.target_id)
    : null;

  const paymentCreator = payment?.creator_id
    ? users.find(u => u.id === payment.creator_id)
    : null;

  const paymentCampaign = payment?.campaign_id
    ? campaigns.find(c => c.id === payment.campaign_id)
    : null;

  const recipientName = paymentCreator?.display_name || paymentCreator?.email?.split('@')[0] || payment?.guest_name || null;

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
              <div className={`w-12 h-12 rounded-[1.5rem] flex items-center justify-center ${
                log.action === 'PAYMENT_REGISTERED' ? 'bg-emerald-50' :
                log.action === 'SOFT_DELETE' ? 'bg-rose-50' :
                log.action === 'RESTORE' ? 'bg-emerald-50' :
                log.action === 'CHANGE_ROLE' ? 'bg-amber-50' :
                'bg-indigo-50'
              }`}>
                {getLogIcon(log.action)}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 leading-tight tracking-tight uppercase">Detalle de Actividad</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    log.action === 'SOFT_DELETE' ? 'bg-rose-50 text-rose-600' :
                    log.action === 'RESTORE' ? 'bg-emerald-50 text-emerald-600' :
                    log.action === 'PAYMENT_REGISTERED' ? 'bg-emerald-50 text-emerald-600' :
                    log.action === 'CHANGE_ROLE' ? 'bg-amber-50 text-amber-600' :
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

          <div className="p-8 pt-4 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
            {/* Human Summary Section */}
            <div className="bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
              <p className="text-base text-gray-900 font-medium leading-relaxed">
                <span className="font-black text-indigo-600">{log.admin?.display_name || 'Sistema'}</span> 
                {' '}{safeDetails(log.details)}
              </p>
            </div>

            {/* === PAYMENT DETAIL CARD === */}
            {log.action === 'PAYMENT_REGISTERED' && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/30 p-6 rounded-[2rem] border border-emerald-100/60 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Detalle del Pago</h3>
                </div>

                {/* Recipient */}
                <div className="flex items-center gap-4 bg-white p-5 rounded-[1.5rem] border border-emerald-100/50 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Destinatario</p>
                    <p className="text-lg font-black text-gray-900 tracking-tight">
                      {recipientName || 'No identificado'}
                    </p>
                    {payment?.guest_name && !paymentCreator && (
                      <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Invitado</span>
                    )}
                  </div>
                </div>

                {/* Amount & Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Amount */}
                  <div className="bg-white p-4 rounded-[1.5rem] border border-emerald-100/50 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto</p>
                    <p className="text-xl font-black text-emerald-600">
                      ${payment ? Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                      {payment?.currency || 'USDT'}
                    </p>
                  </div>

                  {/* Campaign */}
                  <div className="bg-white p-4 rounded-[1.5rem] border border-emerald-100/50 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Campaña</p>
                    <p className="text-sm font-black text-gray-900 leading-snug">
                      {paymentCampaign?.name || 'Sin campaña'}
                    </p>
                  </div>

                  {/* Concept */}
                  {payment?.concept && (
                    <div className="col-span-2 bg-white p-4 rounded-[1.5rem] border border-emerald-100/50 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="h-3 w-3 text-gray-400" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Concepto</p>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{payment.concept}</p>
                    </div>
                  )}

                  {/* Payment Date */}
                  {payment?.paid_at && (
                    <div className="col-span-2 bg-white p-4 rounded-[1.5rem] border border-emerald-100/50 shadow-sm">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha de Pago</p>
                      <p className="text-sm font-bold text-gray-700">{formatDate(payment.paid_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
