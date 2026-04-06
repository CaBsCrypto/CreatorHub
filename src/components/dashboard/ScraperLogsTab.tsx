import React, { useEffect, useState, useMemo } from 'react';
import { ShieldCheck, Activity, AlertCircle, Clock, Server, CheckCircle2, XCircle, Search, RefreshCw, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase';
import { useToast } from '../../hooks/useToast';

interface ScraperLog {
  id: string;
  platform: string;
  url: string;
  status: 'success' | 'error';
  error_message: string | null;
  response_time_ms: number;
  metadata: any;
  created_at: string;
}

const ScraperLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [isRepairing, setIsRepairing] = useState(false);
  const { success, error: toastError } = useToast();

  const fetchStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/scraper-status', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnvStatus(data);
      }
    } catch (e) { console.error("Error fetching status:", e); }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    fetchStatus();
    const { data, error } = await supabase
      .from('scraper_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (data) setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);
  
  const handleRepairInstagram = async () => {
    setIsRepairing(true);
    try {
      // 1. Get all instagram items with 0 views (that are not deleted)
      const { data: zeros, error: fetchError } = await supabase
        .from('content')
        .select('id, url, platform')
        .eq('platform', 'instagram')
        .eq('views', 0)
        .is('deleted_at', null);

      if (fetchError) throw fetchError;
      if (!zeros || zeros.length === 0) {
        success("¡Genial! No se encontraron videos de Instagram con 0 views.");
        return;
      }

      success(`Reparando ${zeros.length} contenidos...`);

      // 2. Call refresh-metrics in chunks to avoid timeouts
      const { data: { session } } = await supabase.auth.getSession();
      const chunkSize = 15;
      let repairedCount = 0;

      for (let i = 0; i < zeros.length; i += chunkSize) {
        const chunk = zeros.slice(i, i + chunkSize);
        
        const res = await fetch('/api/refresh-metrics', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ items: chunk })
        });

        if (res.ok) {
          const result = await res.json();
          repairedCount += result.results_count || 0;
        }
      }

      success(`Reparación completada. ${repairedCount} ítems actualizados.`);
      fetchLogs();
    } catch (err: any) {
      toastError("Error al reparar: " + err.message);
    } finally {
      setIsRepairing(false);
    }
  };

  const stats = useMemo(() => {
    const last24h = logs.filter(l => new Date(l.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000);
    const successCount = last24h.filter(l => l.status === 'success').length;
    const errorCount = last24h.filter(l => l.status === 'error').length;
    const avgResponse = last24h.length ? Math.round(last24h.reduce((acc, l) => acc + (l.response_time_ms || 0), 0) / last24h.length) : 0;
    
    return {
      successRate: last24h.length ? Math.round((successCount / last24h.length) * 100) : 0,
      avgResponse,
      errorCount,
      total: last24h.length
    };
  }, [logs]);

  const filteredLogs = logs.filter(l => {
    const matchStatus = filter === 'all' || l.status === filter;
    const matchPlatform = platformFilter === 'all' || l.platform === platformFilter;
    return matchStatus && matchPlatform;
  });

  const platforms = Array.from(new Set(logs.map(l => l.platform)));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-indigo-600" /> Salud de Scrapers
          </h2>
          <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Diagnóstico técnico y monitoreo de APIs</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRepairInstagram}
            disabled={isRepairing}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm border ${
              isRepairing 
                ? 'bg-gray-100 text-gray-400 border-gray-100' 
                : 'bg-indigo-50/50 text-indigo-600 border-indigo-100/50 hover:bg-indigo-100/50'
            }`}
          >
            <Wrench className={`h-4 w-4 ${isRepairing ? 'animate-pulse' : ''}`} />
            {isRepairing ? 'Reparando...' : 'Reparar Instagram (0s)'}
          </button>
          
          <button 
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Environment Status Diagnostic */}
      {envStatus && (
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Server className="h-24 w-24 text-white" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Estado de Configuración (Vercel/API)</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(envStatus).map(([key, val]) => (
                <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                  val ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${val ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                  <span className="text-[8px] font-bold opacity-60">{val ? 'LISTO' : 'FALTA'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Tasa de Éxito (24h)', value: `${stats.successRate}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Latencia Media', value: `${stats.avgResponse}ms`, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Errores (24h)', value: stats.errorCount, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Total Logs', value: stats.total, icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 ${s.bg} rounded-2xl`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        {/* Header/Filters */}
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
              {['all', 'success', 'error'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s as any)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === s ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s === 'all' ? 'Todos' : s === 'success' ? 'Éxitos' : 'Errores'}
                </button>
              ))}
            </div>

            <select 
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">Plataformas</option>
              {platforms.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por URL o error..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-100 w-64"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status / Plataforma</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">URL / Detalles</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Latencia</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-500" />
                      )}
                      <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{log.platform}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-[11px] font-medium text-gray-900 truncate">{log.url}</p>
                    {log.error_message && (
                      <p className="text-[10px] font-bold text-rose-500 mt-1 line-clamp-1">{log.error_message}</p>
                    )}
                    {log.metadata?.provider && (
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tight mt-1 inline-block">Provider: {log.metadata.provider}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-black ${
                      (log.response_time_ms || 0) > 3000 ? 'text-amber-500' : 'text-gray-500'
                    }`}>
                      {log.response_time_ms ? `${log.response_time_ms}ms` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">
                    {new Date(log.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && !isLoading && (
          <div className="py-20 text-center">
            <Server className="h-10 w-10 text-gray-100 mx-auto mb-4" />
            <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No hay registros que coincidan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScraperLogsTab;
