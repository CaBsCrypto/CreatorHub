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
  onViewProfile?: (userId: string) => void;
}

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition-all placeholder:text-slate-400";
const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1";

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
  onSubmit,
  onViewProfile
}) => {
  const usersById = React.useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);
  const campaignsById = React.useMemo(() => Object.fromEntries(campaigns.map(c => [c.id, c])), [campaigns]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pago Total</p>
          <span className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tabular-nums">
            ${filteredPayments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Transacciones</p>
          <span className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tabular-nums">{filteredPayments.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Creadores Pagados</p>
          <span className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tabular-nums">{new Set(filteredPayments.map(p => p.creator_id)).size}</span>
        </div>
      </div>

      {/* Add Payment Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Registrar Pago</h3>
          </div>
          <button
            onClick={() => setIsAddingPayment(!isAddingPayment)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
              isAddingPayment
                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
            }`}
          >
            {isAddingPayment ? 'Cerrar' : <><Plus className="h-4 w-4" /> Nuevo Pago</>}
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
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Creador</label>
                    <select required value={newPayment.creator_id} onChange={e => setNewPayment({...newPayment, creator_id: e.target.value})} className={inputClass}>
                      <option value="">Seleccionar creador *</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.admin_alias || u.display_name || u.email} [{u.role.toUpperCase()}]</option>
                      ))}
                      <option value="guest">Externo / Invitado</option>
                    </select>
                  </div>

                  {newPayment.creator_id === 'guest' && (
                    <div className="space-y-1.5">
                      <label className={labelClass}>Nombre Invitado</label>
                      <input required type="text" placeholder="Nombre *" value={newPayment.guest_name} onChange={e => setNewPayment({...newPayment, guest_name: e.target.value})} className={inputClass} />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className={labelClass}>Monto</label>
                    <input required type="text" inputMode="decimal" placeholder="0.00 *" value={newPayment.amount} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setNewPayment({...newPayment, amount: v}); }} className={inputClass} />
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>Moneda</label>
                    <select value={newPayment.currency} onChange={e => setNewPayment({...newPayment, currency: e.target.value})} className={inputClass}>
                      <option value="USDT">USDT</option>
                      <option value="BNB">BNB</option>
                      <option value="USD">USD</option>
                      <option value="ETH">ETH</option>
                      <option value="SOL">SOL</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>Campaña</label>
                    <select value={newPayment.campaign_id} onChange={e => setNewPayment({...newPayment, campaign_id: e.target.value})} className={inputClass}>
                      <option value="">Sin campaña</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>Fecha</label>
                    <input required type="date" value={newPayment.paid_at} onChange={e => setNewPayment({...newPayment, paid_at: e.target.value})} className={inputClass} />
                  </div>

                  <div className="space-y-1.5 lg:col-span-2">
                    <label className={labelClass}>Concepto</label>
                    <input type="text" placeholder="Descripción del pago" value={newPayment.concept} onChange={e => setNewPayment({...newPayment, concept: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100">
                    Registrar Pago
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creador</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Moneda</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaña</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map(p => {
                const creator = usersById[p.creator_id];
                const camp = campaignsById[p.campaign_id];
                const canViewProfile = !!creator && !!onViewProfile;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group/row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => canViewProfile && onViewProfile(p.creator_id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] overflow-hidden border border-gray-100 bg-gray-50 text-slate-600 ${
                            canViewProfile ? 'cursor-pointer hover:border-indigo-200 hover:text-indigo-600 transition-all' : ''
                          }`}
                        >
                          {creator?.photo_url ? (
                            <img src={creator.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            !p.creator_id ? (p.guest_name?.charAt(0) || '?') : (creator?.display_name?.charAt(0) || '?')
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span
                            onClick={() => canViewProfile && onViewProfile(p.creator_id)}
                            className={`text-sm font-black text-slate-900 uppercase tracking-tight ${
                              canViewProfile ? 'cursor-pointer group-hover/row:text-indigo-600 transition-colors' : ''
                            }`}
                          >
                            {!p.creator_id ? (
                              <>
                                {p.guest_name}
                                <span className="ml-2 text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Ext.</span>
                              </>
                            ) : (
                              creator?.admin_alias || creator?.display_name || creator?.email || '—'
                            )}
                          </span>
                          {creator?.role && (
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {creator.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base font-black text-indigo-600 tabular-nums">${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 bg-gray-50 text-slate-700 border border-gray-100 rounded-lg text-[9px] font-black uppercase tracking-widest">{p.currency}</span></td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500 max-w-[180px] truncate">{p.concept || '—'}</td>
                    <td className="px-6 py-4">{camp ? <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[9px] font-black uppercase tracking-widest">{camp.name}</span> : '—'}</td>
                    <td className="px-6 py-4 text-[11px] font-black text-slate-500 tabular-nums">{new Date(p.paid_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button onClick={async () => {
                        if (!window.confirm('¿Eliminar este pago?')) return;
                        const { error } = await supabase.from('payments').delete().eq('id', p.id);
                        if (error) toastError('Error: ' + error.message);
                        else { success('Pago eliminado'); refresh(); }
                      }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <Wallet className="h-7 w-7 text-slate-400" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Sin pagos</h3>
                    <p className="text-sm text-slate-500 mt-1">Registra el primer pago con el botón de arriba.</p>
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
