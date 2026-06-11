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
            className="relative w-full max-w-5xl bg-slate-50/80 backdrop-blur-xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200 overflow-hidden flex flex-col md:flex-row max-h-[90vh] ring-1 ring-white/10"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-3 rounded-2xl bg-white shadow-2xl text-slate-500 hover:text-white transition-all hover:rotate-90 border border-slate-200"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left side: Visual Content */}
            <div className="w-full md:w-3/5 h-72 md:h-auto bg-slate-50 relative group overflow-hidden">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.title || 'Content'} 
                  className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className={`w-32 h-32 rounded-full ${config.bg} flex items-center justify-center animate-pulse`}>
                     <Icon className={`h-16 w-16 ${config.color}`} />
                   </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Right side: Insights */}
            <div className="w-full md:w-2/5 p-10 md:p-12 overflow-y-auto bg-transparent custom-scrollbar">
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-2xl ${config.bg.replace('bg-', 'bg-').replace('-50', '-500/10')} border border-slate-200 shadow-sm`}>
                  <Icon className={`h-7 w-7 ${config.color}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-1.5">{config.label}</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-slate-600" />
                    <span className="text-[11px] font-black text-white uppercase tracking-widest leading-none font-mono">
                      {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-black text-white mb-10 tracking-tighter leading-tight uppercase">
                {item.title || 'Strategic Metrics'}
              </h2>

              {(() => {
                const isTikTokStream = item.platform === 'tiktok' && (item.duration_minutes || 0) > 0;
                const isStream = item.platform === 'twitch' || isTikTokStream;
                const isManual = item.platform === 'discord' || item.platform === ('baseapp' as any);

                if (isStream || isManual) {
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-slate-200 rounded-[2rem] p-6 shadow-sm group hover:bg-white/10 transition-colors cursor-default">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Clock className="h-4 w-4" /> Runtime
                          </p>
                          <p className="text-2xl font-black text-white font-mono">
                            {Math.floor((item.duration_minutes || 0) / 60)}h {(item.duration_minutes || 0) % 60}m
                          </p>
                        </div>
                        <div className="bg-white/5 border border-slate-200 rounded-[2rem] p-6 shadow-sm group hover:bg-white/10 transition-colors cursor-default">
                          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <TrendingUp className="h-4 w-4" /> Peak CCV
                          </p>
                          <p className="text-2xl font-black text-white font-mono">
                             {(item.peek_viewers || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-slate-200 rounded-[2rem] p-6 shadow-sm group hover:bg-white/10 transition-colors cursor-default">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Uniques
                          </p>
                          <p className="text-2xl font-black text-white font-mono">{(item.unique_viewers || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 border border-slate-200 rounded-[2rem] p-6 shadow-sm group hover:bg-white/10 transition-colors cursor-default">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            {isManual ? <Monitor className="h-4 w-4 text-purple-400" /> : <BarChart3 className="h-4 w-4 text-indigo-400" />}
                            {isManual ? 'Auditors' : 'Average'}
                          </p>
                          <p className="text-2xl font-black text-white font-mono">
                            {isManual ? (item.shares_count || 0).toLocaleString() : (item.average_viewers || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <p className="text-[11px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10">
                          <Eye className="h-5 w-5" /> Total Reach
                        </p>
                        <p className="text-4xl font-black text-white relative z-10 tracking-tighter font-mono">
                          {(item.views || item.unique_viewers || 0).toLocaleString()}
                        </p>
                      </div>

                      {(item as any).description && (
                        <div className="pt-6 border-t border-slate-200">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Strategic Narrative</p>
                          <div className="p-6 bg-white/5 italic text-sm text-slate-700 leading-relaxed font-medium rounded-3xl border border-slate-200 relative">
                             <div className="absolute top-0 left-6 -translate-y-1/2 bg-slate-50 px-2 text-indigo-400">
                               <MessageSquare className="h-4 w-4" />
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
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group mb-4">
                       <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                       <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 relative z-10">
                         <Eye className="h-5 w-5" /> {isStory ? 'Visualizaciones' : 'Impressions'}
                       </p>
                       <p className="text-5xl font-black text-white relative z-10 tracking-tighter">
                         {(item.views || 0).toLocaleString()}
                       </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-slate-200 rounded-[2rem] p-6 shadow-sm group hover:bg-white/10 transition-colors cursor-default">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" /> {isStory ? 'Interacciones' : 'Interaction'}
                        </p>
                        <p className="text-2xl font-black text-white font-mono">{(item.likes || 0).toLocaleString()}</p>
                      </div>
                      {(item.comments > 0 || item.platform === 'coinmarketcap' || item.platform === 'youtube' || isStory) && (
                        <div className="bg-white/5 border border-slate-200 rounded-[2rem] p-6 shadow-sm group hover:bg-white/10 transition-colors cursor-default">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> {isStory ? 'Actividad Perfil' : 'Sentiment'}
                          </p>
                          <p className="text-2xl font-black text-white font-mono">{(item.comments || 0).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="mt-12">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full flex items-center justify-center gap-3 py-5 bg-white/5 text-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-white/10 hover:translate-y-[-4px] transition-all active:scale-95"
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
