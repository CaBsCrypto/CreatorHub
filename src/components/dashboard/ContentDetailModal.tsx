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
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl text-gray-400 hover:text-gray-900 transition-all hover:rotate-90 border border-gray-100"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left side: Image */}
            <div className="w-full md:w-3/5 h-64 md:h-auto bg-slate-900 relative group overflow-hidden">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.title || 'Content'} 
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className={`h-24 w-24 ${config.color} opacity-20`} />
                </div>
              )}
            </div>

            {/* Right side: Info */}
            <div className="w-full md:w-2/5 p-8 md:p-10 overflow-y-auto bg-white custom-scrollbar">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${config.bg}`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">{config.label}</span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none">
                    {new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight leading-none">
                {item.title || 'Estadísticas'}
              </h2>

              {(() => {
                const isTikTokStream = item.platform === 'tiktok' && (item.duration_minutes || 0) > 0;
                const isStream = item.platform === 'twitch' || isTikTokStream;
                const isManual = item.platform === 'discord' || item.platform === ('baseapp' as any);

                if (isStream || isManual) {
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-sm group">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Duración</p>
                          <p className="text-xl font-black text-slate-900">
                            {Math.floor((item.duration_minutes || 0) / 60)}h {(item.duration_minutes || 0) % 60}m
                          </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <TrendingUp className="h-3.5 w-3.5 text-rose-500" /> Máximo
                          </p>
                          <p className="text-xl font-black text-slate-900">
                             {(item.peek_viewers || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Users className="h-3.5 w-3.5 text-emerald-500" /> Únicos</p>
                          <p className="text-xl font-black text-slate-900">{(item.unique_viewers || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            {isManual ? <Monitor className="h-3.5 w-3.5 text-purple-500" /> : <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />}
                            {isManual ? 'Pantallas' : 'Promedio'}
                          </p>
                          <p className="text-xl font-black text-slate-900">
                            {isManual ? (item.shares_count || 0).toLocaleString() : (item.average_viewers || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10"><Eye className="h-4 w-4" /> Vistas Totales</p>
                        <p className="text-3xl font-black text-white relative z-10">{(item.views || item.unique_viewers || 0).toLocaleString()}</p>
                      </div>

                      {/* Description Section (Optional) */}
                      {(item as any).description && (
                        <div className="pt-4 border-t border-slate-50">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Notas de la sesión</p>
                          <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed font-medium">
                            "{ (item as any).description }"
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Eye className="h-4 w-4" /> Vistas</p>
                      <p className="text-3xl font-black text-slate-900">{(item.views || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Likes</p>
                      <p className="text-3xl font-black text-slate-900">{(item.likes || 0).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-10 flex gap-3">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black hover:translate-y-[-2px] transition-all"
                >
                  <ExternalLink className="h-4 w-4" /> Ver Original
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
