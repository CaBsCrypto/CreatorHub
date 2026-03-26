import React, { useState, useMemo } from 'react';
import { supabase, UserProfile } from '../supabase';
import { useAuth } from '../AuthContext';
import { 
  Plus, Download, RefreshCw, Sparkles, LayoutDashboard, 
  List, Users, Youtube, TrendingUp, AlertTriangle, Target,
  BarChart3, Award, Zap, Trophy, Search, Filter, Trash2, ShieldCheck, Edit2,
  LayoutGrid, List as ListIcon, Briefcase, Wallet, DollarSign, Calendar, Calculator, X, Image as ImageIcon
} from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { normalizeUrl } from '../utils/urlParser';

import { UserRole } from '../supabase';

// Custom Hooks
import { useDashboardData, getAgencyRank, AGENCY_TIERS } from '../hooks/useDashboardData';
import { useToast } from '../hooks/useToast';
import { useTabNavigation, useFilterParams } from '../hooks/useTabNavigation';

// Modular Components (Shared)
import AdminMetricCard from '../components/dashboard/AdminMetricCard';
import CampaignCard from '../components/dashboard/CampaignCard';
import CreatorCard from '../components/dashboard/CreatorCard';
import ContentCard, { ContentItem } from '../components/dashboard/ContentCard';
import TwitchStatsModal from '../components/dashboard/TwitchStatsModal';
import AddCampaignModal from '../components/dashboard/AddCampaignModal';
import AddUserModal from '../components/dashboard/AddUserModal';
import AudienceGeoModal from '../components/dashboard/AudienceGeoModal';
import ContentModal from '../components/dashboard/ContentModal';
import ContentDetailModal from '../components/dashboard/ContentDetailModal';
import CreatorSearchModal from '../components/dashboard/CreatorSearchModal';
import UserHistoryModal from '../components/dashboard/UserHistoryModal';
import CampaignReportModal from '../components/dashboard/CampaignReportModal';

// Modular Tab Components
import OverviewTab from '../components/dashboard/OverviewTab';
import CampaignsTab from '../components/dashboard/CampaignsTab';
import CreatorsTab from '../components/dashboard/CreatorsTab';
import ContentTab from '../components/dashboard/ContentTab';
import TeamTab from '../components/dashboard/TeamTab';
import PaymentsTab from '../components/dashboard/PaymentsTab';
import TrashTab from '../components/dashboard/TrashTab';
import ActivityTab from '../components/dashboard/ActivityTab';
import ClientsTab from '../components/dashboard/ClientsTab';

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#0f172a', // Dark Slate/Black
  instagram: '#e1306c', // Pink
  youtube: '#ff0000', // Red
  x: '#1da1f2', // Twitter Blue
  twitch: '#9146ff', // Purple
  coinmarketcap: '#0d3efd' // Blue
};

const ADMIN_TABS = ['overview', 'campaigns', 'clients', 'content', 'creators', 'payments', 'team', 'activity', 'trash'] as const;
type AdminTab = typeof ADMIN_TABS[number];

const sidebarItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campañas', icon: List },
  { id: 'clients', label: 'Clientes', icon: Briefcase },
  { id: 'content', label: 'Contenido', icon: Youtube },
  { id: 'creators', label: 'Creadores', icon: Users },
  { id: 'payments', label: 'Pagos', icon: Wallet },
  { id: 'team', label: 'Equipo', icon: ShieldCheck },
  { id: 'activity', label: 'Actividad', icon: Zap },
  { id: 'trash', label: 'Papelera', icon: Trash2 }
] as const;

export default function AdminDashboard() {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  
  // Tab management moved to filters hook for atomic state updates
  
  // Modals state
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isEditingCampaign, setIsEditingCampaign] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingAudienceUser, setEditingAudienceUser] = useState<UserProfile | null>(null);
  const [isTwitchModalOpen, setIsTwitchModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [isAnalyzingCreator, setIsAnalyzingCreator] = useState(false);
  const [managingUser, setManagingUser] = useState<UserProfile | null>(null);
  const [selectedCampaignReport, setSelectedCampaignReport] = useState<string | null>(null);
  
  // Processing states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyzingTwitch, setIsAnalyzingTwitch] = useState(false);
  const [isProcessingContent, setIsProcessingContent] = useState(false);
  
  // Form states
  const [newCampaign, setNewCampaign] = useState({ 
    name: '', 
    description: '', 
    client_id: '',
    twitter_url: '',
    contact_info: '',
    budget: 0
  });
  const [newUser, setNewUser] = useState<{ email: string; role: UserRole; linked_campaign_id?: string }>({ email: '', role: 'creator' });
  const [twitchStats, setTwitchStats] = useState<any>(null);
  const [twitchPreview, setTwitchPreview] = useState<string | null>(null);

  // Filters (synced to URL)
  const [filters, setFilter, setFilters, resetFilters] = useFilterParams({ 
    tab: 'overview',
    search: '', 
    platform: 'all', 
    campaign: 'all', 
    creator: 'all', 
    view: 'compact',
    pay_campaign: 'all',
    pay_month: 'all',
    team_role: 'all'
  });
  const activeTab = filters.tab as typeof ADMIN_TABS[number];
  const setActiveTab = (tab: typeof ADMIN_TABS[number]) => setFilter('tab', tab);
  const searchTerm = filters.search;
  const filterPlatform = filters.platform;
  const filterCampaign = filters.campaign;
  const filterCreator = filters.creator;
  const payCampaign = filters.pay_campaign;
  const payMonth = filters.pay_month;
  const teamRole = filters.team_role;
  const viewMode = (filters.view as 'grid' | 'compact' | 'gallery') || 'compact';
  const isCompactView = viewMode === 'compact';
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([]);
  const [deletedContentIds, setDeletedContentIds] = useState<string[]>([]);
  const [viewingDeleted, setViewingDeleted] = useState<{ type: 'content' | 'campaign' | 'user', item: any } | null>(null);

  const { campaigns, content, users, payments, metrics, creatorStats, campaignStats, refresh, filteredContent, deletedContent, deletedCampaigns, deletedUsers, auditLogs } = useDashboardData('admin', { 
    platform: filters.platform, 
    campaign: filters.campaign, 
    creator: filters.creator 
  });

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchCampaign = payCampaign === 'all' || p.campaign_id === payCampaign;
      const matchMonth = payMonth === 'all' || p.paid_at.startsWith(payMonth);
      return matchCampaign && matchMonth;
    });
  }, [payments, payCampaign, payMonth]);
  // Payments form
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ creator_id: '', guest_name: '', amount: '', currency: 'USDT', concept: '', campaign_id: '', paid_at: new Date().toISOString().split('T')[0] });

  const filteredUsers = useMemo(() => {
    let result = users.filter(u => !deletedUserIds.includes(u.id));
    if (teamRole !== 'all') {
      if (teamRole === 'staff') {
        result = result.filter(u => u.role === 'admin' || u.role === 'manager');
      } else {
        result = result.filter(u => u.role === teamRole);
      }
    }
    return result;
  }, [users, deletedUserIds, teamRole]);

  const groupedLogs = useMemo(() => {
    const groups: Record<string, any[]> = {};
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    auditLogs.forEach(log => {
      const date = new Date(log.created_at);
      const dateStr = date.toLocaleDateString();
      let groupKey = dateStr;
      
      if (dateStr === today) groupKey = 'Hoy';
      else if (dateStr === yesterday) groupKey = 'Ayer';
      else {
        groupKey = date.toLocaleDateString(undefined, { 
          day: 'numeric', 
          month: 'long', 
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
        });
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(log);
    });

    return Object.entries(groups).sort((a, b) => {
      // Sort by priority if needed, but the original auditLogs is already sorted by date descending.
      // We just need to ensure the most recent is first.
      return new Date(groups[b[0]][0].created_at).getTime() - new Date(groups[a[0]][0].created_at).getTime();
    });
  }, [auditLogs]);

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta campaña?')) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) {
      toastError("Error al eliminar campaña: " + error.message);
    } else {
      success("Campaña eliminada");
      refresh();
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('campaigns').insert([{ 
      name: newCampaign.name,
      description: newCampaign.description,
      client_id: newCampaign.client_id || null,
      twitter_url: newCampaign.twitter_url || null,
      contact_info: newCampaign.contact_info || null,
      budget: newCampaign.budget || 0,
      status: 'active', 
      created_by: user?.id 
    }]);
    if (error) {
      toastError("Error al crear campaña: " + error.message);
    } else {
      success("Campaña creada con éxito");
      setIsCreatingCampaign(false);
      setNewCampaign({ name: '', description: '', client_id: '', twitter_url: '', contact_info: '', budget: 0 });
      refresh();
    }
  };

  const handleEditCampaign = (campaign: any) => {
    setEditingCampaignId(campaign.id);
    setNewCampaign({
      name: campaign.name,
      description: campaign.description || '',
      client_id: campaign.client_id || '',
      twitter_url: campaign.twitter_url || '',
      contact_info: campaign.contact_info || '',
      budget: campaign.budget || 0
    });
    setIsEditingCampaign(true);
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaignId) return;

    const { error } = await supabase
      .from('campaigns')
      .update({ 
        name: newCampaign.name,
        description: newCampaign.description,
        client_id: newCampaign.client_id || null,
        twitter_url: newCampaign.twitter_url || null,
        contact_info: newCampaign.contact_info || null,
        budget: newCampaign.budget || 0
      })
      .eq('id', editingCampaignId);

    if (error) {
      toastError("Error al actualizar campaña: " + error.message);
    } else {
      success("Campaña actualizada con éxito");
      setIsEditingCampaign(false);
      setEditingCampaignId(null);
      setNewCampaign({ name: '', description: '', client_id: '', twitter_url: '', contact_info: '', budget: 0 });
      refresh();
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: newUser.email,
          role: newUser.role,
          display_name: newUser.email.split('@')[0]
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al crear usuario en el servidor');
      }

      success("Usuario añadido con éxito");

      const newUserObj = data.user;

      // Vincular a campaña si se seleccionó una
      if (newUser.role === 'client' && newUser.linked_campaign_id && newUserObj?.id) {
        await supabase.from('campaigns').update({ client_id: newUserObj.id }).eq('id', newUser.linked_campaign_id);
      }

      // Enviar invitación si es un cliente
      if (newUser.role === 'client') {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const emailRes = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              to: [newUser.email, 'cabscryptocontacto@gmail.com'],
              subject: '🎁 Invitación a Umbra Creator Hub',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f3f4f6; border-radius: 20px;">
                  <h2 style="color: #4f46e5; margin-bottom: 20px;">¡Bienvenido a Umbra!</h2>
                  <p style="color: #374151; font-size: 16px; line-height: 1.5;">Has sido invitado como <strong>Cliente</strong> para colaborar y ver las métricas de tu campaña en tiempo real.</p>
                  <div style="margin: 30px 0;">
                    <a href="https://creator-hub-three-lake.vercel.app/login" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Acceder a mi panel</a>
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">Inicia sesión usando Google con tu correo asociado a esta cuenta (${newUser.email}).</p>
                  <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
                  <p style="color: #9ca3af; font-size: 12px; text-align: center;">El equipo de Umbra</p>
                </div>
              `
            })
          });
          
          if (!emailRes.ok) {
            const errData = await emailRes.json();
            throw new Error(errData.error || "Error al enviar el correo de invitación.");
          }
          
          success("Invitación enviada por correo");
        } catch (emailErr: any) {
          console.error("Email send failed:", emailErr);
          toastError("El usuario se creó pero hubo un error enviando el email: " + emailErr.message);
        }
      }

      setIsAddingUser(false);
      setNewUser({ email: '', role: 'creator' });
      refresh();

    } catch (err: any) {
      toastError("Error al añadir usuario: " + err.message);
    }
  };

  const handleUpdateUserRole = async (newRole: UserRole) => {
    if (!managingUser) return;
    const { data: updatedData, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', managingUser.id)
      .select();
    
    if (error || !updatedData?.length) {
      toastError("Error al actualizar rol: Permisos insuficientes (RLS).");
    } else {
      success("Rol actualizado correctamente");
      setManagingUser(prev => prev ? { ...prev, role: newRole } : null);
      refresh();
    }
  };

  const handleRemoveUser = async () => {
    if (!managingUser) return;
    
    const confirmMsg = `¿Estás seguro de que quieres eliminar a ${managingUser.display_name || managingUser.email}? Esta acción también eliminará todo su contenido vinculado.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      // 1. First delete any content associated with this user
      const { error: contentError } = await supabase
        .from('content')
        .delete()
        .eq('creator_id', managingUser.id);
      
      if (contentError) throw contentError;

      // 2. Check and handle campaigns created by this user
      // We'll try to delete them if they have no other content, or reassign them?
      // For now, let's try to delete them (they might be test campaigns too)
      const { error: campaignError } = await supabase
        .from('campaigns')
        .delete()
        .eq('created_by', managingUser.id);
      
      // We don't throw immediately if campaign deletion fails (might have content from others)
      // but we warn the user.
      if (campaignError) {
        console.warn("Could not delete campaigns created by user:", campaignError.message);
        // If we can't delete campaigns, we might not be able to delete the user.
        // Let's try to reassign those campaigns to the current admin instead.
        if (user?.id) {
          await supabase.from('campaigns').update({ created_by: user.id }).eq('created_by', managingUser.id);
        }
      }

      // 3. Then delete the user from the agency
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', managingUser.id);
      
      if (userError) throw userError;
      
      // Visual removal
      setDeletedUserIds(prev => [...prev, managingUser.id]);
      
      success("Miembro eliminado correctamente");
      setManagingUser(null);
      
      // Optimistic update: manually remove from local state if needed
      // (though refresh() should handle it)
      await refresh();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      toastError("Error al eliminar: " + (err.message || "Verifica dependencias (campañas, contenido)."));
    }
  };

  const handleSaveTwitch = async () => {
    if (!twitchStats) return;
    const { error } = await supabase.from('content').insert([{
      platform: 'twitch',
      url: 'https://twitch.tv/' + (twitchStats.title || 'stream'),
      title: twitchStats.title,
      views: twitchStats.views,
      peek_viewers: twitchStats.peek_viewers,
      thumbnail: twitchPreview,
      uploaded_at: new Date().toISOString(),
      creator_id: user?.id || '' // Assuming the current user is the creator for manual Twitch saves
    }]);
    if (error) {
       toastError("Error al guardar estadísticas de Twitch: " + error.message);
    } else {
      success("Estadísticas de Twitch guardadas");
      setIsTwitchModalOpen(false);
    }
  };



  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 p-8 hidden lg:block">
        <div 
          onClick={() => {
            resetFilters({ tab: 'overview' } as any);
          }}
          className="flex items-center gap-3 px-2 mb-10 cursor-pointer group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
            <Sparkles className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tighter group-hover:text-indigo-600 transition-colors">Umbra <span className="text-indigo-600 group-hover:text-indigo-700">Admin</span></span>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'overview') {
                  resetFilters({ tab: 'overview' } as any);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === item.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto pb-32 lg:pb-12 bg-gray-50/30">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">Panel de Control</h1>
            <p className="text-sm font-medium text-gray-400">Gestiona la agencia, creadores y campañas activas.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto animate-in fade-in slide-in-from-right-4 duration-500 relative">
            <div className="relative">
              <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} 
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all active:scale-95 border ${
                  isFilterMenuOpen || (filterPlatform !== 'all' || filterCampaign !== 'all' || filterCreator !== 'all' || payMonth !== 'all' || teamRole !== 'all')
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' 
                    : 'bg-white text-gray-900 border-gray-100 shadow-sm hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4" /> 
                Filtros
                {(filterPlatform !== 'all' || filterCampaign !== 'all' || filterCreator !== 'all' || payMonth !== 'all' || teamRole !== 'all') && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center animate-bounce">
                    {[filterPlatform, filterCampaign, filterCreator, payMonth, teamRole].filter(f => f !== 'all').length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isFilterMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterMenuOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-3 w-[320px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 z-50 space-y-6"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Ajustar Vista</h4>
                        <button onClick={() => resetFilters()} className="text-[10px] font-black text-rose-500 uppercase hover:underline">Limpiar</button>
                      </div>

                        <div className="space-y-4">
                          <div className="border-b border-gray-50 pb-2 mb-2">
                             <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Filtros Globales</h5>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Plataforma</label>
                            <select value={filterPlatform} onChange={e => setFilter('platform', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                              <option value="all">Todas las plataformas</option>
                              <option value="tiktok">TikTok</option>
                              <option value="instagram">Instagram</option>
                              <option value="youtube">YouTube</option>
                               <option value="twitch">Stream</option>
                              <option value="x">X / Twitter</option>
                              <option value="coinmarketcap">CoinMarketCap</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Campaña</label>
                            <select value={filterCampaign} onChange={e => setFilter('campaign', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                              <option value="all">Todas las campañas</option>
                              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Colaborador / Invitado</label>
                            <select value={filterCreator} onChange={e => setFilter('creator', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                              <option value="all">Todos los colaboradores</option>
                              
                              <optgroup label="Equipo (Cuentas)">
                                {users.filter(u => u.role !== 'client').map(u => (
                                  <option key={u.id} value={u.id}>
                                    {u.admin_alias || u.display_name || u.email.split('@')[0]} ({u.role})
                                  </option>
                                ))}
                              </optgroup>

                              {content.some(c => !c.creator_id && c.guest_name) && (
                                <optgroup label="Invitados (Manuales)">
                                  {[...new Set(content.filter(c => !c.creator_id && c.guest_name).map(c => c.guest_name))].map(name => (
                                    <option key={name} value={`guest:${name}`}>{name}</option>
                                  ))}
                                </optgroup>
                              )}
                            </select>
                          </div>

                          {(activeTab === 'payments' || activeTab === 'team') && (
                            <div className="pt-4 border-t border-gray-100 mt-2">
                               <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Filtros Específicos ({activeTab})</h5>
                               
                               {activeTab === 'payments' && (
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Mes del Pago</label>
                                  <select value={payMonth} onChange={e => setFilter('pay_month', e.target.value)} className="w-full bg-indigo-50/50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value="all">Todos los meses</option>
                                    {[...new Set(payments.map(p => p.paid_at.substring(0, 7)))].sort().reverse().map(month => (
                                      <option key={month} value={month}>{new Date(month + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</option>
                                    ))}
                                  </select>
                                </div>
                               )}

                               {activeTab === 'team' && (
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Rol del Miembro</label>
                                  <select value={teamRole} onChange={e => setFilter('team_role', e.target.value)} className="w-full bg-rose-50/50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-rose-700 focus:ring-2 focus:ring-rose-500 outline-none">
                                    <option value="all">Todos los roles</option>
                                    <option value="staff">Staff (Admin/Manager)</option>
                                    <option value="creator">Creadores</option>
                                    <option value="client">Clientes</option>
                                  </select>
                                </div>
                               )}
                            </div>
                          )}
                        </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setIsAnalyzingCreator(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100"><Search className="h-4 w-4" /> Analizar</button>
            <button onClick={() => setIsCreatingCampaign(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"><Plus className="h-4 w-4" /> Nueva Campaña</button>
            <button onClick={() => setIsAddingUser(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white text-gray-900 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 transition-all"><Users className="h-4 w-4" /> Añadir Miembro</button>
          </div>
        </header>

        {activeTab === 'clients' && (
          <ClientsTab 
            users={users} 
            campaigns={campaigns} 
            content={content} 
            PLATFORM_COLORS={PLATFORM_COLORS} 
            setSelectedCampaignReport={setSelectedCampaignReport} 
            info={info} 
          />
        )}

        {activeTab === 'overview' && (
          <OverviewTab 
            metrics={metrics} 
            campaigns={campaigns} 
            filteredContent={filteredContent} 
            PLATFORM_COLORS={PLATFORM_COLORS} 
            setActiveTab={setActiveTab} 
            setFilter={setFilter} 
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignsTab 
            campaignStats={campaignStats} 
            onDelete={handleDeleteCampaign} 
            onEdit={handleEditCampaign} 
            setFilters={setFilters} 
            setSelectedCampaignReport={setSelectedCampaignReport} 
          />
        )}

        {activeTab === 'creators' && (
          <CreatorsTab 
            creatorStats={creatorStats} 
            users={users} 
            deletedUserIds={deletedUserIds} 
            searchTerm={searchTerm} 
            setFilter={setFilter} 
            setManagingUser={setManagingUser} 
            setEditingAudienceUser={setEditingAudienceUser} 
          />
        )}

        {activeTab === 'content' && (
          <ContentTab 
            filteredContent={filteredContent} 
            deletedContentIds={deletedContentIds} 
            searchTerm={searchTerm} 
            setFilter={setFilter} 
            viewMode={viewMode}
            isCompactView={isCompactView}
            setEditingContent={setEditingContent} 
            setIsContentModalOpen={setIsContentModalOpen} 
            content={content}
            setIsRefreshing={setIsRefreshing}
            isRefreshing={isRefreshing}
            info={info} 
            success={success} 
            toastError={toastError} 
            refresh={refresh} 
            campaigns={campaigns} 
            users={users}
            setManagingUser={setManagingUser}
            setDeletedContentIds={setDeletedContentIds}
            supabase={supabase}
            resetFilters={resetFilters}
            filterCampaign={filterCampaign}
            filterPlatform={filterPlatform}
            filterCreator={filterCreator}
            setViewingContent={setViewingContent} 
          />
        )}

        {activeTab === 'team' && (
          <TeamTab 
            filteredUsers={filteredUsers} 
            setManagingUser={setManagingUser} 
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsTab 
            filteredPayments={filteredPayments} 
            isAddingPayment={isAddingPayment} 
            setIsAddingPayment={setIsAddingPayment} 
            newPayment={newPayment} 
            setNewPayment={setNewPayment} 
            users={users} 
            campaigns={campaigns} 
            refresh={refresh} 
            supabase={supabase} 
            success={success} 
            toastError={toastError} 
          />
        )}

        {activeTab === 'trash' && (
          <TrashTab 
            deletedContent={deletedContent} 
            users={users} 
            campaigns={campaigns} 
            supabase={supabase} 
            success={success} 
            toastError={toastError} 
            refresh={refresh} 
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTab 
            groupedLogs={groupedLogs} 
            auditLogs={auditLogs} 
            refresh={refresh} 
          />
        )}
      </main>

      {/* Modals */}
        <UserHistoryModal 
          user={managingUser}
          onClose={() => setManagingUser(null)}
          userContent={content.filter(c => c.creator_id === managingUser?.id)}
          userPayments={payments.filter(p => p.creator_id === managingUser?.id)}
          onUpdateRole={handleUpdateUserRole}
          onRemoveUser={handleRemoveUser}
          onUpdateAlias={async (alias) => {
            if (!managingUser) return;
            try {
              const { error } = await supabase
                .from('users')
                .update({ admin_alias: alias || null })
                .eq('id', managingUser.id);
              if (error) throw error;
              success("Apodo guardado correctamente");
              refresh();
              setManagingUser({ ...managingUser, admin_alias: alias || null });
            } catch (err: any) {
              toastError("Error al guardar apodo: " + err.message);
            }
          }}
          onRegisterPayment={(creatorId) => {
            setManagingUser(null);
            setNewPayment(prev => ({ ...prev, creator_id: creatorId }));
            setIsAddingPayment(true);
            setActiveTab('payments');
          }}
        />
        <ContentDetailModal 
          isOpen={!!viewingContent}
          onClose={() => setViewingContent(null)}
          item={viewingContent}
        />

        <AddCampaignModal 
          isOpen={isCreatingCampaign || isEditingCampaign} 
          isEditing={isEditingCampaign}
          onClose={() => {
            setIsCreatingCampaign(false);
            setIsEditingCampaign(false);
            setEditingCampaignId(null);
            setNewCampaign({ name: '', description: '', client_id: '', twitter_url: '', contact_info: '', budget: 0 });
          }} 
          onSubmit={isEditingCampaign ? handleUpdateCampaign : handleCreateCampaign} 
          newCampaign={newCampaign} 
          setNewCampaign={setNewCampaign}
          clients={users.filter(u => u.role === 'client')}
        />
        <AddUserModal 
          isOpen={isAddingUser} 
          onClose={() => setIsAddingUser(false)} 
          onSubmit={handleAddUser} 
          email={newUser.email} 
          setEmail={e => setNewUser({...newUser, email: e})} 
          role={newUser.role} 
          setRole={r => setNewUser({...newUser, role: r, linked_campaign_id: r === 'client' ? newUser.linked_campaign_id : undefined})} 
          campaigns={campaigns}
          linkedCampaignId={newUser.linked_campaign_id}
          setLinkedCampaignId={id => setNewUser({...newUser, linked_campaign_id: id})}
        />
         <AudienceGeoModal user={editingAudienceUser} onClose={() => setEditingAudienceUser(null)} onSave={async (id, geo) => { await supabase.from('users').update({ audience_geo: geo }).eq('id', id); setEditingAudienceUser(null); success("Audiencia actualizada"); }} />
        <TwitchStatsModal isOpen={isTwitchModalOpen} onClose={() => setIsTwitchModalOpen(false)} isAnalyzing={isAnalyzingTwitch} stats={twitchStats} onSave={handleSaveTwitch} previewImage={twitchPreview} />

        <ContentModal 
          isOpen={isContentModalOpen} 
          onClose={() => {
            setIsContentModalOpen(false);
            setEditingContent(null);
          }}
          campaigns={campaigns}
          users={users.filter(u => u.role !== 'client')}
          editingContent={editingContent as any}
          isProcessing={isProcessingContent}
          onTwitchUpload={async (file, selectedCreatorId, dCount, aCount, pCount, uvCount, uChatters, vCount, fCount, sCount) => {
            setIsProcessingContent(true);
            try {
              const activeCreatorId = selectedCreatorId || user?.id;
              const fileName = `${activeCreatorId}/${Date.now()}-${file.name}`;
              
              const { error: uploadError } = await supabase.storage
                .from('content-attachments')
                .upload(fileName, file, {
                  cacheControl: '3600',
                  upsert: false
                });

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                .from('content-attachments')
                .getPublicUrl(fileName);

              const { error: dbError } = await supabase.from('content').insert([{
                campaign_id: editingContent?.campaign_id || (campaigns[0]?.id || ''),
                platform: 'twitch',
                url: 'https://twitch.tv/stats-' + Date.now(),
                thumbnail: publicUrl,
                creator_id: activeCreatorId,
                status: 'active',
                views: vCount || 0,
                unique_viewers: uvCount || 0,
                peek_viewers: pCount || 0,
                average_viewers: aCount || 0,
                unique_chatters: uChatters || 0,
                followers: fCount || 0,
                new_subscriptions: sCount || 0,
                duration_minutes: dCount || 0,
                uploaded_at: new Date().toISOString()
              }]);

              if (dbError) throw dbError;

              success("Captura de Twitch guardada");
              setIsContentModalOpen(false);
              refresh();
            } catch (err: any) {
              toastError("Error al subir captura: " + err.message);
            } finally {
              setIsProcessingContent(false);
            }
          }}
          onSubmit={async (data) => {
            setIsProcessingContent(true);
            try {
              const activeCreatorId = data.creator_id === 'guest' ? null : (data.creator_id || user?.id);
              const guestName = data.creator_id === 'guest' ? data.guest_name : null;
              const cleanUrl = normalizeUrl(data.url, data.platform);

              if (editingContent) {
                // Check duplicate if URL changed
                if (cleanUrl !== normalizeUrl(editingContent.url, editingContent.platform)) {
                   const { data: existing } = await supabase.from('content').select('id').eq('campaign_id', data.campaign_id).eq('url', cleanUrl).is('deleted_at', null).neq('id', editingContent.id).limit(1);
                   if (existing && existing.length > 0) {
                      toastError("¡Ese enlace ya está vinculado a esta campaña!");
                      setIsProcessingContent(false);
                      return;
                   }
                }

                const { error } = await supabase
                  .from('content')
                  .update({ 
                    campaign_id: data.campaign_id, 
                    platform: data.platform, 
                    url: cleanUrl, 
                    creator_id: activeCreatorId,
                    guest_name: guestName,
                    title: data.title,
                    views: data.views,
                    likes: data.likes,
                    comments: data.comments
                  })
                  .eq('id', editingContent.id);
                
                if (error) throw error;
                success("Contenido actualizado");

                // If URL changed, fetch new metadata in background
                if (cleanUrl !== normalizeUrl(editingContent.url, editingContent.platform)) {
                  const { data: { session } } = await supabase.auth.getSession();
                  fetch('/api/fetch-metadata', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ url: cleanUrl, platform: data.platform })
                  }).then(async (res) => {
                    if (res.ok) {
                      const metadata = await res.json();
                      await supabase.from('content').update({
                        title: metadata.title || 'Contenido Actualizado',
                        thumbnail: metadata.thumbnail || '',
                        views: metadata.views || 0,
                        likes: metadata.likes || 0,
                        comments: metadata.comments || 0
                      }).eq('id', editingContent.id);
                      refresh();
                    }
                  }).catch(e => console.warn("Background update after edit failed:", e));
                }
              } else {
                // 1. Check duplicate for new inserts
                const { data: existing } = await supabase.from('content').select('id').eq('campaign_id', data.campaign_id).eq('url', cleanUrl).is('deleted_at', null).limit(1);
                if (existing && existing.length > 0) {
                    toastError("¡Este contenido ya se encuentra registrado en la campaña!");
                    setIsProcessingContent(false);
                    return;
                }

                // 2. INSERT IMMEDIATELY (FAST)
                const { data: insertedData, error } = await supabase.from('content').insert([{
                  ...data,
                  url: cleanUrl,
                  title: 'Cargando métricas...',
                  thumbnail: '',
                  views: data.views || 0,
                  unique_viewers: data.unique_viewers || 0,
                  likes: data.likes || 0,
                  comments: data.comments || 0,
                  peek_viewers: data.peek_viewers || 0,
                  average_viewers: data.average_viewers || 0,
                  unique_chatters: data.unique_chatters || 0,
                  followers: data.followers || 0,
                  new_subscriptions: data.new_subscriptions || 0,
                  duration_minutes: data.duration_minutes || 0,
                  creator_id: activeCreatorId,
                  guest_name: guestName,
                  status: 'active',
                  uploaded_at: new Date().toISOString()
                }]).select();
                
                if (error) throw error;

                success("¡Contenido creado! Las métricas se actualizarán en breve.");

                // 3. FETCH METADATA IN BACKGROUND
                const { data: { session } } = await supabase.auth.getSession();
                fetch('/api/fetch-metadata', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                  },
                  body: JSON.stringify({ url: cleanUrl, platform: data.platform })
                }).then(async (res) => {
                  if (res.ok && insertedData?.[0]) {
                    const metadata = await res.json();
                    await supabase.from('content').update({
                      title: metadata.title || 'Nuevo Contenido',
                      thumbnail: metadata.thumbnail || '',
                      views: metadata.views || 0,
                      likes: metadata.likes || 0,
                      comments: metadata.comments || 0
                    }).eq('id', insertedData[0].id);
                    refresh();
                  }
                }).catch(e => console.warn("Admin background update failed:", e));
              }
              setIsContentModalOpen(false);
              setEditingContent(null);
              refresh();
            } catch (err: any) {
              toastError("Error al procesar contenido: " + err.message);
            } finally {
              setIsProcessingContent(false);
            }
          }}
        />
        <CreatorSearchModal isOpen={isAnalyzingCreator} onClose={() => setIsAnalyzingCreator(false)} />

        {selectedCampaignReport && (
          <CampaignReportModal
            isOpen={!!selectedCampaignReport}
            onClose={() => setSelectedCampaignReport(null)}
            campaign={campaigns.find(c => c.id === selectedCampaignReport) || null}
            content={content}
            users={users}
            onFilterChange={({ platform, creatorId, campaignId }) => {
              if (platform) setFilter('platform', platform);
              if (creatorId) setFilter('creator', creatorId);
              if (campaignId) setFilter('campaign', campaignId);
              setActiveTab('content');
              setSelectedCampaignReport(null);
              setTimeout(() => {
                document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}

        <AnimatePresence>
          {viewingDeleted && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingDeleted(null)}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        viewingDeleted.type === 'content' ? 'bg-indigo-50 text-indigo-600' :
                        viewingDeleted.type === 'campaign' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {viewingDeleted.type === 'content' && <Youtube className="h-6 w-6" />}
                        {viewingDeleted.type === 'campaign' && <Target className="h-6 w-6" />}
                        {viewingDeleted.type === 'user' && <Users className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Detalles del {viewingDeleted.type === 'user' ? 'Usuario' : viewingDeleted.type === 'campaign' ? 'Campaña' : 'Contenido'}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Estado: Eliminado</p>
                      </div>
                    </div>
                    <button onClick={() => setViewingDeleted(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <X className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Image Preview for Content */}
                    {viewingDeleted.type === 'content' && viewingDeleted.item.thumbnail && (
                      <div className="mb-6 rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm aspect-video bg-gray-50 flex items-center justify-center">
                        <img 
                          src={viewingDeleted.item.thumbnail} 
                          alt={viewingDeleted.item.title || 'Vista previa'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'flex flex-col items-center justify-center text-gray-300 gap-2';
                                placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-[10px] font-black uppercase tracking-widest">Imagen no disponible</span>';
                                parent.appendChild(placeholder);
                            }
                          }}
                        />
                      </div>
                    )}
                    
                    {Object.entries(viewingDeleted.item).map(([key, value]) => {
                      if (value === null || value === undefined || typeof value === 'object' || key.includes('id')) return null;
                      return (
                        <div key={key} className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-bold text-gray-900 break-all">{String(value)}</span>
                        </div>
                      );
                    })}
                    <div className="pt-4 border-t border-gray-50">
                       <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Fecha de Eliminación</span>
                       <p className="text-sm font-black text-rose-600 mt-1">{viewingDeleted.item.deleted_at ? new Date(viewingDeleted.item.deleted_at).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                    <button 
                      onClick={async () => {
                        const table = viewingDeleted.type === 'content' ? 'content' : viewingDeleted.type === 'campaign' ? 'campaigns' : 'users';
                        const { error } = await supabase.from(table).update({ deleted_at: null }).eq('id', viewingDeleted.item.id);
                        if (!error) {
                          success("Restaurado correctamente");
                          setViewingDeleted(null);
                          refresh();
                        } else {
                          toastError("Error al restaurar");
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                    >
                      <RefreshCw className="h-4 w-4" /> Restaurar Item
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm("¿Estás seguro de eliminar permanentemente? Esta acción es irreversible.")) {
                          const table = viewingDeleted.type === 'content' ? 'content' : viewingDeleted.type === 'campaign' ? 'campaigns' : 'users';
                          const { error } = await supabase.from(table).delete().eq('id', viewingDeleted.item.id);
                          if (!error) {
                            success("Eliminado permanentemente");
                            setViewingDeleted(null);
                            refresh();
                          } else {
                            toastError("Error al eliminar");
                          }
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                    >
                      <Trash2 className="h-4 w-4" /> Borrado Físico
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pointer-events-none">
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-2 flex items-center justify-between pointer-events-auto">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'overview') {
                    resetFilters({ tab: 'overview' } as any);
                  } else {
                    setActiveTab(item.id);
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'animate-in zoom-in-75 duration-300 mb-0.5' : 'mb-0.5'}`} />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter mt-0.5 block w-full text-center truncate px-0.5">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
}

