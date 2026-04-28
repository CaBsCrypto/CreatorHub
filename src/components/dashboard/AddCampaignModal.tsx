import React from 'react';
import { X, Target, List, Maximize2 } from 'lucide-react';

interface AddCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newCampaign: { 
    name: string; 
    description: string; 
    client_id?: string | null;
    twitter_url?: string | null;
    contact_info?: string | null;
    budget?: number;
    slug?: string | null;
    notes?: string | null;
  };
  setNewCampaign: (campaign: any) => void;
  clients: any[];
  creators: any[];
  isEditing?: boolean;
}

const AddCampaignModal: React.FC<AddCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newCampaign,
  setNewCampaign,
  clients,
  creators,
  isEditing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 no-scrollbar">
        <div className="relative z-10 flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            {isEditing ? <Target className="h-6 w-6 text-indigo-600" /> : <List className="h-6 w-6 text-indigo-600" />}
            {isEditing ? 'Editar Campaña' : 'Nueva Campaña'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 text-slate-400 transition-all hover:rotate-90">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6 pb-2">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre de la Campaña</label>
            <input
              type="text"
              required
              className="block w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 px-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500/50 transition-all outline-none"
              placeholder="Ej: Lanzamiento Verano 2024"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Descripción</label>
            <textarea
              className="block w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 px-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500/50 transition-all outline-none resize-y min-h-[100px]"
              rows={3}
              placeholder="Objetivos estratégicos y metas..."
              value={newCampaign.description}
              onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest">Notas Internas</label>
            </div>
            <textarea
              className="block w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 px-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500/50 transition-all outline-none resize-y min-h-[150px]"
              rows={6}
              placeholder="Detalles adicionales, requerimientos o links... (Ej: Wallets, links a carpetas)"
              value={newCampaign.notes || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, notes: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Twitter / X</label>
              <input
                type="text"
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 px-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500/50 transition-all outline-none"
                placeholder="@usuario"
                value={newCampaign.twitter_url || ''}
                onChange={(e) => setNewCampaign({ ...newCampaign, twitter_url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Telegram</label>
              <input
                type="text"
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 px-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500/50 transition-all outline-none"
                placeholder="@usuario"
                value={newCampaign.contact_info || ''}
                onChange={(e) => setNewCampaign({ ...newCampaign, contact_info: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Presupuesto Asignado (USDT)</label>
            <input
              type="number"
              step="0.01"
              className="block w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 px-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500/50 transition-all outline-none font-mono"
              placeholder="0.00"
              value={newCampaign.budget || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Slug Premium (URL Amigable)</label>
            <input
              type="text"
              className="block w-full rounded-xl border border-indigo-200 bg-white py-3 px-4 text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none shadow-sm font-mono"
              placeholder="mi-campana-2024"
              value={newCampaign.slug || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, slug: e.target.value })}
            />
            <p className="mt-2 text-[9px] text-indigo-400 font-bold leading-relaxed">
              ⚡ Endpoint exclusivo de acceso. Se genera automáticamente si se deja vacío.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Asignar Creadores</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {creators.map(creator => (
                <label key={creator.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 bg-white text-indigo-600 focus:ring-indigo-500/20 transition-all cursor-pointer"
                    checked={(newCampaign as any).assigned_creator_ids?.includes(creator.id)}
                    onChange={(e) => {
                      const currentIds = (newCampaign as any).assigned_creator_ids || [];
                      const newIds = e.target.checked 
                        ? [...currentIds, creator.id]
                        : currentIds.filter((id: string) => id !== creator.id);
                      setNewCampaign({ ...newCampaign, assigned_creator_ids: newIds });
                    }}
                  />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                    {creator.display_name || creator.email.split('@')[0]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white sm:static">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] px-8 py-3.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              {isEditing ? 'Guardar Cambios' : 'Inicializar Campaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};};

export default AddCampaignModal;
