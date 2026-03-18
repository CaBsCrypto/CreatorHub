import React from 'react';
import { LucideIcon, Youtube, Instagram, Music2, Twitter, Globe, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ContentItem {
  id: string;
  campaign_id: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'x' | 'coinmarketcap' | 'twitch';
  url: string;
  title: string | null;
  thumbnail: string | null;
  views: number;
  likes: number;
  comments: number;
  peek_viewers?: number;
  duration_minutes?: number;
  uploaded_at: string | null;
  created_at: string;
}

interface ContentCardProps {
  item: ContentItem;
  campaignName?: string;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  index: number;
}

const platformConfig = {
  youtube: { icon: Youtube, color: 'text-red-600' },
  instagram: { icon: Instagram, color: 'text-pink-600' },
  tiktok: { icon: Music2, color: 'text-black' },
  x: { icon: Twitter, color: 'text-black' },
  coinmarketcap: { icon: Globe, color: 'text-indigo-600' },
  twitch: { icon: Globe, color: 'text-purple-600' }
};

const ContentCard: React.FC<ContentCardProps> = ({ item, campaignName, onEdit, onDelete, index }) => {
  const { icon: PlatformIcon, color: platformColor } = platformConfig[item.platform] || { icon: Globe, color: 'text-gray-400' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="group relative flex flex-col rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 ring-1 ring-gray-100 hover:ring-indigo-100 transition-all duration-500"
    >
      {/* Thumbnail Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {item.thumbnail ? (
          <img 
            src={item.thumbnail} 
            alt={item.title || "Content thumbnail"} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
            <div className="text-indigo-200">
              <PlatformIcon className="h-12 w-12" />
            </div>
          </div>
        )}
        
        {/* Overlay Glass Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-white/20">
            <PlatformIcon className={`h-3.5 w-3.5 ${platformColor}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">{item.platform}</span>
          </div>
        </div>

        {/* Action Buttons overlay */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
          <button onClick={() => onEdit(item)} className="p-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg text-gray-600 hover:text-indigo-600 transition-colors">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg text-gray-600 hover:text-red-600 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-[10px] font-black text-indigo-600 mb-2 tracking-[0.2em] uppercase">
            {campaignName || 'General'}
          </p>
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors"
          >
            {item.title || item.url}
          </a>
        </div>
        
        <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 leading-none">{item.views?.toLocaleString() || 0}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Views</span>
            </div>
            <div className="w-[1px] h-6 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 leading-none">
                {item.platform === 'twitch' ? (item.peek_viewers || 0).toLocaleString() : (item.likes || 0).toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">
                {item.platform === 'twitch' ? 'Peak' : 'Likes'}
              </span>
            </div>
          </div>
          
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
