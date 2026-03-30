import React, { useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { 
  Sparkles, Youtube, Instagram, Globe, 
  ExternalLink, TrendingUp, Zap, Trophy, Flame, CheckCircle2,
  LayoutDashboard, Upload, Wallet, Plus, RefreshCw, BarChart3, List as ListIcon, LayoutGrid, Award,
  AlertCircle, CheckCircle, Rocket, X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeUrl } from '../utils/urlParser';

// Custom Hooks
import { useDashboardData, getAgencyRank, AGENCY_TIERS } from '../hooks/useDashboardData';
import { useToast } from '../hooks/useToast';
import { useFilterParams } from '../hooks/useTabNavigation';

// Modular Components
import StatsCard from '../components/dashboard/StatsCard';
import RankCard from '../components/dashboard/RankCard';
import JourneyMap from '../components/dashboard/JourneyMap';
import BadgeItem from '../components/dashboard/BadgeItem';
import ContentCard, { ContentItem } from '../components/dashboard/ContentCard';
import PaymentModal from '../components/dashboard/PaymentModal';
import ContentModal from '../components/dashboard/ContentModal';
import ContentDetailModal from '../components/dashboard/ContentDetailModal';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const { success, error: toastError, info } = useToast();
  const [filters, setFilter, setFilters, resetFilters] = useFilterParams({ campaign: 'all', tab: 'overview' });
  const activeTab = filters.tab || 'overview';
  const setActiveTab = (tab: string) => setFilter('tab', tab);
  const { campaigns, content, filteredContent, metrics, refresh } = useDashboardData('creator', { campaign: filters.campaign });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isProcessingContent, setIsProcessingContent] = useState(false);
  const [previewRankIndex, setPreviewRankIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [isCompactView, setIsCompactView] = useState(false);

  // Derived state
  const currentRankIndex = useMemo(() => {
    for (let i = AGENCY_TIERS.length - 1; i >= 0; i--) {
      if (metrics.totalPosts >= AGENCY_TIERS[i].minPosts || metrics.totalViews >= AGENCY_TIERS[i].minViews) return i;
    }
    return 0;
  }, [metrics]);

  const myRank = AGENCY_TIERS[currentRankIndex];

  const handleSavePayment = async (data: any) => {
    setIsSavingPayment(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          payment_method: data.payment_method,
          binance_id: data.binance_id,
          wallet_address: data.wallet_address,
          wallet_network: data.wallet_network
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      success("Ajustes de pago guardados");
      setIsPaymentModalOpen(false);
      await refresh();
    } catch (err: any) {
      toastError("Error al guardar ajustes: " + err.message);
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    info("Sincronizando tus métricas...");
    try {
      const { data } = await supabase.from('content').select('id, url, platform').eq('creator_id', user?.id).is('deleted_at', null);
      if (data && data.length > 0) {
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
          for (const item of result.results) {
            try {
              const { error: updateErr } = await supabase.from('content').update({
                title: item.title,
                views: item.views,
                likes: item.likes,
                comments: item.comments,
                thumbnail: item.thumbnail
              }).eq('id', item.id);
              if (!updateErr) updatedCount++;
            } catch (e) {
              console.error(`Error updating item ${item.id}:`, e);
            }
          }
          await refresh();
          success(`${updatedCount} de ${result.results.length} videos actualizados correctamente`);
        } else {
          throw new Error(result.error || "Error en el servidor de métricas");
        }
      } else {
        info("No tienes contenido para sincronizar");
      }
    } catch (err: any) {
      toastError("Error al sincronizar métricas: " + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

    return (
      <div className="relative z-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 md:p-0 pb-20 md:pb-6">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="cursor-pointer" onClick={() => { setActiveTab('overview'); resetFilters(); }}>
            <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tight hover:text-indigo-600 transition-colors">Hola, {profile?.display_name || 'Creador'}</h1>
            <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse`} />
              Tu carrera en Umbra: <span className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">{myRank.name}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            <button onClick={handleRefresh} disabled={isRefreshing} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 transition-all ${isRefreshing ? 'opacity-50' : ''}`}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
            <button onClick={() => setIsContentModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              <Plus className="h-4 w-4" />
              Nuevo Contenido
            </button>
          </div>
        </header>
        {/* Main Tabs Navigation */}
        <div 
          className="flex items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar relative z-[9999] pointer-events-auto"
          style={{ isolation: 'isolate' }}
        >
          {[
            { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
            { id: 'campaigns', label: 'Campañas', icon: Rocket },
            { id: 'content', label: 'Mi Contenido', icon: ListIcon },
            { id: 'journey', label: 'Mi Camino', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab(tab.id);
              }}
              className={`flex-none flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 pointer-events-auto cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-white text-indigo-600 shadow-[0_8px_20px_-4px_rgba(79,70,229,0.15)] ring-1 ring-gray-100/50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 items-stretch">
            <StatsCard 
              label="Vistas Totales" 
              value={metrics.totalViews.toLocaleString()} 
              trend={metrics.viewsTrend ? `${metrics.viewsTrend.isPositive ? '+' : '-'}${metrics.viewsTrend.value}% vs mes anterior` : undefined} 
              icon={TrendingUp} 
              iconColor="text-indigo-600" 
            />
            <StatsCard label="Promedio Vistas" value={Math.round(metrics.totalViews / (metrics.totalPosts || 1)).toLocaleString()} icon={Zap} iconColor="text-rose-600" />
            <StatsCard 
              label="Publicaciones" 
              value={metrics.totalPosts} 
              trend={metrics.postsTrend ? `${metrics.postsTrend.isPositive ? '+' : '-'}${metrics.postsTrend.value}% vs mes anterior` : undefined} 
              icon={ListIcon} 
              iconColor="text-teal-600" 
            />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-indigo-500" /> Campañas Activas ({campaigns.filter(c => c.status === 'active').length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.filter(c => c.status === 'active').map((campaign, i) => (
                  <motion.div 
                    key={campaign.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-gray-50 rounded-3xl border border-gray-100 hover:border-indigo-100 transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-black text-gray-900">{campaign.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Meta: {campaign.target_posts} posts</p>
                    </div>
                    <button 
                      onClick={() => {
                        setFilter('campaign', campaign.id);
                        setActiveTab('content');
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100/50 border border-indigo-200 active:scale-95 transition-all"
                    >
                      Ir a la Campaña
                    </button>
                  </motion.div>
                ))}
                {campaigns.filter(c => c.status === 'active').length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-400 font-medium">
                    No hay campañas activas en este momento.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2">
              <RankCard 
                tiers={AGENCY_TIERS}
                currentRankIndex={currentRankIndex}
                previewRankIndex={previewRankIndex}
                onPreviewRank={setPreviewRankIndex}
                totalPosts={metrics.totalPosts}
                totalViews={metrics.totalViews}
              />
            </div>
            {!profile?.payment_method ? (
              <div className="h-full bg-gradient-to-br from-rose-500 via-pink-600 to-orange-500 p-6 rounded-3xl shadow-xl shadow-rose-100 flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-white/80 mb-3">
                    <AlertCircle className="h-4 w-4 text-amber-300 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Pendiente</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 leading-tight tracking-tight drop-shadow-sm">Activa tus Pagos</h3>
                  <p className="text-white/70 text-xs font-medium mb-6">Configura un método para recibir tus recompensas y acumular beneficios.</p>
                </div>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-3.5 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-lg active:scale-95"
                >
                  Configurar Ahora
                </button>
              </div>
            ) : (
              <div className="h-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-indigo-500" /> Pagos
                    </h3>
                    <div className="p-1.5 bg-emerald-50 rounded-lg">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Método Activo</p>
                      <p className="text-xs font-black text-gray-900 uppercase">{profile.payment_method === 'binance' ? 'Binance Pay' : 'Crypto Wallet'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Identificador</p>
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {profile.payment_method === 'binance' ? profile.binance_id : profile.wallet_address}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                  Cambiar Método
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Mi Contenido</h2>
            <div className="flex items-center gap-4">
              {filters.campaign && filters.campaign !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black border border-indigo-100 uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                  Campaña: {campaigns.find(c => c.id === filters.campaign)?.name || '...'}
                  <button onClick={() => setFilter('campaign', 'all')} className="hover:text-indigo-900 ml-1"><X className="h-3 w-3" /></button>
                </div>
              )}
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

          <div className={isCompactView ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
            {filteredContent.map((item, i) => (
              isCompactView ? (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    const isStream = item.platform === 'twitch' || (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0);
                    if (isStream) setViewingContent(item as any);
                    else window.open(item.url, '_blank');
                  }}
                  className="group bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                      {item.platform === 'tiktok' && <Flame className="h-5 w-5 text-rose-500" />}
                      {item.platform === 'instagram' && <Instagram className="h-5 w-5 text-pink-500" />}
                      {item.platform === 'youtube' && <Youtube className="h-5 w-5 text-red-500" />}
                      {item.platform === 'twitch' && <Zap className="h-5 w-5 text-purple-500" />}
                      {!['tiktok', 'instagram', 'youtube', 'twitch'].includes(item.platform) && <Globe className="h-5 w-5 text-indigo-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-gray-900 truncate leading-tight">{item.title || 'Sin Título'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1.5 py-0.5 bg-gray-50 rounded-md border border-gray-100">{item.platform}</span>
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{campaigns.find(c => c.id === item.campaign_id)?.name || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto px-1 sm:px-0">
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-end">
                        <span className="text-base font-black text-gray-900 leading-none">{(item.views ?? 0).toLocaleString()}</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Vistas</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-base font-black text-emerald-600 leading-none">${((item.views || 0) / 1000 * 2.5).toFixed(2)}</span>
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">ROI Est.</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                       <button onClick={() => { setEditingContent(item); setIsContentModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><BarChart3 className="h-4 w-4" /></button>
                       <button onClick={async () => {
                         if(confirm("¿Eliminar contenido?")) {
                            await supabase.from('content').delete().eq('id', item.id);
                            refresh();
                         }
                       }} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><AlertCircle className="h-4 w-4" /></button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <ContentCard 
                    key={item.id} 
                    item={item as any} 
                    index={i} 
                    onEdit={(c) => { 
                        setEditingContent(c); 
                        setIsContentModalOpen(true); 
                    }} 
                    onDelete={async (id) => { 
                        if(confirm("¿Eliminar contenido?")) {
                            await supabase.from('content').delete().eq('id', id);
                            success("Contenido eliminado");
                            refresh();
                        }
                    }} 
                    onClick={() => {
                        const isStream = item.platform === 'twitch' || (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0);
                        if (isStream) setViewingContent(item as any);
                        else window.open(item.url, '_blank');
                    }}
                />
              )
            ))}
            <button onClick={() => { setEditingContent(null); setIsContentModalOpen(true); }} className={`rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all group ${isCompactView ? 'h-20 flex-row px-8' : 'aspect-square'}`}>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-all">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">Añadir Contenido</span>
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          {campaigns.filter(c => c.status === 'active').map((campaign, i) => (
            <div key={campaign.id} className="relative group bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 overflow-hidden">
               <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity" />
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-6">
                   <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                     {campaign.status}
                   </div>
                   <div className="p-2 bg-gray-50 rounded-xl text-indigo-500 font-black text-[10px]">
                     +{campaign.target_posts}XP
                   </div>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{campaign.name}</h3>
                 <p className="text-sm text-gray-500 line-clamp-2 mb-6 min-h-[40px]">{campaign.description || 'Sin descripción.'}</p>
                 <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                     <button 
                       onClick={() => {
                         setFilter('campaign', campaign.id);
                         setActiveTab('content');
                       }} 
                       className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                     >
                       Ver Posts
                     </button>
                 </div>
               </div>
            </div>
          ))}
          {campaigns.filter(c => c.status === 'active').length === 0 && (
            <div className="col-span-full py-20 text-center">
              <Rocket className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900">No hay campañas activas</h3>
            </div>
          )}
        </div>
      )}

      {activeTab === 'journey' && (
        <div className="animate-in fade-in duration-500">
          <JourneyMap tiers={AGENCY_TIERS} currentRankIndex={currentRankIndex} />
        </div>
      )}

      <ContentDetailModal 
        isOpen={!!viewingContent}
        onClose={() => setViewingContent(null)}
        item={viewingContent}
      />

      <ContentModal 
        isOpen={isContentModalOpen} 
        onClose={() => { setIsContentModalOpen(false); setEditingContent(null); }} 
        campaigns={campaigns} 
        editingContent={editingContent}
        isProcessing={isProcessingContent}
        onTwitchUpload={async (file, explicitCreatorId, dCount, aCount, pCount, uvCount, uChatters, vCount, fCount, sCount, title, campaign_id, platform) => {
          setIsProcessingContent(true);
          try {
            const currentCampaignId = campaign_id || (filters.campaign === 'all' ? (campaigns[0]?.id || '') : filters.campaign);
            const finalPlatform = platform || 'twitch';
            const fileName = `${explicitCreatorId || user?.id}/${Date.now()}-${file.name}`;
            
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
              campaign_id: currentCampaignId,
              platform: finalPlatform,
              url: 'https://twitch.tv/stats-' + Date.now(),
              title: title || null,
              thumbnail: publicUrl,
              creator_id: explicitCreatorId || user?.id,
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

            success("¡Captura subida con éxito!");
            setIsContentModalOpen(false);
            refresh();


          } catch (err: any) {
            toastError("Fallo en la subida: " + (err.message || "Error desconocido"));
          } finally {
            setIsProcessingContent(false);
          }
        }}
        onSubmit={async (data) => {
          setIsProcessingContent(true);
          try {
            const cleanUrl = normalizeUrl(data.url, data.platform);

            if (editingContent) {
              const { error } = await supabase
                .from('content')
                .update({ 
                  campaign_id: data.campaign_id, 
                  platform: data.platform, 
                  url: cleanUrl, 
                  title: data.title,
                  views: data.views,
                  likes: data.likes,
                  comments: data.comments
                })
                .eq('id', editingContent.id)
                .eq('creator_id', user?.id);
                
              if (error) throw error;
              success("Contenido actualizado");
              setIsContentModalOpen(false);
              setEditingContent(null);
              refresh();
            } else {
              const { data: existing } = await supabase.from('content').select('id').eq('campaign_id', data.campaign_id).eq('url', cleanUrl).is('deleted_at', null).limit(1);
              if (existing && existing.length > 0) {
                  toastError("¡Este contenido ya se encuentra registrado en la campaña!");
                  return;
              }

              const { data: insertedData, error } = await supabase.from('content').insert([{
                ...data,
                url: cleanUrl,
                title: 'Cargando métricas...',
                thumbnail: '',
                views: 0,
                likes: 0,
                comments: 0,
                creator_id: user?.id,
                status: 'active',
                uploaded_at: new Date().toISOString()
              }]).select();
              
              if (error) throw error;

              success("¡Contenido vinculado! Las métricas aparecerán en breve.");
              setIsContentModalOpen(false);
              setEditingContent(null);
              refresh();

              // Fetch metadata in background
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
              }).catch(e => console.warn("Background update failed:", e));
            }
          } catch (err: any) {
            toastError("Error al guardar contenido: " + err.message);
          } finally {
            setIsProcessingContent(false);
          }
        }}
      />
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        profile={profile}
        onSave={handleSavePayment}
        isSaving={isSavingPayment}
      />
    </div>
  );
}
