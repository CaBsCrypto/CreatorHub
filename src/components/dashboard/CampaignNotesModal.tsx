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
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 pb-4 flex justify-between items-start border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <StickyNote className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">Anotaciones de Campaña</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {campaignName}
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

          {/* Body */}
          <div className="p-8 space-y-4 flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Editor Ampliado</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase">
                    <Info className="h-3 w-3" />
                    Estas notas son visibles para el cliente en el reporte.
                </div>
            </div>

            <textarea
              autoFocus
              className="w-full flex-1 p-8 bg-slate-50 border-none rounded-[2rem] text-sm md:text-base font-medium leading-relaxed text-slate-700 focus:ring-2 focus:ring-indigo-100 transition-all outline-none resize-none custom-scrollbar"
              placeholder="Escribe aquí las wallets de pago, instrucciones específicas para los creadores, o cualquier información extra que deba aparecer en el reporte..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
              Se recomienda usar saltos de línea para separar wallets.
            </p>
            <div className="flex gap-4">
                <button 
                onClick={onClose}
                className="px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                >
                Cancelar
                </button>
                <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-10 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                >
                <Save className={`h-4 w-4 ${isSaving ? 'animate-pulse' : ''}`} />
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CampaignNotesModal;
