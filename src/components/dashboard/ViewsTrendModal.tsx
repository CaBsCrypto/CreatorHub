import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, TrendingUp, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ViewsTrendModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any[];
}

export default function ViewsTrendModal({ isOpen, onClose, content }: ViewsTrendModalProps) {
  
  // Aggregate views by date
  const chartData = useMemo(() => {
    if (!content || content.length === 0) return [];
    
    const dailyViews: Record<string, number> = {};
    
    content.forEach(item => {
      const dateStr = item.uploaded_at || item.created_at;
      if (!dateStr) return;
      
      const date = new Date(dateStr);
      // Format to YYYY-MM-DD for grouping
      const key = date.toISOString().split('T')[0];
      
      if (!dailyViews[key]) dailyViews[key] = 0;
      dailyViews[key] += (item.views || 0);
    });

    const sortedDates = Object.keys(dailyViews).sort();
    
    // Calculate cumulative as well, or just show daily bumps
    let cumulative = 0;
    return sortedDates.map(date => {
      cumulative += dailyViews[date];
      return {
        date,
        displayDate: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        dailyViews: dailyViews[date],
        totalViews: cumulative
      };
    });
  }, [content]);

  // Aggregate by creator or campaign for extra insights
  const { totalViews, maxDay } = useMemo(() => {
    if (chartData.length === 0) return { totalViews: 0, maxDay: null };
    const max = [...chartData].sort((a, b) => b.dailyViews - a.dailyViews)[0];
    const total = chartData[chartData.length - 1].totalViews;
    return { totalViews: total, maxDay: max };
  }, [chartData]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50 shadow-inner">
                  <CalendarIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight">Flujo de Vistas</h2>
                  <p className="text-xs md:text-sm font-medium text-gray-500">
                    Historial cronológico de generación de impacto
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              
              {chartData.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Filter className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Sin datos de vistas</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">
                    No hay contenido con vistas en este filtro o todavía no se han registrado métricas.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Vistas Acumuladas</p>
                      <p className="text-2xl font-black text-gray-900">{totalViews.toLocaleString()}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Mejor Día</p>
                      <p className="text-2xl font-black text-emerald-700">+{maxDay?.dailyViews.toLocaleString()}</p>
                      <p className="text-xs font-bold text-emerald-600 mt-0.5">{maxDay?.displayDate}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 col-span-2 md:col-span-1">
                      <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest mb-1">Promedio Diario</p>
                      <p className="text-2xl font-black text-indigo-700">
                        {Math.round(totalViews / chartData.length).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      Crecimiento de Vistas
                    </h3>
                    <div className="h-64 w-full min-h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="displayDate" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
                            tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-gray-900 border border-gray-700 p-3 rounded-xl shadow-2xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{data.displayDate}</p>
                                    <p className="text-sm font-bold text-white">Acumulado: <span className="text-emerald-400 font-black">{data.totalViews.toLocaleString()}</span></p>
                                    <p className="text-xs font-medium text-gray-300 mt-1">Nuevas: +{data.dailyViews.toLocaleString()}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="totalViews" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorViews)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Daily Log */}
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Registro Diario</h3>
                    <div className="space-y-2">
                      {[...chartData].reverse().map((day, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black">
                              {day.displayDate.split(' ')[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{day.displayDate}</p>
                              <p className="text-[10px] font-medium text-gray-500">Agregado al total</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-600">+{day.dailyViews.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-gray-400">Total: {day.totalViews.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
