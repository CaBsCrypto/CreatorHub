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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 relative overflow-hidden group hover:border-indigo-100 transition-all duration-300 shadow-sm">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <p className="relative z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Pagado</p>
          <span className="relative z-10 text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tighter tabular-nums">${filteredPayments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 group hover:border-indigo-100 transition-all duration-300 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Registros de Transacción</p>
          <span className="text-4xl font-black text-slate-900 tabular-nums group-hover:text-indigo-600 transition-colors">{filteredPayments.length}</span>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 group hover:border-indigo-100 transition-all duration-300 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Creadores Pagados</p>
          <span className="text-4xl font-black text-slate-900 tabular-nums group-hover:text-indigo-600 transition-colors">{new Set(filteredPayments.map(p => p.creator_id)).size}</span>
        </div>
      </div>

      {/* Add Payment Section */}
      <div className="bg-white rounded-[3rem] border border-gray-100 p-10 relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
              <DollarSign className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Registrar Pago</h3>
          </div>
          <button 
            onClick={() => setIsAddingPayment(!isAddingPayment)} 
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-md ${isAddingPayment ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {isAddingPayment ? 'Cerrar Formulario' : <><Plus className="h-4 w-4" /> Nuevo Pago</>}
          </button>
        </div>

        <AnimatePresence>
          {isAddingPayment && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden relative z-10"
              onSubmit={onSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Asignar a Creador</label>
                  <select required value={newPayment.creator_id} onChange={e => setNewPayment({...newPayment, creator_id: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-slate-900 uppercase tracking-widest focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none appearance-none transition-all">
                    <option value="">Seleccionar Creador *</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-white">{u.admin_alias || u.display_name || u.email}</option>
                    ))}
                    <option value="guest" className="bg-white">Invitado Externo</option>
                  </select>
                </div>

                {newPayment.creator_id === 'guest' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Invitado</label>
                    <input required type="text" placeholder="NOMBRE COMPLETO *" value={newPayment.guest_name} onChange={e => setNewPayment({...newPayment, guest_name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-slate-900 uppercase tracking-widest focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto del Pago</label>
                  <input required type="text" inputMode="decimal" placeholder="0.00 *" value={newPayment.amount} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setNewPayment({...newPayment, amount: v}); }} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-indigo-600 uppercase tracking-widest focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all tabular-nums" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Moneda / Activo</label>
                  <select value={newPayment.currency} onChange={e => setNewPayment({...newPayment, currency: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-slate-900 uppercase tracking-widest focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none appearance-none transition-all">
                    <option value="USDT">USDT</option>
                    <option value="BNB">BNB</option>
                    <option value="USD">USD</option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaña Asociada</label>
                  <select value={newPayment.campaign_id} onChange={e => setNewPayment({...newPayment, campaign_id: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-slate-900 uppercase tracking-widest focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none appearance-none transition-all">
                    <option value="">Operación General</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id} className="bg-white">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Pago</label>
                  <input required type="date" value={newPayment.paid_at} onChange={e => setNewPayment({...newPayment, paid_at: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-slate-900 uppercase tracking-widest focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Concepto / Referencia</label>
                  <input type="text" placeholder="DESCRIPCIÓN DEL PAGO" value={newPayment.concept} onChange={e => setNewPayment({...newPayment, concept: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-slate-900 uppercase tracking-widest focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all" />
                </div>
              </div>
              <div className="flex justify-end pb-8 border-b border-gray-100 mb-8">
                <button type="submit" className="px-12 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all duration-300 active:scale-95 shadow-lg">
                  Confirmar Transacción
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Payments Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Creador</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidad</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campaña</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map(p => {
                const creator = usersById[p.creator_id];
                const camp = campaignsById[p.campaign_id];
                const canViewProfile = !!creator && !!onViewProfile;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group/row">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => canViewProfile && onViewProfile(p.creator_id)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-[10px] overflow-hidden transition-all duration-300 border border-gray-100 ${
                            canViewProfile 
                              ? 'cursor-pointer hover:border-indigo-500/50' 
                              : ''
                          } bg-gray-50 text-indigo-600`}
                        >
                          {creator?.photo_url ? (
                            <img src={creator.photo_url} alt="" className="w-full h-full object-cover transition-all duration-300" />
                          ) : (
                            !p.creator_id ? (p.guest_name?.charAt(0) || '?') : (creator?.display_name?.charAt(0) || '?')
                          )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span 
                            onClick={() => canViewProfile && onViewProfile(p.creator_id)}
                            className={`text-sm font-black text-slate-900 uppercase tracking-tighter transition-colors ${
                              canViewProfile ? 'cursor-pointer group-hover/row:text-indigo-600' : ''
                            }`}
                          >
                            {!p.creator_id ? (
                              <>
                                {p.guest_name} 
                                <span className="ml-3 text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">EXTERNO</span>
                              </>
                            ) : (
                              creator?.admin_alias || creator?.display_name || creator?.email || 'ERROR'
                            )}
                          </span>
                          {creator?.role && (
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                              {creator.role.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-base font-black text-indigo-600 tabular-nums">${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-6"><span className="px-3 py-1 bg-gray-50 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100">{p.currency}</span></td>
                    <td className="px-8 py-6 text-xs font-medium text-slate-500 max-w-[200px] truncate">{p.concept || '—'}</td>
                    <td className="px-8 py-6">{camp ? <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[9px] font-black uppercase tracking-widest">{camp.name}</span> : '—'}</td>
                    <td className="px-8 py-6 text-[11px] font-black text-slate-400 tabular-nums">{new Date(p.paid_at).toLocaleDateString()}</td>/td>
                    <td className="px-8 py-6">
                      <button onClick={async () => {
                        if (!window.confirm('¿Eliminar este pago?')) return;
                        const { error } = await supabase.from('payments').delete().eq('id', p.id);
                        if (error) toastError('Error: ' + error.message);
                        else { success('Pago eliminado'); refresh(); }
                      }} className="p-3 text-slate-800 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-500 group-hover/row:scale-110"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-40 text-center">
                    <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm">
                      <Wallet className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">No se detectaron transacciones</h3>
                    <p className="text-sm text-slate-500 mt-3 font-medium">Inicia un nuevo protocolo de pago para comenzar.</p>
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
