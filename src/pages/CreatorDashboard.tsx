import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { 
  Youtube, Instagram, Globe, 
  TrendingUp, Zap, Trophy, Flame,
  LayoutDashboard, Plus, RefreshCw, BarChart3, List as ListIcon, LayoutGrid,
  AlertCircle, CheckCircle, X, Music2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeUrl } from '../utils/urlParser';

// Custom Hooks
import { useDashboardData, AGENCY_TIERS } from '../hooks/useDashboardData';
import { useToast } from '../hooks/useToast';
import { useFilterParams } from '../hooks/useTabNavigation';
import { useContentActions } from '../hooks/useContentActions';

// Modular Components
import StatsCard from '../components/dashboard/StatsCard';
import RankCard from '../components/dashboard/RankCard';
import JourneyMap from '../components/dashboard/JourneyMap';
import ContentCard, { ContentItem } from '../components/dashboard/ContentCard';
import PaymentModal from '../components/dashboard/PaymentModal';
import ContentModal from '../components/dashboard/ContentModal';
import ContentDetailModal from '../components/dashboard/ContentDetailModal';
import CampaignsTab from '../components/dashboard/CampaignsTab';
import Skeleton, { StatsSkeleton, CardSkeleton } from '../components/dashboard/Skeleton';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const { success, error: toastError, info } = useToast();
  const [filters, setFilter, setFilters, resetFilters] = useFilterParams({ campaign: 'all', tab: 'overview' });
  const activeTab = filters.tab || 'overview';
  const setActiveTab = useCallback((tab: string) => setFilter('tab', tab), [setFilter]);
  
  const dashboardFilters = useMemo(() => ({ campaign: filters.campaign }), [filters.campaign]);
  
  const { campaigns, content, filteredContent, metrics, campaignStats, refresh, loading } = useDashboardData('creator', dashboardFilters);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const { isProcessing: isProcessingContent, handleTwitchUpload, handleContentSubmit } = useContentActions(refresh);
  const [previewRankIndex, setPreviewRankIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [isCompactView, setIsCompactView] = useState(false);

  const currentRankIndex = useMemo(() => {
    for (let i = AGENCY_TIERS.length - 1; i >= 0; i--) {
      if (metrics.totalPosts >= AGENCY_TIERS[i].minPosts || metrics.totalViews >= AGENCY_TIERS[i].minViews) return i;
    }
    return 0;
  }, [metrics.totalPosts, metrics.totalViews]);

  const myRank = AGENCY_TIERS[currentRankIndex];

  const handleSavePayment = useCallback(async (data: any) => {
    setIsSavingPayment(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          payment_method: data.payment_method,
          binance_id: data.binance_id,
          wallet_address: data.wallet_address,
          wallet_network: data.wallet_network,
          wallet_note: data.wallet_note,
          wallet_address_2: data.wallet_address_2,
          wallet_network_2: data.wallet_network_2,
          wallet_2_note: data.wallet_2_note
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
  }, [user?.id, refresh, success, toastError]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    info("Sincronizando tus métricas...");
    try {
      const { data } = await supabase.from('content').select('id, url, platform').eq('creator_id', user?.id).is('deleted_at', null);
      if (data && data.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch('/api/refresh-creator-metrics', {
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
          success(`${updatedCount} de ${result.results.length} videos actualizados`);
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
  }, [user?.id, refresh, success, toastError, info]);

  const handleCopyShareLink = useCallback(async (token: string, e: React.MouseEvent, type: 'review' | 'slug' = 'review') => {
    e.stopPropagation();
    try {
      const BASE_URL = window.location.origin;
      const path = type === 'slug' ? `/v/${token}` : `/review/${token}`;
      const url = `${BASE_URL}${path}`;
      await navigator.clipboard.writeText(url);
      success(type === 'slug' ? "¡Enlace personalizado copiado!" : "¡Enlace de reporte copiado!");
    } catch (err) {
      toastError("No se pudo copiar el enlace.");
    }
  }, [success, toastError]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" variant="text" />
              <Skeleton className="h-10 w-64" variant="rectangular" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-12 w-32" variant="rectangular" />
              <Skeleton className="h-12 w-32" variant="rectangular" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 lg:p-12 relative overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="cursor-pointer group" onClick={() => { setActiveTab('overview'); resetFilters(); }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.4)] animate-pulse" />
              <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight uppercase">
                {profile?.display_name || 'Creador'}
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5">
              Rango Actual: <span className="text-indigo-600 italic font-black">{myRank.name}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing} 
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
            <button 
              onClick={() => setIsContentModalOpen(true)} 
              className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Nuevo Contenido
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-gray-100 w-fit shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
            { id: 'campaigns', label: 'Campañas', icon: BarChart3 },
            { id: 'content', label: 'Mi Contenido', icon: ListIcon },
            { id: 'journey', label: 'Evolución', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="min-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <StatsCard 
                  label="Vistas Totales" 
                  value={metrics.totalViews.toLocaleString()} 
                  trend={metrics.viewsTrend ? `${metrics.viewsTrend.isPositive ? '+' : '-'}${metrics.viewsTrend.value}%` : undefined} 
                  icon={TrendingUp} 
                />
                <StatsCard 
                  label="Promedio Vistas" 
                  value={Math.round(metrics.totalViews / (metrics.totalPosts || 1)).toLocaleString()} 
                  icon={Zap} 
                  iconColor="text-rose-500" 
                />
                <StatsCard 
                  label="Publicaciones" 
                  value={metrics.totalPosts} 
                  trend={metrics.postsTrend ? `${metrics.postsTrend.isPositive ? '+' : '-'}${metrics.postsTrend.value}%` : undefined} 
                  icon={ListIcon} 
                  iconColor="text-emerald-500" 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
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
                
                {/* Payment Configuration Card */}
                {!profile?.payment_method ? (
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group border border-indigo-500">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2.5 text-white/70 mb-6">
                        <AlertCircle className="h-4 w-4 text-yellow-300 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Configuración Pendiente</span>
                      </div>
                      <h3 className="text-3xl font-black text-white mb-3 tracking-tight uppercase">Activa Pagos</h3>
                      <p className="text-indigo-100/70 text-xs font-bold leading-relaxed">Configura tu método de retiro para empezar a cobrar tus recompensas.</p>
                    </div>
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl active:scale-95"
                    >
                      Configurar Ahora
                    </button>
                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5 uppercase tracking-tight">
                          <CheckCircle className="h-5 w-5 text-emerald-500" /> Mi Wallet
                        </h3>
                        <button 
                          onClick={() => setIsPaymentModalOpen(true)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Método Primario</p>
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-700 uppercase truncate">
                                {profile.payment_method === 'binance' ? 'Binance Pay' : profile.wallet_network}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">
                                {profile.payment_method === 'binance' ? profile.binance_id : profile.wallet_address}
                              </p>
                            </div>
                          </div>
                        </div>

                        {profile.wallet_address_2 && (
                          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Método Secundario</p>
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-700 uppercase truncate">{profile.wallet_network_2}</p>
                                <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{profile.wallet_address_2}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="mt-6 w-full py-3.5 bg-gray-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100 hover:border-indigo-100 transition-all active:scale-95"
                    >
                      Editar Ajustes
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Repositorio</h2>
                <div className="flex items-center gap-4">
                  {filters.campaign && filters.campaign !== 'all' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black border border-indigo-100 uppercase tracking-widest">
                      {campaigns.find(c => c.id === filters.campaign)?.name || '...'}
                      <button onClick={() => setFilter('campaign', 'all')} className="hover:text-indigo-900 ml-1"><X className="h-3 w-3" /></button>
                    </div>
                  )}
                  <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <button onClick={() => setIsCompactView(false)} className={`p-2 rounded-lg transition-all ${!isCompactView ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="h-4 w-4" /></button>
                    <button onClick={() => setIsCompactView(true)} className={`p-2 rounded-lg transition-all ${isCompactView ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><ListIcon className="h-4 w-4" /></button>
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
                        const isPopup = item.platform === 'twitch' || 
                                        item.platform === 'discord' || 
                                        item.platform === 'baseapp' || 
                                        item.platform === 'instagram_story' || 
                                        (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0) || 
                                        (item.thumbnail && (item.thumbnail.includes('supabase.co') || item.thumbnail.includes('content-attachments') || item.thumbnail.includes('storage') || item.thumbnail.includes('supabase.co/storage'))) ||
                                        (item.url && item.url.includes('twitch.tv/stats-'));
                        if (isPopup) setViewingContent(item as any);
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
                          {item.platform === 'discord' && <Music2 className="h-5 w-5 text-indigo-500" />}
                          {!['tiktok', 'instagram', 'youtube', 'twitch', 'discord'].includes(item.platform) && <Globe className="h-5 w-5 text-indigo-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900 truncate leading-tight">{item.title || 'Sin Título'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-gray-50 rounded-md border border-gray-100">{item.platform}</span>
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{campaigns.find(c => c.id === item.campaign_id)?.name || 'General'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto px-1 sm:px-0">
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col items-end w-24 shrink-0">
                            <span className="text-xl font-black text-slate-900 leading-none">{(item.views ?? 0).toLocaleString()}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Vistas</span>
                          </div>
                          <div className="hidden lg:flex flex-col items-end w-24 shrink-0">
                            <span className="text-sm font-black text-slate-500 leading-none text-right">
                              {item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '—'}
                            </span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 text-right">Fecha</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setEditingContent(item); setIsContentModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><BarChart3 className="h-4 w-4" /></button>
                          <button onClick={async () => {
                            if(confirm("¿Mover este contenido a la papelera?")) {
                                await supabase.from('content').update({ deleted_at: new Date().toISOString() }).eq('id', item.id);
                                success("Contenido eliminado");
                                refresh();
                            }
                          }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><X className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <ContentCard 
                        key={item.id} 
                        item={item as any} 
                        index={i} 
                        onEdit={(c) => { setEditingContent(c); setIsContentModalOpen(true); }} 
                        onDelete={async (id) => { 
                            if(confirm("¿Mover este contenido a la papelera?")) {
                                await supabase.from('content').update({ deleted_at: new Date().toISOString() }).eq('id', id);
                                success("Contenido eliminado");
                                refresh();
                            }
                        }} 
                        onClick={() => {
                             const isStream = item.platform === 'twitch' || 
                                              item.platform === 'discord' || 
                                              item.platform === 'baseapp' || 
                                              item.platform === 'instagram_story' || 
                                              (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0) || 
                                              (item.thumbnail && (item.thumbnail.includes('supabase.co') || item.thumbnail.includes('content-attachments') || item.thumbnail.includes('storage') || item.thumbnail.includes('supabase.co/storage'))) ||
                                              (item.url && item.url.includes('twitch.tv/stats-'));
                             if (isStream) setViewingContent(item as any);
                             else window.open(item.url, '_blank');
                         }}
                    />
                  )
                ))}
                <button onClick={() => { setEditingContent(null); setIsContentModalOpen(true); }} className={`rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-indigo-200 hover:text-indigo-600 transition-all group ${isCompactView ? 'h-20 flex-row px-8' : 'aspect-square'}`}>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-all">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Nuevo Post</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="animate-in fade-in duration-500">
              <CampaignsTab
                campaignStats={campaignStats}
                role="creator"
                onDelete={() => {}}
                onEdit={() => {}}
                setFilters={setFilters}
                setSelectedCampaignReport={() => {}}
                onCopyLink={handleCopyShareLink}
              />
            </div>
          )}

          {activeTab === 'journey' && (
            <div className="animate-in fade-in duration-500">
              <JourneyMap tiers={AGENCY_TIERS} currentRankIndex={currentRankIndex} />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {viewingContent && (
        <ContentDetailModal 
          isOpen={true}
          onClose={() => setViewingContent(null)}
          item={viewingContent}
        />
      )}

      <ContentModal 
        isOpen={isContentModalOpen} 
        onClose={() => { setIsContentModalOpen(false); setEditingContent(null); }} 
        campaigns={campaigns} 
        editingContent={editingContent}
        isProcessing={isProcessingContent}
        onTwitchUpload={(file, explicitCreatorId, dCount, aCount, pCount, uvCount, uChatters, vCount, fCount, sCount, shCount, title, campaign_id, platform, likes, comments, contentType, isRepost, parentId) => 
          handleTwitchUpload(file, user?.id || '', explicitCreatorId || null, editingContent, campaigns, dCount, aCount, pCount, uvCount, uChatters, vCount, fCount, sCount, shCount, title, campaign_id || (filters.campaign === 'all' ? (campaigns[0]?.id || '') : filters.campaign), platform, likes, comments, contentType, isRepost, parentId)
        }
        onSubmit={(data) => 
          handleContentSubmit(data, user?.id || '', editingContent, () => { setIsContentModalOpen(false); setEditingContent(null); })
        }
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
