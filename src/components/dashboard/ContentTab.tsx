import React, { useState } from 'react';
import { Search, LayoutGrid, ImageIcon, List as ListIcon, Plus, RefreshCw, Youtube, List, Users, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ContentCard from './ContentCard';
import { supabase } from '../../supabase';
import ViewsTrendModal from './ViewsTrendModal';
import Skeleton, { CardSkeleton } from './Skeleton';

interface ContentTabProps {
  searchTerm: string;
  setFilter: (key: string, value: string) => void;
  viewMode: string;
  isCompactView: boolean;
  setEditingContent: (val: any) => void;
  setIsContentModalOpen: (val: boolean) => void;
  content: any[];
  setIsRefreshing: (val: boolean) => void;
  isRefreshing: boolean;
  refresh: () => void;
  filteredContent: any[];
  deletedContentIds: string[];
  setViewingContent: (val: any) => void;
  success: (msg: string) => void;
  toastError: (msg: string) => void;
  info: (msg: string) => void;
  campaigns: any[];
  users: any[];
  setManagingUser: (val: any) => void;
  setDeletedContentIds: React.Dispatch<React.SetStateAction<string[]>>;
  resetFilters: () => void;
  filterCampaign: string;
  filterPlatform: string;
  filterCreator: string;
  filterZeroViews: boolean;
  isLoading?: boolean;
}

const ContentTab: React.FC<ContentTabProps> = ({
  searchTerm,
  setFilter,
  viewMode,
  isCompactView,
  setEditingContent,
  setIsContentModalOpen,
  content,
  setIsRefreshing,
  isRefreshing,
  refresh,
  filteredContent,
  deletedContentIds,
  setViewingContent,
  success,
  toastError,
  info,
  campaigns,
  users,
  setManagingUser,
  setDeletedContentIds,
  resetFilters,
  filterCampaign,
  filterPlatform,
  filterCreator,
  filterZeroViews,
  isLoading
}) => {
  const [isViewsModalOpen, setIsViewsModalOpen] = useState(false);

  const handleRefreshAll = async () => {
    if (content.length === 0) return info("No hay contenido para sincronizar");
    setIsRefreshing(true);
    info("Sincronizando todas las métricas...");
    try {
      const data = content.map(c => ({ id: c.id, url: c.url, platform: c.platform }));
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/refresh-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ items: data })
      });
      const result = await response.json();
      if (result.success) {
        await refresh();
        success(`${result.results_count} videos sincronizados correctamente desde el servidor`);
      } else {
        throw new Error(result.error || "Fallo en la sincronización masiva");
      }
    } catch (e: any) {
      toastError("Error: " + e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshItem = async (item: any) => {
    info("Sincronizando video...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/fetch-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ url: item.url, platform: item.platform, contentId: item.id })
      });
      if (!res.ok) throw new Error("Error al obtener metadata");
      
      success("Video actualizado desde el servidor");
      refresh();
    } catch (e: any) {
      toastError("Error: " + e.message);
    }
  };

  return (
    <div id="content-section" className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="glass-dark p-6 md:p-8 rounded-[3rem] border border-white/5 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="relative flex-1 min-w-[280px] max-w-xl group">
              <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-focus-within:bg-emerald-500/10 transition-all duration-700" />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition-all duration-500 relative z-10" />
              <input
                type="text"
                placeholder="Search_Content_Nodes..."
                value={searchTerm}
                onChange={(e) => setFilter('search', e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-900/50 border border-white/5 focus:border-emerald-500/30 rounded-2xl text-sm font-black uppercase tracking-widest placeholder:text-slate-700 outline-none transition-all relative z-10 text-white italic"
              />
            </div>
            
            <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-white/5 relative z-10">
              <button 
                onClick={() => setFilter('view', 'grid')}
                className={`p-3 rounded-xl transition-all duration-500 ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-slate-600 hover:text-white'}`}
                title="Grid_View"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setFilter('view', 'gallery')}
                className={`p-3 rounded-xl transition-all duration-500 ${viewMode === 'gallery' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-slate-600 hover:text-white'}`}
                title="Gallery_View"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setFilter('view', 'compact')}
                className={`p-3 rounded-xl transition-all duration-500 ${viewMode === 'compact' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'text-slate-600 hover:text-white'}`}
                title="List_View"
              >
                <ListIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={() => setFilter('zero_views', filterZeroViews ? 'false' : 'true')}
              className={`flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 whitespace-nowrap border-2 ${filterZeroViews ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30'}`}
              title="Filter_Zero_Metrics"
            >
              <TrendingUp className={`h-4 w-4 ${filterZeroViews ? 'rotate-180 transition-transform duration-700' : ''}`} /> 0_Metrics
            </button>

            <button 
              onClick={() => { setEditingContent(null); setIsContentModalOpen(true); }}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-500 active:scale-95 whitespace-nowrap italic shadow-2xl"
            >
              <Plus className="h-4 w-4" /> Deploy_Asset
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {(filterCampaign !== 'all' || filterPlatform !== 'all' || filterCreator !== 'all' || searchTerm || filterZeroViews) && (
        <div className="flex flex-wrap items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-6 duration-700">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mr-4 italic">Active_Parameters:</span>
          {filterZeroViews && (
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-[9px] font-black border border-emerald-500/20 uppercase tracking-widest italic">
              ZERO_VIEWS_ONLY
              <button onClick={() => setFilter('zero_views', 'false')} className="hover:text-white transition-colors">×</button>
            </div>
          )}
          {filterCampaign !== 'all' && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 text-white rounded-xl text-[9px] font-black border border-white/10 uppercase tracking-widest italic">
              CAMPAIGN: {campaigns.find(c => c.id === filterCampaign)?.name || '...'}
              <button onClick={() => setFilter('campaign', 'all')} className="hover:text-emerald-400 transition-colors">×</button>
            </div>
          )}
          {filterPlatform !== 'all' && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 text-white rounded-xl text-[9px] font-black border border-white/10 uppercase tracking-widest italic">
              PLATFORM: {filterPlatform}
              <button onClick={() => setFilter('platform', 'all')} className="hover:text-emerald-400 transition-colors">×</button>
            </div>
          )}
          {filterCreator !== 'all' && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 text-white rounded-xl text-[9px] font-black border border-white/10 uppercase tracking-widest italic">
              AGENT: {filterCreator.startsWith('guest:') ? filterCreator.replace('guest:', '') : (users.find(u => u.id === filterCreator)?.display_name || '...')}
              <button onClick={() => setFilter('creator', 'all')} className="hover:text-emerald-400 transition-colors">×</button>
            </div>
          )}
          <button 
            onClick={() => resetFilters()}
            className="px-4 py-2 text-[9px] font-black text-emerald-500 hover:text-white hover:bg-emerald-500/20 rounded-xl uppercase tracking-[0.3em] transition-all duration-500 border border-emerald-500/20 italic"
          >
            Purge_All
          </button>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
        {isLoading ? (
          <>
            <div className="glass-dark p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-4 animate-pulse">
              <div className="h-2 w-24 bg-white/5 rounded" />
              <div className="h-10 w-48 bg-white/5 rounded" />
            </div>
            <div className="glass-dark p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-4 animate-pulse">
              <div className="h-2 w-24 bg-white/5 rounded" />
              <div className="h-10 w-48 bg-white/5 rounded" />
            </div>
          </>
        ) : (
          <>
            <div className="glass-dark p-8 rounded-[3rem] border border-white/5 flex flex-col group hover:border-emerald-500/30 transition-all duration-700 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-3 italic">
                <Youtube className="h-4 w-4 text-emerald-500" /> Total_Asset_Nodes
              </span>
              <span className="text-5xl font-black text-white group-hover:text-emerald-400 transition-all duration-700 tracking-tighter tabular-nums">
                {filteredContent.filter(item => !deletedContentIds.includes(item.id)).length}
              </span>
            </div>
            <div 
              onClick={() => setIsViewsModalOpen(true)}
              className="glass-dark p-8 rounded-[3rem] border border-white/5 flex flex-col group hover:border-emerald-500/30 transition-all duration-700 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-3 italic">
                <TrendingUp className="h-4 w-4 text-emerald-500" /> Aggregated_Metrics_Score
              </span>
              <span className="text-5xl font-black text-emerald-500 group-hover:text-emerald-400 transition-all duration-700 tracking-tighter tabular-nums">
                {filteredContent.filter(item => !deletedContentIds.includes(item.id)).reduce((sum, item) => sum + (item.views || 0), 0).toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>

      <div className={
        viewMode === 'compact' ? "space-y-4" : 
        viewMode === 'gallery' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" :
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      }>
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : filteredContent
          .filter(item => !deletedContentIds.includes(item.id))
          .filter(item => {
            if (!searchTerm) return true;
            return item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   item.platform.toLowerCase().includes(searchTerm.toLowerCase());
          })
          .map((item, i) => (
            viewMode === 'gallery' ? (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01, duration: 0.7 }}
                onClick={() => {
                  const isPopup = item.platform === 'twitch' || item.platform === 'discord' || item.platform === 'baseapp' || (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0);
                  if (isPopup) setViewingContent(item as any);
                  else window.open(item.url, '_blank');
                }}
                className="aspect-square rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-700 group relative cursor-pointer glass-dark"
              >
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100" />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-800 group-hover:text-emerald-500 transition-colors" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700 p-5 flex flex-col justify-end">
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1 italic">{item.platform === 'twitch' ? 'stream' : item.platform}_NODE</p>
                  <p className="text-[11px] font-black text-white line-clamp-1 uppercase tracking-tight">{item.title || 'Untitled_Entry'}</p>
                </div>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingContent(item as any);
                    setIsContentModalOpen(true);
                  }}
                  className="absolute top-4 right-4 p-2.5 bg-white text-slate-950 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-emerald-500 shadow-2xl scale-75 group-hover:scale-100"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            ) : isCompactView ? (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.7 }}
                onClick={() => {
                  const isPopup = item.platform === 'twitch' || item.platform === 'discord' || item.platform === 'baseapp' || (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0);
                  if (isPopup) setViewingContent(item as any);
                  else window.open(item.url, '_blank');
                }}
                className="glass-dark px-8 py-6 rounded-[2rem] border border-white/5 flex items-center hover:border-emerald-500/30 hover:shadow-2xl transition-all duration-500 group gap-10 cursor-pointer active:scale-[0.99] relative overflow-hidden"
              >
                <div className="w-16 h-16 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 shrink-0 group-hover:scale-105 transition-transform duration-500">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                  ) : (
                    <Youtube className="h-6 w-6 text-slate-800 group-hover:text-emerald-500 transition-colors" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-white line-clamp-1 uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">{item.title || 'Untitled_Node'}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="text-[9px] font-black text-slate-950 uppercase tracking-[0.2em] px-3 py-1 bg-white rounded-lg italic">
                      {item.platform === 'twitch' ? 'stream' : item.platform}_DATA
                    </span>
                    <span className="text-[9px] font-black text-slate-500 bg-slate-900 rounded-lg px-3 py-1 flex items-center gap-2 uppercase tracking-widest border border-white/5">
                      <List className="h-3 w-3 text-emerald-500" />
                      {campaigns.find(c => c.id === item.campaign_id)?.name || 'STANDALONE_OP'}
                    </span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.creator_id) setManagingUser(users.find(u => u.id === item.creator_id) || null);
                      }}
                      className={`text-[9px] font-black flex items-center gap-2 uppercase tracking-widest transition-all duration-500 ${item.creator_id ? 'text-slate-600 hover:text-emerald-400 cursor-pointer' : 'text-slate-700'}`}
                    >
                      <Users className="h-3 w-3" />
                      AGENT: {item.creator_id ? (users.find(u => u.id === item.creator_id)?.display_name || 'UNKNOWN') : (item.guest_name || 'EXT_SOURCE')}
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-center w-36 shrink-0 pt-1">
                  <p className="text-3xl font-black text-white leading-none tracking-tighter tabular-nums group-hover:text-emerald-500 transition-colors">{(item.views || 0).toLocaleString()}</p>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mt-3 italic">AGGREGATED_METRIC</p>
                </div>

                <div className="hidden lg:flex flex-col items-center w-36 shrink-0 pt-1">
                  <p className="text-sm font-black text-slate-400 leading-none uppercase tracking-widest">
                    {item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'STALE'}
                  </p>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mt-3 italic">TIMESTAMP</p>
                </div>

                <div className="flex items-center gap-4 shrink-0 relative z-20">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRefreshItem(item); }}
                    className="p-3 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all duration-500 active:scale-90 border border-white/5 hover:border-emerald-500/30"
                    title="Sync_Node"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingContent(item as any); 
                      setIsContentModalOpen(true); 
                    }}
                    className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-500 active:scale-90 border border-white/5 hover:border-white/20"
                    title="Edit_Manifest"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm("¿Mover esta publicación a la papelera?")) {
                        setDeletedContentIds(prev => [...prev, item.id]);
                        const { error } = await supabase.from('content').update({ deleted_at: new Date().toISOString() }).eq('id', item.id);
                        if (error) {
                          toastError("Error al mover a papelera: " + error.message);
                        } else {
                          success("Contenido movido a la papelera");
                          refresh();
                        }
                      }
                    }}
                    className="p-3 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-500 active:scale-90 border border-white/5 hover:border-rose-500/30"
                    title="Purge_Node"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <ContentCard 
                key={item.id} 
                item={item as any} 
                index={i} 
                campaignName={campaigns.find(c => c.id === item.campaign_id)?.name}
                onEdit={(content) => {
                  setEditingContent(content);
                  setIsContentModalOpen(true);
                }}
                onDelete={async (id) => {
                  if (confirm("¿Mover este contenido a la papelera?")) {
                    setDeletedContentIds(prev => [...prev, id]);
                    const { error } = await supabase.from('content').update({ deleted_at: new Date().toISOString() }).eq('id', id);
                    if (!error) {
                      success("Contenido movido a la papelera");
                      refresh();
                    }
                  }
                }}
                onClick={() => setViewingContent(item as any)}
              />
            )
          ))}
        {content.length === 0 && (
          <div className="col-span-full py-40 text-center animate-in fade-in duration-1000">
            <div className="w-24 h-24 glass-dark rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
              <Youtube className="h-10 w-10 text-slate-800" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-[0.4em] italic">No_Asset_Nodes_Detected</h3>
            <p className="text-sm text-slate-600 mt-3 font-medium">Initialize synchronization or deploy new assets.</p>
          </div>
        )}
      </div>

      <ViewsTrendModal 
        isOpen={isViewsModalOpen} 
        onClose={() => setIsViewsModalOpen(false)} 
        content={filteredContent.filter(item => !deletedContentIds.includes(item.id))} 
      />
    </div>
  );
};


export default ContentTab;
