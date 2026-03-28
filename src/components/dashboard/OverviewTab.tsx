import React from 'react';
import { TrendingUp, Zap, Users, List, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import AdminMetricCard from './AdminMetricCard';

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
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  metrics,
  campaigns,
  filteredContent,
  setActiveTab,
  setFilter,
  PLATFORM_COLORS
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-6">
        <AdminMetricCard 
          title="Vistas Totales" 
          value={metrics.totalViews.toLocaleString()} 
          trend={metrics.viewsTrend || undefined} 
          icon={TrendingUp} 
          color="from-indigo-500 to-indigo-600"
          onClick={() => setActiveTab('content')} 
        />
        <AdminMetricCard 
          title="Vistas Promedio" 
          value={Math.round(metrics.totalViews / (metrics.totalPosts || 1)).toLocaleString()} 
          icon={Zap} 
          color="from-rose-500 to-pink-600"
          onClick={() => setActiveTab('content')} 
        />
        <AdminMetricCard 
          title="Creadores" 
          value={metrics.activeCreators} 
          icon={Users} 
          color="from-teal-500 to-emerald-600"
          onClick={() => setActiveTab('creators')} 
        />
        <AdminMetricCard 
          title="Posts Totales" 
          value={metrics.totalPosts.toLocaleString()} 
          trend={metrics.postsTrend || undefined} 
          icon={List} 
          color="from-amber-500 to-orange-600"
          onClick={() => setActiveTab('content')} 
        />
        <AdminMetricCard 
          title="Campañas Activas" 
          value={campaigns.filter(c => c.status === 'active').length} 
          icon={BarChart3} 
          color="from-blue-500 to-blue-600"
          onClick={() => setActiveTab('campaigns')} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-indigo-500" /> Distribución por Plataforma</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformCount}
                  innerRadius={80} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                  onClick={(data) => {
                    if (data && data.payload && data.payload.id) {
                      setFilter('platform', data.payload.id);
                      setActiveTab('content');
                    }
                  }}
                >
                  {platformCount.map((entry, i) => (
                    <Cell key={i} fill={PLATFORM_COLORS[entry.id]} className="cursor-pointer hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-3">
            {[...platformCount].sort((a, b) => b.value - a.value).map((item) => (
              <button 
                key={item.id} 
                onClick={() => {
                  setFilter('platform', item.id);
                  setActiveTab('content');
                }}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[item.id] || '#cbd5e1' }} />
                  <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-black text-gray-900">{item.value.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />
          <h3 className="text-xl font-black text-gray-900 mb-12 flex items-center gap-2 relative z-10"><BarChart3 className="h-5 w-5 text-indigo-500" /> Vistas por Plataforma</h3>
          
          <div className="h-[300px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformViews}
                  innerRadius={80} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                  onClick={(data) => {
                    if (data && data.payload && data.payload.id) {
                      setFilter('platform', data.payload.id);
                      setActiveTab('content');
                    }
                  }}
                >
                  {platformViews.map((entry, i) => (
                    <Cell key={i} fill={PLATFORM_COLORS[entry.id] || '#cbd5e1'} className="cursor-pointer hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString() + ' vistas', 'Vistas']}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-3 relative z-10">
            {[...platformViews].sort((a, b) => b.value - a.value).map(({ id: platform, value: views }) => (
              <button 
                key={platform} 
                onClick={() => {
                  setFilter('platform', platform);
                  setActiveTab('content');
                }}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[platform] || '#cbd5e1' }} />
                  <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{platform}</span>
                </div>
                <span className="text-xs font-black text-gray-900">{views.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
