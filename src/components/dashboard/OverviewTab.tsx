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
  onOpenCompanyViews?: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  metrics,
  campaigns,
  filteredContent,
  setActiveTab,
  setFilter,
  PLATFORM_COLORS,
  isLoading,
  onOpenCompanyViews
}) => {
  const platformCount = React.useMemo(() => [
    { name: 'Youtube', id: 'youtube', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'youtube').length },
    { name: 'Instagram', id: 'instagram', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'instagram').length },
    { name: 'TikTok', id: 'tiktok', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'tiktok').length },
    { name: 'X', id: 'x', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'x').length },
    { name: 'LinkedIn', id: 'linkedin', value: filteredContent.filter(c => c.platform?.toLowerCase() === 'linkedin').length },
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
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 py-1">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
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
              icon={TrendingUp}
              onClick={() => onOpenCompanyViews ? onOpenCompanyViews() : setActiveTab('content')}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Posts por plataforma */}
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-0">
          <h3 className="text-[13px] font-black text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-tight flex-shrink-0">
            <BarChart3 className="h-4.5 w-4.5 text-indigo-600" /> Posts by Platform
          </h3>
          
          <div className="flex-1 min-h-0 w-full h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformCount}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
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
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', color: '#000' }}
                  itemStyle={{ color: '#000', fontWeight: '800', textTransform: 'uppercase', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vistas por plataforma */}
        <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full min-h-0">
          <h3 className="text-[13px] font-black text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-tight flex-shrink-0">
            <BarChart3 className="h-4.5 w-4.5 text-indigo-600" /> Views by Platform
          </h3>
          
          <div className="flex-1 min-h-0 w-full h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformViews}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
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
                  formatter={(value: number) => [value.toLocaleString() + ' views', 'Metric']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', color: '#000' }}
                  itemStyle={{ color: '#000', fontWeight: '800', textTransform: 'uppercase', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
