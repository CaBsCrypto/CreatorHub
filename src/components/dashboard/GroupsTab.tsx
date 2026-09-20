import React, { useState } from 'react';
import { Users, Plus, Pencil, UserPlus, BarChart3, Trash2, Globe, ArrowRight, LayoutDashboard, Check } from 'lucide-react';
import { supabase, CreatorGroup, CreatorGroupMember, UserProfile, Campaign, Content, UserRole } from '../../supabase';
import GroupModal from './GroupModal';
import GroupMembersModal from './GroupMembersModal';
import { useToast } from '../../hooks/useToast';

interface GroupsTabProps {
  groups: CreatorGroup[];
  groupMembers: CreatorGroupMember[];
  users: UserProfile[];
  campaigns: Campaign[];
  content: Content[];
  refresh: () => void;
  activeGroupId?: string;
  setActiveGroupId?: (id: string) => void;
  onEnterGroup?: (groupId: string) => void;
}

const COLOR_STYLES: Record<string, { gradient: string; text: string; bgSoft: string; border: string }> = {
  indigo:  { gradient: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600', bgSoft: 'bg-indigo-50', border: 'border-indigo-100' },
  emerald: { gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600', bgSoft: 'bg-emerald-50', border: 'border-emerald-100' },
  fuchsia: { gradient: 'from-fuchsia-500 to-fuchsia-600', text: 'text-fuchsia-600', bgSoft: 'bg-fuchsia-50', border: 'border-fuchsia-100' },
  amber:   { gradient: 'from-amber-400 to-amber-500', text: 'text-amber-600', bgSoft: 'bg-amber-50', border: 'border-amber-100' },
  sky:     { gradient: 'from-sky-400 to-sky-500', text: 'text-sky-600', bgSoft: 'bg-sky-50', border: 'border-sky-100' },
  rose:    { gradient: 'from-rose-400 to-rose-500', text: 'text-rose-600', bgSoft: 'bg-rose-50', border: 'border-rose-100' }
};

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || null;

const GroupsTab: React.FC<GroupsTabProps> = ({ 
  groups, 
  groupMembers, 
  users, 
  campaigns, 
  content, 
  refresh,
  activeGroupId = 'all',
  setActiveGroupId,
  onEnterGroup
}) => {
  const { success, error: toastError } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CreatorGroup | null>(null);
  const [groupForm, setGroupForm] = useState<Partial<CreatorGroup> & { name: string }>({ name: '', color: 'indigo', logo_emoji: '' });
  const [membersGroup, setMembersGroup] = useState<CreatorGroup | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const creators = users.filter(u => u.role === 'creator');
  const activeGroup = groups.find(g => g.id === activeGroupId);

  const openCreate = () => {
    setEditingGroup(null);
    setGroupForm({ name: '', color: 'indigo', logo_emoji: '' });
    setIsModalOpen(true);
  };

  const openEdit = (group: CreatorGroup) => {
    setEditingGroup(group);
    setGroupForm({ name: group.name, color: group.color, logo_emoji: group.logo_emoji || '', description: group.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editingGroup) {
        const { error } = await supabase
          .from('creator_groups')
          .update({
            name: groupForm.name.trim(),
            slug: slugify(groupForm.name) || editingGroup.slug,
            color: groupForm.color || 'indigo',
            logo_emoji: groupForm.logo_emoji || null,
            description: groupForm.description || null
          })
          .eq('id', editingGroup.id);
        if (error) throw error;
        success('Grupo actualizado');
      } else {
        const { error } = await supabase
          .from('creator_groups')
          .insert([{
            name: groupForm.name.trim(),
            slug: slugify(groupForm.name),
            color: groupForm.color || 'indigo',
            logo_emoji: groupForm.logo_emoji || null,
            description: groupForm.description || null
          }]);
        if (error) throw error;
        success('Grupo creado');
      }
      setIsModalOpen(false);
      refresh();
    } catch (err: any) {
      toastError('Error: ' + (err.message || 'No se pudo guardar el grupo'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (group: CreatorGroup) => {
    if (!confirm(`¿Eliminar el grupo "${group.name}"? (borrado suave, las campañas quedan sin grupo)`)) return;
    try {
      const { error } = await supabase
        .from('creator_groups')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', group.id);
      if (error) throw error;
      success('Grupo eliminado');
      refresh();
    } catch (err: any) {
      toastError('Error al eliminar: ' + err.message);
    }
  };

  const toggleMember = (creatorId: string, isMember: boolean) => {
    if (!membersGroup) return;
    // Fire-and-forget; refresh at the end for consistency
    const op = isMember
      ? supabase.from('creator_group_members').delete().eq('group_id', membersGroup.id).eq('creator_id', creatorId)
      : supabase.from('creator_group_members').insert([{ group_id: membersGroup.id, creator_id: creatorId }]);
    op.then(({ error }) => {
      if (error) toastError('Error al actualizar miembros: ' + error.message);
      refresh();
    });
  };

  const statsFor = (groupId: string) => {
    const memberCount = groupMembers.filter(m => m.group_id === groupId).length;
    const groupCampaigns = campaigns.filter(c => c.group_id === groupId);
    const campaignIdSet = new Set(groupCampaigns.map(c => c.id));
    const views = content.filter(c => campaignIdSet.has(c.campaign_id)).reduce((s, c) => s + (c.views || 0), 0);
    return { memberCount, campaignCount: groupCampaigns.length, views };
  };

  const handleEnter = (groupId: string) => {
    if (onEnterGroup) {
      onEnterGroup(groupId);
    } else if (setActiveGroupId) {
      setActiveGroupId(groupId);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Active Space Banner (if scoped) */}
      {activeGroup ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-white border border-indigo-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center text-2xl shadow-sm">
              {activeGroup.logo_emoji || '👥'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Espacio Activo Actualmente</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                Estás dentro del espacio de <span className="font-black text-indigo-600">{activeGroup.name}</span>. Todos los paneles muestran exclusivamente información de este grupo.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveGroupId && setActiveGroupId('all')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex-shrink-0"
          >
            <Globe className="h-4 w-4 text-indigo-600" />
            Ver Todo (Vista Global)
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100/70 border border-slate-200 text-slate-600">
          <div className="flex items-center gap-2.5">
            <Globe className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold">Modo Main Admin: <span className="font-extrabold text-slate-900">Vista Global Activa</span> (visualizando todas las marcas juntas).</span>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider hidden sm:inline">Selecciona un grupo abajo para entrar a su panel</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Grupos y Espacios de Marcas</h2>
            <p className="text-xs text-slate-400 font-medium">Cada grupo empaqueta sus campañas, creadores y contenidos de forma independiente.</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
        >
          <Plus className="h-4 w-4" /> Nuevo Grupo
        </button>
      </div>

      {/* Group Cards */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sin grupos</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Crea tu primer grupo para organizar creators y campañas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => {
            const cs = COLOR_STYLES[group.color] || COLOR_STYLES.indigo;
            const s = statsFor(group.id);
            const isCurrentActive = activeGroupId === group.id;

            return (
              <div 
                key={group.id} 
                className={`bg-white rounded-2xl border transition-all overflow-hidden group hover:shadow-lg ${
                  isCurrentActive 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-100' 
                    : 'border-gray-100 shadow-sm'
                }`}
              >
                <div className={`h-2 bg-gradient-to-r ${cs.gradient}`} />
                <div className="p-6 flex flex-col h-[calc(100%-8px)] justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl ${cs.bgSoft} ${cs.border} border flex items-center justify-center text-2xl flex-shrink-0`}>
                          {group.logo_emoji || '👥'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 truncate">{group.name}</h3>
                            {isCurrentActive && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" /> Activo
                              </span>
                            )}
                          </div>
                          {group.description && (
                            <p className="text-xs text-slate-400 font-medium truncate">{group.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => openEdit(group)} title="Editar" className="p-2 rounded-lg hover:bg-gray-100 text-slate-400 hover:text-slate-600 transition-all">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(group)} title="Eliminar" className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-5">
                      <div className={`${cs.bgSoft} rounded-xl p-3 text-center`}>
                        <p className={`text-lg font-black ${cs.text}`}>{s.memberCount}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Creators</p>
                      </div>
                      <div className={`${cs.bgSoft} rounded-xl p-3 text-center`}>
                        <p className={`text-lg font-black ${cs.text}`}>{s.campaignCount}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Campañas</p>
                      </div>
                      <div className={`${cs.bgSoft} rounded-xl p-3 text-center`}>
                        <p className={`text-lg font-black ${cs.text}`}>{
                          s.views >= 1_000_000 ? `${(s.views / 1_000_000).toFixed(1)}M`
                          : s.views >= 1_000 ? `${(s.views / 1_000).toFixed(1)}K`
                          : s.views
                        }</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Views</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {isCurrentActive ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEnter(group.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                        >
                          <LayoutDashboard className="h-4 w-4" /> Ver Resumen
                        </button>
                        <button
                          onClick={() => setActiveGroupId && setActiveGroupId('all')}
                          title="Salir a vista global"
                          className="px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-black uppercase tracking-widest transition-all"
                        >
                          <Globe className="h-4 w-4 text-indigo-600" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEnter(group.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 shadow-md hover:shadow-indigo-200 transition-all"
                      >
                        <ArrowRight className="h-4 w-4" /> Entrar a este Espacio
                      </button>
                    )}

                    <button
                      onClick={() => setMembersGroup(group)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border ${cs.border} ${cs.bgSoft} ${cs.text} text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all`}
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Gestionar Miembros
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <GroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        group={groupForm}
        setGroup={setGroupForm}
        isEditing={!!editingGroup}
      />
      {membersGroup && (
        <GroupMembersModal
          group={membersGroup}
          creators={creators}
          members={groupMembers}
          onToggleMember={toggleMember}
          onClose={() => setMembersGroup(null)}
        />
      )}
    </div>
  );
};

export default GroupsTab;
