import React from 'react';
import { Zap, RefreshCw, Trash2, ShieldCheck, DollarSign, AlertTriangle, ChevronRight } from 'lucide-react';

interface ActivityTabProps {
  groupedLogs: [string, any[]][];
  auditLogs: any[];
  refresh: () => void;
  onSelectLog: (log: any) => void;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ groupedLogs, auditLogs, refresh, onSelectLog }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 italic">
            <Zap className="h-6 w-6 text-indigo-600 animate-pulse" /> Registro de Actividad
          </h2>
          <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Historial de acciones administrativas en tiempo real</p>
        </div>
        <button 
          onClick={refresh}
          className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] relative">
        <div className="absolute left-12 top-0 bottom-0 w-[2px] bg-gray-50/50" />
        
        <div className="p-8 relative z-10">
          <div className="space-y-12">
            {groupedLogs.map(([date, logs]) => (
              <div key={date} className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-white px-4 py-1 rounded-full border border-gray-100 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {date}
                  </div>
                  <div className="flex-1 h-[1px] bg-gray-50" />
                </div>

                <div className="space-y-6">
                  {logs.map((log) => (
                    <div key={log.id} className="relative pl-12 group">
                      {/* Timeline Marker */}
                      <div className={`absolute left-[-5px] top-1 w-10 h-10 rounded-2xl flex items-center justify-center z-10 shadow-lg border-4 border-white transition-transform group-hover:scale-110 ${
                        log.action === 'SOFT_DELETE' ? 'bg-rose-500 text-white' :
                        log.action === 'RESTORE' ? 'bg-indigo-600 text-white' :
                        log.action === 'CHANGE_ROLE' ? 'bg-amber-500 text-white' :
                        log.action === 'PAYMENT_REGISTERED' ? 'bg-indigo-600 text-white' :
                        'bg-slate-700 text-white'
                      }`}>
                        {log.action === 'SOFT_DELETE' && <Trash2 className="h-4 w-4" />}
                        {log.action === 'RESTORE' && <RefreshCw className="h-4 w-4" />}
                        {log.action === 'CHANGE_ROLE' && <ShieldCheck className="h-4 w-4" />}
                        {log.action === 'PAYMENT_REGISTERED' && <DollarSign className="h-4 w-4" />}
                        {log.action === 'HARD_DELETE' && <AlertTriangle className="h-4 w-4" />}
                      </div>

                      <div 
                        onClick={() => onSelectLog(log)}
                        className="bg-gray-50/30 rounded-[2rem] p-6 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/20 transition-all duration-300 cursor-pointer group/card active:scale-[0.99]"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-base text-gray-900 leading-relaxed">
                              <span className="font-black text-indigo-600 group-hover/card:text-indigo-700">
                                {log.admin?.display_name || log.admin?.email?.split('@')[0] || 'Sistema'}
                              </span>
                              {' '}
                              <span className="text-gray-500 font-medium">
                                {log.action === 'SOFT_DELETE' ? 'ha enviado a la papelera' :
                                 log.action === 'RESTORE' ? 'ha restaurado' :
                                 log.action === 'CHANGE_ROLE' ? 'ha actualizado el rol de' :
                                 log.action === 'PAYMENT_REGISTERED' ? 'ha registrado un nuevo pago para' :
                                 log.action === 'METRICS_ADJUSTED' ? 'ha ajustado métricas de' :
                                 'ha modificado'}
                              </span>
                              {' '}
                              <span className="font-black text-gray-900 underline decoration-indigo-200 underline-offset-4 decoration-2 group-hover/card:decoration-indigo-400 transition-colors">
                                {(() => {
                                  const d = log.details;
                                  if (typeof d === 'string' && d.trim().length > 0) {
                                    return d.includes('Contenido') ? 'Contenido' : (d.split(' ').slice(-1)[0] || 'un elemento');
                                  }
                                  // Handle legacy object details or null/undef
                                  if (d && typeof d === 'object') {
                                    return (d as any).name || (d as any).table || 'un elemento';
                                  }
                                  return 'un elemento';
                                })()}
                              </span>
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-gray-50 shadow-sm group-hover/card:border-indigo-50">
                                {log.created_at ? new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </span>
                              <span className="text-[9px] font-black text-indigo-400 opacity-60 uppercase tracking-widest group-hover/card:opacity-100 transition-opacity">
                                Módulo: {log.target_type || 'SYSTEM'}
                              </span>
                              {log.target_id && (
                                <span className="text-[8px] text-gray-300 font-bold uppercase tracking-tight group-hover/card:text-indigo-200 transition-colors">
                                  ID Ref: {log.target_id.slice(0,8)}
                                </span>
                              )}
                              <div className="ml-auto opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <ChevronRight className="h-4 w-4 text-indigo-400" />
                              </div>
                            </div>
                          </div>

                          <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                            log.action === 'SOFT_DELETE' ? 'bg-rose-50 text-rose-600' :
                            log.action === 'RESTORE' ? 'bg-emerald-50 text-emerald-600' :
                            log.action === 'CHANGE_ROLE' ? 'bg-amber-50 text-amber-600' :
                            log.action === 'PAYMENT_REGISTERED' ? 'bg-indigo-50 text-indigo-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {log.action.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {auditLogs.length === 0 && (
              <div className="py-40 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-10 w-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Sin actividad</h3>
                <p className="text-sm font-medium text-gray-400 italic">No hay acciones registradas que mostrar hoy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTab;
