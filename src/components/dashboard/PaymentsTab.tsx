import React from 'react';
import { DollarSign, Plus, Wallet, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabase';

interface PaymentsTabProps {
  filteredPayments: any[];
  isAddingPayment: boolean;
  setIsAddingPayment: (val: boolean) => void;
  newPayment: any;
  setNewPayment: (val: any) => void;
  users: any[];
  campaigns: any[];
  refresh: () => void;
  success: (msg: string) => void;
  toastError: (msg: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({
  filteredPayments,
  isAddingPayment,
  setIsAddingPayment,
  newPayment,
  setNewPayment,
  users,
  campaigns,
  refresh,
  success,
  toastError,
  onSubmit
}) => {
  const usersById = React.useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);
  const campaignsById = React.useMemo(() => Object.fromEntries(campaigns.map(c => [c.id, c])), [campaigns]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <p className="relative z-10 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Pagado</p>
          <span className="relative z-10 text-3xl font-black text-gray-900">${filteredPayments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pagos Registrados</p>
          <span className="text-3xl font-black text-gray-900">{filteredPayments.length}</span>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Creadores Pagados</p>
          <span className="text-3xl font-black text-gray-900">{new Set(filteredPayments.map(p => p.creator_id)).size}</span>
        </div>
      </div>

      {/* Add Payment */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2"><DollarSign className="h-5 w-5 text-emerald-500" /> Registrar Pago</h3>
            {/* Calculator removed per user request */}
          </div>
          <button onClick={() => setIsAddingPayment(!isAddingPayment)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95">
            <Plus className="h-4 w-4" /> Nuevo Pago
          </button>
        </div>

        <AnimatePresence>
          {isAddingPayment && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
              onSubmit={onSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                <select required value={newPayment.creator_id} onChange={e => setNewPayment({...newPayment, creator_id: e.target.value})} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Creador *</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.admin_alias || u.display_name || u.email} ({u.role})</option>
                  ))}
                  <option value="guest">Externo / Invitado</option>
                </select>
                {newPayment.creator_id === 'guest' && (
                  <input required type="text" placeholder="Nombre Invitado *" value={newPayment.guest_name} onChange={e => setNewPayment({...newPayment, guest_name: e.target.value})} className="px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                )}
                <input required type="text" inputMode="decimal" placeholder="Monto *" value={newPayment.amount} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setNewPayment({...newPayment, amount: v}); }} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={newPayment.currency} onChange={e => setNewPayment({...newPayment, currency: e.target.value})} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="USDT">USDT</option>
                  <option value="BNB">BNB</option>
                  <option value="USD">USD</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                </select>
                <input type="text" placeholder="Concepto" value={newPayment.concept} onChange={e => setNewPayment({...newPayment, concept: e.target.value})} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={newPayment.campaign_id} onChange={e => setNewPayment({...newPayment, campaign_id: e.target.value})} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Campaña (opcional)</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input required type="date" value={newPayment.paid_at} onChange={e => setNewPayment({...newPayment, paid_at: e.target.value})} className="px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex justify-end pb-6 border-b border-gray-50 mb-6">
                <button type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100">✓ Guardar Pago</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Creador</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Moneda</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Concepto</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaña</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map(p => {
                const creator = usersById[p.creator_id];
                const camp = campaignsById[p.campaign_id];
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs overflow-hidden ${!p.creator_id ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {creator?.photo_url ? <img src={creator.photo_url} alt="" className="w-full h-full object-cover" /> : (!p.creator_id ? (p.guest_name?.charAt(0) || '?') : (creator?.display_name?.charAt(0) || '?'))}
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {!p.creator_id ? (
                            <>{p.guest_name} <span className="ml-2 text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">Externo</span></>
                          ) : (
                            creator?.admin_alias || creator?.display_name || creator?.email || 'Desconocido'
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-600 uppercase">{p.currency}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.concept || '—'}</td>
                    <td className="px-6 py-4">{camp ? <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">{camp.name}</span> : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.paid_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button onClick={async () => {
                        if (!window.confirm('¿Eliminar este pago?')) return;
                        const { error } = await supabase.from('payments').delete().eq('id', p.id);
                        if (error) toastError('Error: ' + error.message);
                        else { success('Pago eliminado'); refresh(); }
                      }} className="p-2 text-gray-300 hover:text-rose-500 rounded-xl transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Wallet className="h-8 w-8 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900">No hay pagos coincidentes</h3>
                    <p className="text-sm text-gray-400">Intenta cambiar los filtros seleccionados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
