import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, ExternalLink, MessageSquare } from 'lucide-react';
import { Content, UserProfile } from '../../supabase';
import { getProxiedUrl } from '../../utils/urlHelpers';

interface ReviewContentCardProps {
  item: Content;
  creator: UserProfile | undefined;
  index: number;
  onStreamClick: (thumbnail: string) => void;
  lang: 'en' | 'es';
  translations: {
    anonymous: string;
  };
}

const ReviewContentCard: React.FC<ReviewContentCardProps> = ({
  item,
  creator,
  index,
  onStreamClick,
  translations
}) => {
  const isStream = item.platform === 'twitch' || 
                   item.platform === 'instagram_story' ||
                   (item.platform === 'tiktok' && (item.duration_minutes || 0) > 0) ||
                   (item.thumbnail ? (item.thumbnail.includes('supabase.co') || item.thumbnail.includes('content-attachments') || item.thumbnail.includes('storage') || item.thumbnail.includes('supabase.co/storage')) : false) ||
                   (item.url ? item.url.includes('twitch.tv/stats-') : false);
  const isGamenight = item.platform === 'discord' || item.platform === 'baseapp';
  const platformColors: Record<string, string> = {
    youtube: 'from-rose-600 to-red-700', instagram: 'from-pink-600 to-rose-600',
    tiktok: 'from-gray-800 to-gray-900', x: 'from-sky-600 to-blue-700',
    twitch: 'from-violet-700 to-purple-800', coinmarketcap: 'from-amber-600 to-orange-600',
    discord: 'from-indigo-600 to-blue-700', baseapp: 'from-blue-600 to-indigo-700',
    instagram_story: 'from-rose-500 to-pink-600'
  };
  const gradient = platformColors[item.platform] || 'from-indigo-600 to-blue-700';

  return (
    <motion.a
      href={(isStream || isGamenight) ? '#' : item.url}
      onClick={(e) => { 
        if ((isStream || isGamenight) && item.thumbnail) { 
          e.preventDefault(); 
          onStreamClick(item.thumbnail!); 
        } 
      }}
      target={(isStream || isGamenight) ? undefined : '_blank'}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
      className={`bg-white rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer ${
        isGamenight 
          ? 'ring-2 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] border-none' 
          : 'border border-gray-100 hover:border-indigo-100 hover:shadow-indigo-500/5'
      }`}
    >
      {/* Thumbnail / Color Bar */}
      {(isStream || isGamenight) && item.thumbnail ? (
        <div className="relative h-16 overflow-hidden flex-shrink-0 bg-slate-900 border-b border-white/5">
          <img src={getProxiedUrl(item.thumbnail, 'https://cdn-icons-png.flaticon.com/512/174/174855.png')} alt={item.title || 'Stream'} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 ${isGamenight ? 'bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-indigo-600'} text-white text-[6px] font-black uppercase tracking-wider rounded flex items-center gap-1`}>
            {isGamenight && <div className="w-1 h-1 bg-white rounded-full animate-pulse" />}
            {isGamenight ? 'GAMENIGHT' : item.platform === 'instagram_story' ? 'HISTORIA IG' : 'STREAM'}
          </span>
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-end justify-between">
            <div>
              <p className="text-[6px] font-black text-white/50 uppercase tracking-tighter">Peak Views</p>
              <p className="text-[10px] font-black text-white leading-none">{(item.peek_viewers || item.views || 0).toLocaleString()}</p>
            </div>
            {isGamenight && (item.unique_viewers || 0) > 0 && (
              <div className="text-right">
                <p className="text-[6px] font-black text-white/50 uppercase tracking-tighter text-right">Unique</p>
                <p className="text-[10px] font-black text-indigo-300 leading-none">{(item.unique_viewers || 0).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      ) : item.thumbnail ? (
        <div className="relative h-14 overflow-hidden flex-shrink-0 bg-gray-50">
          <img src={getProxiedUrl(item.thumbnail, 'https://cdn-icons-png.flaticon.com/512/174/174855.png')} alt={item.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className={`h-1.5 w-full bg-gradient-to-r ${gradient} flex-shrink-0`} />
      )}

      <div className="p-2 flex flex-col gap-1 flex-1">
        {/* Creator + platform row */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black text-white overflow-hidden flex-shrink-0 ${!creator?.photo_url ? `bg-gradient-to-br ${gradient}` : ''}`}>
              {creator?.photo_url
                ? <img src={creator.photo_url} alt="" className="w-full h-full object-cover" />
                : (creator?.display_name || '?').charAt(0).toUpperCase()
              }
            </div>
            <span className="text-[8px] font-bold text-slate-500 truncate">{creator?.display_name || translations.anonymous}</span>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {item.is_repost && (
              <span className="px-1 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[6px] font-black uppercase tracking-wider rounded">
                REPOST
              </span>
            )}
            {item.content_type && (
              <span className="px-1 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[6px] font-black uppercase tracking-wider rounded">
                {item.content_type === 'video_largo' ? 'LARGO' : 'CORTO'}
              </span>
            )}
          </div>
        </div>
        {/* Title */}
        <p className="text-[9px] font-bold text-slate-800 line-clamp-2 leading-tight flex-1">
          {item.title || (isStream ? `Stream · ${new Date(item.uploaded_at || item.created_at).toLocaleDateString()}` : '—')}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Eye className="h-2 w-2 text-gray-300" />
            <span className="text-[8px] font-black text-slate-900">{(item.views ?? 0).toLocaleString()}</span>
          </div>
          {(!isStream || item.platform === 'instagram_story') && (item.likes || 0) > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="h-2 w-2 text-gray-300" />
              <span className="text-[8px] font-black text-slate-500">{(item.likes || 0).toLocaleString()}</span>
            </div>
          )}
          {(!isStream || item.platform === 'instagram_story') && (item.comments || 0) > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-2 w-2 text-gray-300" />
              <span className="text-[8px] font-black text-slate-500">{(item.comments || 0).toLocaleString()}</span>
            </div>
          )}
          <ExternalLink className="h-2 w-2 text-gray-200 ml-auto group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>
    </motion.a>
  );
};

export default ReviewContentCard;
