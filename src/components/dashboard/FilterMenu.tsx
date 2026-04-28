import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
  campaigns: any[];
  users: any[];
  content: any[];
  payments: any[];
  activeTab: string;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ 
  isOpen, 
  onClose, 
  filters, 
  setFilter, 
  resetFilters, 
  campaigns, 
  users, 
  content,
  payments,
  activeTab
}) => {
  const { platform, campaign, creator, pay_month, team_role } = filters;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 top-full mt-5 w-[360px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 z-50 space-y-8"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros de Sistema</h4>
              <button onClick={() => resetFilters()} className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-700 transition-colors tracking-widest underline underline-offset-4">Limpiar Todo</button>
            </div>

            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-4">
                 <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Parámetros Globales</h5>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Plataforma</label>
                <select value={platform} onChange={e => setFilter('platform', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-black text-slate-900 uppercase tracking-widest focus:border-indigo-500/50 outline-none transition-all cursor-pointer appearance-none">
                  <option value="all">Todas las Redes</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                   <option value="stream">Streams</option>
                  <option value="x">X / Twitter</option>
                  <option value="coinmarketcap">CoinMarketCap</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contexto de Campaña</label>
                <select value={campaign} onChange={e => setFilter('campaign', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-black text-slate-900 uppercase tracking-widest focus:border-indigo-500/50 outline-none transition-all cursor-pointer appearance-none">
                  <option value="all">Todas las Campañas</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Agente Asignado</label>
                <select value={creator} onChange={e => setFilter('creator', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-black text-slate-900 uppercase tracking-widest focus:border-indigo-500/50 outline-none transition-all cursor-pointer appearance-none">
                  <option value="all">Todo el Personal</option>
                  
                  <optgroup label="Entidades de Red" className="bg-white text-slate-400">
                    {users.filter(u => u.role !== 'client').map(u => (
                      <option key={u.id} value={u.id} className="text-slate-900">
                        {u.admin_alias || u.display_name || u.email.split('@')[0]} [{u.role.toUpperCase()}]
                      </option>
                    ))}
                  </optgroup>

                  {content.some(c => !c.creator_id && c.guest_name) && (
                    <optgroup label="Invitados" className="bg-white text-slate-400">
                      {[...new Set(content.filter(c => !c.creator_id && c.guest_name).map(c => c.guest_name))].map(name => (
                        <option key={name} value={`guest:${name}`} className="text-slate-900">{name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {(activeTab === 'payments' || activeTab === 'team') && (
                <div className="pt-6 border-t border-gray-100 mt-4 space-y-6">
                   <h5 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2 italic">Reglas Específicas</h5>
                   
                   {activeTab === 'payments' && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciclo de Facturación</label>
                      <select value={pay_month} onChange={e => setFilter('pay_month', e.target.value)} className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 text-xs font-black text-indigo-600 uppercase tracking-widest focus:border-indigo-500/50 outline-none transition-all cursor-pointer appearance-none">
                        <option value="all">Todos los Ciclos</option>
                        {[...new Set(payments.map(p => p.paid_at.substring(0, 7)))].sort().reverse().map(month => (
                          <option key={month} value={month}>{new Date(month + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</option>
                        ))}
                      </select>
                    </div>
                   )}

                   {activeTab === 'team' && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nivel de Acceso</label>
                      <select value={team_role} onChange={e => setFilter('team_role', e.target.value)} className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 text-xs font-black text-indigo-600 uppercase tracking-widest focus:border-indigo-500/50 outline-none transition-all cursor-pointer appearance-none">
                        <option value="all">Todos los Niveles</option>
                        <option value="staff">Staff (Admin/Manager)</option>
                        <option value="creator">Creadores</option>
                        <option value="client">Entidades Cliente</option>
                      </select>
                    </div>
                   )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterMenu;
