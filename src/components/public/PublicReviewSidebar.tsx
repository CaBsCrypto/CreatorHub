import React from 'react';
import { ArrowLeft, TrendingUp, Eye, Heart, MessageSquare, Trophy, ArrowRight } from 'lucide-react';
import { getPlatformIcon, getPlatformColor } from '../../utils/platformUtils';
import { UserProfile } from '../../supabase';

interface PublicReviewSidebarProps {
  stats: {
    platforms: Record<string, number>;
    platformStats?: Record<string, { views: number; likes: number; comments: number }>;
  } | null;
  filterPlatform: string;
  setFilterPlatform: (val: string) => void;
  setFilters: (updates: any) => void;
  setShowCreatorRankingModal: (val: boolean) => void;
  creatorRanking: any[];
  lang: 'en' | 'es';
  translations: {
    platformDistribution: string;
    viewAllPlatforms: string;
  };
}

const PublicReviewSidebar: React.FC<PublicReviewSidebarProps> = ({
  stats,
  filterPlatform,
  setFilterPlatform,
  setFilters,
  setShowCreatorRankingModal,
  creatorRanking,
  lang,
  translations
}) => {
  const formatCompact = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="hidden lg:flex flex-col gap-6">
      {/* Platform Filter Panel */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">{translations.platformDistribution}</h3>
        <div className="space-y-2">
          {filterPlatform !== 'all' && (
            <button onClick={() => setFilterPlatform('all')}
              className="flex items-center gap-1.5 py-2 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> {translations.viewAllPlatforms}
            </button>
          )}
          {Object.entries(stats?.platforms || {}).map(([platform, count]) => {
            const lowerPlatform = platform.toLowerCase();
            const pStats = stats?.platformStats?.[lowerPlatform];
            return (
              <button key={platform} onClick={() => setFilters({ platform, section: 'content' })}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 border gap-3 ${
                  filterPlatform === lowerPlatform
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100'
                    : 'bg-white border-gray-50 hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    filterPlatform === lowerPlatform ? 'bg-white/20 text-white' : getPlatformColor(platform)
                  }`}>
                    {getPlatformIcon(platform, 'h-4 w-4')}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className={`text-sm font-black capitalize leading-tight ${filterPlatform === lowerPlatform ? 'text-white' : 'text-slate-700'}`}>
                       {lowerPlatform === 'coinmarketcap' ? 'CMC' : lowerPlatform === 'twitch' ? 'Stream' : platform}
                    </span>
                    {pStats && (
                      <div className="flex items-center gap-2 mt-1 min-w-0 flex-wrap">
                        <span className={`flex items-center gap-0.5 text-[10px] font-bold ${filterPlatform === lowerPlatform ? 'text-white/80' : 'text-slate-400'}`}>
                          <Eye className="h-3 w-3 opacity-70" /> {formatCompact(pStats.views)}
                        </span>
                        <span className={`flex items-center gap-0.5 text-[10px] font-bold ${filterPlatform === lowerPlatform ? 'text-white/80' : 'text-slate-400'}`}>
                          <Heart className="h-3 w-3 opacity-70" /> {formatCompact(pStats.likes)}
                        </span>
                        <span className={`flex items-center gap-0.5 text-[10px] font-bold ${filterPlatform === lowerPlatform ? 'text-white/80' : 'text-slate-400'}`}>
                          <MessageSquare className="h-3 w-3 opacity-70" /> {formatCompact(pStats.comments)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-lg shrink-0 ${
                  filterPlatform === lowerPlatform ? 'bg-white/20 text-white' : 'bg-gray-50 text-slate-400 border border-gray-100'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Creator Ranking Panel (Inline) */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">
          {lang === 'en' ? 'CREATOR RANKING' : 'RANKING DE CREADORES'}
        </h3>
        <div className="space-y-2.5">
          {creatorRanking.map((creator, index) => {
            const u = creator.user;
            return (
              <div
                key={u.id || index}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-gray-50 bg-slate-50/30 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-black text-slate-300 w-5 shrink-0 text-center">
                    #{index + 1}
                  </span>

                  {/* Creator Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-500/10 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {u.photo_url ? (
                      <img src={u.photo_url} alt={u.display_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      (u.display_name || '?').charAt(0)
                    )}
                  </div>

                  {/* Creator Name & Post count */}
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-black text-slate-800 truncate leading-snug">
                      {u.display_name || 'Anonymous'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none mt-0.5">
                      {creator.postsCount} {creator.postsCount === 1 ? 'post' : 'posts'}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-col text-right shrink-0">
                  <span className="text-[11px] font-black text-indigo-600 flex items-center justify-end gap-0.5 leading-none">
                    <Eye className="h-3.5 w-3.5 opacity-75" /> {formatCompact(creator.views)}
                  </span>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className="text-[8px] font-bold text-slate-400 flex items-center gap-0.5 leading-none">
                      <Heart className="h-2.5 w-2.5 opacity-60" /> {formatCompact(creator.likes)}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 flex items-center gap-0.5 leading-none">
                      <MessageSquare className="h-2.5 w-2.5 opacity-60" /> {formatCompact(creator.comments)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicReviewSidebar;
