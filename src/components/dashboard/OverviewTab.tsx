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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
              color="from-indigo-600 to-indigo-700"
              onClick={() => setActiveTab('content')} 
            />
            <AdminMetricCard 
              title="Creadores" 
              value={metrics.activeCreators} 
              icon={Users} 
              color="from-blue-600 to-blue-700"
              onClick={() => setActiveTab('creators')} 
            />
            <AdminMetricCard 
              title="Posts Totales" 
              value={metrics.totalPosts.toLocaleString()} 
              trend={metrics.postsTrend || undefined} 
              icon={List} 
              color="from-emerald-600 to-emerald-700"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 relative overflow-hidden group shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-widest relative z-10 italic">
            <BarChart3 className="h-6 w-6 text-indigo-600" /> Distribución por Plataforma
          </h3>
          <div className="h-[280px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformCount}
                  innerRadius={70} 
                  outerRadius={100} 
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
                    <Cell key={i} fill={PLATFORM_COLORS[entry.id]} className="cursor-pointer hover:opacity-80 transition-all" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '1rem', shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 relative z-10">
            {[...platformCount].sort((a, b) => b.value - a.value).map((item) => (
              <button 
                key={item.id} 
                onClick={() => {
                  setFilter('platform', item.id);
                  setActiveTab('content');
                }}
                className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-indigo-100 transition-all group/item shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[item.id] || '#cbd5e1' }} />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/item:text-indigo-600 transition-colors">{item.name}</span>
                </div>
                <span className="text-xs font-black text-gray-900 tabular-nums">{item.value.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 relative overflow-hidden group shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-widest relative z-10 italic">
            <BarChart3 className="h-6 w-6 text-indigo-600" /> Análisis de Vistas
          </h3>
          
          <div className="h-[280px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformViews}
                  innerRadius={70} 
                  outerRadius={100} 
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
                    <Cell key={i} fill={PLATFORM_COLORS[entry.id] || '#cbd5e1'} className="cursor-pointer hover:opacity-80 transition-all" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString() + ' vistas', 'Métrica']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '1rem', shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 relative z-10">
            {[...platformViews].sort((a, b) => b.value - a.value).map(({ id: platform, value: views }) => (
              <button 
                key={platform} 
                onClick={() => {
                  setFilter('platform', platform);
                  setActiveTab('content');
                }}
                className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-indigo-100 transition-all group/item shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[platform] || '#cbd5e1' }} />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/item:text-indigo-600 transition-colors">{platform}</span>
                </div>
                <span className="text-xs font-black text-gray-900 tabular-nums">{views.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};;

export default OverviewTab;
