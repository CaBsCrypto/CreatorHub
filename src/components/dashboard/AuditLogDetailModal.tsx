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
    if (!data) return <span className="text-slate-600 italic text-[10px] uppercase font-black tracking-widest">No metadata detected.</span>;
    return (
      <pre className="text-[10px] font-mono p-5 bg-slate-950/80 text-emerald-400 rounded-3xl overflow-x-auto border border-white/5 shadow-2xl backdrop-blur-xl">
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
      default: return <Zap className="h-6 w-6 text-indigo-400" />;
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
          className="relative w-full max-w-2xl bg-slate-950/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden ring-1 ring-white/10"
        >
          <div className="p-8 pb-4 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-[1.5rem] flex items-center justify-center ring-1 ring-white/10 ${
                log.action === 'PAYMENT_REGISTERED' ? 'bg-emerald-500/10' :
                log.action === 'SOFT_DELETE' ? 'bg-rose-500/10' :
                log.action === 'RESTORE' ? 'bg-emerald-500/10' :
                log.action === 'CHANGE_ROLE' ? 'bg-amber-500/10' :
                'bg-indigo-500/10'
              }`}>
                {getLogIcon(log.action)}
              </div>
              <div>
                <h2 className="text-xl font-black text-white leading-tight tracking-tight uppercase">Event Telemetry</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ring-1 ring-white/5 ${
                    log.action === 'SOFT_DELETE' ? 'bg-rose-500/10 text-rose-400' :
                    log.action === 'RESTORE' ? 'bg-emerald-500/10 text-emerald-400' :
                    log.action === 'PAYMENT_REGISTERED' ? 'bg-emerald-500/10 text-emerald-400' :
                    log.action === 'CHANGE_ROLE' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl transition-all border border-white/5"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          <div className="p-8 pt-4 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
            {/* Human Summary Section */}
            <div className="bg-indigo-500/5 p-6 rounded-[2rem] border border-white/5">
              <p className="text-base text-slate-300 font-medium leading-relaxed">
                <span className="font-black text-indigo-400">{log.admin?.display_name || 'System Agent'}</span> 
                {' '}{safeDetails(log.details)}
              </p>
            </div>

            {/* === PAYMENT DETAIL CARD === */}
            {log.action === 'PAYMENT_REGISTERED' && (
              <div className="bg-emerald-500/5 p-6 rounded-[2rem] border border-white/5 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Transaction Intelligence</h3>
                </div>

                {/* Recipient */}
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[1.5rem] border border-white/5 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Recipient Identity</p>
                    <p className="text-lg font-black text-white tracking-tight">
                      {recipientName || 'Unidentified'}
                    </p>
                    {payment?.guest_name && !paymentCreator && (
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em]">External Entity</span>
                    )}
                  </div>
                </div>

                {/* Amount & Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Amount */}
                  <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Quantum</p>
                    <p className="text-xl font-black text-emerald-400 font-mono">
                      ${payment ? Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                    </p>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">
                      {payment?.currency || 'USDT'}
                    </p>
                  </div>

                  {/* Campaign */}
                  <div className="bg-white/5 p-4 rounded-[1.5rem] border border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mission Target</p>
                    <p className="text-sm font-black text-white leading-snug uppercase tracking-tight">
                      {paymentCampaign?.name || 'Isolated Event'}
                    </p>
                  </div>

                  {/* Concept */}
                  {payment?.concept && (
                    <div className="col-span-2 bg-white/5 p-4 rounded-[1.5rem] border border-white/5 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="h-3 w-3 text-slate-500" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Note</p>
                      </div>
                      <p className="text-sm font-medium text-slate-300 font-mono italic">"{payment.concept}"</p>
                    </div>
                  )}

                  {/* Payment Date */}
                  {payment?.paid_at && (
                    <div className="col-span-2 bg-white/5 p-4 rounded-[1.5rem] border border-white/5 shadow-sm">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Injection Timestamp</p>
                      <p className="text-sm font-black text-slate-300 font-mono tracking-tight">{formatDate(payment.paid_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-start gap-4">
                <Clock className="h-5 w-5 text-slate-600 mt-1" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Event Horizon</p>
                  <p className="text-sm font-black text-slate-300 font-mono">{formatDate(log.created_at)}</p>
                </div>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-start gap-4">
                <Database className="h-5 w-5 text-slate-600 mt-1" />
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Protocol Entity</p>
                  <p className="text-sm font-black text-slate-300 uppercase tracking-tighter">{log.target_type || 'CORE'}</p>
                </div>
              </div>
            </div>

            {/* Technical Metadata Section */}
            {log.metadata && (
                <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <Fingerprint className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Neural Metadata (JSON)</h3>
                </div>
                {renderJson(log.metadata)}
                </div>
            )}

            {/* Target ID Section */}
            {log.target_id && (
                <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                   <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-indigo-500" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Entity Signature</span>
                   </div>
                   <code className="text-[10px] font-mono text-indigo-400 bg-white/5 px-3 py-1 rounded-lg border border-white/5 shadow-xl">{log.target_id}</code>
                </div>
            )}
          </div>

          <div className="p-8 pt-4 border-t border-white/5 flex justify-end">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white/5 text-slate-500 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-white/20 hover:text-white transition-all shadow-sm active:scale-95"
            >
              Close Telemetry
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuditLogDetailModal;
