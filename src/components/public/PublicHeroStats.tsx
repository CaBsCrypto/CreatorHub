import React from 'react';
import { Eye, BarChart3, Users } from 'lucide-react';
import HeroStatCard from './HeroStatCard';
import { useCountUp } from '../../hooks/useCountUp';

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
  onViewsClick: () => void;
  onPostsClick: () => void;
  onCreatorsClick: () => void;
}

const PublicHeroStats: React.FC<PublicHeroStatsProps> = ({
  stats,
  postsCount,
  creatorsCount,
  translations,
  onViewsClick,
  onPostsClick,
  onCreatorsClick
}) => {
  const animatedViews = useCountUp(stats?.totalViews || 0);
  const animatedPosts = useCountUp(postsCount);
  const animatedCreators = useCountUp(creatorsCount);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-8 mb-8">
      <HeroStatCard
        icon={<Eye className="h-5 w-5" />}
        label={translations.totalViews}
        value={animatedViews.toLocaleString()}
        color="indigo"
        onClick={onViewsClick}
      />
      <HeroStatCard
        icon={<BarChart3 className="h-5 w-5" />}
        label={translations.posts}
        value={animatedPosts.toString()}
        color="purple"
        onClick={onPostsClick}
      />
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
