import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Target, Users, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react';

interface DeletedItemModalProps {
  viewingDeleted: { type: 'content' | 'campaign' | 'user', item: any } | null;
  onClose: () => void;
  onRestore: (type: 'content' | 'campaign' | 'user', item: any) => Promise<void>;
  onPermanentDelete: (type: 'content' | 'campaign' | 'user', item: any) => Promise<void>;
}

const DeletedItemModal: React.FC<DeletedItemModalProps> = ({
  viewingDeleted,
  onClose,
  onRestore,
  onPermanentDelete
}) => {
  if (!viewingDeleted) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-50/60 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-slate-50/80 backdrop-blur-xl w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 ring-1 ring-white/10"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ring-1 ring-white/10 ${
                  viewingDeleted.type === 'content' ? 'bg-indigo-500/10 text-indigo-400' :
                  viewingDeleted.type === 'campaign' ? 'bg-indigo-50 text-indigo-600' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {viewingDeleted.type === 'content' && <Youtube className="h-6 w-6" />}
                  {viewingDeleted.type === 'campaign' && <Target className="h-6 w-6" />}
                  {viewingDeleted.type === 'user' && <Users className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {viewingDeleted.type === 'user' ? 'Entity' : viewingDeleted.type === 'campaign' ? 'Mission' : 'Asset'} Recovery
                  </h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">Status: Decommissioned</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/5 rounded-xl transition-all border border-slate-200"
                title="Abort"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
              {/* Image Preview for Content */}
              {viewingDeleted.type === 'content' && viewingDeleted.item.thumbnail && (
                <div className="mb-6 rounded-[2rem] overflow-hidden border border-slate-200 shadow-2xl aspect-video bg-white/5 flex items-center justify-center group/img">
                  <img 
                    src={viewingDeleted.item.thumbnail} 
                    alt={viewingDeleted.item.title || 'Vista previa'} 
                    className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'flex flex-col items-center justify-center text-slate-700 gap-2';
                          placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-[10px] font-black uppercase tracking-widest">Image Corrupted</span>';
                          parent.appendChild(placeholder);
                      }
                    }}
                  />
                </div>
              )}
              
              {Object.entries(viewingDeleted.item).map(([key, value]) => {
                if (value === null || value === undefined || typeof value === 'object' || key.includes('id')) return null;
                return (
                  <div key={key} className="flex flex-col gap-1 bg-white/5 p-3 rounded-xl border border-slate-200">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-black text-white break-all font-mono tracking-tight">{String(value)}</span>
                  </div>
                );
              })}
              <div className="pt-4 border-t border-slate-200">
                 <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Decommission Date</span>
                 <p className="text-sm font-black text-rose-400 mt-1 font-mono">
                    {viewingDeleted.item.deleted_at ? new Date(viewingDeleted.item.deleted_at).toLocaleString() : 'N/A'}
                 </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-2 gap-4">
              <button 
                onClick={() => onRestore(viewingDeleted.type, viewingDeleted.item)}
                className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
              >
                <RefreshCw className="h-4 w-4" /> Restore Intelligence
              </button>
              <button 
                onClick={() => onPermanentDelete(viewingDeleted.type, viewingDeleted.item)}
                className="flex items-center justify-center gap-2 py-4 bg-white/5 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 transition-all active:scale-95 border border-slate-200"
              >
                <Trash2 className="h-4 w-4" /> Purge Records
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeletedItemModal;
