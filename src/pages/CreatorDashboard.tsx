import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { 
  Sparkles, Youtube, Instagram, Globe, 
  ExternalLink, TrendingUp, Zap, Trophy, Flame, CheckCircle2,
  LayoutDashboard, Upload, Wallet, Plus, RefreshCw, BarChart3, List as ListIcon, LayoutGrid, Award,
  AlertCircle, CheckCircle, Rocket, X, Music2
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
import CampaignsTab from '../components/dashboard/CampaignsTab';
import Skeleton, { StatsSkeleton, CardSkeleton } from '../components/dashboard/Skeleton';
import { DiscordSessionEvent } from '../supabase';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const { success, error: toastError, info } = useToast();
  const [filters, setFilter, setFilters, resetFilters] = useFilterParams({ campaign: 'all', tab: 'overview' });
  const activeTab = filters.tab || 'overview';
  const setActiveTab = (tab: string) => setFilter('tab', tab);
  const { campaigns, content, filteredContent, metrics, campaignStats, refresh, loading } = useDashboardData('creator', { campaign: filters.campaign });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isProcessingContent, setIsProcessingContent] = useState(false);
  const [previewRankIndex, setPreviewRankIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [discordEvents, setDiscordEvents] = useState<DiscordSessionEvent[]>([]);
  const [isCompactView, setIsCompactView] = useState(false);

  // Derived state
  const currentRankIndex = useMemo(() => {
    for (let i = AGENCY_TIERS.length - 1; i >= 0; i--) {
      if (metrics.totalPosts >= AGENCY_TIERS[i].minPosts || metrics.totalViews >= AGENCY_TIERS[i].minViews) return i;
    }
    return 0;
  }, [metrics]);

  const myRank = AGENCY_TIERS[currentRankIndex];

  // Fetch Discord events when a discord content is viewed
  useEffect(() => {
    if (viewingContent?.platform === 'discord') {
      supabase.from('discord_session_events')
        .select('*')
        .eq('content_id', viewingContent.id)
        .order('timestamp', { ascending: true })
        .then(({ data }) => setDiscordEvents(data || []));
    } else {
      setDiscordEvents([]);
    }
  }, [viewingContent]);

  const handleSavePayment = async (data: any) => {
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
  };

  const handleRefresh = async () => {
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

  const handleCopyShareLink = async (token: string, e: React.MouseEvent, type: 'review' | 'slug' = 'review') => {
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
  };

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
      <div className="relative z-0 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-0 pb-20 md:pb-6">
        {/* Cinematic Overlays */}
        <div className="grain-overlay opacity-[0.02]" />
        
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="cursor-pointer group" onClick={() => { setActiveTab('overview'); resetFilters(); }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
              <h1 className="text-3xl font-black text-white leading-tight tracking-tighter uppercase group-hover:text-emerald-400 transition-colors">
                {profile?.display_name || 'Creador'}
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-5">
              Protocol Level: <span className="text-emerald-500 italic">{myRank.name}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button onClick={handleRefresh} disabled={isRefreshing} className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-slate-800 transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <RefreshCw className={`h-4 w-4 text-emerald-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync_Metrics
            </button>
            <button onClick={() => setIsContentModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95">
              <Plus className="h-4 w-4" />
              Add_Content
            </button>
          </div>
        </header>

        {/* Main Tabs Navigation */}
        <div 
          className="flex items-center gap-3 p-2 bg-slate-900/50 backdrop-blur-3xl rounded-3xl w-full lg:w-fit overflow-x-auto no-scrollbar relative z-10 border border-white/5"
          style={{ isolation: 'isolate' }}
        >
          {[
            { id: 'overview', label: 'Summary', icon: LayoutDashboard },
            { id: 'campaigns', label: 'Campaigns', icon: BarChart3 },
            { id: 'content', label: 'Repository', icon: ListIcon },
            { id: 'journey', label: 'Evolution', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab(tab.id);
              }}
              className={`flex-none flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 pointer-events-auto cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
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
              <div className="h-full bg-gradient-to-br from-emerald-600 via-cyan-600 to-emerald-700 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden group min-h-[350px]">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 text-white/80 mb-6">
                    <AlertCircle className="h-5 w-5 text-yellow-300 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Node_Incomplete</span>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 leading-tight tracking-tighter uppercase">Activate_Payments</h3>
                  <p className="text-white/70 text-xs font-medium mb-8 leading-relaxed italic">Configura un método para recibir tus recompensas y acumular beneficios de red.</p>
                </div>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl active:scale-95"
                >
                  Configure_Now
                </button>
              </div>
            ) : (
              <div className="h-full glass-dark p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden group min-h-[350px]">
                <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-emerald-500/05 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                      <Wallet className="h-5 w-5 text-emerald-500" /> Wallet_Node
                    </h3>
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8 max-h-[200px] overflow-y-auto no-scrollbar pr-2">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 flex justify-between">
                        <span>Primary_Method</span>
                        {profile.wallet_note && <span className="text-emerald-500 italic">{profile.wallet_note}</span>}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white uppercase truncate">
                            {profile.payment_method === 'binance' ? 'Binance Pay' : `${profile.wallet_network}`}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 truncate mt-1">
                            {profile.payment_method === 'binance' ? profile.binance_id : profile.wallet_address}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            const val = profile.payment_method === 'binance' ? profile.binance_id : profile.wallet_address;
                            if (val) { navigator.clipboard.writeText(val); success("Copiado!"); }
                          }}
                          className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors text-slate-500 hover:text-emerald-400"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {profile.wallet_address_2 && (
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 flex justify-between">
                          <span>Secondary_Method</span>
                          {profile.wallet_2_note && <span className="text-emerald-500 italic">{profile.wallet_2_note}</span>}
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-black text-white uppercase truncate">
                              {profile.wallet_network_2}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 truncate mt-1">
                              {profile.wallet_address_2}
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              if (profile.wallet_address_2) { navigator.clipboard.writeText(profile.wallet_address_2); success("Copiado!"); }
                            }}
                            className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors text-slate-500 hover:text-emerald-400"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all border border-white/5 active:scale-95"
                >
                  Modify_Method
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
                    const isPopup = item.platform === 'twitch' || item.platform === 'discord' || item.platform === 'baseapp' || (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0);
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
                      <p className="text-sm font-black text-gray-900 truncate leading-tight">{item.title || 'Sin Título'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1.5 py-0.5 bg-gray-50 rounded-md border border-gray-100">{item.platform}</span>
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{campaigns.find(c => c.id === item.campaign_id)?.name || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto px-1 sm:px-0">
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-end w-24 shrink-0">
                        <span className="text-xl font-black text-gray-900 leading-none">{(item.views ?? 0).toLocaleString()}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Vistas</span>
                      </div>
                      <div className="hidden lg:flex flex-col items-end w-24 shrink-0">
                        <span className="text-sm font-black text-gray-500 leading-none text-right">
                          {item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '—'}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 text-right">Fecha</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                       <button onClick={() => { setEditingContent(item); setIsContentModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><BarChart3 className="h-4 w-4" /></button>
                       <button onClick={async () => {
                         if(confirm("¿Mover este contenido a la papelera?")) {
                            await supabase.from('content').update({ deleted_at: new Date().toISOString() }).eq('id', item.id);
                            success("Contenido movido a la papelera");
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
                        if(confirm("¿Mover este contenido a la papelera?")) {
                            await supabase.from('content').update({ deleted_at: new Date().toISOString() }).eq('id', id);
                            success("Contenido movido a la papelera");
                            refresh();
                        }
                    }} 
                    onClick={() => {
                        const isStream = item.platform === 'twitch' || (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0) || item.platform === 'discord';
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
        <div className="animate-in fade-in duration-500">
          <CampaignsTab
            campaignStats={campaignStats}
            role="creator"
            onDelete={() => {}} // No permissions
            onEdit={() => {}}   // No permissions
            setFilters={setFilters}
            setSelectedCampaignReport={() => {}} // Could be enabled later if we want creators to see their own reports
            onCopyLink={handleCopyShareLink}
          />
        </div>
      )}

      {activeTab === 'journey' && (
        <div className="animate-in fade-in duration-500">
          <JourneyMap tiers={AGENCY_TIERS} currentRankIndex={currentRankIndex} />
        </div>
      )}

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
        onTwitchUpload={async (file, explicitCreatorId, dCount, aCount, pCount, uvCount, uChatters, vCount, fCount, sCount, shCount, title, campaign_id, platform) => {
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
              views: finalPlatform === 'discord' ? (uvCount || 0) : (vCount || 0),
              unique_viewers: uvCount || 0,
              peek_viewers: pCount || 0,
              average_viewers: aCount || 0,
              unique_chatters: uChatters || 0,
              followers: fCount || 0,
              new_subscriptions: sCount || 0,
              duration_minutes: dCount || 0,
              shares_count: shCount || 0,
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
                  comments: data.comments,
                  avg_duration_minutes: data.avg_duration_minutes,
                  shares_count: data.shares_count
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
