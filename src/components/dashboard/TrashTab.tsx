import React from 'react';
import { Trash2, RotateCcw, Youtube, Clock, Users, Hash } from 'lucide-react';
import { supabase } from '../../supabase';

interface TrashTabProps {
  deletedContent: any[];
  users: any[];
  campaigns: any[];
  success: (msg: string) => void;
  toastError: (msg: string) => void;
  refresh: () => void;
}

const TrashTab: React.FC<TrashTabProps> = ({
  deletedContent,
  users,
  campaigns,
  success,
  toastError,
  refresh
}) => {
  const handleRestore = async (id: string) => {
    const { error } = await supabase.from('content').update({ deleted_at: null }).eq('id', id);
    if (error) toastError('Error: ' + error.message);
    else { success('Contenido restaurado'); refresh(); }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('¿Eliminar permanentemente? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('content').delete().eq('id', id);
    if (error) toastError('Error: ' + error.message);
    else { success('Eliminado permanentemente'); refresh(); }
  };

  return (    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-gray-100 p-10 rounded-[3rem] flex items-start gap-6 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100 shrink-0">
          <Trash2 className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Depósito de Seguridad</h3>
          <p className="text-base text-slate-500 leading-relaxed font-medium mt-1">Gestión de activos eliminados. Los elementos en este estado pueden ser restaurados al ecosistema activo o eliminados de forma irreversible.</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Publicación</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creador</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaña</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Eliminado</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {deletedContent.map((item) => {
              const creator = users.find(u => u.id === item.creator_id);
              const campaign = campaigns.find(c => c.id === item.campaign_id);
              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 shrink-0 shadow-inner">
                        {item.thumbnail ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover grayscale opacity-40" /> : <Youtube className="h-6 w-6 text-slate-200" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-400 truncate max-w-[200px] uppercase tracking-tight">{item.title || 'Sin título'}</p>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1 block opacity-60">{item.platform}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-slate-300" />
                      <span className="text-sm font-bold text-slate-400">{item.creator_id ? (creator?.display_name || 'Desconocido') : (item.guest_name || 'Invitado')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Hash className="h-4 w-4" />
                      <span className="text-sm font-bold">{campaign?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <div className="flex items-center justify-center gap-3 text-slate-300">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-bold">{new Date(item.deleted_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleRestore(item.id)}
                        className="p-4 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100 active:scale-90"
                        title="Restaurar"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item.id)}
                        className="p-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 active:scale-90"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {deletedContent.length === 0 && (
              <tr>
                <td colSpan={5} className="py-40 text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm">
                    <Trash2 className="h-10 w-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">El depósito está vacío</h3>
                  <p className="text-sm text-slate-400 mt-2 font-medium">No se detectaron activos en estado de eliminación.</p>
                </td>
              </tr>
            )}           )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrashTab;
