import React from 'react';
import { X, ExternalLink, Youtube, Instagram, Music2, Twitter, Globe, Clock, Users, Eye, TrendingUp, BarChart3, MessageSquare } from 'lucide-react';
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
  twitch: { icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Twitch' }
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
            className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl text-gray-400 hover:text-gray-900 transition-all hover:rotate-90"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Left side: Image */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative group overflow-hidden">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.title || 'Content'} 
                  className="absolute inset-0 w-full h-full object-contain bg-slate-900"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className={`h-24 w-24 ${config.color} opacity-20`} />
                </div>
              )}
            </div>

            {/* Right side: Info */}
            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${config.bg}`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{config.label}</span>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-8 leading-tight">
                {item.title || 'Estadísticas del Contenido'}
              </h2>

              {item.platform === 'twitch' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Duración</p>
                      <p className="text-lg font-black text-slate-900">
                        {Math.floor((item.duration_minutes || 0) / 60)}h {(item.duration_minutes || 0) % 60}m
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><BarChart3 className="h-3 w-3" /> Promedio</p>
                      <p className="text-lg font-black text-slate-900">{(item.average_viewers || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> Máximo</p>
                      <p className="text-lg font-black text-slate-900">{(item.peek_viewers || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Users className="h-3 w-3" /> Únicos</p>
                      <p className="text-lg font-black text-slate-900">{(item.unique_viewers || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Chatters</p>
                      <p className="text-lg font-black text-slate-900">{(item.unique_chatters || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Eye className="h-3 w-3" /> Vistas</p>
                      <p className="text-lg font-black text-slate-900">{(item.views || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Eye className="h-4 w-4" /> Vistas</p>
                    <p className="text-2xl font-black text-slate-900">{(item.views || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Likes</p>
                    <p className="text-2xl font-black text-slate-900">{(item.likes || 0).toLocaleString()}</p>
                  </div>
                </div>
              )}

              </div>
            </motion.div>
          </div>
      )}
    </AnimatePresence>
  );
};

export default ContentDetailModal;
