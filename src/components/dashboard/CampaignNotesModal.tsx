import React, { useState, useEffect } from 'react';
import { X, StickyNote, Save, Maximize2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CampaignNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => Promise<void>;
  initialNotes: string;
  campaignName: string;
}

const CampaignNotesModal: React.FC<CampaignNotesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNotes,
  campaignName
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes(initialNotes);
    }
  }, [isOpen, initialNotes]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(notes);
      onClose();
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-50/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-slate-200 ring-1 ring-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-10 pb-6 flex justify-between items-start border-b border-slate-200">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/20">
                <StickyNote className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">Campaign Narrative</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                    {campaignName}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/5 rounded-2xl transition-all active:scale-90"
            >
              <X className="h-6 w-6 text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-10 space-y-6 flex-1 flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Maximize2 className="h-3.5 w-3.5 text-indigo-600" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Advanced Strategic Editor</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400/60 uppercase tracking-widest font-mono">
                    <Info className="h-3.5 w-3.5" />
                    Visible in Public Reports
                </div>
            </div>

            <textarea
              autoFocus
              className="w-full flex-1 p-10 bg-white/5 border border-slate-200 rounded-[2.5rem] text-sm md:text-lg font-medium leading-relaxed text-white placeholder:text-slate-700 focus:ring-4 focus:ring-emerald-500/5 focus:bg-white/10 focus:border-emerald-500/50 transition-all outline-none resize-none no-scrollbar font-mono"
              placeholder="Inject strategic notes, secondary wallets, or campaign specifics here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="p-10 pt-6 bg-transparent border-t border-slate-200 flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic opacity-60">
              Tip: Use new lines for multiple wallet addresses.
            </p>
            <div className="flex gap-4">
                <button 
                onClick={onClose}
                className="px-10 py-4 bg-white/5 text-slate-500 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 font-sans"
                >
                Abort
                </button>
                <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-3 px-12 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 font-sans"
                >
                <Save className={`h-4 w-4 ${isSaving ? 'animate-pulse' : ''}`} />
                {isSaving ? 'Synchronizing...' : 'Save Strategy'}
                </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CampaignNotesModal;
