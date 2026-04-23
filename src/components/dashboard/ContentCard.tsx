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
  youtube: { icon: Youtube, color: 'text-red-500', bg: 'from-red-950/20 to-slate-950' },
  instagram: { icon: Instagram, color: 'text-pink-500', bg: 'from-pink-950/20 to-slate-950' },
  tiktok: { icon: Music2, color: 'text-white', bg: 'from-slate-900 to-slate-950' },
  x: { icon: Twitter, color: 'text-white', bg: 'from-slate-900 to-slate-950' },
  coinmarketcap: { icon: Globe, color: 'text-emerald-500', bg: 'from-emerald-950/20 to-slate-950' },
  twitch: { icon: Globe, color: 'text-purple-500', bg: 'from-purple-950/20 to-slate-950' },
  discord: { icon: DiscordIcon, color: 'text-indigo-400', bg: 'from-indigo-950/20 to-slate-950' },
  baseapp: { icon: Globe, color: 'text-cyan-500', bg: 'from-cyan-950/20 to-slate-950' }
};

const ContentCard: React.FC<ContentCardProps> = ({ item, campaignName, onEdit, onDelete, onClick, index }) => {
  const { icon: PlatformIcon, color: platformColor, bg: platformBg } = platformConfig[item.platform] || { icon: Globe, color: 'text-slate-400', bg: 'from-slate-900 to-slate-950' };
  const isGamenight = item.platform === 'discord' || item.platform === 'baseapp';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.5 }}
      onClick={onClick}
      className={`group relative flex flex-col rounded-[2.5rem] glass-dark overflow-hidden shadow-2xl transition-all duration-700 cursor-pointer border ${
        isGamenight 
          ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]' 
          : 'border-white/5 hover:border-emerald-500/30'
      }`}
    >
      {/* Header Section */}
      <div className={`relative h-40 w-full bg-gradient-to-br ${platformBg} flex items-center justify-center overflow-hidden`}>
        {item.thumbnail ? (
          <>
            <img 
              src={item.thumbnail} 
              alt={item.title || 'Thumbnail'} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </>
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-1000`}>
            <PlatformIcon className="h-64 w-64 -rotate-12" />
          </div>
        )}
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900/80 backdrop-blur-xl shadow-2xl flex items-center justify-center mb-3 border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <PlatformIcon className={`h-8 w-8 ${platformColor}`} />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${item.thumbnail ? 'text-white' : 'text-slate-500'}`}>
            {item.platform === 'twitch' ? 'stream' : item.platform === 'discord' ? 'jornada' : item.platform === 'baseapp' ? 'video' : item.platform}
          </span>
        </div>

        {isGamenight && (
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2.5 px-4 py-2 bg-emerald-600 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-75 duration-700">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">GAMENIGHT</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 z-30">
          <button 
            type="button"
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              onEdit(item); 
            }} 
            className="p-3 rounded-xl bg-white text-slate-950 shadow-2xl hover:scale-110 transition-all active:scale-95"
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
            className="p-3 rounded-xl bg-rose-600 text-white shadow-2xl hover:scale-110 transition-all active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-[10px] font-black text-emerald-500 mb-3 tracking-[0.4em] uppercase italic">
            {campaignName || 'General_Node'}
          </p>
          <h3 className="text-lg font-black text-white leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
            {item.title || item.url}
          </h3>
        </div>
        
        <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white leading-none tracking-tighter">{item.views?.toLocaleString() || 0}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-[0.2em]">Impact</span>
            </div>
            <div className="w-[1px] h-10 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white leading-none tracking-tighter">
                {item.platform === 'twitch' || item.platform === 'discord' ? (item.peek_viewers || 0).toLocaleString() : (item.likes || 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-[0.2em]">
                {item.platform === 'twitch' || item.platform === 'discord' ? 'Peak' : 'Engage'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] font-black text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 italic">
             Access <ExternalLink className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
