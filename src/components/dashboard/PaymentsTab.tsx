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
        <div className="glass-dark p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-700">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
          <p className="relative z-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 italic">Total_Aggregated_Payout</p>
          <span className="relative z-10 text-4xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tighter tabular-nums">${filteredPayments.reduce((s, p) => s + Number(p.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="glass-dark p-8 rounded-[3rem] border border-white/5 group hover:border-white/20 transition-all duration-700">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 italic">Transaction_Records</p>
          <span className="text-4xl font-black text-white tabular-nums group-hover:text-emerald-400 transition-colors">{filteredPayments.length}</span>
        </div>
        <div className="glass-dark p-8 rounded-[3rem] border border-white/5 group hover:border-white/20 transition-all duration-700">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4 italic">Paid_Agents_Count</p>
          <span className="text-4xl font-black text-white tabular-nums group-hover:text-emerald-400 transition-colors">{new Set(filteredPayments.map(p => p.creator_id)).size}</span>
        </div>
      </div>

      {/* Add Payment Section */}
      <div className="glass-dark rounded-[3.5rem] border border-white/5 p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-[0.02] [background-size:20px_20px]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <DollarSign className="h-7 w-7 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Register_Payout_Protocol</h3>
          </div>
          <button 
            onClick={() => setIsAddingPayment(!isAddingPayment)} 
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 shadow-2xl ${isAddingPayment ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'}`}
          >
            {isAddingPayment ? 'Close_Form' : <><Plus className="h-4 w-4" /> Initialize_Transfer</>}
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
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Assigned_Agent</label>
                  <select required value={newPayment.creator_id} onChange={e => setNewPayment({...newPayment, creator_id: e.target.value})} className="w-full px-5 py-4 bg-slate-900/80 border border-white/5 rounded-2xl text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none appearance-none transition-all">
                    <option value="">Select_Agent *</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-slate-950">{u.admin_alias || u.display_name || u.email} [{u.role.toUpperCase()}]</option>
                    ))}
                    <option value="guest" className="bg-slate-950">External_Guest</option>
                  </select>
                </div>

                {newPayment.creator_id === 'guest' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Guest_ID</label>
                    <input required type="text" placeholder="GUEST_NAME_*" value={newPayment.guest_name} onChange={e => setNewPayment({...newPayment, guest_name: e.target.value})} className="w-full px-5 py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all" />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Payout_Amount</label>
                  <input required type="text" inputMode="decimal" placeholder="0.00 *" value={newPayment.amount} onChange={e => { const v = e.target.value; if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setNewPayment({...newPayment, amount: v}); }} className="w-full px-5 py-4 bg-slate-900/80 border border-white/5 rounded-2xl text-xs font-black text-emerald-400 uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all tabular-nums" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Asset_Unit</label>
                  <select value={newPayment.currency} onChange={e => setNewPayment({...newPayment, currency: e.target.value})} className="w-full px-5 py-4 bg-slate-900/80 border border-white/5 rounded-2xl text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none appearance-none transition-all">
                    <option value="USDT">USDT_STABLE</option>
                    <option value="BNB">BNB_NODE</option>
                    <option value="USD">USD_FIAT</option>
                    <option value="ETH">ETH_NETWORK</option>
                    <option value="SOL">SOL_NETWORK</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Operation_Context</label>
                  <select value={newPayment.campaign_id} onChange={e => setNewPayment({...newPayment, campaign_id: e.target.value})} className="w-full px-5 py-4 bg-slate-900/80 border border-white/5 rounded-2xl text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none appearance-none transition-all">
                    <option value="">STANDALONE_OP</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-950">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Timestamp</label>
                  <input required type="date" value={newPayment.paid_at} onChange={e => setNewPayment({...newPayment, paid_at: e.target.value})} className="w-full px-5 py-4 bg-slate-900/80 border border-white/5 rounded-2xl text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all invert brightness-200" />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Transfer_Manifest</label>
                  <input type="text" placeholder="CONCEPT_DESC" value={newPayment.concept} onChange={e => setNewPayment({...newPayment, concept: e.target.value})} className="w-full px-5 py-4 bg-slate-900/80 border border-white/5 rounded-2xl text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all italic" />
                </div>
              </div>
              <div className="flex justify-end pb-8 border-b border-white/5 mb-8">
                <button type="submit" className="px-12 py-5 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all duration-500 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)] italic">
                  Commit_Transaction_Entry
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Payments Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Agent_Entity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Aggregated_Value</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Asset_Unit</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Manifest</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Context</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.map(p => {
                const creator = usersById[p.creator_id];
                const camp = campaignsById[p.campaign_id];
                const canViewProfile = !!creator && !!onViewProfile;

                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group/row">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => canViewProfile && onViewProfile(p.creator_id)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-[10px] overflow-hidden transition-all duration-500 border border-white/5 ${
                            canViewProfile 
                              ? 'cursor-pointer hover:scale-110 hover:border-emerald-500/50 shadow-2xl' 
                              : ''
                          } ${!p.creator_id ? 'bg-slate-900 text-emerald-500' : 'bg-slate-900 text-white'}`}
                        >
                          {creator?.photo_url ? (
                            <img src={creator.photo_url} alt="" className="w-full h-full object-cover grayscale opacity-80 group-hover/row:grayscale-0 group-hover/row:opacity-100 transition-all duration-700" />
                          ) : (
                            !p.creator_id ? (p.guest_name?.charAt(0) || '?') : (creator?.display_name?.charAt(0) || '?')
                          )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <span 
                            onClick={() => canViewProfile && onViewProfile(p.creator_id)}
                            className={`text-sm font-black text-white uppercase tracking-tighter transition-colors ${
                              canViewProfile ? 'cursor-pointer group-hover/row:text-emerald-400' : ''
                            }`}
                          >
                            {!p.creator_id ? (
                              <>
                                {p.guest_name} 
                                <span className="ml-3 text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 italic">EXT_NODE</span>
                              </>
                            ) : (
                              creator?.admin_alias || creator?.display_name || creator?.email || 'SYSTEM_ERR'
                            )}
                          </span>
                          {creator?.role && (
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic leading-none">
                              LVL_{creator.role.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-base font-black text-emerald-400 tabular-nums">${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-8 py-6"><span className="px-3 py-1 bg-white text-slate-950 rounded-lg text-[9px] font-black uppercase tracking-widest italic">{p.currency}</span></td>
                    <td className="px-8 py-6 text-xs font-medium text-slate-400 italic max-w-[200px] truncate">{p.concept || '—'}</td>
                    <td className="px-8 py-6">{camp ? <span className="px-3 py-1 bg-slate-900 text-white border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest italic">{camp.name}</span> : '—'}</td>
                    <td className="px-8 py-6 text-[11px] font-black text-slate-500 tabular-nums">{new Date(p.paid_at).toLocaleDateString()}</td>
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
                    <div className="w-24 h-24 glass-dark rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                      <Wallet className="h-10 w-10 text-slate-800" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-[0.4em] italic">No_Transaction_Nodes_Detected</h3>
                    <p className="text-sm text-slate-600 mt-3 font-medium">Initialize new payout protocol or verify parameters.</p>
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
