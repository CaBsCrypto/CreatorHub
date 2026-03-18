import React, { useState, useMemo } from 'react';
import { supabase, UserProfile } from '../supabase';
import { useAuth } from '../AuthContext';
import { 
  Plus, Download, RefreshCw, Sparkles, LayoutDashboard, 
  List, Users, Youtube, TrendingUp, 
  BarChart3, Award, Zap, Trophy, Search, Filter, Trash2, ShieldCheck,
  LayoutGrid, List as ListIcon
} from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';

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
import { UserRole } from '../supabase';

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  const { campaigns, content, users, metrics, creatorStats, refresh } = useDashboardData('admin');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'content' | 'creators' | 'team'>('overview');
  
  // Modals state
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingAudienceUser, setEditingAudienceUser] = useState<UserProfile | null>(null);
  const [isTwitchModalOpen, setIsTwitchModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [isAnalyzingCreator, setIsAnalyzingCreator] = useState(false);
  const [managingUser, setManagingUser] = useState<UserProfile | null>(null);
  
  // Processing states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyzingTwitch, setIsAnalyzingTwitch] = useState(false);
  
  // Form states
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '', target_posts: 3 });
  const [newUser, setNewUser] = useState<{ email: string; role: 'creator' | 'manager' | 'admin' }>({ email: '', role: 'creator' });
  const [twitchStats, setTwitchStats] = useState<any>(null);
  const [twitchPreview, setTwitchPreview] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [isCompactView, setIsCompactView] = useState(false);

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
    const { error } = await supabase.from('campaigns').insert([{ ...newCampaign, status: 'active', created_by: user?.id }]);
    if (error) {
      toastError("Error al crear campaña: " + error.message);
    } else {
      success("Campaña creada con éxito");
      setIsCreatingCampaign(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('users').insert([{ email: newUser.email, role: newUser.role, display_name: newUser.email.split('@')[0] }]);
    if (error) {
      toastError("Error al añadir usuario: " + error.message);
    } else {
      success("Usuario añadido con éxito");
      setIsAddingUser(false);
    }
  };

  const handleUpdateUserRole = async (newRole: UserRole) => {
    if (!managingUser) return;
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', managingUser.id);
    
    if (error) {
      toastError("Error al actualizar rol: " + error.message);
    } else {
      success("Rol actualizado correctamente");
      setManagingUser(prev => prev ? { ...prev, role: newRole } : null);
      refresh();
    }
  };

  const handleRemoveUser = async () => {
    if (!managingUser) return;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', managingUser.id);
    
    if (error) {
      toastError("Error al eliminar usuario: " + error.message);
    } else {
      success("Usuario eliminado de la agencia");
      setManagingUser(null);
      refresh();
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
    { id: 'content', label: 'Contenido', icon: Youtube },
    { id: 'creators', label: 'Creadores', icon: Users },
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

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AdminMetricCard title="Vistas Totales" value={metrics.totalViews.toLocaleString()} trend={{ value: 12, isPositive: true }} icon={TrendingUp} color="from-indigo-500 to-indigo-600" />
              <AdminMetricCard title="Engagement" value={metrics.totalEngagement.toLocaleString()} trend={{ value: 8, isPositive: true }} icon={Zap} color="from-rose-500 to-pink-600" />
              <AdminMetricCard title="Creadores" value={metrics.activeCreators} icon={Users} color="from-teal-500 to-emerald-600" />
              <AdminMetricCard title="ROI Estimado" value={`$${metrics.roi.toLocaleString()}`} trend={{ value: 15, isPositive: true }} icon={Award} color="from-amber-500 to-orange-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-indigo-500" /> Distribución por Plataforma</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[
                        { name: 'Youtube', value: content.filter(c => c.platform === 'youtube').length },
                        { name: 'Instagram', value: content.filter(c => c.platform === 'instagram').length },
                        { name: 'TikTok', value: content.filter(c => c.platform === 'tiktok').length },
                        { name: 'X', value: content.filter(c => c.platform === 'x').length }
                      ]} innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                        {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
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
                          value 
                        }))} 
                        innerRadius={80} 
                        outerRadius={100} 
                        paddingAngle={5} 
                        dataKey="value"
                      >
                        {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
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
                    <div key={platform} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{platform}</span>
                      </div>
                      <span className="text-xs font-black text-gray-900">{views.toLocaleString()}</span>
                    </div>
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
                .map((c, i) => (
                  <CreatorCard 
                    key={c.creator_id} 
                    creator={c} 
                    index={i} 
                    onViewProfile={() => setManagingUser(users.find(u => u.id === c.creator_id) || null)}
                    onEditAudience={() => setEditingAudienceUser(users.find(u => u.id === c.creator_id) || null)} 
                  />
                ))}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filter Bar */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar contenido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                  />
                </div>
                <select 
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">Plataformas</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitch">Twitch</option>
                </select>
                <select 
                  value={filterCampaign}
                  onChange={(e) => setFilterCampaign(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">Todas las campañas</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl ml-2">
                  <button 
                    onClick={() => setIsCompactView(false)}
                    className={`p-1.5 rounded-lg transition-all ${!isCompactView ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsCompactView(true)}
                    className={`p-1.5 rounded-lg transition-all ${isCompactView ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    <ListIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setEditingContent(null); setIsContentModalOpen(true); }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                >
                  <Plus className="h-4 w-4" /> Nuevo Contenido
                </button>
                <button 
                  onClick={async () => {
                    setIsRefreshing(true);
                    info("Sincronizando métricas...");
                    // API call simulation or real call if available
                    setTimeout(async () => {
                      await refresh();
                      success("Métricas actualizadas");
                      setIsRefreshing(false);
                    }, 1000);
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isRefreshing ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Sincronizar
                </button>
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
                  return matchesSearch && matchesPlatform && matchesCampaign;
                })
                .map((item, i) => (
                  isCompactView ? (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-indigo-100 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-50">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Youtube className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 line-clamp-1">{item.title || 'Contenido sin título'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest px-1.5 py-0.5 bg-indigo-50 rounded-md">
                              {item.platform}
                            </span>
                            <span className="text-[9px] font-medium text-gray-400">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right flex flex-col items-end">
                          <p className="text-sm font-black text-gray-900 leading-none">{(item.views || 0).toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Vistas</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => { setEditingContent(item as any); setIsContentModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                          >
                            <Plus className="h-4 w-4 rotate-45" />
                          </button>
                        </div>
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
                      onClick={() => setManagingUser(users.find(u => u.id === item.creator_id) || null)}
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
              {users.map((u, i) => (
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

        {/* Modals */}
        <UserHistoryModal 
          user={managingUser}
          onClose={() => setManagingUser(null)}
          userContent={content.filter(c => c.creator_id === managingUser?.id)}
          onUpdateRole={handleUpdateUserRole}
          onRemoveUser={handleRemoveUser}
        />
        <AddCampaignModal isOpen={isCreatingCampaign} onClose={() => setIsCreatingCampaign(false)} onSubmit={handleCreateCampaign} newCampaign={newCampaign} setNewCampaign={setNewCampaign} />
        <AddUserModal isOpen={isAddingUser} onClose={() => setIsAddingUser(false)} onSubmit={handleAddUser} email={newUser.email} setEmail={e => setNewUser({...newUser, email: e})} role={newUser.role} setRole={r => setNewUser({...newUser, role: r})} />
         <AudienceGeoModal user={editingAudienceUser} onClose={() => setEditingAudienceUser(null)} onSave={async (id, geo) => { await supabase.from('users').update({ audience_geo: geo }).eq('id', id); setEditingAudienceUser(null); success("Audiencia actualizada"); }} />
        <TwitchStatsModal isOpen={isTwitchModalOpen} onClose={() => setIsTwitchModalOpen(false)} isAnalyzing={isAnalyzingTwitch} stats={twitchStats} onSave={handleSaveTwitch} previewImage={twitchPreview} />
        <ContentModal 
          isOpen={isContentModalOpen} 
          onClose={() => {
            setIsContentModalOpen(false);
            setEditingContent(null);
          }}
          campaigns={campaigns}
          editingContent={editingContent as any}
          isProcessing={false}
          onTwitchUpload={async () => {}}
          onSubmit={async (data) => {
            if (editingContent) {
              const { error } = await supabase
                .from('content')
                .update({ campaign_id: data.campaign_id, platform: data.platform, url: data.url })
                .eq('id', editingContent.id);
              
              if (error) {
                toastError("Error al actualizar contenido: " + error.message);
              } else {
                success("Contenido actualizado");
                setIsContentModalOpen(false);
                setEditingContent(null);
                refresh();
              }
            } else {
              // Create new content as admin
              const { error } = await supabase
                .from('content')
                .insert([{
                  campaign_id: data.campaign_id,
                  platform: data.platform,
                  url: data.url,
                  creator_id: user?.id, // Defaulting to current admin, though in a real scenario might want to pick a creator
                  status: 'active',
                  uploaded_at: new Date().toISOString()
                }]);
              
              if (error) {
                toastError("Error al crear contenido: " + error.message);
              } else {
                success("Contenido creado");
                setIsContentModalOpen(false);
                refresh();
              }
            }
          }}
        />
        <CreatorSearchModal isOpen={isAnalyzingCreator} onClose={() => setIsAnalyzingCreator(false)} />
      </main>
    </div>
  );
}
