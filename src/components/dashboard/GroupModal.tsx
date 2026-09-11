import React from 'react';
import { X, Users } from 'lucide-react';
import { CreatorGroup } from '../../supabase';

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Índigo', badge: 'bg-indigo-600' },
  { id: 'emerald', label: 'Esmeralda', badge: 'bg-emerald-600' },
  { id: 'fuchsia', label: 'Fucsia', badge: 'bg-fuchsia-600' },
  { id: 'amber', label: 'Ámbar', badge: 'bg-amber-500' },
  { id: 'sky', label: 'Celeste', badge: 'bg-sky-500' },
  { id: 'rose', label: 'Rosa', badge: 'bg-rose-500' }
];

export const GROUP_COLORS = COLOR_OPTIONS.map(c => c.id);

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  group: Partial<CreatorGroup> & { name: string };
  setGroup: (g: any) => void;
  isEditing?: boolean;
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, onSubmit, group, setGroup, isEditing = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Users className="h-5 w-5 text-indigo-600" />
            {isEditing ? 'Editar Grupo' : 'Nuevo Grupo'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 text-slate-400 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre del Grupo</label>
            <input
              type="text"
              required
              value={group.name || ''}
              onChange={(e) => setGroup({ ...group, name: e.target.value })}
              placeholder="Ej: Tellus Cooperative"
              className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Emoji</label>
            <input
              type="text"
              value={group.logo_emoji || ''}
              onChange={(e) => setGroup({ ...group, logo_emoji: e.target.value })}
              placeholder="🌱"
              maxLength={4}
              className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Color del Grupo</label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGroup({ ...group, color: opt.id })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    group.color === opt.id
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-gray-100 bg-gray-50 text-slate-500 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${opt.badge}`}></span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descripción (opcional)</label>
            <textarea
              rows={2}
              value={group.description || ''}
              onChange={(e) => setGroup({ ...group, description: e.target.value })}
              placeholder="Equipo de creators enfocado en..."
              className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none resize-y"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
            >
              {isEditing ? 'Guardar' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;
