import React, { useMemo } from 'react';
import { X, Users, Clock, Share2, Activity, Zap, TrendingUp, Monitor, ArrowRight, LogIn, LogOut, Play } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Content, DiscordSessionEvent } from '../../supabase';

interface DiscordStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Content | null;
  events?: DiscordSessionEvent[];
}

const DiscordStatsModal: React.FC<DiscordStatsModalProps> = ({ isOpen, onClose, session, events = [] }) => {
  if (!isOpen || !session) return null;

  const chartData = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    // Process events to create a step chart of active users
    const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let currentUsers = 0;
    
    return sortedEvents.map(event => {
      if (event.event_type === 'join') currentUsers++;
      if (event.event_type === 'leave') currentUsers--;
      
      return {
        time: new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        users: Math.max(0, currentUsers),
        timestamp: new Date(event.timestamp).getTime()
      };
    });
  }, [events]);

  const metrics = [
    { label: 'Duración', value: `${Math.floor((session.duration_minutes || 0) / 60)}h ${(session.duration_minutes || 0) % 60}m`, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Simultáneos', value: session.peek_viewers || 0, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Únicos', value: session.views || 0, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'T. Promedio', value: `${Math.floor((session.avg_duration_minutes || 0) / 60)}h ${(session.avg_duration_minutes || 0) % 60}m`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Compartidas', value: session.shares_count || 0, icon: Monitor, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-md" 
          onClick={onClose} 
        />
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] bg-white shadow-2xl flex flex-col"
      >
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all z-10 shadow-sm"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar relative z-0">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Discord Session</div>
              <span className="text-gray-400 font-bold text-sm">{new Date(session.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">{session.title || 'Sesión de Juego'}</h2>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {metrics.map((m, i) => (
              <motion.div 
                key={m.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative"
              >
                <div className={`absolute -right-4 -top-4 w-16 h-16 ${m.bg} opacity-20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700`} />
                <m.icon className={`h-5 w-5 ${m.color} mb-3`} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                <p className="text-xl font-black text-gray-900 leading-none">{m.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Activity Chart Area */}
          <div className="mb-10">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" /> Actividad de Usuarios
            </h3>
            <div className="h-64 w-full bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-6">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      minTickGap={30}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                    />
                    <Area 
                      type="stepAfter" 
                      dataKey="users" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                  <Activity className="h-8 w-8 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30">No hay datos de actividad disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> Línea de Tiempo
            </h3>
            <div className="space-y-3">
              {events.length > 0 ? (
                [...events].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((event, i) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="text-[10px] font-bold text-gray-400 w-16 tabular-nums">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    
                    <div className="relative flex items-center justify-center py-2 h-full">
                       <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-100 -translate-x-1/2 group-first:top-1/2 group-last:bottom-1/2" />
                       <div className={`relative z-10 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                         event.event_type === 'join' ? 'bg-emerald-500' : 
                         event.event_type === 'leave' ? 'bg-rose-500' : 
                         event.event_type === 'stream_start' ? 'bg-indigo-500' : 'bg-gray-400'
                       }`} />
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-2xl px-6 py-3 border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-gray-900 font-mono">{event.user_name}</span>
                        <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                          event.event_type === 'join' ? 'bg-emerald-100 text-emerald-700' : 
                          event.event_type === 'leave' ? 'bg-rose-100 text-rose-700' : 
                          event.event_type === 'stream_start' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {event.event_type === 'join' && <LogIn className="h-2 w-2" />}
                          {event.event_type === 'leave' && <LogOut className="h-2 w-2" />}
                          {event.event_type === 'stream_start' && <Play className="h-2 w-2" />}
                          {event.event_type === 'join' ? 'se unió' : 
                           event.event_type === 'leave' ? 'salió' : 
                           event.event_type === 'stream_start' ? 'transmitiendo' : 'fin transición'}
                        </div>
                      </div>
                      
                      {event.duration_minutes && (
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          estuvo <span className="text-indigo-600">{event.duration_minutes}m</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-xs font-medium text-gray-400">No hay eventos registrados para esta sesión.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DiscordStatsModal;
