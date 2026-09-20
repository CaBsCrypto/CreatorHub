import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  Layers, 
  ExternalLink, 
  Eye, 
  Heart, 
  MessageSquare, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  BarChart3,
  Video,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatorGroup, Campaign, Content } from '../../supabase';

interface CompanyViewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: CreatorGroup[];
  campaigns: Campaign[];
  content: Content[];
  onSelectGroup: (groupId: string) => void;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; ring: string; bar: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', ring: 'ring-indigo-500', bar: 'bg-indigo-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-500', bar: 'bg-emerald-500' },
  fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', ring: 'ring-fuchsia-500', bar: 'bg-fuchsia-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', ring: 'ring-amber-500', bar: 'bg-amber-400' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', ring: 'ring-sky-500', bar: 'bg-sky-400' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', ring: 'ring-rose-500', bar: 'bg-rose-400' },
};

const PLATFORM_ICONS: Record<string, string> = {
  youtube: '▶️ YouTube',
  tiktok: '🎵 TikTok',
  instagram: '📸 Instagram',
  instagram_story: '📸 Story',
  x: '𝕏 Post',
  twitch: '🟣 Twitch',
  coinmarketcap: '🟡 CMC',
  baseapp: '🔵 Base',
  stream: '🔴 Stream',
  discord: '💬 Discord'
};

export const CompanyViewsModal: React.FC<CompanyViewsModalProps> = ({
  isOpen,
  onClose,
  groups,
  campaigns,
  content,
  onSelectGroup,
}) => {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // Group campaigns map
  const campaignGroupMap = useMemo(() => {
    const map = new Map<string, string | null>();
    campaigns.forEach(c => map.set(c.id, c.group_id || null));
    return map;
  }, [campaigns]);

  // Aggregate stats per company / group
  const { totalTrackedViews, groupStats, unassignedStats } = useMemo(() => {
    let totalViews = 0;
    const statsByGroup = new Map<string, {
      group: CreatorGroup;
      views: number;
      likes: number;
      comments: number;
      campaigns: Campaign[];
      posts: Content[];
    }>();

    groups.forEach(g => {
      statsByGroup.set(g.id, {
        group: g,
        views: 0,
        likes: 0,
        comments: 0,
        campaigns: campaigns.filter(c => c.group_id === g.id),
        posts: [],
      });
    });

    const unassigned: {
      views: number;
      likes: number;
      comments: number;
      campaigns: Campaign[];
      posts: Content[];
    } = {
      views: 0,
      likes: 0,
      comments: 0,
      campaigns: campaigns.filter(c => !c.group_id),
      posts: [],
    };

    content.forEach(post => {
      if (post.status === 'archived') return;
      const v = post.views || 0;
      const l = post.likes || 0;
      const com = post.comments || 0;
      totalViews += v;

      const gId = campaignGroupMap.get(post.campaign_id);
      if (gId && statsByGroup.has(gId)) {
        const item = statsByGroup.get(gId)!;
        item.views += v;
        item.likes += l;
        item.comments += com;
        item.posts.push(post);
      } else {
        unassigned.views += v;
        unassigned.likes += l;
        unassigned.comments += com;
        unassigned.posts.push(post);
      }
    });

    const sortedGroups = Array.from(statsByGroup.values()).sort((a, b) => b.views - a.views);

    return {
      totalTrackedViews: totalViews,
      groupStats: sortedGroups,
      unassignedStats: unassigned,
    };
  }, [groups, campaigns, content, campaignGroupMap]);

  if (!isOpen) return null;

  const toggleGroup = (id: string) => {
    setExpandedGroupId(prev => prev === id ? null : id);
  };

  const handleFilterAndClose = (groupId: string) => {
    onSelectGroup(groupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-inner">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight uppercase">Desglose de Vistas por Empresa</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
                  Live Tracking
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Monitoreo consolidado de métricas y rendimiento por empresa/grupo
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Summary Bar */}
        <div className="bg-slate-50 px-5 sm:px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vistas Totales</p>
              <p className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight">
                {totalTrackedViews.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Empresas / Grupos</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {groups.length}
              </p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campañas</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {campaigns.length}
              </p>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posts Monitoreados</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
                {content.filter(c => c.status !== 'archived').length}
              </p>
            </div>
          </div>

          {/* Visual Distribution Bar */}
          {totalTrackedViews > 0 && (
            <div>
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                <span>Participación por Empresa</span>
                <span className="text-slate-400 font-medium">100% de views indexadas</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                {groupStats.map(({ group, views }) => {
                  if (views === 0) return null;
                  const pct = ((views / totalTrackedViews) * 100);
                  const color = COLOR_MAP[group.color]?.bar || 'bg-indigo-600';
                  return (
                    <div 
                      key={group.id} 
                      style={{ width: `${pct}%` }} 
                      className={`${color} h-full transition-all duration-500`}
                      title={`${group.name}: ${views.toLocaleString()} views (${pct.toFixed(1)}%)`}
                    />
                  );
                })}
                {unassignedStats.views > 0 && (
                  <div 
                    style={{ width: `${(unassignedStats.views / totalTrackedViews) * 100}%` }}
                    className="bg-slate-400 h-full"
                    title={`Sin empresa: ${unassignedStats.views.toLocaleString()} views`}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content Body: Companies List & Drilldown */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {groupStats.map(({ group, views, likes, comments, campaigns: groupCamps, posts: groupPosts }) => {
            const isExpanded = expandedGroupId === group.id;
            const pct = totalTrackedViews > 0 ? ((views / totalTrackedViews) * 100).toFixed(1) : '0';
            const colorScheme = COLOR_MAP[group.color] || COLOR_MAP.indigo;

            return (
              <div 
                key={group.id} 
                className={`rounded-2xl border transition-all duration-300 ${
                  isExpanded 
                    ? 'border-indigo-300 bg-white shadow-md ring-2 ring-indigo-500/10' 
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Company Header Row */}
                <div 
                  onClick={() => toggleGroup(group.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className="text-2xl sm:text-3xl flex-shrink-0" role="img" aria-label={group.name}>
                      {group.logo_emoji || '🏢'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 tracking-tight truncate">
                          {group.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border}`}>
                          {pct}% del total
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {groupCamps.length} {groupCamps.length === 1 ? 'campaña' : 'campañas'} • {groupPosts.length} {groupPosts.length === 1 ? 'post' : 'posts'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-base sm:text-xl font-black text-slate-900 tracking-tight">
                        <Eye className="h-4 w-4 text-indigo-500" />
                        <span>{views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400 mt-0.5">
                        <span>❤️ {likes.toLocaleString()}</span>
                        <span>💬 {comments.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100 px-4 sm:px-6 py-4 bg-slate-50/60 rounded-b-2xl overflow-hidden"
                    >
                      {/* Company Action Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-indigo-600" />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Campañas de {group.name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleFilterAndClose(group.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider shadow-sm shadow-indigo-200 transition-all"
                        >
                          <Filter className="h-3.5 w-3.5" />
                          Filtrar Dashboard por {group.name}
                        </button>
                      </div>

                      {/* Campaigns Chips */}
                      {groupCamps.length === 0 ? (
                        <p className="text-xs text-slate-400 italic mb-4">No hay campañas asociadas a esta empresa.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {groupCamps.map(camp => {
                            const campPosts = groupPosts.filter(p => p.campaign_id === camp.id);
                            const campViews = campPosts.reduce((acc, p) => acc + (p.views || 0), 0);
                            return (
                              <div 
                                key={camp.id}
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center gap-2 shadow-2xl"
                              >
                                <span className="font-bold text-slate-800">{camp.name}</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-black text-[10px]">
                                  {campViews.toLocaleString()} views
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Tracked Posts Table */}
                      <div className="mt-3">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Video className="h-3.5 w-3.5" />
                          Posts en seguimiento ({groupPosts.length})
                        </p>

                        {groupPosts.length === 0 ? (
                          <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                            No se han registrado publicaciones para esta empresa todavía.
                          </div>
                        ) : (
                          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100 max-h-72 overflow-y-auto">
                            {groupPosts.map(post => {
                              const camp = campaigns.find(c => c.id === post.campaign_id);
                              return (
                                <div key={post.id} className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                                  {/* Left: Platform & Title */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                        {PLATFORM_ICONS[post.platform] || post.platform}
                                      </span>
                                      {camp && (
                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                                          {camp.name}
                                        </span>
                                      )}
                                      {post.guest_name && (
                                        <span className="text-[10px] font-medium text-slate-400">
                                          por {post.guest_name}
                                        </span>
                                      )}
                                    </div>
                                    <a 
                                      href={post.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs font-bold text-slate-800 hover:text-indigo-600 line-clamp-1 flex items-center gap-1 transition-colors"
                                    >
                                      <span>{post.title || post.url}</span>
                                      <ExternalLink className="h-3 w-3 opacity-60 flex-shrink-0" />
                                    </a>
                                  </div>

                                  {/* Right: Metrics */}
                                  <div className="flex items-center gap-4 text-right flex-shrink-0">
                                    <div>
                                      <div className="text-sm font-black text-slate-900">
                                        {(post.views || 0).toLocaleString()}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        vistas
                                      </div>
                                    </div>
                                    <div className="hidden sm:block text-slate-300">|</div>
                                    <div className="hidden sm:block text-right">
                                      <div className="text-xs font-bold text-slate-700">
                                        ❤️ {(post.likes || 0).toLocaleString()}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-medium">
                                        💬 {(post.comments || 0).toLocaleString()}
                                      </div>
                                    </div>
                                    {post.last_refreshed_at && (
                                      <div className="hidden md:flex items-center gap-1 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
                                        <Clock className="h-3 w-3" />
                                        <span>Actualizado</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Unassigned Campaigns/Posts (if any) */}
          {unassignedStats.posts.length > 0 && (
            <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-700">Otras Campañas (Sin Grupo Asignado)</h4>
                  <p className="text-xs text-slate-400">
                    {unassignedStats.campaigns.length} campañas • {unassignedStats.posts.length} posts
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-700">
                    {unassignedStats.views.toLocaleString()} views
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span>Actualización diaria automática vía Vercel Cron</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CompanyViewsModal;
