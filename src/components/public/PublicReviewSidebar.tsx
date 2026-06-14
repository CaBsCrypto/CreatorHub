import React from 'react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
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
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 border gap-3 ${
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
                    <span className={`text-[9px] font-bold mt-0.5 whitespace-nowrap truncate ${
                      filterPlatform === lowerPlatform ? 'text-white/80' : 'text-slate-400'
                    }`}>
                      {pStats ? `${formatCompact(pStats.views)} views • ${formatCompact(pStats.likes)} likes • ${formatCompact(pStats.comments)} comments` : '0 views'}
                    </span>
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

      {/* Brand Card */}
      <div className="relative bg-white border border-gray-100 rounded-[2rem] p-6 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-100">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">Umbra Creator Hub</h3>
          <p className="text-gray-500 text-xs font-medium leading-relaxed mb-4">
            {lang === 'en'
              ? 'Real-time campaign metrics connecting brands with top creators.'
              : 'Métricas de campaña en tiempo real.'}
          </p>
          <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">© 2026 UMBRA AGENCY</div>
        </div>
      </div>
    </div>
  );
};

export default PublicReviewSidebar;
