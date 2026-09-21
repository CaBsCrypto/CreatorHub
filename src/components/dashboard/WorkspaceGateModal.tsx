import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Sparkles, ArrowRight, Plus, 
  Layers, UsersRound, Compass, CheckCircle2 
} from 'lucide-react';
import { CreatorGroup } from '../../supabase';
import GroupModal from './GroupModal';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../supabase';

interface WorkspaceGateModalProps {
  isOpen: boolean;
  groups: CreatorGroup[];
  campaigns: any[];
  users: any[];
  onSelectGroup: (groupId: string) => void;
  onRefreshGroups: () => Promise<void>;
  canClose?: boolean;
  onClose?: () => void;
}

export const WorkspaceGateModal: React.FC<WorkspaceGateModalProps> = ({
  isOpen,
  groups,
  campaigns,
  users,
  onSelectGroup,
  onRefreshGroups,
  canClose = false,
  onClose
}) => {
  const { success, error: toastError } = useToast();
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupForm, setNewGroupForm] = useState<Partial<CreatorGroup> & { name: string }>({
    name: '',
    color: 'emerald',
    logo_emoji: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupForm.name.trim()) return;

    setIsSaving(true);
    try {
      const slug = newGroupForm.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || null;

      const { data, error } = await supabase
        .from('creator_groups')
        .insert({
          name: newGroupForm.name.trim(),
          slug,
          color: newGroupForm.color || 'emerald',
          logo_emoji: newGroupForm.logo_emoji || null,
          description: newGroupForm.description || null
        })
        .select()
        .single();

      if (error) throw error;

      success(`Organización "${data.name}" creada con éxito`);
      setIsCreatingGroup(false);
      setNewGroupForm({ name: '', color: 'emerald', logo_emoji: '' });
      await onRefreshGroups();
      onSelectGroup(data.id);
    } catch (err: any) {
      toastError("Error al registrar la organización: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-2xl overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-2xl shadow-slate-950/20 relative my-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3">
              <Compass className="h-3.5 w-3.5" />
              <span>Zona de Selección de Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ¿En qué negocio vas a operar hoy?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Selecciona el espacio de trabajo para aislar campañas, creadores y analíticas sin mezclar datos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Añadir Negocio</span>
            </button>
            {canClose && onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 text-xs font-bold transition-all"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>

        {/* Groups Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-8">
          {groups.map((group) => {
            const s = (group.slug || group.name).toLowerCase();
            const isUmbra = s.includes('umbra');
            const isTellus = s.includes('tellus');

            const groupCampaignCount = campaigns.filter(c => c.group_id === group.id).length;

            return (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectGroup(group.id)}
                className={`p-6 sm:p-8 rounded-3xl border-2 cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between group shadow-sm ${
                  isUmbra
                    ? 'border-rose-100 hover:border-rose-500 bg-gradient-to-br from-white via-rose-50/20 to-rose-50/40 hover:shadow-rose-500/10'
                    : isTellus
                      ? 'border-emerald-100 hover:border-emerald-500 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-50/40 hover:shadow-emerald-500/10'
                      : 'border-slate-100 hover:border-indigo-500 bg-gradient-to-br from-white via-slate-50 to-indigo-50/30'
                }`}
              >
                {/* Decorative blob */}
                <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${
                  isUmbra ? 'bg-rose-600' : isTellus ? 'bg-emerald-600' : 'bg-indigo-600'
                }`} />

                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md ${
                      isUmbra
                        ? 'bg-rose-600 text-white shadow-rose-200'
                        : isTellus
                          ? 'bg-emerald-600 text-white shadow-emerald-200'
                          : 'bg-slate-900 text-white shadow-slate-200'
                    }`}>
                      {group.logo_emoji || (isUmbra ? '⚡' : isTellus ? '🌱' : '🏢')}
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isUmbra
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isTellus
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {isUmbra ? 'Agencia Creativa' : isTellus ? 'Cooperative Hub' : 'Organización'}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-slate-950 transition-colors">
                    {group.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
                    {group.description || (isUmbra 
                      ? 'Campañas de alto impacto, creadores Web3 y branding carmesí.' 
                      : isTellus 
                        ? 'Management de creadores cooperativos y ecosistema sustentable.' 
                        : 'Espacio de trabajo y analítica independiente.')}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100/80 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-400">
                    <span className="text-slate-900 font-black">{groupCampaignCount}</span> {groupCampaignCount === 1 ? 'campaña activa' : 'campañas activas'}
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
                    isUmbra ? 'text-rose-600' : isTellus ? 'text-emerald-600' : 'text-indigo-600'
                  }`}>
                    <span>Entrar</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal para crear nuevo grupo */}
        <GroupModal
          isOpen={isCreatingGroup}
          onClose={() => setIsCreatingGroup(false)}
          onSubmit={handleCreateGroupSubmit}
          group={newGroupForm}
          setGroup={setNewGroupForm}
          isEditing={false}
        />
      </motion.div>
    </div>
  );
};

export default WorkspaceGateModal;
