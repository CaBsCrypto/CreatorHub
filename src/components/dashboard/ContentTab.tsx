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
    <div id="content-section" className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">      <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="relative flex-1 min-w-[280px] max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-all duration-300 relative z-10" />
              <input
                type="text"
                placeholder="Buscar contenidos por título..."
                value={searchTerm}
                onChange={(e) => setFilter('search', e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-gray-50/50 border border-gray-100 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-sm font-black uppercase tracking-widest placeholder:text-slate-300 outline-none transition-all relative z-10 text-slate-900"
              />
            </div>
            
            <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 relative z-10">
              <button 
                onClick={() => setFilter('view', 'grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-600'}`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setFilter('view', 'gallery')}
                className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'gallery' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-600'}`}
                title="Vista Galería"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setFilter('view', 'compact')}
                className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'compact' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-600'}`}
                title="Vista Lista"
              >
                <ListIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={() => setFilter('zero_views', filterZeroViews ? 'false' : 'true')}
              className={`flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 whitespace-nowrap border-2 ${filterZeroViews ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-gray-50 border-gray-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-100'}`}
              title="Filtrar métricas en cero"
            >
              <TrendingUp className={`h-4 w-4 ${filterZeroViews ? 'rotate-180' : ''}`} /> 0 Vistas
            </button>

            <button 
              onClick={() => { setEditingContent(null); setIsContentModalOpen(true); }}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all duration-300 active:scale-95 whitespace-nowrap border border-indigo-100"
            >
              <Plus className="h-4 w-4" /> Nuevo Contenido
            </button>
          </div>
        </div>
      </div>v>

      {/* Active Filter Indicator */}
      {(filterCampaign !== 'all' || filterPlatform !== 'all' || filterCreator !== 'all' || searchTerm || filterZeroViews) && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-4">Filtros Activos:</span>
          {filterZeroViews && (
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black border border-indigo-100 uppercase tracking-widest">
              SOLO VISTAS 0
              <button onClick={() => setFilter('zero_views', 'false')} className="hover:text-indigo-800 transition-colors">×</button>
            </div>
          )}
          {filterCampaign !== 'all' && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white text-slate-600 rounded-xl text-[9px] font-black border border-gray-100 uppercase tracking-widest">
              CAMPAÑA: {campaigns.find(c => c.id === filterCampaign)?.name || '...'}
              <button onClick={() => setFilter('campaign', 'all')} className="hover:text-indigo-600 transition-colors">×</button>
            </div>
          )}
          {filterPlatform !== 'all' && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white text-slate-600 rounded-xl text-[9px] font-black border border-gray-100 uppercase tracking-widest">
              PLATAFORMA: {filterPlatform}
              <button onClick={() => setFilter('platform', 'all')} className="hover:text-indigo-600 transition-colors">×</button>
            </div>
          )}
          {filterCreator !== 'all' && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white text-slate-600 rounded-xl text-[9px] font-black border border-gray-100 uppercase tracking-widest">
              CREADOR: {filterCreator.startsWith('guest:') ? filterCreator.replace('guest:', '') : (users.find(u => u.id === filterCreator)?.display_name || '...')}
              <button onClick={() => setFilter('creator', 'all')} className="hover:text-indigo-600 transition-colors">×</button>
            </div>
          )}
          <button 
            onClick={() => resetFilters()}
            className="px-4 py-2 text-[9px] font-black text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-xl uppercase tracking-widest transition-all duration-300 border border-indigo-100"
          >
            Limpiar Todo
          </button>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
        {isLoading ? (
          <>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col gap-4 animate-pulse shadow-sm">
              <div className="h-2 w-24 bg-gray-50 rounded" />
              <div className="h-10 w-48 bg-gray-50 rounded" />
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col gap-4 animate-pulse shadow-sm">
              <div className="h-2 w-24 bg-gray-50 rounded" />
              <div className="h-10 w-48 bg-gray-50 rounded" />
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 flex flex-col group hover:border-indigo-100 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                <Youtube className="h-4 w-4 text-indigo-600" /> Contenidos Totales
              </span>
              <span className="text-5xl font-black text-slate-900 group-hover:text-indigo-600 transition-all duration-300 tracking-tighter tabular-nums">
                {filteredContent.filter(item => !deletedContentIds.includes(item.id)).length}
              </span>
            </div>
            <div 
              onClick={() => setIsViewsModalOpen(true)}
              className="bg-white p-8 rounded-[3rem] border border-gray-100 flex flex-col group hover:border-indigo-100 transition-all duration-300 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md"
            >
              <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-indigo-600" /> Impacto Acumulado
              </span>
              <span className="text-5xl font-black text-indigo-600 transition-all duration-300 tracking-tighter tabular-nums">
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
                transition={{ delay: i * 0.01, duration: 0.5 }}
                onClick={() => {
                  const isPopup = item.platform === 'twitch' || item.platform === 'discord' || item.platform === 'baseapp' || (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0);
                  if (isPopup) setViewingContent(item as any);
                  else window.open(item.url, '_blank');
                }}
                className="aspect-square rounded-[2rem] overflow-hidden border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 group relative cursor-pointer bg-white"
              >
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end">
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{item.platform === 'twitch' ? 'stream' : item.platform}</p>
                  <p className="text-[11px] font-bold text-white line-clamp-1 uppercase tracking-tight">{item.title || 'Sin Título'}</p>
                </div>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingContent(item as any);
                    setIsContentModalOpen(true);
                  }}
                  className="absolute top-4 right-4 p-2.5 bg-white text-slate-900 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-indigo-600 shadow-lg scale-75 group-hover:scale-100"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            ) : isCompactView              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.5 }}
                onClick={() => {
                  const isPopup = item.platform === 'twitch' || item.platform === 'discord' || item.platform === 'baseapp' || (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0);
                  if (isPopup) setViewingContent(item as any);
                  else window.open(item.url, '_blank');
                }}
                className="bg-white px-8 py-6 rounded-[2rem] border border-gray-100 flex items-center hover:border-indigo-100 hover:shadow-xl transition-all duration-300 group gap-10 cursor-pointer active:scale-[0.99] relative overflow-hidden shadow-sm"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-100 shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover transition-all duration-500" />
                  ) : (
                    <Youtube className="h-6 w-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-slate-900 line-clamp-1 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{item.title || 'Sin Título'}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-lg">
                      {item.platform === 'twitch' ? 'stream' : item.platform}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 bg-gray-50 rounded-lg px-3 py-1 flex items-center gap-2 uppercase tracking-widest border border-gray-100">
                      <List className="h-3 w-3 text-indigo-600" />
                      {campaigns.find(c => c.id === item.campaign_id)?.name || 'General'}
                    </span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.creator_id) setManagingUser(users.find(u => u.id === item.creator_id) || null);
                      }}
                      className={`text-[9px] font-black flex items-center gap-2 uppercase tracking-widest transition-all duration-300 ${item.creator_id ? 'text-slate-500 hover:text-indigo-600 cursor-pointer' : 'text-slate-400'}`}
                    >
                      <Users className="h-3 w-3" />
                      {item.creator_id ? (users.find(u => u.id === item.creator_id)?.display_name || 'Desconocido') : (item.guest_name || 'Externo')}
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-center w-36 shrink-0 pt-1">
                  <p className="text-3xl font-black text-slate-900 leading-none tracking-tighter tabular-nums group-hover:text-indigo-600 transition-colors">{(item.views || 0).toLocaleString()}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">Vistas</p>
                </div>

                <div className="hidden lg:flex flex-col items-center w-36 shrink-0 pt-1">
                  <p className="text-sm font-black text-slate-500 leading-none uppercase tracking-widest">
                    {item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '-'}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">Fecha</p>
                </div>

                <div className="flex items-center gap-4 shrink-0 relative z-20">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRefreshItem(item); }}
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 active:scale-90 border border-gray-100 hover:border-indigo-100"
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
                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 active:scale-90 border border-gray-100 hover:border-indigo-100"
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
                    className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300 active:scale-90 border border-gray-100 hover:border-rose-100"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>ion.div>
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
          <div className="col-span-full py-40 text-center">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm">
              <Youtube className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">No se detectaron contenidos</h3>
            <p className="text-sm text-slate-500 mt-3 font-medium">Sincroniza o despliega nuevos activos para comenzar.</p>
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
