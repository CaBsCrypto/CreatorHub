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

  return     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
            <ShieldCheck className="h-6 w-6 text-indigo-600" /> Salud de Scrapers
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">Diagnóstico técnico y monitoreo de APIs</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRepairInstagram}
            disabled={isRepairing}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md border ${
              isRepairing 
                ? 'bg-gray-100 text-gray-400 border-gray-100' 
                : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'
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
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Server className="h-32 w-32 text-indigo-600" />
          </div>
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">Estado de Configuración (Vercel/API)</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(envStatus).map(([key, val]) => (
                <div key={key} className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
                  val ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${val ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'} animate-pulse`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                  <div className="h-4 w-[1px] bg-indigo-200/50" />
                  <span className="text-[9px] font-bold opacity-60">{val ? 'LISTO' : 'FALTA'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Tasa de Éxito (24h)', value: `${stats.successRate}%`, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Latencia Media', value: `${stats.avgResponse}ms`, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Errores (24h)', value: stats.errorCount, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Total Logs', value: stats.total, icon: Activity, color: 'text-slate-500', bg: 'bg-gray-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-lg transition-all duration-300">
            <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center border border-transparent group-hover:border-indigo-100`}>
              <s.icon className={`h-7 w-7 ${s.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        {/* Header/Filters */}
        <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
              {['all', 'success', 'error'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s as any)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === s ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {s === 'all' ? 'Todos' : s === 'success' ? 'Éxitos' : 'Errores'}
                </button>
              ))}
            </div>

            <select 
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-white border border-gray-100 rounded-2xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm"
            >
              <option value="all">Plataformas</option>
              {platforms.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por URL o error..."
              className="pl-11 pr-5 py-3 bg-white border border-gray-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-100 w-72 shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Plataforma</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">URL / Detalles</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Latencia</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${
                        log.status === 'success' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-rose-50 border-rose-100 text-rose-500'
                      }`}>
                        {log.status === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{log.platform}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-md">
                    <p className="text-[11px] font-bold text-slate-900 truncate tracking-tight">{log.url}</p>
                    {log.error_message && (
                      <p className="text-[10px] font-black text-rose-500 mt-1 line-clamp-1 uppercase tracking-tight italic opacity-80">{log.error_message}</p>
                    )}
                    {log.metadata?.provider && (
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1.5 inline-block bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">PROV: {log.metadata.provider}</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`text-[11px] font-black px-3 py-1 rounded-lg tabular-nums border ${
                      (log.response_time_ms || 0) > 3000 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-gray-50 text-slate-500 border-gray-100'
                    }`}>
                      {log.response_time_ms ? `${log.response_time_ms}ms` : '—'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      {new Date(log.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && !isLoading && (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm">
               <Server className="h-10 w-10 text-slate-200" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No hay registros que coincidan</p>
          </div>
        )}
      </div>
    </div>        )}
      </div>
    </div>
  );
};

export default ScraperLogsTab;
