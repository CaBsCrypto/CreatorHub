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
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 top-full mt-3 w-[320px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 z-50 space-y-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Ajustar Vista</h4>
              <button onClick={() => resetFilters()} className="text-[10px] font-black text-rose-500 uppercase hover:underline">Limpiar</button>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-50 pb-2 mb-2">
                 <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Filtros Globales</h5>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Plataforma</label>
                <select value={platform} onChange={e => setFilter('platform', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="all">Todas las plataformas</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                   <option value="stream">Streams</option>
                  <option value="x">X / Twitter</option>
                  <option value="coinmarketcap">CoinMarketCap</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Campaña</label>
                <select value={campaign} onChange={e => setFilter('campaign', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="all">Todas las campañas</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Colaborador / Invitado</label>
                <select value={creator} onChange={e => setFilter('creator', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="all">Todos los colaboradores</option>
                  
                  <optgroup label="Equipo (Cuentas)">
                    {users.filter(u => u.role !== 'client').map(u => (
                      <option key={u.id} value={u.id}>
                        {u.admin_alias || u.display_name || u.email.split('@')[0]} ({u.role})
                      </option>
                    ))}
                  </optgroup>

                  {content.some(c => !c.creator_id && c.guest_name) && (
                    <optgroup label="Invitados (Manuales)">
                      {[...new Set(content.filter(c => !c.creator_id && c.guest_name).map(c => c.guest_name))].map(name => (
                        <option key={name} value={`guest:${name}`}>{name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {(activeTab === 'payments' || activeTab === 'team') && (
                <div className="pt-4 border-t border-gray-100 mt-2">
                   <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Filtros Específicos ({activeTab})</h5>
                   
                   {activeTab === 'payments' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Mes del Pago</label>
                      <select value={pay_month} onChange={e => setFilter('pay_month', e.target.value)} className="w-full bg-indigo-50/50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="all">Todos los meses</option>
                        {[...new Set(payments.map(p => p.paid_at.substring(0, 7)))].sort().reverse().map(month => (
                          <option key={month} value={month}>{new Date(month + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</option>
                        ))}
                      </select>
                    </div>
                   )}

                   {activeTab === 'team' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Rol del Miembro</label>
                      <select value={team_role} onChange={e => setFilter('team_role', e.target.value)} className="w-full bg-rose-50/50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-rose-700 focus:ring-2 focus:ring-rose-500 outline-none">
                        <option value="all">Todos los roles</option>
                        <option value="staff">Staff (Admin/Manager)</option>
                        <option value="creator">Creadores</option>
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
