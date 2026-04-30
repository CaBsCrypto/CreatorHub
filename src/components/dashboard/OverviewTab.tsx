import React from 'react';
import { TrendingUp, Users, List, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import AdminMetricCard from './AdminMetricCard';
import { StatsSkeleton } from './Skeleton';

interface OverviewTabProps {
  metrics: {
    totalViews: number;
    viewsTrend?: { value: number; isPositive: boolean };
    totalPosts: number;
    postsTrend?: { value: number; isPositive: boolean };
    activeCreators: number;
  };
  campaigns: any[];
  filteredContent: any[];
  setActiveTab: (tab: any) => void;
  setFilter: (key: string, value: any) => void;
  PLATFORM_COLORS: Record<string, string>;
  isLoading?: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  metrics,
  campaigns,
  filteredContent,
  setActiveTab,
  setFilter,
  PLATFORM_COLORS,
  isLoading
}) => {
  const platformCount = React.useMemo(() => [
    { name: 'Youtube', id: 'youtube', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'youtube').length },
    { name: 'Instagram', id: 'instagram', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'instagram').length },
    { name: 'TikTok', id: 'tiktok', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'tiktok').length },
    { name: 'X', id: 'x', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'x').length },
    { name: 'Stream', id: 'twitch', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'twitch').length },
    { name: 'CMC', id: 'coinmarketcap', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'coinmarketcap').length }
  ].filter(d => d.value > 0), [filteredContent]);

  const platformViews = React.useMemo(() => Object.entries(
    filteredContent.reduce((acc, curr) => {
      const p = curr.platform?.toLowerCase() || 'other';
      acc[p] = (acc[p] || 0) + (curr.views || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    id: name,
    value: value as number
  })), [filteredContent]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
          </>
        ) : (
          <>
            <AdminMetricCard
              title="Vistas Totales"
              value={metrics.totalViews.toLocaleString()}
              trend={metrics.viewsTrend || undefined}
              icon={TrendingUp}
              onClick={() => setActiveTab('content')}
            />
            <AdminMetricCard
              title="Creadores"
              value={metrics.activeCreators}
              icon={Users}
              onClick={() => setActiveTab('creators')}
            />
            <AdminMetricCard
              title="Posts Totales"
              value={metrics.totalPosts.toLocaleString()}
              trend={metrics.postsTrend || undefined}
              icon={List}
              onClick={() => setActiveTab('content')}
            />
            <AdminMetricCard
              title="Campañas Activas"
              value={campaigns.filter(c => c.status === 'active').length}
              icon={BarChart3}
              onClick={() => setActiveTab('campaigns')}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts por plataforma */}
        <div className="bg-white/[0.03] p-8 rounded-2xl border border-white/5 shadow-sm">
          <h3 className="text-base font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
            <BarChart3 className="h-5 w-5 text-red-500" /> Posts por Plataforma
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformCount}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  onClick={(data) => {
                    if (data && data.payload && data.payload.id) {
                      setFilter('platform', data.payload.id);
                      setActiveTab('content');
                    }
                  }}
                >
                  {platformCount.map((entry, i) => (
                    <Cell key={i} fill={PLATFORM_COLORS[entry.id]} className="cursor-pointer hover:opacity-80 transition-all duration-300" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: '800', textTransform: 'uppercase', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[...platformCount].sort((a, b) => b.value - a.value).map((item) => (
              <button
                key={item.id}
                onClick={() => { setFilter('platform', item.id); setActiveTab('content'); }}
                className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-red-500/10 rounded-xl border border-white/5 hover:border-red-500/20 transition-all group/item"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[item.id] || '#444' }} />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover/item:text-red-500 transition-colors">{item.name}</span>
                </div>
                <span className="text-xs font-black text-white tabular-nums">{item.value.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vistas por plataforma */}
        <div className="bg-white/[0.03] p-8 rounded-2xl border border-white/5 shadow-sm">
          <h3 className="text-base font-black text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
            <BarChart3 className="h-5 w-5 text-red-500" /> Vistas por Plataforma
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformViews}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  onClick={(data) => {
                    if (data && data.payload && data.payload.id) {
                      setFilter('platform', data.payload.id);
                      setActiveTab('content');
                    }
                  }}
                >
                  {platformViews.map((entry, i) => (
                    <Cell key={i} fill={PLATFORM_COLORS[entry.id] || '#444'} className="cursor-pointer hover:opacity-80 transition-all duration-300" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString() + ' vistas', 'Métrica']}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: '800', textTransform: 'uppercase', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[...platformViews].sort((a, b) => b.value - a.value).map(({ id: platform, value: views }) => (
              <button
                key={platform}
                onClick={() => { setFilter('platform', platform); setActiveTab('content'); }}
                className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-red-500/10 rounded-xl border border-white/5 hover:border-red-500/20 transition-all group/item"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[platform] || '#444' }} />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover/item:text-red-500 transition-colors">{platform}</span>
                </div>
                <span className="text-xs font-black text-white tabular-nums">{views.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
