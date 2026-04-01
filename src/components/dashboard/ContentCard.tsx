import React from 'react';
import { LucideIcon, Youtube, Instagram, Music2, Twitter, Globe, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ContentItem {
  id: string;
  campaign_id: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'x' | 'coinmarketcap' | 'twitch' | 'discord';
  url: string;
  title: string | null;
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
  uploaded_at: string | null;
  created_at: string;
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

const platformConfig = {
  youtube: { icon: Youtube, color: 'text-red-500', bg: 'from-red-50 to-white' },
  instagram: { icon: Instagram, color: 'text-pink-500', bg: 'from-pink-50 to-white' },
  tiktok: { icon: Music2, color: 'text-gray-900', bg: 'from-gray-100 to-white' },
  x: { icon: Twitter, color: 'text-indigo-900', bg: 'from-indigo-50 to-white' },
  coinmarketcap: { icon: Globe, color: 'text-indigo-600', bg: 'from-indigo-50 to-white' },
  twitch: { icon: Globe, color: 'text-purple-600', bg: 'from-purple-50 to-white' },
  discord: { icon: Music2, color: 'text-indigo-500', bg: 'from-indigo-50 to-white' }
};

const ContentCard: React.FC<ContentCardProps> = ({ item, campaignName, onEdit, onDelete, onClick, index }) => {
  const { icon: PlatformIcon, color: platformColor, bg: platformBg } = platformConfig[item.platform] || { icon: Globe, color: 'text-gray-400', bg: 'from-gray-50 to-white' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      onClick={onClick}
      className="group relative flex flex-col rounded-[2.5rem] bg-white overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 ring-1 ring-gray-100 hover:ring-indigo-100 transition-all duration-500 cursor-pointer"
    >
      {/* Generic Premium Header */}
      <div className={`relative h-32 w-full bg-gradient-to-br ${platformBg} flex items-center justify-center overflow-hidden`}>
        {item.thumbnail ? (
          <>
            <img 
              src={item.thumbnail} 
              alt={item.title || 'Thumbnail'} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-500" />
          </>
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500`}>
            <PlatformIcon className="h-48 w-48 -rotate-12" />
          </div>
        )}
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-2 ring-1 ring-gray-100">
            <PlatformIcon className={`h-6 w-6 ${platformColor}`} />
          </div>
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.thumbnail ? 'text-white' : 'text-gray-400'}`}>
            {item.platform === 'twitch' ? 'stream' : item.platform === 'discord' ? 'jornada' : item.platform}
          </span>
        </div>

        {/* Action Buttons overlay */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 z-[9999]">
          <button 
            type="button"
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              onEdit(item); 
            }} 
            className="p-2.5 rounded-xl bg-white shadow-xl text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all pointer-events-auto cursor-pointer ring-1 ring-gray-100"
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
            className="p-2.5 rounded-xl bg-white shadow-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all pointer-events-auto cursor-pointer ring-1 ring-gray-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-7 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-[9px] font-black text-indigo-600 mb-2 tracking-[0.3em] uppercase">
            {campaignName || 'General'}
          </p>
          <h3 className="text-base font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {item.title || item.url}
          </h3>
        </div>
        
        <div className="mt-8 flex items-center justify-between border-t border-gray-50 pt-5">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 leading-none">{item.views?.toLocaleString() || 0}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase mt-1.5 tracking-widest">Views</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 leading-none">
                {item.platform === 'twitch' || item.platform === 'discord' ? (item.peek_viewers || 0).toLocaleString() : (item.likes || 0).toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase mt-1.5 tracking-widest">
                {item.platform === 'twitch' || item.platform === 'discord' ? 'Peak' : 'Likes'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
             Detalle <ExternalLink className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
