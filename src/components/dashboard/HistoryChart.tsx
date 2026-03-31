import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ContentMetricsHistory } from '../../supabase';

interface HistoryChartProps {
  data: ContentMetricsHistory[];
  height?: number;
  showOtherMetrics?: boolean;
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ 
  data, 
  height = 300, 
  showOtherMetrics = false 
}) => {
  if (!data || data.length === 0) {
    return (
      <div 
        className="w-full flex items-center justify-center text-gray-500 bg-gray-900/40 rounded-xl border border-white/5"
        style={{ height }}
      >
        <p>No hay datos históricos suficientes.</p>
      </div>
    );
  }

  // Group and sort data by date. For simplicity, we just format the date to a readable string.
  const chartData = [...data]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map(item => {
      const date = new Date(item.recorded_at);
      return {
        ...item,
        dateFormatted: date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    });

  // Check if we have Twitch-specific metrics in the data
  const hasTwitchMetrics = chartData.some(d => d.average_viewers !== undefined && d.average_viewers > 0);

  return (
    <div className="w-full bg-gray-900/50 p-4 rounded-xl border border-white/10" style={{ height: height + 60 }}>
      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Evolución de Métricas
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
          <XAxis 
            dataKey="dateFormatted" 
            stroke="#9ca3af" 
            tick={{ fill: '#9ca3af', fontSize: 11 }} 
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fill: '#9ca3af', fontSize: 11 }} 
            tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          
          <Line 
            type="monotone" 
            name="Vistas Totales"
            dataKey="views" 
            stroke="#6366f1" 
            strokeWidth={3}
            dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, stroke: '#818cf8', strokeWidth: 2 }} 
          />
          
          {showOtherMetrics && (
            <>
              <Line 
                type="monotone" 
                name="Likes"
                dataKey="likes" 
                stroke="#ec4899" 
                strokeWidth={2}
                dot={{ fill: '#ec4899', r: 3, strokeWidth: 0 }} 
              />
              <Line 
                type="monotone" 
                name="Comentarios"
                dataKey="comments" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }} 
              />
            </>
          )}

          {hasTwitchMetrics && showOtherMetrics && (
            <>
              <Line 
                type="monotone" 
                name="Chatters Únicos"
                dataKey="unique_chatters" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }} 
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
