import React from 'react';
import { Youtube, Instagram, Music2, Twitter, Globe, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ContentItem {
  id: string;
  campaign_id: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'x' | 'coinmarketcap' | 'twitch' | 'discord' | 'baseapp';
  url: string;
  title: string | null;
  description?: string | null;
  thumbnail: string | null;
  views: number;
  likes: number;
  comments: number;
  peek_viewers?: number;
  average_viewers?: number;
  unique_viewers?: number;
  unique_chatters?: number;
  duration_minutes?: number;
  followers?: number;
  new_subscriptions?: number;
  shares_count?: number;
  uploaded_at: string | null;
  created_at: string;
  updated_at?: string;
  creator_id: string;
}

interface ContentCardProps {
  item: ContentItem;
  campaignName?: string;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
  index: number;
}

import DiscordIcon from '../icons/DiscordIcon';

const platformConfig = {
  youtube: { icon: Youtube, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  instagram: { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
  tiktok: { icon: Music2, color: 'text-slate-900', bg: 'bg-slate-50', border: 'border-slate-200' },
  x: { icon: Twitter, color: 'text-slate-900', bg: 'bg-slate-50', border: 'border-slate-200' },
  coinmarketcap: { icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  twitch: { icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  discord: { icon: DiscordIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  baseapp: { icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
  instagram_story: { icon: Instagram, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100' }
};

const ContentCard = React.memo(({ item, campaignName, onEdit, onDelete, onClick, index }: ContentCardProps) => {
  const { icon: PlatformIcon, color: platformColor, bg: platformBg, border: platformBorder } = platformConfig[item.platform] || { icon: Globe, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' };
  const isGamenight = item.platform === 'discord' || item.platform === 'baseapp';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 * index, duration: 0.5 }}
      onClick={onClick}
      className="group relative flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Thumbnail / Platform Header */}
      <div className="relative h-44 w-full bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-50">
        {item.thumbnail ? (
          <>
            <img 
              src={item.thumbnail} 
              alt={item.title || 'Thumbnail'} 
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          </>
        ) : (
          <PlatformIcon className={`h-16 w-16 ${platformColor} opacity-20`} />
        )}
        
        {/* Platform Badge */}
        <div className={`absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 ${platformBg} ${platformBorder} border rounded-xl shadow-sm`}>
          <PlatformIcon className={`h-3.5 w-3.5 ${platformColor}`} />
          <span className={`text-[9px] font-black uppercase tracking-widest ${platformColor}`}>
            {item.platform === 'twitch' ? 'stream' : item.platform === 'discord' ? 'jornada' : item.platform === 'instagram_story' ? 'historia ig' : item.platform}
          </span>
        </div>

        {isGamenight && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl shadow-sm">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">GAMENIGHT</span>
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
            className="p-2 rounded-lg bg-white/90 text-slate-600 hover:text-indigo-600 shadow-lg border border-white transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
            className="p-2 rounded-lg bg-white/90 text-slate-600 hover:text-rose-600 shadow-lg border border-white transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-[9px] font-black text-indigo-500 mb-2 tracking-widest uppercase">
            {campaignName || 'General'}
          </p>
          <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
            {item.title || 'Sin título'}
          </h3>
        </div>
        
        <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 leading-none tracking-tight">{item.views?.toLocaleString() || 0}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Impacto</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 leading-none tracking-tight">
                {item.platform === 'twitch' || item.platform === 'discord' ? (item.peek_viewers || 0).toLocaleString() : (item.likes || 0).toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                {item.platform === 'twitch' || item.platform === 'discord' ? 'Peak' : item.platform === 'instagram_story' ? 'Interac.' : 'Likes'}
              </span>
            </div>
          </div>
          
          <div className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
             <ExternalLink className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ContentCard;
