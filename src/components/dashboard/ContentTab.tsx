import React, { useState } from 'react';
import { Search, LayoutGrid, ImageIcon, List as ListIcon, Plus, RefreshCw, Youtube, List, Users, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ContentCard from './ContentCard';
import { supabase } from '../../supabase';
import ViewsTrendModal from './ViewsTrendModal';
import { CardSkeleton } from './Skeleton';

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

  const activeContent = filteredContent.filter(item => !deletedContentIds.includes(item.id));

  return (
    <div id="content-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Search & Actions Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="relative flex-1 min-w-[280px] max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Buscar contenido..."
                value={searchTerm}
                onChange={(e) => setFilter('search', e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none"
              />
            </div>

            {/* Campaign Select Filter */}
            <select
              value={filterCampaign}
              onChange={(e) => setFilter('campaign', e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all cursor-pointer min-w-[130px]"
            >
              <option value="all">Campañas: Todas</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Platform Select Filter */}
            <select
              value={filterPlatform}
              onChange={(e) => setFilter('platform', e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all cursor-pointer min-w-[130px]"
            >
              <option value="all">Redes: Todas</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="stream">Streams</option>
              <option value="x">X / Twitter</option>
              <option value="coinmarketcap">CoinMarketCap</option>
            </select>

            {/* Creator Select Filter */}
            <select
              value={filterCreator}
              onChange={(e) => setFilter('creator', e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all cursor-pointer min-w-[170px]"
            >
              <option value="all">Creadores: Todos</option>
              <optgroup label="Personal" className="bg-white text-slate-400">
                {users.filter(u => u.role !== 'client').map(u => (
                  <option key={u.id} value={u.id} className="text-slate-700">
                    {u.admin_alias || u.display_name || u.email.split('@')[0]}
                  </option>
                ))}
              </optgroup>
              {content.some(c => !c.creator_id && c.guest_name) && (
                <optgroup label="Invitados" className="bg-white text-slate-400">
                  {[...new Set(content.filter(c => !c.creator_id && c.guest_name).map(c => c.guest_name))].map(name => (
                    <option key={name} value={`guest:${name}`} className="text-slate-700">{name}</option>
                  ))}
                </optgroup>
              )}
            </select>
            
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
              <button 
                onClick={() => setFilter('view', 'grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-slate-400 hover:text-slate-600'}`}
                title="Vista Grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setFilter('view', 'gallery')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'gallery' ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-slate-400 hover:text-slate-600'}`}
                title="Vista Galería"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setFilter('view', 'compact')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-slate-400 hover:text-slate-600'}`}
                title="Vista Lista"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setFilter('zero_views', filterZeroViews ? 'false' : 'true')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${filterZeroViews ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'}`}
            >
              <TrendingUp className={`h-3.5 w-3.5 ${filterZeroViews ? 'rotate-180 transition-transform' : ''}`} /> 0 Métricas
            </button>

            <button 
              onClick={() => { setEditingContent(null); setIsContentModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar Contenido
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(filterCampaign !== 'all' || filterPlatform !== 'all' || filterCreator !== 'all' || searchTerm || filterZeroViews) && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-500">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Filtros Activos:</span>
          {filterZeroViews && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black border border-indigo-100 uppercase tracking-widest">
              SOLO 0 VISTAS
              <button onClick={() => setFilter('zero_views', 'false')} className="hover:text-indigo-800">×</button>
            </div>
          )}
          {filterCampaign !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-slate-600 rounded-lg text-[9px] font-black border border-gray-100 uppercase tracking-widest">
              CAMPAÑA: {campaigns.find(c => c.id === filterCampaign)?.name || '...'}
              <button onClick={() => setFilter('campaign', 'all')} className="hover:text-slate-900">×</button>
            </div>
          )}
          {filterPlatform !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-slate-600 rounded-lg text-[9px] font-black border border-gray-100 uppercase tracking-widest">
              PLATAFORMA: {filterPlatform}
              <button onClick={() => setFilter('platform', 'all')} className="hover:text-slate-900">×</button>
            </div>
          )}
          {filterCreator !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-slate-600 rounded-lg text-[9px] font-black border border-gray-100 uppercase tracking-widest">
              CREADOR: {filterCreator.startsWith('guest:') ? filterCreator.replace('guest:', '') : (users.find(u => u.id === filterCreator)?.display_name || '...')}
              <button onClick={() => setFilter('creator', 'all')} className="hover:text-slate-900">×</button>
            </div>
          )}
          <button 
            onClick={() => resetFilters()}
            className="px-3 py-1.5 text-[9px] font-black text-rose-500 hover:bg-rose-50 rounded-lg uppercase tracking-widest transition-all border border-rose-100"
          >
            Limpiar Filtros
          </button>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col group hover:border-indigo-100 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Youtube className="h-3.5 w-3.5 text-indigo-600" /> Videos Totales
          </span>
          <span className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight tabular-nums">
            {activeContent.length}
          </span>
        </div>
        <div 
          onClick={() => setIsViewsModalOpen(true)}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col group hover:border-indigo-100 transition-all cursor-pointer"
        >
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-600" /> Vistas Totales
          </span>
          <span className="text-3xl font-black text-indigo-600 tracking-tight tabular-nums">
            {activeContent.reduce((sum, item) => sum + (item.views || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>

      <div className={
        viewMode === 'compact' ? "space-y-3" : 
        viewMode === 'gallery' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" :
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      }>
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : activeContent
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
                transition={{ delay: i * 0.01, duration: 0.5 }}
                onClick={() => {
                  const isPopup = item.platform === 'twitch' || 
                                  item.platform === 'discord' || 
                                  item.platform === 'baseapp' || 
                                  item.platform === 'instagram_story' || 
                                  (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0) || 
                                  (item.thumbnail && (item.thumbnail.includes('supabase.co') || item.thumbnail.includes('content-attachments') || item.thumbnail.includes('storage') || item.thumbnail.includes('supabase.co/storage'))) ||
                                  (item.url && item.url.includes('twitch.tv/stats-')) ||
                                  (item.coupledPosts && item.coupledPosts.length > 1);
                  if (isPopup) setViewingContent(item as any);
                  else window.open(item.url, '_blank');
                }}
                className={`aspect-square rounded-2xl overflow-hidden transition-all duration-300 group relative cursor-pointer bg-gray-50 ${
                  (item.coupledPlatforms && item.coupledPlatforms.length > 1)
                    ? 'border-[3px] border-indigo-200 hover:border-indigo-400 hover:shadow-md'
                    : 'border border-gray-100 hover:border-indigo-200 hover:shadow-md'
                }`}
              >
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                  </div>
                )}
                
                {/* Badges on top of thumbnail in gallery view */}
                <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
                  {item.coupledPlatforms && item.coupledPlatforms.length > 1 && (
                    <span className="px-1.5 py-0.5 bg-indigo-650 text-white text-[7px] font-black uppercase tracking-wider rounded shadow-sm">
                      MULTIPLATAFORMA
                    </span>
                  )}
                  {item.is_repost && (
                    <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[7px] font-black uppercase tracking-wider rounded shadow-sm">
                      MISMO POST
                    </span>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <p className="text-[10px] font-black text-white line-clamp-1 uppercase tracking-tight">{item.title || 'Sin título'}</p>
                </div>
              </motion.div>
            ) : isCompactView ? (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02, duration: 0.5 }}
                onClick={() => {
                  const isPopup = item.platform === 'twitch' || 
                                  item.platform === 'discord' || 
                                  item.platform === 'baseapp' || 
                                  item.platform === 'instagram_story' || 
                                  (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0) || 
                                  (item.thumbnail && (item.thumbnail.includes('supabase.co') || item.thumbnail.includes('content-attachments') || item.thumbnail.includes('storage') || item.thumbnail.includes('supabase.co/storage'))) ||
                                  (item.url && item.url.includes('twitch.tv/stats-')) ||
                                  (item.coupledPosts && item.coupledPosts.length > 1);
                  if (isPopup) setViewingContent(item as any);
                  else window.open(item.url, '_blank');
                }}
                className={`bg-white px-5 py-4 rounded-xl flex items-center hover:shadow-md transition-all duration-300 group gap-6 cursor-pointer ${
                  (item.coupledPlatforms && item.coupledPlatforms.length > 1)
                    ? 'border-[3px] border-indigo-200 hover:border-indigo-400 hover:shadow-indigo-500/10'
                    : 'border border-gray-100 hover:border-indigo-100 hover:shadow-indigo-500/5'
                }`}
              >
                <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-50 shrink-0">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Youtube className="h-5 w-5 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 line-clamp-1 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{item.title || 'Sin título'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                      {item.platform}
                    </span>
                    {item.coupledPlatforms && item.coupledPlatforms.length > 1 && (
                      <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-wider rounded shadow-sm">
                        MULTIPLATAFORMA
                      </span>
                    )}
                    {item.is_repost && (
                      <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[8px] font-black uppercase tracking-wider rounded">
                        MISMO POST
                      </span>
                    )}
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <List className="h-3 w-3" />
                      {campaigns.find(c => c.id === item.campaign_id)?.name || 'Sin campaña'}
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-end w-24 shrink-0">
                  <p className="text-xl font-black text-slate-900 leading-none tabular-nums group-hover:text-indigo-600 transition-colors">{(item.views || 0).toLocaleString()}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Vistas</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRefreshItem(item); }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
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
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-gray-50 rounded-lg transition-all"
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
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
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
          <div className="col-span-full py-24 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Youtube className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Sin contenido</h3>
            <p className="text-sm text-slate-500 mt-1">Sincroniza o agrega contenido nuevo arriba.</p>
          </div>
        )}
      </div>

      <ViewsTrendModal 
        isOpen={isViewsModalOpen} 
        onClose={() => setIsViewsModalOpen(false)} 
        content={activeContent} 
      />
    </div>
  );
};

export default ContentTab;
