import React from 'react';
import { TrendingUp, Zap, Users, List, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
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
              color="from-emerald-500 to-emerald-600"
              onClick={() => setActiveTab('content')} 
            />
            <AdminMetricCard 
              title="Creadores" 
              value={metrics.activeCreators} 
              icon={Users} 
              color="from-cyan-500 to-blue-600"
              onClick={() => setActiveTab('creators')} 
            />
            <AdminMetricCard 
              title="Posts Totales" 
              value={metrics.totalPosts.toLocaleString()} 
              trend={metrics.postsTrend || undefined} 
              icon={List} 
              color="from-emerald-400 to-emerald-500"
              onClick={() => setActiveTab('content')} 
            />
            <AdminMetricCard 
              title="Campañas Activas" 
              value={campaigns.filter(c => c.status === 'active').length} 
              icon={BarChart3} 
              color="from-slate-800 to-slate-900"
              onClick={() => setActiveTab('campaigns')} 
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass-dark p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-1000" />
          <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3 uppercase tracking-widest relative z-10 italic">
            <BarChart3 className="h-6 w-6 text-emerald-500" /> Platform_Distribution
          </h3>
          <div className="h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformCount}
                  innerRadius={80} 
                  outerRadius={110} 
                  paddingAngle={8} 
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
                    <Cell key={i} fill={PLATFORM_COLORS[entry.id]} className="cursor-pointer hover:opacity-80 transition-all duration-500" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', backdropFilter: 'blur(10px)', color: 'white' }}
                  itemStyle={{ color: 'white', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
            {[...platformCount].sort((a, b) => b.value - a.value).map((item) => (
              <button 
                key={item.id} 
                onClick={() => {
                  setFilter('platform', item.id);
                  setActiveTab('content');
                }}
                className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl border border-white/5 transition-all duration-300 group/item"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: PLATFORM_COLORS[item.id] || '#cbd5e1' }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-white transition-colors">{item.name}</span>
                </div>
                <span className="text-xs font-black text-white tabular-nums">{item.value.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-dark p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-1000" />
          <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3 uppercase tracking-widest relative z-10 italic">
            <BarChart3 className="h-6 w-6 text-emerald-500" /> View_Metrics_Analysis
          </h3>
          
          <div className="h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformViews}
                  innerRadius={80} 
                  outerRadius={110} 
                  paddingAngle={8} 
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
                    <Cell key={i} fill={PLATFORM_COLORS[entry.id] || '#cbd5e1'} className="cursor-pointer hover:opacity-80 transition-all duration-500" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString() + ' views', 'Metric']}
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', backdropFilter: 'blur(10px)', color: 'white' }}
                  itemStyle={{ color: 'white', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
            {[...platformViews].sort((a, b) => b.value - a.value).map(({ id: platform, value: views }) => (
              <button 
                key={platform} 
                onClick={() => {
                  setFilter('platform', platform);
                  setActiveTab('content');
                }}
                className="flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-800 rounded-2xl border border-white/5 transition-all duration-300 group/item"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: PLATFORM_COLORS[platform] || '#cbd5e1' }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-white transition-colors">{platform}</span>
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
