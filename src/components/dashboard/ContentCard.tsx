import React from 'react';
import { LucideIcon, Youtube, Instagram, Music2, Twitter, Globe, ExternalLink, Edit2, Trash2 } from 'lucide-react';
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
  youtube: { icon: Youtube, color: 'text-rose-600', bg: 'bg-rose-50' },
  instagram: { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
  tiktok: { icon: Music2, color: 'text-slate-900', bg: 'bg-gray-50' },
  x: { icon: Twitter, color: 'text-slate-900', bg: 'bg-gray-50' },
  coinmarketcap: { icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  twitch: { icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
  discord: { icon: DiscordIcon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  baseapp: { icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50' }
};

const ContentCard = React.memo(({ item, campaignName, onEdit, onDelete, onClick, index }: ContentCardProps) => {
  const { icon: PlatformIcon, color: platformColor, bg: platformBg } = platformConfig[item.platform] || { icon: Globe, color: 'text-slate-500', bg: 'bg-gray-50' };
  const isGamenight = item.platform === 'discord' || item.platform === 'baseapp';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.5 }}
      onClick={onClick}
      className={`group relative flex flex-col rounded-[2.5rem] bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border ${
        isGamenight 
          ? 'border-emerald-100' 
          : 'border-gray-100 hover:border-indigo-200'
      }`}
    >
      <div className={`relative h-40 w-full ${platformBg} flex items-center justify-center overflow-hidden`}>
        {item.thumbnail ? (
          <>
            <img 
              src={item.thumbnail} 
              alt={item.title || 'Thumbnail'} 
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
          </>
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700`}>
            <PlatformIcon className="h-64 w-64 -rotate-12" />
          </div>
        )}
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-3 border border-gray-100 group-hover:scale-110 transition-transform duration-300">
            <PlatformIcon className={`h-8 w-8 ${platformColor}`} />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${item.thumbnail ? 'text-white' : 'text-slate-400'}`}>
            {item.platform === 'twitch' ? 'stream' : item.platform === 'discord' ? 'jornada' : item.platform === 'baseapp' ? 'video' : item.platform}
          </span>
        </div>

        {isGamenight && (
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">GAMENIGHT</span>
          </div>
        )}

        <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-30">
          <button 
            type="button"
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              onEdit(item); 
            }} 
            className="p-3 rounded-xl bg-white text-slate-900 shadow-md hover:text-indigo-600 transition-all active:scale-95 border border-gray-100"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            type="button"
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              onDelete(item.id); 
            }} 
            className="p-3 rounded-xl bg-white text-slate-400 hover:text-rose-600 shadow-md transition-all active:scale-95 border border-gray-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-[10px] font-black text-indigo-600 mb-3 tracking-widest uppercase">
            {campaignName || 'General'}
          </p>
          <h3 className="text-lg font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
            {item.title || item.url}
          </h3>
        </div>
        
        <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 leading-none tracking-tighter">{item.views?.toLocaleString() || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Impacto</span>
            </div>
            <div className="w-[1px] h-10 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 leading-none tracking-tighter">
                {item.platform === 'twitch' || item.platform === 'discord' ? (item.peek_viewers || 0).toLocaleString() : (item.likes || 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
                {item.platform === 'twitch' || item.platform === 'discord' ? 'Pico' : 'Interacción'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
             Ver <ExternalLink className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ContentCard;
