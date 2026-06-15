import React from 'react';
import { ArrowLeft, TrendingUp, Eye, Heart, MessageSquare, Trophy, ArrowRight } from 'lucide-react';
import { getPlatformIcon, getPlatformColor } from '../../utils/platformUtils';
import { UserProfile } from '../../supabase';
import { DeliverableTargets } from '../../utils/campaignHelpers';

interface PublicReviewSidebarProps {
  stats: {
    platforms: Record<string, number>;
    platformStats?: Record<string, { views: number; likes: number; comments: number }>;
  } | null;
  filterPlatform: string;
  setFilterPlatform: (val: string) => void;
  setFilters: (updates: any) => void;
  setShowCreatorRankingModal: (val: boolean) => void;
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
  lang,
  translations
}) => {
  const formatCompact = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="hidden lg:flex flex-col gap-6 sticky top-24">
      {/* Platform Filter Panel */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-4 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{translations.platformDistribution}</h3>
        <div className="space-y-1.5">
          {filterPlatform !== 'all' && (
            <button onClick={() => setFilterPlatform('all')}
              className="flex items-center gap-1 py-1.5 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> {translations.viewAllPlatforms}
            </button>
          )}
          {Object.entries(stats?.platforms || {}).map(([platform, count]) => {
            const lowerPlatform = platform.toLowerCase();
            const pStats = stats?.platformStats?.[lowerPlatform];
            return (
              <button key={platform} onClick={() => setFilters({ platform, section: 'content' })}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 border gap-2 ${
                  filterPlatform === lowerPlatform
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100'
                    : 'bg-white border-gray-50 hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                    filterPlatform === lowerPlatform ? 'bg-white/20 text-white' : getPlatformColor(platform)
                  }`}>
                    {getPlatformIcon(platform, 'h-3.5 w-3.5')}
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className={`text-xs font-black capitalize leading-tight ${filterPlatform === lowerPlatform ? 'text-white' : 'text-slate-700'}`}>
                       {lowerPlatform === 'coinmarketcap' ? 'CMC' : lowerPlatform === 'twitch' ? 'Stream' : platform}
                    </span>
                    {pStats && (
                      <div className="flex items-center gap-1.5 mt-0.5 min-w-0 flex-wrap">
                        <span className={`flex items-center gap-0.5 text-[9px] font-bold ${filterPlatform === lowerPlatform ? 'text-white/80' : 'text-slate-400'}`}>
                          <Eye className="h-3 w-3 opacity-70" /> {formatCompact(pStats.views)}
                        </span>
                        <span className={`flex items-center gap-0.5 text-[9px] font-bold ${filterPlatform === lowerPlatform ? 'text-white/80' : 'text-slate-400'}`}>
                          <Heart className="h-2.5 w-2.5 opacity-70" /> {formatCompact(pStats.likes)}
                        </span>
                        <span className={`flex items-center gap-0.5 text-[9px] font-bold ${filterPlatform === lowerPlatform ? 'text-white/80' : 'text-slate-400'}`}>
                          <MessageSquare className="h-2.5 w-2.5 opacity-70" /> {formatCompact(pStats.comments)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg shrink-0 ${
                  filterPlatform === lowerPlatform ? 'bg-white/20 text-white' : 'bg-gray-50 text-slate-400 border border-gray-100'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicReviewSidebar;
