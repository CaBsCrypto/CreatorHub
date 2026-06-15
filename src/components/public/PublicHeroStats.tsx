import React from 'react';
import { Eye, BarChart3, Users } from 'lucide-react';
import HeroStatCard from './HeroStatCard';
import { useCountUp } from '../../hooks/useCountUp';
import { motion } from 'framer-motion';
import { DeliverableTargets } from '../../utils/campaignHelpers';

interface PublicHeroStatsProps {
  stats: {
    totalViews: number;
    totalEngagement: number;
    platforms: Record<string, number>;
  } | null;
  postsCount: number;
  creatorsCount: number;
  translations: {
    totalViews: string;
    posts: string;
    activeCreators: string;
  };
  deliverableProgress?: {
    completed: DeliverableTargets;
    targets: DeliverableTargets;
  } | null;
  lang: 'en' | 'es';
  onViewsClick: () => void;
  onPostsClick: () => void;
  onCreatorsClick: () => void;
}

const PublicHeroStats: React.FC<PublicHeroStatsProps> = ({
  stats,
  postsCount,
  creatorsCount,
  translations,
  deliverableProgress,
  lang,
  onViewsClick,
  onPostsClick,
  onCreatorsClick
}) => {
  const animatedViews = useCountUp(stats?.totalViews || 0);
  const animatedPosts = useCountUp(postsCount);
  const animatedCreators = useCountUp(creatorsCount);

  const hasDeliverableTargets = deliverableProgress ? !Object.values(deliverableProgress.targets).every(t => t === 0) : false;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-8 mb-8">
      <HeroStatCard
        icon={<Eye className="h-5 w-5" />}
        label={translations.totalViews}
        value={animatedViews.toLocaleString()}
        color="indigo"
        onClick={onViewsClick}
      />
      
      {hasDeliverableTargets && deliverableProgress ? (
        <motion.button
          whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.1)" }}
          onClick={onPostsClick}
          className="relative bg-white border border-gray-100 rounded-[2.5rem] p-5 sm:p-6 text-left w-full overflow-hidden group transition-all duration-300 shadow-sm flex items-center justify-between cursor-pointer"
        >
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-gray-50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="flex items-center gap-4 sm:gap-6 w-full relative z-10">
            {/* Left Side: Posts Info */}
            <div className="flex flex-col shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 shadow-sm">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{translations.posts}</p>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">{animatedPosts.toString()}</span>
            </div>

            {/* Vertical Divider */}
            <div className="w-[2px] bg-slate-900 self-stretch my-2 shrink-0 opacity-10" />

            {/* Right Side: Deliverables Progress */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">
                {lang === 'en' ? 'DELIVERABLES PROGRESS' : 'PROGRESO DE ENTREGABLES'}
              </p>
              <div className="space-y-2.5">
                {[
                  { key: 'video_largo', label: lang === 'en' ? 'LONG VIDEOS' : 'VIDEOS LARGOS' },
                  { key: 'video_corto', label: lang === 'en' ? 'SHORT VIDEOS' : 'VIDEOS CORTOS' },
                  { key: 'stream', label: lang === 'en' ? 'STREAMS' : 'STREAMS' },
                  { key: 'game_night', label: lang === 'en' ? 'GAME NIGHTS' : 'GAME NIGHTS' },
                  { key: 'post', label: lang === 'en' ? 'POSTS' : 'POSTS' }
                ].map(deliv => {
                  const target = deliverableProgress.targets[deliv.key] || 0;
                  if (target === 0) return null;
                  const completed = deliverableProgress.completed[deliv.key] || 0;
                  const pct = Math.min(100, Math.round((completed / target) * 100));
                  const isCompleted = completed >= target;
                  return (
                    <div key={deliv.key} className="space-y-1">
                      <div className="flex justify-between items-center text-[7px] sm:text-[8px] font-black leading-none">
                        <span className="text-slate-500 uppercase tracking-wider truncate max-w-[90px]">{deliv.label}</span>
                        <span className={`font-mono ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {completed} / {target}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
          </div>
        </motion.button>
      ) : (
        <HeroStatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label={translations.posts}
          value={animatedPosts.toString()}
          color="purple"
          onClick={onPostsClick}
        />
      )}

      <HeroStatCard
        icon={<Users className="h-5 w-5" />}
        label={translations.activeCreators}
        value={animatedCreators.toString()}
        color="emerald"
        onClick={onCreatorsClick}
      />
    </div>
  );
};

export default PublicHeroStats;
