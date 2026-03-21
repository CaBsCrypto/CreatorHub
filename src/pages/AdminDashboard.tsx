import React, { useState, useMemo } from 'react';
import { supabase, UserProfile } from '../supabase';
import { useAuth } from '../AuthContext';
import { 
  Plus, Download, RefreshCw, Sparkles, LayoutDashboard, 
  List, Users, Youtube, TrendingUp, 
  BarChart3, Award, Zap, Trophy, Search, Filter, Trash2, ShieldCheck,
  LayoutGrid, List as ListIcon, Briefcase, Wallet, DollarSign, Calendar
} from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { normalizeUrl } from '../utils/urlParser';

// Custom Hooks
import { useDashboardData, getAgencyRank, AGENCY_TIERS } from '../hooks/useDashboardData';
import { useToast } from '../hooks/useToast';

// Modular Components
import AdminMetricCard from '../components/dashboard/AdminMetricCard';
import CampaignCard from '../components/dashboard/CampaignCard';
import CreatorCard from '../components/dashboard/CreatorCard';
import ContentCard, { ContentItem } from '../components/dashboard/ContentCard';
import TwitchStatsModal from '../components/dashboard/TwitchStatsModal';
import AddCampaignModal from '../components/dashboard/AddCampaignModal';
import AddUserModal from '../components/dashboard/AddUserModal';
import AudienceGeoModal from '../components/dashboard/AudienceGeoModal';
import ContentModal from '../components/dashboard/ContentModal';
import CreatorSearchModal from '../components/dashboard/CreatorSearchModal';
import UserHistoryModal from '../components/dashboard/UserHistoryModal';
import CampaignReportModal from '../components/dashboard/CampaignReportModal';
import { UserRole } from '../supabase';

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#0f172a', // Dark Slate/Black
  instagram: '#e1306c', // Pink
  youtube: '#ff0000', // Red
  x: '#1da1f2', // Twitter Blue
  twitch: '#9146ff', // Purple
  coinmarketcap: '#0d3efd' // Blue
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  const { campaigns, content, users, payments, metrics, creatorStats, refresh } = useDashboardData('admin');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'clients' | 'content' | 'creators' | 'payments' | 'team'>('overview');
  
  // Modals state
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingAudienceUser, setEditingAudienceUser] = useState<UserProfile | null>(null);
  const [isTwitchModalOpen, setIsTwitchModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [isAnalyzingCreator, setIsAnalyzingCreator] = useState(false);
  const [managingUser, setManagingUser] = useState<UserProfile | null>(null);
  const [selectedCampaignReport, setSelectedCampaignReport] = useState<string | null>(null);
  
  // Processing states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyzingTwitch, setIsAnalyzingTwitch] = useState(false);
  const [isProcessingContent, setIsProcessingContent] = useState(false);
  
  // Form states
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '', client_id: '' });
  const [newUser, setNewUser] = useState<{ email: string; role: UserRole; linked_campaign_id?: string }>({ email: '', role: 'creator' });
  const [twitchStats, setTwitchStats] = useState<any>(null);
  const [twitchPreview, setTwitchPreview] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [filterCreator, setFilterCreator] = useState('all');
  const [isCompactView, setIsCompactView] = useState(true);
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([]);
  
  // Payments form
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ creator_id: '', amount: '', currency: 'USDT', concept: '', campaign_id: '', paid_at: new Date().toISOString().split('T')[0] });

  const filteredUsers = useMemo(() => {
    return users.filter(u => !deletedUserIds.includes(u.id));
  }, [users, deletedUserIds]);

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
      status: 'active', 
      created_by: user?.id 
    }]);
    if (error) {
      toastError("Error al crear campaña: " + error.message);
    } else {
      success("Campaña creada con éxito");
      setIsCreatingCampaign(false);
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

  const sidebarItems = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campañas', icon: List },
    { id: 'clients', label: 'Clientes', icon: Briefcase },
    { id: 'content', label: 'Contenido', icon: Youtube },
    { id: 'creators', label: 'Creadores', icon: Users },
    { id: 'payments', label: 'Pagos', icon: Wallet },
    { id: 'team', label: 'Equipo', icon: ShieldCheck }
  ] as const;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 p-8 hidden lg:block">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Sparkles className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tighter">Umbra <span className="text-indigo-600">Admin</span></span>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">Panel de Control</h1>
            <p className="text-sm font-medium text-gray-400">Gestiona la agencia, creadores y campañas activas.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsAnalyzingCreator(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100"><Search className="h-4 w-4" /> Analizar</button>
            <button onClick={() => setIsCreatingCampaign(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"><Plus className="h-4 w-4" /> Nueva Campaña</button>
            <button onClick={() => setIsAddingUser(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 transition-all"><Users className="h-4 w-4" /> Añadir Miembro</button>
          </div>
        </header>

        {activeTab === 'clients' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contacto</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Proyectos</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Redes</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Métricas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.filter(u => u.role === 'client').map(client => {
                    const clientCampaigns = campaigns.filter(c => c.client_id === client.id);
                    const platforms = Array.from(new Set(
                      content.filter(cnt => clientCampaigns.some(camp => camp.id === cnt.campaign_id))
                             .map(cnt => cnt.platform)
                    ));
                    
                    return (
                      <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                              {client.photo_url ? <img src={client.photo_url} alt="" className="w-full h-full object-cover" /> : client.display_name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 leading-tight">{client.display_name || 'Sin nombre'}</div>
                              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">ID: {client.id.slice(0,8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-medium text-gray-500">{client.email}</td>
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-2">
                            {clientCampaigns.map(c => (
                              <span key={c.id} className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase">
                                {c.name}
                              </span>
                            ))}
                            {clientCampaigns.length === 0 && <span className="text-gray-300 text-xs italic">Sin campañas</span>}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex -space-x-2">
                             {platforms.map(p => (
                               <div key={p} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: PLATFORM_COLORS[p] || '#ccc' }}>
                                 {p.charAt(0).toUpperCase()}
                               </div>
                             ))}
                             {platforms.length === 0 && <span className="text-gray-300 text-xs px-3">-</span>}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => {
                              if (clientCampaigns[0]) {
                                setSelectedCampaignReport(clientCampaigns[0].id);
                              } else {
                                info("Este cliente aún no tiene campañas asignadas.");
                              }
                            }}
                            className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                            title="Ver métricas de campaña"
                          >
                            <BarChart3 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {users.filter(u => u.role === 'client').length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <Briefcase className="h-8 w-8 text-gray-200" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900">No hay clientes invitados</h3>
                        <p className="text-sm text-gray-400">Invita a un cliente para que pueda ver los resultados.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <AdminMetricCard 
                title="Vistas Totales" 
                value={metrics.totalViews.toLocaleString()} 
                trend={{ value: 12, isPositive: true }} 
                icon={TrendingUp} 
                color="from-indigo-500 to-indigo-600"
                onClick={() => setActiveTab('content')} 
              />
              <AdminMetricCard 
                title="Vistas Promedio" 
                value={Math.round(metrics.totalViews / (metrics.totalPosts || 1)).toLocaleString()} 
                icon={Zap} 
                color="from-rose-500 to-pink-600"
                onClick={() => setActiveTab('content')} 
              />
              <AdminMetricCard 
                title="Creadores" 
                value={metrics.activeCreators} 
                icon={Users} 
                color="from-teal-500 to-emerald-600"
                onClick={() => setActiveTab('creators')} 
              />
              <AdminMetricCard 
                title="Posts Totales" 
                value={metrics.totalPosts.toLocaleString()} 
                trend={{ value: 15, isPositive: true }} 
                icon={List} 
                color="from-amber-500 to-orange-600"
                onClick={() => setActiveTab('content')} 
              />
              <AdminMetricCard 
                title="Campañas Activas" 
                value={campaigns.filter(c => c.status === 'active').length} 
                icon={BarChart3} 
                color="from-blue-500 to-blue-600"
                onClick={() => setActiveTab('campaigns')} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-indigo-500" /> Distribución por Plataforma</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={[
                          { name: 'Youtube', id: 'youtube', value: content.filter(c => c.platform === 'youtube').length },
                          { name: 'Instagram', id: 'instagram', value: content.filter(c => c.platform === 'instagram').length },
                          { name: 'TikTok', id: 'tiktok', value: content.filter(c => c.platform === 'tiktok').length },
                          { name: 'X', id: 'x', value: content.filter(c => c.platform === 'x').length },
                          { name: 'Twitch', id: 'twitch', value: content.filter(c => c.platform === 'twitch').length },
                          { name: 'CMC', id: 'coinmarketcap', value: content.filter(c => c.platform === 'coinmarketcap').length }
                        ].filter(d => d.value > 0)} 
                        innerRadius={80} 
                        outerRadius={100} 
                        paddingAngle={5} 
                        dataKey="value"
                        onClick={(data) => {
                          if (data && data.payload && data.payload.id) {
                            setFilterPlatform(data.payload.id);
                            setActiveTab('content');
                          }
                        }}
                      >
                        {[
                          { id: 'youtube' },
                          { id: 'instagram' },
                          { id: 'tiktok' },
                          { id: 'x' },
                          { id: 'twitch' },
                          { id: 'coinmarketcap' }
                        ].filter(d => content.filter(c => c.platform === d.id).length > 0).map((entry, i) => (
                          <Cell key={i} fill={PLATFORM_COLORS[entry.id]} className="cursor-pointer hover:opacity-80 transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />
                <h3 className="text-xl font-black text-gray-900 mb-12 flex items-center gap-2 relative z-10"><BarChart3 className="h-5 w-5 text-indigo-500" /> Vistas por Plataforma</h3>
                
                <div className="h-[300px] relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={Object.entries(
                          content.reduce((acc, curr) => {
                            acc[curr.platform] = (acc[curr.platform] || 0) + (curr.views || 0);
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([name, value]) => ({ 
                          name: name.charAt(0).toUpperCase() + name.slice(1), 
                          id: name,
                          value 
                        }))} 
                        innerRadius={80} 
                        outerRadius={100} 
                        paddingAngle={5} 
                        dataKey="value"
                        onClick={(data) => {
                          if (data && data.payload && data.payload.id) {
                            setFilterPlatform(data.payload.id);
                            setActiveTab('content');
                          }
                        }}
                      >
                        {Object.entries(
                          content.reduce((acc, curr) => {
                            acc[curr.platform] = (acc[curr.platform] || 0) + (curr.views || 0);
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([name], i) => (
                          <Cell key={i} fill={PLATFORM_COLORS[name] || '#cbd5e1'} className="cursor-pointer hover:opacity-80 transition-opacity" />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString() + ' vistas', 'Vistas']}
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 space-y-3 relative z-10">
                  {Object.entries(
                    content.reduce((acc, curr) => {
                      acc[curr.platform] = (acc[curr.platform] || 0) + (curr.views || 0);
                      return acc;
                    }, {} as Record<string, number>)
                  ).sort((a, b) => b[1] - a[1]).map(([platform, views], i) => (
                    <button 
                      key={platform} 
                      onClick={() => {
                        setFilterPlatform(platform);
                        setActiveTab('content');
                      }}
                      className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[platform] || '#cbd5e1' }} />
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{platform}</span>
                      </div>
                      <span className="text-xs font-black text-gray-900">{views.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {campaigns.map((campaign, i) => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign} 
                      index={i} 
                      onDelete={handleDeleteCampaign}
                      onClick={(id) => {
                        setFilterCampaign(id);
                        setActiveTab('content');
                      }}
                      onViewReport={(id, e) => {
                        e.stopPropagation();
                        setSelectedCampaignReport(id);
                      }}
                    />
                  ))}
          </div>
        )}

        {activeTab === 'creators' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between gap-4 mb-8">
               <div className="relative flex-1 max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Buscar creadores..." className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
               <div className="flex items-center gap-2"><button className="p-3.5 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 transition-all"><Filter className="h-4 w-4" /></button></div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {creatorStats
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .filter(c => !deletedUserIds.includes(c.creator_id))
                .map((c, i) => (
                  <CreatorCard 
                    key={c.creator_id} 
                    creator={c} 
                    index={i}
                    userRole={users.find(u => u.id === c.creator_id)?.role}
                    onViewProfile={() => setManagingUser(users.find(u => u.id === c.creator_id) || null)}
                    onEditAudience={() => setEditingAudienceUser(users.find(u => u.id === c.creator_id) || null)} 
                  />
                ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div id="content-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Enhanced Filter Bar */}
            <div className="bg-white p-4 md:p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 md:space-y-0">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search & Filters Group */}
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar contenido..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm transition-all outline-none"
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <select 
                      value={filterPlatform}
                      onChange={(e) => setFilterPlatform(e.target.value)}
                      className="px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all outline-none cursor-pointer"
                    >
                      <option value="all">Plataformas</option>
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitch">Twitch</option>
                      <option value="x">X</option>
                      <option value="coinmarketcap">CMC</option>
                    </select>

                    <select 
                      value={filterCampaign}
                      onChange={(e) => setFilterCampaign(e.target.value)}
                      className="px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all outline-none cursor-pointer max-w-[150px]"
                    >
                      <option value="all">Campañas</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    <select 
                      value={filterCreator}
                      onChange={(e) => setFilterCreator(e.target.value)}
                      className="px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all outline-none cursor-pointer max-w-[150px]"
                    >
                      <option value="all">Creadores</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.admin_alias || u.display_name || u.email.split('@')[0]} ({u.role})</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
                      <button 
                        onClick={() => setIsCompactView(false)}
                        className={`p-2 rounded-lg transition-all ${!isCompactView ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Vista Cuadrícula"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setIsCompactView(true)}
                        className={`p-2 rounded-lg transition-all ${isCompactView ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Vista Lista"
                      >
                        <ListIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions Group */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setEditingContent(null); setIsContentModalOpen(true); }}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" /> Nuevo Contenido
                  </button>
                  <button 
                    onClick={async () => {
                      if (content.length === 0) return info("No hay contenido para sincronizar");
                      setIsRefreshing(true);
                      info("Sincronizando todas las métricas...");
                      try {
                        const data = content.map(c => ({ id: c.id, url: c.url, platform: c.platform }));
                        const { data: { session } } = await supabase.auth.getSession();
                        const response = await fetch('/api/refresh-metrics', {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.access_token}`
                          },
                          body: JSON.stringify({ items: data })
                        });
                        const result = await response.json();
                        if (result.success && result.results) {
                          let updatedCount = 0;
                          for (const r of result.results) {
                            try {
                              const { error: updateErr } = await supabase.from('content').update({
                                title: r.title,
                                views: r.views,
                                likes: r.likes,
                                comments: r.comments,
                                thumbnail: r.thumbnail
                              }).eq('id', r.id);
                              if (!updateErr) updatedCount++;
                            } catch (e) {
                              console.error(`Error updating item ${r.id}:`, e);
                            }
                          }
                          await refresh();
                          success(`${updatedCount} de ${result.results.length} videos sincronizados correctamente`);
                        } else {
                          throw new Error(result.error || "Fallo en la sincronización masiva");
                        }
                      } catch (e: any) {
                        toastError("Error: " + e.message);
                      } finally {
                        setIsRefreshing(false);
                      }
                    }}
                    className={`flex items-center justify-center p-3 rounded-2xl transition-all ${isRefreshing ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95'}`}
                    title="Sincronizar todo"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className={isCompactView ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
              {content
                .filter(item => {
                  const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      item.platform.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
                  const matchesCampaign = filterCampaign === 'all' || item.campaign_id === filterCampaign;
                  const matchesCreator = filterCreator === 'all' || item.creator_id === filterCreator;
                  return matchesSearch && matchesPlatform && matchesCampaign && matchesCreator;
                })
                .map((item, i) => (
                  isCompactView ? (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => window.open(item.url, '_blank')}
                      className="bg-white px-6 py-4 rounded-2xl border border-gray-100 flex items-center hover:border-indigo-100 hover:shadow-lg transition-all group gap-8 cursor-pointer active:scale-[0.99]"
                    >
                      <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-50 shrink-0">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Youtube className="h-5 w-5 text-gray-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 line-clamp-1">{item.title || 'Contenido sin título'}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md">
                            {item.platform}
                          </span>
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setManagingUser(users.find(u => u.id === item.creator_id) || null);
                            }}
                            className="text-[9px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Users className="h-2.5 w-2.5" />
                            {users.find(u => u.id === item.creator_id)?.display_name || 'Desconocido'}
                          </span>
                        </div>
                      </div>

                      <div className="hidden md:flex flex-col items-center w-32 shrink-0">
                        <p className="text-xs font-black text-gray-900">{(item.views || 0).toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Vistas</p>
                      </div>

                      <div className="hidden lg:flex flex-col items-center w-32 shrink-0">
                        <p className="text-xs font-black text-emerald-600">${((item.views || 0) / 1000 * 2.5).toFixed(2)}</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ROI Est.</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={async () => {
                            info("Sincronizando video...");
                            try {
                              const res = await fetch('/api/fetch-metadata', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ url: item.url, platform: item.platform })
                              });
                              if (!res.ok) throw new Error("Error al obtener metadata");
                              const metadata = await res.json();
                              const { error } = await supabase.from('content').update({
                                title: metadata.title,
                                views: metadata.views,
                                likes: metadata.likes,
                                comments: metadata.comments,
                                thumbnail: metadata.thumbnail
                              }).eq('id', item.id);
                              if (error) throw error;
                              success("Video actualizado");
                              refresh();
                            } catch (e: any) {
                              toastError("Error: " + e.message);
                            }
                          }}
                          className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          title="Sincronizar"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => { setEditingContent(item as any); setIsContentModalOpen(true); }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          title="Editar"
                        >
                          <Plus className="h-4 w-4 text-xs" />
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm("¿Eliminar este contenido?")) {
                              const { error } = await supabase.from('content').delete().eq('id', item.id);
                              if (!error) refresh();
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <ContentCard 
                      key={item.id} 
                      item={item as ContentItem} 
                      index={i} 
                      campaignName={campaigns.find(c => c.id === item.campaign_id)?.name}
                      onEdit={(content) => {
                        setEditingContent(content);
                        setIsContentModalOpen(true);
                      }}
                      onDelete={async (id) => {
                        if (confirm("¿Estás seguro de que deseas eliminar este contenido?")) {
                          const { error } = await supabase.from('content').delete().eq('id', id);
                          if (!error) refresh();
                        }
                      }}
                      onClick={() => window.open(item.url, '_blank')}
                    />
                  )
                ))}
              {content.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Youtube className="h-8 w-8 text-gray-200" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">No hay contenido</h3>
                  <p className="text-sm text-gray-400">Comienza vinculando contenido a tus campañas.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((u, i) => (
                <motion.div 
                  key={u.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setManagingUser(u)}
                  className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                        u.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                        u.role === 'manager' ? 'bg-amber-50 text-amber-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        <Users className="h-7 w-7" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.role === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        u.role === 'manager' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {u.role}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {u.display_name || u.email.split('@')[0]}
                    </h3>
                    <p className="text-sm text-gray-400 mb-6 truncate">{u.email}</p>
                    
                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-gray-400 uppercase">Miembro desde</span>
                         <span className="text-[10px] font-black text-gray-900">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        Gestionar <Plus className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Payment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Pagado</p>
                <span className="text-3xl font-black text-gray-900">${payments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pagos Registrados</p>
                <span className="text-3xl font-black text-gray-900">{payments.length}</span>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Creadores Pagados</p>
                <span className="text-3xl font-black text-gray-900">{new Set(payments.map(p => p.creator_id)).size}</span>
              </div>
            </div>

            {/* Add Payment */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2"><DollarSign className="h-5 w-5 text-emerald-500" /> Registrar Pago</h3>
                <button onClick={() => setIsAddingPayment(!isAddingPayment)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95">
                  <Plus className="h-4 w-4" /> Nuevo Pago
                </button>
              </div>

              <AnimatePresence>
                {isAddingPayment && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const { error } = await supabase.from('payments').insert([{
                        creator_id: newPayment.creator_id,
                        amount: parseFloat(newPayment.amount),
                        currency: newPayment.currency,
                        concept: newPayment.concept || null,
                        campaign_id: newPayment.campaign_id || null,
                        paid_at: newPayment.paid_at
                      }]);
                      if (error) {
                        toastError('Error al registrar pago: ' + error.message);
                      } else {
                        success('Pago registrado');
                        setIsAddingPayment(false);
                        setNewPayment({ creator_id: '', amount: '', currency: 'USDT', concept: '', campaign_id: '', paid_at: new Date().toISOString().split('T')[0] });
                        refresh();
                      }
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                      <select required value={newPayment.creator_id} onChange={e => setNewPayment({...newPayment, creator_id: e.target.value})} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Creador *</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.admin_alias || u.display_name || u.email} ({u.role})</option>
                        ))}
                      </select>
                      <input required type="text" inputMode="decimal" placeholder="Monto *" value={newPayment.amount} onChange={e => { const v = e.target.value; if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) setNewPayment({...newPayment, amount: v}); }} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                      <select value={newPayment.currency} onChange={e => setNewPayment({...newPayment, currency: e.target.value})} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="USDT">USDT</option>
                        <option value="BNB">BNB</option>
                        <option value="USD">USD</option>
                        <option value="ETH">ETH</option>
                        <option value="SOL">SOL</option>
                      </select>
                      <input type="text" placeholder="Concepto" value={newPayment.concept} onChange={e => setNewPayment({...newPayment, concept: e.target.value})} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                      <select value={newPayment.campaign_id} onChange={e => setNewPayment({...newPayment, campaign_id: e.target.value})} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Campaña (opcional)</option>
                        {campaigns.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <input required type="date" value={newPayment.paid_at} onChange={e => setNewPayment({...newPayment, paid_at: e.target.value})} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex justify-end pb-6 border-b border-gray-50 mb-6">
                      <button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100">✓ Guardar Pago</button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Payments Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Creador</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Moneda</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Concepto</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaña</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map(p => {
                      const creator = users.find(u => u.id === p.creator_id);
                      const camp = campaigns.find(c => c.id === p.campaign_id);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs overflow-hidden">
                                {creator?.photo_url ? <img src={creator.photo_url} alt="" className="w-full h-full object-cover" /> : (creator?.display_name?.charAt(0) || '?')}
                              </div>
                              <span className="text-sm font-bold text-gray-900">{creator?.admin_alias || creator?.display_name || creator?.email || 'Desconocido'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-emerald-600">${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase">{p.currency}</span></td>
                          <td className="px-6 py-4 text-sm text-gray-500">{p.concept || '—'}</td>
                          <td className="px-6 py-4">{camp ? <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">{camp.name}</span> : '—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.paid_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <button onClick={async () => {
                              if (!window.confirm('¿Eliminar este pago?')) return;
                              const { error } = await supabase.from('payments').delete().eq('id', p.id);
                              if (error) toastError('Error: ' + error.message);
                              else { success('Pago eliminado'); refresh(); }
                            }} className="p-2 text-gray-300 hover:text-rose-500 rounded-xl transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      );
                    })}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-20 text-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <Wallet className="h-8 w-8 text-gray-200" />
                          </div>
                          <h3 className="text-lg font-black text-gray-900">No hay pagos registrados</h3>
                          <p className="text-sm text-gray-400">Registra un pago con el botón de arriba.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <UserHistoryModal 
          user={managingUser}
          onClose={() => setManagingUser(null)}
          userContent={content.filter(c => c.creator_id === managingUser?.id)}
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
        <AddCampaignModal 
          isOpen={isCreatingCampaign} 
          onClose={() => setIsCreatingCampaign(false)} 
          onSubmit={handleCreateCampaign} 
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
          users={users}
          editingContent={editingContent as any}
          isProcessing={isProcessingContent}
          onTwitchUpload={async (file, selectedCreatorId) => {
            setIsProcessingContent(true);
            try {
              const activeCreatorId = selectedCreatorId || user?.id;
              const fileName = `${activeCreatorId}/${Date.now()}-${file.name}`;
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('content-attachments')
                .upload(fileName, file);

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                .from('content-attachments')
                .getPublicUrl(fileName);

              const { error: dbError } = await supabase.from('content').insert([{
                campaign_id: campaigns.find(c => c.status === 'active')?.id || (campaigns[0]?.id || ''),
                platform: 'twitch',
                url: 'https://twitch.tv/capture-' + Date.now(),
                thumbnail: publicUrl,
                creator_id: activeCreatorId,
                status: 'active',
                views: 0,
                likes: 0,
                comments: 0,
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
              const activeCreatorId = data.creator_id || user?.id;
              const cleanUrl = normalizeUrl(data.url, data.platform);

              if (editingContent) {
                // Check duplicate if URL changed
                if (cleanUrl !== normalizeUrl(editingContent.url, editingContent.platform)) {
                   const { data: existing } = await supabase.from('content').select('id').eq('campaign_id', data.campaign_id).eq('url', cleanUrl).neq('id', editingContent.id).limit(1);
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
                    title: data.title,
                    views: data.views,
                    likes: data.likes,
                    comments: data.comments
                  })
                  .eq('id', editingContent.id);
                
                if (error) throw error;
                success("Contenido actualizado");
              } else {
                // 1. Check duplicate for new inserts
                const { data: existing } = await supabase.from('content').select('id').eq('campaign_id', data.campaign_id).eq('url', cleanUrl).limit(1);
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
                  views: 0,
                  likes: 0,
                  comments: 0,
                  creator_id: activeCreatorId,
                  status: 'active',
                  uploaded_at: new Date().toISOString()
                }]).select();
                
                if (error) throw error;

                success("¡Contenido creado! Las métricas se actualizarán en breve.");

                // 3. FETCH METADATA IN BACKGROUND
                fetch('/api/fetch-metadata', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
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
              if (platform) setFilterPlatform(platform);
              if (creatorId) setFilterCreator(creatorId);
              if (campaignId) setFilterCampaign(campaignId);
              setActiveTab('content');
              setSelectedCampaignReport(null);
              setTimeout(() => {
                document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}
      </main>
    </div>
  );
}
