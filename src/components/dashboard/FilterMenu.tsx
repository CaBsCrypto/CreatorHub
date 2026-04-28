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
          <div className="fixed inset-0 z-40 bg-slate-900/5 backdrop-blur-[1px]" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute left-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-50 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuración Filtros</h4>
              <button onClick={() => resetFilters()} className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-700 transition-colors tracking-widest underline underline-offset-4">Limpiar</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Plataforma</label>
                <select value={platform} onChange={e => setFilter('platform', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-widest focus:border-indigo-300 outline-none transition-all cursor-pointer appearance-none">
                  <option value="all">Todas</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="stream">Streams</option>
                  <option value="x">X / Twitter</option>
                  <option value="coinmarketcap">CoinMarketCap</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaña</label>
                <select value={campaign} onChange={e => setFilter('campaign', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-widest focus:border-indigo-300 outline-none transition-all cursor-pointer appearance-none">
                  <option value="all">Todas</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Creador / Agente</label>
                <select value={creator} onChange={e => setFilter('creator', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-widest focus:border-indigo-300 outline-none transition-all cursor-pointer appearance-none">
                  <option value="all">Todos</option>
                  
                  <optgroup label="Personal" className="bg-white text-slate-400">
                    {users.filter(u => u.role !== 'client').map(u => (
                      <option key={u.id} value={u.id} className="text-slate-700">
                        {u.admin_alias || u.display_name || u.email.split('@')[0]} [{u.role.toUpperCase()}]
                      </option>
                    ))}
                  </optgroup>

                  {content.some(c => !c.creator_id && c.guest_name) && (
                    <optgroup label="Invitados" className="bg-white text-slate-400">
                      {[...new Set(content.filter(c => !c.creator_id && c.guest_name).map(c => c.guest_name))].map(name => (
                        <option key={name} value={`guest:${name}`} className="text-slate-700">{name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {(activeTab === 'payments' || activeTab === 'team') && (
                <div className="pt-4 border-t border-gray-50 mt-2 space-y-4">
                   {activeTab === 'payments' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciclo de Pago</label>
                      <select value={pay_month} onChange={e => setFilter('pay_month', e.target.value)} className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 text-xs font-bold text-indigo-600 uppercase tracking-widest focus:border-indigo-300 outline-none transition-all cursor-pointer appearance-none">
                        <option value="all">Todos</option>
                        {[...new Set(payments.map(p => p.paid_at.substring(0, 7)))].sort().reverse().map(month => (
                          <option key={month} value={month}>{new Date(month + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</option>
                        ))}
                      </select>
                    </div>
                   )}

                   {activeTab === 'team' && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol / Nivel</label>
                      <select value={team_role} onChange={e => setFilter('team_role', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-widest focus:border-indigo-300 outline-none transition-all cursor-pointer appearance-none">
                        <option value="all">Todos</option>
                        <option value="staff">Staff (Admin/Manager)</option>
                        <option value="creator">Agentes (Creadores)</option>
                        <option value="client">Clientes</option>
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
