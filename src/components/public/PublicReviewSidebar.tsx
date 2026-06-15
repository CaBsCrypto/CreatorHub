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

      {/* Creator Ranking Card (Trigger) */}
      <button 
        onClick={() => setShowCreatorRankingModal(true)}
        className="relative text-left w-full bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border-none rounded-[2rem] p-6 overflow-hidden shadow-xl shadow-indigo-950/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 group cursor-pointer"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all duration-500" />
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Trophy className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-lg font-black mb-2 leading-tight uppercase tracking-wide">Ranking de Creadores</h3>
          <p className="text-indigo-200/80 text-xs font-medium leading-relaxed mb-4">
            {lang === 'en'
              ? 'Check how each creator performed sorted by views and engagement.'
              : 'Mira el rendimiento de cada creador ordenados por vistas y engagement.'}
          </p>
          <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-1">
            Ver Ranking <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </button>
    </div>
  );
};

export default PublicReviewSidebar;
