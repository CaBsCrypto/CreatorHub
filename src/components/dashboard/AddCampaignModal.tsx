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
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-gray-900/10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-transparent">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            {isEditing ? <Target className="h-6 w-6 text-indigo-600" /> : <List className="h-6 w-6 text-indigo-600" />}
            {isEditing ? 'Editar Campaña' : 'Nueva Campaña'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6 pb-2">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre de Campaña</label>
            <input
              type="text"
              required
              className="block w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              placeholder="Ej: Lanzamiento Verano 2024"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción</label>
            <textarea
              className="block w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none"
              rows={3}
              placeholder="Detalles sobre los objetivos de la campaña..."
              value={newCampaign.description}
              onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">Notas / Información Extra (Para el Cliente)</label>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Maximize2 className="h-3 w-3" /> Arrastra para ampliar
              </span>
            </div>
            <textarea
              className="block w-full rounded-2xl border-indigo-100 bg-indigo-50/20 py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-y min-h-[150px]"
              rows={8}
              placeholder="Escribe aquí cualquier detalle adicional, requisitos o links que los creadores necesiten saber... (Ej: Wallets, hashes de transacción, links de carpetas)"
              value={newCampaign.notes || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, notes: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Twitter / X</label>
              <input
                type="text"
                className="block w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="@proyecto"
                value={newCampaign.twitter_url || ''}
                onChange={(e) => setNewCampaign({ ...newCampaign, twitter_url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contacto (Telegram)</label>
              <input
                type="text"
                className="block w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="@usuario"
                value={newCampaign.contact_info || ''}
                onChange={(e) => setNewCampaign({ ...newCampaign, contact_info: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Presupuesto Asignado (USDT)</label>
            <input
              type="number"
              step="0.01"
              className="block w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              placeholder="0.00"
              value={newCampaign.budget || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="bg-indigo-50/30 p-5 rounded-[2rem] border border-indigo-100/50">
            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">URL Amigable (Slug Premium)</label>
            <input
              type="text"
              className="block w-full rounded-2xl border-white bg-white/80 py-3 px-4 text-sm font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none shadow-sm"
              placeholder="nombre-de-campana-1234"
              value={newCampaign.slug || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, slug: e.target.value })}
            />
            <p className="mt-2 text-[9px] text-indigo-400/80 font-bold leading-relaxed">
              ⚡ Este es el enlace corto que verán tus clientes. Se genera automáticamente si lo dejas vacío.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Asignar Creadores</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-100">
              {creators.map(creator => (
                <label key={creator.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-indigo-100 transition-all cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                    checked={(newCampaign as any).assigned_creator_ids?.includes(creator.id)}
                    onChange={(e) => {
                      const currentIds = (newCampaign as any).assigned_creator_ids || [];
                      const newIds = e.target.checked 
                        ? [...currentIds, creator.id]
                        : currentIds.filter((id: string) => id !== creator.id);
                      setNewCampaign({ ...newCampaign, assigned_creator_ids: newIds });
                    }}
                  />
                  <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-600 transition-colors truncate">
                    {creator.display_name || creator.email.split('@')[0]}
                  </span>
                </label>
              ))}
            </div>
            {creators.length === 0 && (
              <p className="text-[10px] font-medium text-gray-400 italic">No hay creadores disponibles para asignar.</p>
            )}
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white sm:static">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-100 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] px-8 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
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
