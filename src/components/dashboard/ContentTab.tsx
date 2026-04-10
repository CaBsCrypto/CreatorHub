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
    <div id="content-section" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 md:space-y-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contenido..."
                value={searchTerm}
                onChange={(e) => setFilter('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm transition-all outline-none"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
                <button 
                  onClick={() => setFilter('view', 'grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Vista Cuadrícula"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setFilter('view', 'gallery')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'gallery' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Vista Galería (Álbum)"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setFilter('view', 'compact')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title="Vista Lista"
                >
                  <ListIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setFilter('zero_views', filterZeroViews ? 'false' : 'true')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap ${filterZeroViews ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white border border-gray-100 text-gray-400 hover:text-rose-500 hover:bg-rose-50'}`}
              title="Mostrar solo contenido con 0 vistas"
            >
              <TrendingUp className={`h-4 w-4 ${filterZeroViews ? 'rotate-180 transition-transform' : ''}`} /> 0 Vistas
            </button>

            <button 
              onClick={() => { setEditingContent(null); setIsContentModalOpen(true); }}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> Nuevo Contenido
            </button>
          </div>

        </div>
      </div>

      {/* Active Filter Indicator */}
      {(filterCampaign !== 'all' || filterPlatform !== 'all' || filterCreator !== 'all' || searchTerm || filterZeroViews) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Filtros Activos:</span>
          {filterZeroViews && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl text-[10px] font-black border border-rose-100 uppercase tracking-widest">
              Solo con 0 vistas
              <button onClick={() => setFilter('zero_views', 'false')} className="hover:text-rose-900">×</button>
            </div>
          )}
          {filterCampaign !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black border border-indigo-100 uppercase tracking-widest">
              Campaña: {campaigns.find(c => c.id === filterCampaign)?.name || '...'}
              <button onClick={() => setFilter('campaign', 'all')} className="hover:text-indigo-900">×</button>
            </div>
          )}
          {filterPlatform !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black border border-indigo-100 uppercase tracking-widest">
              Plataforma: {filterPlatform}
              <button onClick={() => setFilter('platform', 'all')} className="hover:text-indigo-900">×</button>
            </div>
          )}
          {filterCreator !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black border border-indigo-100 uppercase tracking-widest">
              Creador: {filterCreator.startsWith('guest:') ? filterCreator.replace('guest:', '') : (users.find(u => u.id === filterCreator)?.display_name || '...')}
              <button onClick={() => setFilter('creator', 'all')} className="hover:text-indigo-900">×</button>
            </div>
          )}
          {searchTerm && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black border border-indigo-100 uppercase tracking-widest">
              Búsqueda: {searchTerm}
              <button onClick={() => setFilter('search', '')} className="hover:text-indigo-900">×</button>
            </div>
          )}
          <button 
            onClick={() => resetFilters()}
            className="px-3 py-1.5 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-xl uppercase tracking-widest transition-colors border border-transparent hover:border-rose-100"
          >
            Limpiar Todo
          </button>
        </div>
      )}

      {/* Filtered Content Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          <>
            <div className="bg-white/50 backdrop-blur-sm p-4 md:p-5 rounded-[2rem] border border-gray-100 flex flex-col gap-2">
              <Skeleton className="h-2 w-16" variant="rectangular" />
              <Skeleton className="h-6 w-24" variant="rectangular" />
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-4 md:p-5 rounded-[2rem] border border-gray-100 flex flex-col gap-2">
              <Skeleton className="h-2 w-16" variant="rectangular" />
              <Skeleton className="h-6 w-24" variant="rectangular" />
            </div>
          </>
        ) : (
          <>
            <div className="bg-white/50 backdrop-blur-sm p-4 md:p-5 rounded-[2rem] border border-gray-100 flex flex-col group hover:bg-white hover:shadow-xl hover:shadow-indigo-100/20 transition-all duration-500">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Youtube className="h-3 w-3 text-indigo-400" /> Videos
              </span>
              <span className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                {filteredContent.filter(item => !deletedContentIds.includes(item.id)).length}
              </span>
            </div>
            <div 
              onClick={() => setIsViewsModalOpen(true)}
              className="bg-white/50 backdrop-blur-sm p-4 md:p-5 rounded-[2rem] border border-gray-100 flex flex-col group hover:bg-white hover:shadow-xl hover:shadow-emerald-100/20 transition-all duration-500 cursor-pointer"
            >
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-emerald-400" /> Vistas (Clic para ver historial)
              </span>
              <span className="text-xl md:text-2xl font-black text-emerald-600 group-hover:text-emerald-700 transition-colors">
                {filteredContent.filter(item => !deletedContentIds.includes(item.id)).reduce((sum, item) => sum + (item.views || 0), 0).toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>

      <div className={
        viewMode === 'compact' ? "space-y-3" : 
        viewMode === 'gallery' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4" :
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
            // ... (rest of map logic)
            viewMode === 'gallery' ? (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                onClick={() => {
                  const isPopup = item.platform === 'twitch' || item.platform === 'discord' || item.platform === 'baseapp' || (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0);
                  if (isPopup) setViewingContent(item as any);
                  else window.open(item.url, '_blank');
                }}
                className="aspect-square rounded-[2rem] overflow-hidden border border-gray-100 hover:ring-4 hover:ring-indigo-100 transition-all group relative cursor-pointer"
              >
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <p className="text-[8px] font-black text-white uppercase tracking-widest truncate">{item.platform === 'twitch' ? 'stream' : item.platform}</p>
                  <p className="text-[10px] font-bold text-white line-clamp-1">{item.title || 'Sin título'}</p>
                </div>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingContent(item as any);
                    setIsContentModalOpen(true);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-gray-700"
                >
                  <Edit2 className="h-3 w-3" />
                </div>
              </motion.div>
            ) : isCompactView ? (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  const isPopup = item.platform === 'twitch' || item.platform === 'discord' || item.platform === 'baseapp' || (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0);
                  if (isPopup) setViewingContent(item as any);
                  else window.open(item.url, '_blank');
                }}
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
                      {item.platform === 'twitch' ? 'stream' : item.platform}
                    </span>
                    <span className="text-[9px] font-black text-gray-500 bg-gray-100 rounded-md px-2 py-0.5 flex items-center gap-1 uppercase tracking-widest">
                      <List className="h-2.5 w-2.5" />
                      {campaigns.find(c => c.id === item.campaign_id)?.name || 'Sin Campaña'}
                    </span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.creator_id) setManagingUser(users.find(u => u.id === item.creator_id) || null);
                      }}
                      className={`text-[9px] font-bold flex items-center gap-1 uppercase tracking-widest transition-colors ${item.creator_id ? 'text-gray-400 hover:text-indigo-600 cursor-pointer' : 'text-gray-400'}`}
                    >
                      <Users className="h-2.5 w-2.5" />
                      {item.creator_id ? (users.find(u => u.id === item.creator_id)?.display_name || 'Desconocido') : (item.guest_name || 'Invitado')}
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

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRefreshItem(item); }}
                    className="p-2.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                    title="Sincronizar"
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
                    className="p-2.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                    title="Editar"
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
                    className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                    title="Eliminar"
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
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Youtube className="h-8 w-8 text-gray-200" />
            </div>
            <h3 className="text-lg font-black text-gray-900">No hay contenido</h3>
            <p className="text-sm text-gray-400">Comienza vinculando contenido a tus campañas.</p>
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
