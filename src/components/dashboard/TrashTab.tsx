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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2.5rem] flex items-start gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 shrink-0">
          <Trash2 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-black text-amber-900">Papelera de Reciclaje</h3>
          <p className="text-sm text-amber-700/70 leading-relaxed font-medium">Aquí encontrarás el contenido que has eliminado. Puedes restaurarlo o eliminarlo permanentemente si ya no lo necesitas.</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Publicación</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Creador</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaña</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Eliminado</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {deletedContent.map((item) => {
              const creator = users.find(u => u.id === item.creator_id);
              const campaign = campaigns.find(c => c.id === item.campaign_id);
              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 shrink-0">
                        {item.thumbnail ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover grayscale opacity-50" /> : <Youtube className="h-5 w-5 text-gray-300" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-400 truncate max-w-[200px]">{item.title || 'Sin título'}</p>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{item.platform}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-gray-300" />
                      <span className="text-xs font-medium text-gray-400">{item.creator_id ? (creator?.display_name || 'Desconocido') : (item.guest_name || 'Invitado')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Hash className="h-3 w-3" />
                      <span className="text-xs font-medium">{campaign?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-medium">{new Date(item.deleted_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore(item.id)}
                        className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
                        title="Restaurar"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item.id)}
                        className="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {deletedContent.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-8 w-8 text-gray-200" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">La papelera está vacía</h3>
                  <p className="text-sm text-gray-400">El contenido eliminado aparecerá aquí.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrashTab;
