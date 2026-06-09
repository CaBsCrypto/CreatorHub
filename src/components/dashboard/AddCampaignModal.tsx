import React from 'react';
import { X, Target, List } from 'lucide-react';

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
    show_to_all?: boolean;
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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 no-scrollbar">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            {isEditing ? <Target className="h-5 w-5 text-indigo-600" /> : <List className="h-5 w-5 text-indigo-600" />}
            {isEditing ? 'Editar Campaña' : 'Nueva Campaña'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 text-slate-400 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6 pb-2">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre de la Campaña</label>
            <input
              type="text"
              required
              className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none"
              placeholder="Ej: Lanzamiento Verano 2024"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descripción Pública</label>
            <textarea
              className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none resize-y min-h-[80px]"
              rows={2}
              placeholder="Objetivos generales de la campaña..."
              value={newCampaign.description}
              onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 ml-1">Notas Internas (Solo Admin)</label>
            <textarea
              className="block w-full rounded-xl border border-indigo-100 bg-indigo-50/30 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none resize-y min-h-[120px]"
              rows={4}
              placeholder="Detalles estratégicos, requisitos, wallets, links de carpetas..."
              value={newCampaign.notes || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, notes: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Twitter / X</label>
              <input
                type="text"
                className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none"
                placeholder="@usuario"
                value={newCampaign.twitter_url || ''}
                onChange={(e) => setNewCampaign({ ...newCampaign, twitter_url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Telegram Contacto</label>
              <input
                type="text"
                className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none"
                placeholder="@usuario"
                value={newCampaign.contact_info || ''}
                onChange={(e) => setNewCampaign({ ...newCampaign, contact_info: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Presupuesto Asignado (USDT)</label>
            <input
              type="number"
              step="0.01"
              className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none font-mono"
              placeholder="0.00"
              value={newCampaign.budget || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Slug Amigable (URL Premium)</label>
            <input
              type="text"
              className="block w-full rounded-xl border border-white bg-white py-3 px-4 text-sm font-black text-indigo-600 focus:ring-2 focus:ring-indigo-300 transition-all outline-none shadow-sm font-mono"
              placeholder="identificador-campaña-123"
              value={newCampaign.slug || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, slug: e.target.value })}
            />
            <p className="mt-2 text-[9px] text-indigo-400 font-bold leading-relaxed uppercase tracking-tighter">
              ⚡ Link de acceso exclusivo. Se genera solo si queda vacío.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest">Mostrar a todos</label>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                Permite que todos los administradores vean esta campaña
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={!!newCampaign.show_to_all}
                onChange={(e) => setNewCampaign({ ...newCampaign, show_to_all: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Asignar Agentes</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {creators.map(creator => (
                <label key={creator.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer group">
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

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] px-8 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Campaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCampaignModal;
