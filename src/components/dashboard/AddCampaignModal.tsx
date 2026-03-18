import React from 'react';
import { X, Target, List } from 'lucide-react';

interface AddCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newCampaign: { name: string; description: string; target_posts: number };
  setNewCampaign: (campaign: any) => void;
}

const AddCampaignModal: React.FC<AddCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newCampaign,
  setNewCampaign
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-gray-900/10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <List className="h-6 w-6 text-indigo-600" /> Nueva Campaña
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre de Campaña</label>
            <input
              type="text"
              required
              className="block w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="Ej: Lanzamiento Verano 2024"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción</label>
            <textarea
              className="block w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
              rows={3}
              placeholder="Detalles sobre los objetivos de la campaña..."
              value={newCampaign.description}
              onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Meta de Posts por Creador</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Target className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                required
                min="1"
                className="block w-full pl-10 rounded-2xl border-gray-100 bg-gray-50/50 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                value={newCampaign.target_posts}
                onChange={(e) => setNewCampaign({ ...newCampaign, target_posts: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-100 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-2 px-8 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              Crear Campaña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCampaignModal;
