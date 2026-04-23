import React, { useState } from 'react';
import { 
  X, Users, Mail, ShieldCheck, Calendar, Wallet, DollarSign,
  Trash2, AlertTriangle, CheckCircle2, 
  ExternalLink, Youtube, Instagram, Zap, Globe, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, Content, supabase, UserRole, Payment } from '../../supabase';
import { useToast } from '../../hooks/useToast';

interface UserHistoryModalProps {
  user: UserProfile | null;
  onClose: () => void;
  userContent: Content[];
  userPayments?: Payment[];
  onUpdateRole: (newRole: UserRole) => Promise<void>;
  onRemoveUser: () => Promise<void>;
  onUpdateAlias?: (alias: string) => Promise<void>;
  onUpdatePayment?: (data: Partial<UserProfile>) => Promise<void>;
  onRegisterPayment?: (creatorId: string) => void;
}

export default function UserHistoryModal({ 
  user, 
  onClose, 
  userContent, 
  userPayments,
  onUpdateRole, 
  onRemoveUser,
  onUpdateAlias,
  onUpdatePayment,
  onRegisterPayment
}: UserHistoryModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(user?.role);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminAlias, setAdminAlias] = useState(user?.admin_alias || '');
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editPaymentData, setEditPaymentData] = useState<Partial<UserProfile>>({});
  const { success, error: toastError } = useToast();

  // Sync values when user changes
  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setAdminAlias(user.admin_alias || '');
      setEditPaymentData({
        payment_method: user.payment_method,
        binance_id: user.binance_id || '',
        wallet_address: user.wallet_address || '',
        wallet_network: user.wallet_network || '',
        wallet_note: user.wallet_note || '',
        wallet_address_2: user.wallet_address_2 || '',
        wallet_network_2: user.wallet_network_2 || '',
        wallet_2_note: user.wallet_2_note || ''
      });
    }
  }, [user]);

  if (!user) return null;

  const handleDelete = async () => {
    if (deleteConfirmStep < 2) {
      setDeleteConfirmStep(prev => prev + 1);
      return;
    }
    setIsUpdating(true);
    await onRemoveUser();
    setIsUpdating(false);
    onClose();
  };

  const handleSaveRole = async () => {
    if (selectedRole === user.role) return;
    setIsUpdating(true);
    await onUpdateRole(selectedRole);
    setIsUpdating(false);
  };

  const roles: UserRole[] = ['creator', 'manager', 'admin'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-slate-950/80 backdrop-blur-xl ring-1 ring-white/10 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Decoration */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${
          user.role === 'admin' ? 'bg-rose-500' : 
          user.role === 'manager' ? 'bg-amber-500' : 'bg-emerald-500'
        }`} />
        
        {/* Modal Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10 ${
              !user.photo_url ? (
                user.role === 'admin' ? 'bg-rose-500/10 text-rose-500' : 
                user.role === 'manager' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
              ) : ''
            }`}>
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.display_name || ''} className="w-full h-full object-cover" />
              ) : (
                <Users className="h-10 w-10" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
                {user.display_name || user.email.split('@')[0]}
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  user.role === 'admin' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                  user.role === 'manager' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                }`}>
                  {user.role}
                </span>
              </h2>
              <div className="flex items-center gap-4 mt-2 text-slate-500 font-bold font-mono text-[10px] uppercase tracking-widest">
                <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5"><Mail className="h-3.5 w-3.5 text-indigo-400" /> {user.email}</span>
                <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5"><Calendar className="h-3.5 w-3.5 text-emerald-400" /> Node Active Since {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Alias Editor */}
            {onUpdateAlias && (
              <div className="mt-6 flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 max-w-sm">
                <div className="flex-1">
                  <label className="block text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Internal Alias</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ALPHA-CREATOR"
                    value={adminAlias}
                    onChange={(e) => setAdminAlias(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:ring-1 focus:ring-emerald-500/50 outline-none font-mono uppercase placeholder:text-slate-800"
                  />
                </div>
                <button 
                  onClick={async () => {
                    setIsUpdating(true);
                    await onUpdateAlias(adminAlias);
                    setIsUpdating(false);
                  }}
                  disabled={isUpdating || adminAlias === user.admin_alias}
                  className="mt-4 px-4 py-3 bg-indigo-600/10 text-indigo-400 font-black uppercase tracking-[0.2em] rounded-xl text-[9px] border border-indigo-500/20 hover:bg-indigo-600 hover:text-white disabled:opacity-50 transition-all shadow-lg"
                >
                  {isUpdating ? 'SYNC...' : 'UPDATE'}
                </button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/5 text-slate-400 transition-all hover:rotate-90">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-8 pb-8 flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area: History */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" /> Operational History
              </h3>
              
              <div className="space-y-3">
                {userContent.length > 0 ? (
                  userContent.map((item, i) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-white/5 rounded-[1.5rem] border border-white/5 flex items-center justify-between hover:bg-white/10 hover:border-white/10 transition-all group/item"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm border border-white/5">
                          {item.platform === 'youtube' ? <Youtube className="h-6 w-6 text-red-500" /> :
                           item.platform === 'instagram' ? <Instagram className="h-6 w-6 text-pink-500" /> :
                           <Globe className="h-6 w-6 text-indigo-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white line-clamp-1 uppercase tracking-tight">{item.title || 'Contenido'}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                            {new Date(item.created_at).toLocaleDateString()} • {(item.views || 0).toLocaleString()} impressions
                          </p>
                        </div>
                      </div>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-slate-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                    <Zap className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest text-[10px]">No active telemetry data detected.</p>
                  </div>
                )}
              </div>
            </div>

            {userPayments !== undefined && (
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" /> Disbursement Ledger
                </h3>
                <div className="space-y-3">
                  {userPayments.length > 0 ? (
                    userPayments.map((p, i) => (
                      <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 bg-emerald-500/5 rounded-[1.5rem] border border-emerald-500/10 flex flex-col gap-2 hover:bg-emerald-500/10 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-emerald-400 font-mono">${p.amount} {p.currency}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-1 rounded-full border border-white/5">
                            {new Date(p.paid_at).toLocaleDateString()}
                          </span>
                        </div>
                        {p.concept && <p className="text-xs font-medium text-slate-400 italic">{p.concept}</p>}
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                      <Wallet className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Zero historical disbursements</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area: Management */}
          <div className="space-y-8">
            {/* Payment Information */}
            <div className="bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <Wallet className="h-3 w-3" /> Settlement Protocol
                </h3>
                {onUpdatePayment && (
                  <button 
                    onClick={() => setIsEditingPayment(!isEditingPayment)} 
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {isEditingPayment ? 'Abort' : 'Config'}
                  </button>
                )}
              </div>
              
              {isEditingPayment ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Gateway Method</label>
                    <div className="flex gap-2">
                      {(['binance', 'wallet'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setEditPaymentData(prev => ({ ...prev, payment_method: m }))}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            editPaymentData.payment_method === m 
                              ? 'bg-emerald-600 text-white border-emerald-600' 
                              : 'bg-white/5 text-emerald-400 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {m === 'binance' ? 'Binance' : 'Wallet'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {editPaymentData.payment_method === 'binance' ? (
                    <div>
                      <label className="block text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Binance Protocol ID</label>
                      <input 
                        type="text" 
                        value={editPaymentData.binance_id}
                        onChange={(e) => setEditPaymentData(prev => ({ ...prev, binance_id: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none font-mono"
                        placeholder="Binance ID"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Network (Primary)</label>
                          <input 
                            type="text" 
                            value={editPaymentData.wallet_network}
                            onChange={(e) => setEditPaymentData(prev => ({ ...prev, wallet_network: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none font-mono"
                            placeholder="e.g., Solana"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Tag (Primary)</label>
                          <input 
                            type="text" 
                            value={editPaymentData.wallet_note}
                            onChange={(e) => setEditPaymentData(prev => ({ ...prev, wallet_note: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none font-mono"
                            placeholder="Main Node"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Address (Primary)</label>
                        <input 
                          type="text" 
                          value={editPaymentData.wallet_address}
                          onChange={(e) => setEditPaymentData(prev => ({ ...prev, wallet_address: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none font-mono"
                          placeholder="0x..."
                        />
                      </div>
                    </>
                  )}

                  {/* Wallet 2 Section - Always editable if exists or if adding */}
                  <div className="pt-4 border-t border-emerald-500/20 mt-4">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Auxiliary Destination (Optional)</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Network (Aux)</label>
                        <input 
                          type="text" 
                          value={editPaymentData.wallet_network_2 || ''}
                          onChange={(e) => setEditPaymentData(prev => ({ ...prev, wallet_network_2: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none font-mono"
                          placeholder="e.g., Ethereum"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Tag (Aux)</label>
                        <input 
                          type="text" 
                          value={editPaymentData.wallet_2_note || ''}
                          onChange={(e) => setEditPaymentData(prev => ({ ...prev, wallet_2_note: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none font-mono"
                          placeholder="Secondary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Address (Aux)</label>
                      <input 
                        type="text" 
                        value={editPaymentData.wallet_address_2 || ''}
                        onChange={(e) => setEditPaymentData(prev => ({ ...prev, wallet_address_2: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white focus:ring-2 focus:ring-emerald-500/50 outline-none font-mono"
                        placeholder="0x..."
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      setIsUpdating(true);
                      await onUpdatePayment?.(editPaymentData);
                      setIsUpdating(false);
                      setIsEditingPayment(false);
                    }}
                    disabled={isUpdating}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isUpdating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                    Confirm Settlement Logic
                  </button>
                </div>
              ) : !user.payment_method ? (
                <div className="text-center py-4">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">No configurado</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <p className="text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Protocol</p>
                    <p className="text-xs font-black text-white uppercase tracking-wider">
                      {user.payment_method === 'binance' ? 'Binance Pay' : 'Digital Asset Wallet'}
                    </p>
                  </div>

                  {user.payment_method === 'binance' ? (
                    <div>
                      <p className="text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-1">Binance Access ID</p>
                      <div className="flex items-center justify-between gap-2 p-2 bg-white/5 rounded-lg border border-white/10">
                        <code className="text-[10px] font-bold text-emerald-400 truncate font-mono">{user.binance_id}</code>
                        <button 
                          onClick={() => {
                            if (user.binance_id) {
                              navigator.clipboard.writeText(user.binance_id);
                              success("Copied: " + user.binance_id);
                            }
                          }}
                          className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-emerald-400"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 relative group/wallet">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Node (Primary) • {user.wallet_network}</p>
                          {user.wallet_note && (
                            <span className="text-[7px] font-black px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full uppercase tracking-tighter">
                              {user.wallet_note}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-[10px] font-black text-emerald-400 truncate font-mono bg-slate-900 px-2 py-1 rounded border border-white/5">{user.wallet_address}</code>
                          <button 
                            onClick={() => {
                              if (user.wallet_address) {
                                navigator.clipboard.writeText(user.wallet_address);
                                success("Copied to clipboard");
                              }
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-emerald-400"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {user.wallet_address_2 && (
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 relative group/wallet mt-2">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-[8px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Node (Aux) • {user.wallet_network_2}</p>
                            {user.wallet_2_note && (
                              <span className="text-[7px] font-black px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full uppercase tracking-tighter">
                                {user.wallet_2_note}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-[10px] font-bold text-emerald-400 truncate font-mono">{user.wallet_address_2}</code>
                            <button 
                              onClick={() => {
                                if (user.wallet_address_2) {
                                  navigator.clipboard.writeText(user.wallet_address_2);
                                  success("Copied: " + user.wallet_address_2);
                                }
                              }}
                              className="p-1 hover:bg-white/10 rounded transition-colors text-emerald-400"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick Register Payment */}
            {onRegisterPayment && (
              <button
                onClick={() => onRegisterPayment(user.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                <DollarSign className="h-4 w-4" /> Finalize Settlement
              </button>
            )}

            {/* Role Management */}
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Privilege Authorization</h3>
              <div className="space-y-2">
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    disabled={isUpdating}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      selectedRole === r 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'bg-white/5 text-slate-500 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <span className="capitalize">{r}</span>
                    {selectedRole === r && <CheckCircle2 className="h-4 w-4" />}
                  </button>
                ))}
              </div>

              {selectedRole !== user.role && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSaveRole}
                  disabled={isUpdating}
                  className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isUpdating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                  Commit Privileges
                </motion.button>
              )}
            </div>

            {/* Dangerous Actions */}
            <div className="bg-rose-500/5 p-6 rounded-[2rem] border border-rose-500/20">
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" /> Termination Protocols
              </h3>
              
              {!isConfirmingDelete ? (
                <button 
                  onClick={() => setIsConfirmingDelete(true)}
                  className="w-full px-4 py-3 bg-white/5 text-rose-500 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                >
                  Deauthorize Node
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-rose-700 leading-tight">
                    {deleteConfirmStep === 0 && "¿Estás completamente seguro?"}
                    {deleteConfirmStep === 1 && "Esta acción no se puede deshacer."}
                    {deleteConfirmStep === 2 && "Confirmación final: ¿Eliminar?"}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDelete}
                      disabled={isUpdating}
                      className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                    >
                      {deleteConfirmStep < 2 ? 'Initialize Wipe' : 'Confirm Deletion'}
                    </button>
                    <button 
                      onClick={() => { setIsConfirmingDelete(false); setDeleteConfirmStep(0); }}
                      className="px-3 py-2 bg-white/5 text-slate-500 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest"
                    >
                      Abort
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
