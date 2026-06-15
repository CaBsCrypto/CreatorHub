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
  filterCreatorId: string;
  setFilters: (updates: any) => void;
  setShowCreatorRankingModal: (val: boolean) => void;
  creatorRanking: any[];
  deliverableProgress: {
    completed: DeliverableTargets;
    targets: DeliverableTargets;
  } | null;
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
  filterCreatorId,
  setFilters,
  setShowCreatorRankingModal,
  creatorRanking,
  deliverableProgress,
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

      {/* Deliverables Progress Panel */}
      {deliverableProgress && !Object.values(deliverableProgress.targets).every(t => t === 0) && (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">
            {lang === 'en' ? 'DELIVERABLES PROGRESS' : 'PROGRESO DE ENTREGABLES'}
          </h3>
          <div className="space-y-4">
            {[
              { key: 'video_largo', label: lang === 'en' ? 'Long Videos' : 'Videos Largos' },
              { key: 'video_corto', label: lang === 'en' ? 'Short Videos' : 'Videos Cortos' },
              { key: 'stream', label: lang === 'en' ? 'Streams' : 'Streams' },
              { key: 'game_night', label: lang === 'en' ? 'Game Nights' : 'Game Nights' },
              { key: 'post', label: lang === 'en' ? 'Posts' : 'Posts' }
            ].map(deliv => {
              const target = deliverableProgress.targets[deliv.key as keyof typeof deliverableProgress.targets] || 0;
              if (target === 0) return null;

              const completed = deliverableProgress.completed[deliv.key as keyof typeof deliverableProgress.completed] || 0;
              const pct = Math.min(100, Math.round((completed / target) * 100));
              const isCompleted = completed >= target;

              return (
                <div key={deliv.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600 font-black uppercase tracking-wide text-[9px]">{deliv.label}</span>
                    <span className={`font-mono text-[10px] ${isCompleted ? 'text-emerald-600 font-black' : 'text-slate-500'}`}>
                      {completed} / {target}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-550 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Creator Ranking Panel (Inline) */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">
          {lang === 'en' ? 'CREATOR RANKING' : 'RANKING DE CREADORES'}
        </h3>
        <div className="space-y-2.5">
          {filterCreatorId !== 'all' && (
            <button onClick={() => setFilters({ creator: 'all' })}
              className="flex items-center gap-1.5 py-1 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors mb-2"
            >
              <ArrowLeft className="h-3 w-3" /> {lang === 'en' ? 'VIEW ALL CREATORS' : 'VER TODOS'}
            </button>
          )}
          {creatorRanking.map((creator, index) => {
            const u = creator.user;
            const isSelected = filterCreatorId === u.id;
            return (
              <button
                key={u.id || index}
                onClick={() => setFilters({ creator: isSelected ? 'all' : u.id, section: 'content' })}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl transition-all duration-200 border text-left cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100'
                    : 'bg-white border-gray-50 hover:bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`text-xs font-black w-5 shrink-0 text-center ${isSelected ? 'text-white/80' : 'text-slate-300'}`}>
                    #{index + 1}
                  </span>

                  {/* Creator Avatar */}
                  <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs uppercase shrink-0 border ${
                    isSelected ? 'bg-white/20 text-white border-white/20' : 'bg-indigo-500/10 text-indigo-600 border-indigo-100'
                  }`}>
                    {u.photo_url ? (
                      <img src={u.photo_url} alt={u.display_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      (u.display_name || '?').charAt(0)
                    )}
                  </div>

                  {/* Creator Name & Post count */}
                  <div className="flex flex-col text-left min-w-0">
                    <span className={`text-xs font-black truncate leading-snug ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {u.display_name || 'Anonymous'}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide leading-none mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      {creator.postsCount} {creator.postsCount === 1 ? 'post' : 'posts'}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-col text-right shrink-0">
                  <span className={`text-[11px] font-black flex items-center justify-end gap-0.5 leading-none ${isSelected ? 'text-white' : 'text-indigo-600'}`}>
                    <Eye className="h-3.5 w-3.5 opacity-75" /> {formatCompact(creator.views)}
                  </span>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className={`text-[8px] font-bold flex items-center gap-0.5 leading-none ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      <Heart className="h-2.5 w-2.5 opacity-60" /> {formatCompact(creator.likes)}
                    </span>
                    <span className={`text-[8px] font-bold flex items-center gap-0.5 leading-none ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      <MessageSquare className="h-2.5 w-2.5 opacity-60" /> {formatCompact(creator.comments)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PublicReviewSidebar;
