import React from 'react';
import { X, ExternalLink, Youtube, Instagram, Music2, Twitter, Globe, Clock, Users, Eye, TrendingUp, BarChart3, MessageSquare, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentItem } from './ContentCard';

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem | null;
}

const platformConfig = {
  youtube: { icon: Youtube, color: 'text-red-500', bg: 'bg-red-50', label: 'YouTube' },
  instagram: { icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-50', label: 'Instagram' },
  instagram_story: { icon: Instagram, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Instagram Story' },
  tiktok: { icon: Music2, color: 'text-gray-900', bg: 'bg-gray-100', label: 'TikTok' },
  x: { icon: Twitter, color: 'text-indigo-900', bg: 'bg-indigo-50', label: 'X (Twitter)' },
  coinmarketcap: { icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'CoinMarketCap' },
  twitch: { icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Stream' },
  discord: { icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Discord' },
  baseapp: { icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50', label: 'BaseApp' }
};

const ContentDetailModal: React.FC<ContentDetailModalProps> = ({ isOpen, onClose, item }) => {
  if (!item) return null;

  const config = platformConfig[item.platform] || { icon: Globe, color: 'text-gray-400', bg: 'bg-gray-50', label: item.platform };
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-50/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-slate-50/80 backdrop-blur-xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden flex flex-col md:flex-row max-h-[90vh] ring-1 ring-white/10"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-3 rounded-2xl bg-white shadow-md text-slate-500 hover:text-slate-800 transition-all hover:rotate-90 border border-slate-100"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left side: Visual Content */}
            <div className="w-full md:w-3/5 h-72 md:h-auto bg-slate-100 relative group overflow-hidden flex items-center justify-center border-r border-slate-200">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.title || 'Content'} 
                  className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                   <div className={`w-32 h-32 rounded-full ${config.bg} flex items-center justify-center animate-pulse`}>
                     <Icon className={`h-16 w-16 ${config.color}`} />
                   </div>
                </div>
              )}
            </div>

            {/* Right side: Insights */}
            <div className="w-full md:w-2/5 p-10 md:p-12 overflow-y-auto bg-white custom-scrollbar">
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-2xl ${config.bg} border border-slate-100 shadow-sm`}>
                  <Icon className={`h-7 w-7 ${config.color}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1.5">{config.label}</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none font-mono">
                      {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight leading-tight uppercase">
                {item.title || 'Métricas de la Publicación'}
              </h2>

              <div className="flex flex-wrap gap-2 mb-8">
                {item.coupledPlatforms && item.coupledPlatforms.length > 0 && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm shadow-indigo-600/10">
                    + {item.coupledPlatforms.map(p => p.toUpperCase()).join(' · ')}
                  </span>
                )}
                {item.content_type && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm">
                    {item.content_type === 'video_largo' ? 'Video Largo' : 'Video Corto'}
                  </span>
                )}
                 {item.is_repost && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-sm">
                    Mismo Post
                  </span>
                 )}
              </div>

              {(() => {
                const isTikTokStream = item.platform === 'tiktok' && (item.duration_minutes || 0) > 0;
                const isStream = item.platform === 'twitch' || isTikTokStream;
                const isManual = item.platform === 'discord' || item.platform === ('baseapp' as any);

                if (isStream || isManual) {
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:border-indigo-100 transition-colors cursor-default">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Clock className="h-4 w-4" /> Runtime
                          </p>
                          <p className="text-xl font-black text-slate-800 font-mono">
                            {Math.floor((item.duration_minutes || 0) / 60)}h {(item.duration_minutes || 0) % 60}m
                          </p>
                        </div>
                        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:border-indigo-100 transition-colors cursor-default">
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <TrendingUp className="h-4 w-4" /> Peak CCV
                          </p>
                          <p className="text-xl font-black text-slate-800 font-mono">
                             {(item.peek_viewers || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:border-indigo-100 transition-colors cursor-default">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Uniques
                          </p>
                          <p className="text-xl font-black text-slate-800 font-mono">{(item.unique_viewers || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:border-indigo-100 transition-colors cursor-default">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            {isManual ? <Monitor className="h-4 w-4 text-purple-500" /> : <BarChart3 className="h-4 w-4 text-indigo-500" />}
                            {isManual ? 'Auditors' : 'Average'}
                          </p>
                          <p className="text-xl font-black text-slate-800 font-mono">
                            {isManual ? (item.shares_count || 0).toLocaleString() : (item.average_viewers || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-600/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <p className="text-[11px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10">
                          <Eye className="h-5 w-5" /> Total Reach
                        </p>
                        <p className="text-3xl font-black text-white relative z-10 tracking-tighter font-mono">
                          {(item.views || item.unique_viewers || 0).toLocaleString()}
                        </p>
                      </div>

                      {(item as any).description && (
                        <div className="pt-6 border-t border-slate-150">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Resumen de la Actividad</p>
                          <div className="p-6 bg-slate-50 italic text-sm text-slate-700 leading-relaxed font-medium rounded-3xl border border-slate-150 relative">
                             <div className="absolute top-0 left-6 -translate-y-1/2 bg-white border border-slate-150 px-2.5 py-0.5 rounded-full text-indigo-500">
                               <MessageSquare className="h-3.5 w-3.5" />
                             </div>
                            "{ (item as any).description }"
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                const isStory = item.platform === 'instagram_story';
                return (
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group mb-4">
                       <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                       <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10">
                         <Eye className="h-5 w-5" /> {isStory ? 'Visualizaciones' : 'Impressions'}
                       </p>
                       <p className="text-4xl font-black text-slate-800 relative z-10 tracking-tighter">
                         {(item.views || 0).toLocaleString()}
                       </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm group hover:bg-slate-50 transition-colors cursor-default">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" /> {isStory ? 'Interacciones' : 'Interaction'}
                        </p>
                        <p className="text-xl font-black text-slate-800 font-mono">{(item.likes || 0).toLocaleString()}</p>
                      </div>
                      {(item.comments > 0 || item.platform === 'coinmarketcap' || item.platform === 'youtube' || isStory) && (
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm group hover:bg-slate-50 transition-colors cursor-default">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> {isStory ? 'Actividad Perfil' : 'Sentiment'}
                          </p>
                          <p className="text-xl font-black text-slate-800 font-mono">{(item.comments || 0).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {item.coupledPosts && item.coupledPosts.length > 1 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Publicaciones Acopladas ({item.coupledPosts.length})
                  </p>
                  <div className="space-y-3">
                    {item.coupledPosts.map((post) => {
                      const postConfig = platformConfig[post.platform as 'youtube'] || { icon: Globe, color: 'text-gray-400', bg: 'bg-gray-50', label: post.platform };
                      const PostIcon = postConfig.icon;
                      
                      return (
                        <div key={post.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-100 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-xl ${postConfig.bg} flex items-center justify-center`}>
                              <PostIcon className={`h-4 w-4 ${postConfig.color}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 uppercase tracking-wide truncate max-w-[200px] leading-tight">
                                {postConfig.label}
                              </p>
                              <p className="text-[9px] font-medium text-slate-400 truncate max-w-[200px] leading-none mt-0.5">
                                {post.title || post.url}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-700 leading-tight">
                                {(post.views || 0).toLocaleString()}
                              </p>
                              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                Vistas
                              </p>
                            </div>
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-all"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-12">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-md hover:bg-slate-850 hover:translate-y-[-2px] transition-all active:scale-95"
                >
                  <ExternalLink className="h-4 w-4" /> Verify Analytics
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContentDetailModal;
