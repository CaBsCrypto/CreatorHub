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
          <div className="fixed inset-0 z-40 bg-slate-50/20 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 top-full mt-5 w-[360px] glass-dark rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-slate-200 p-8 z-50 space-y-8"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">System_Configuration</h4>
              <button onClick={() => resetFilters()} className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-600 transition-colors tracking-widest underline decoration-emerald-500/30 underline-offset-4">Reset_All</button>
            </div>

            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                 <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Global_Parameters</h5>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Platform_Node</label>
                <select value={platform} onChange={e => setFilter('platform', e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all cursor-pointer appearance-none">
                  <option value="all">All_Networks</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                   <option value="stream">Streams</option>
                  <option value="x">X / Twitter</option>
                  <option value="coinmarketcap">CoinMarketCap</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Operation_Context</label>
                <select value={campaign} onChange={e => setFilter('campaign', e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all cursor-pointer appearance-none">
                  <option value="all">All_Campaigns</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Assigned_Agent</label>
                <select value={creator} onChange={e => setFilter('creator', e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-xs font-black text-white uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all cursor-pointer appearance-none">
                  <option value="all">All_Personnel</option>
                  
                  <optgroup label="Network_Entities" className="bg-slate-50 text-slate-500">
                    {users.filter(u => u.role !== 'client').map(u => (
                      <option key={u.id} value={u.id} className="text-white">
                        {u.admin_alias || u.display_name || u.email.split('@')[0]} [{u.role.toUpperCase()}]
                      </option>
                    ))}
                  </optgroup>

                  {content.some(c => !c.creator_id && c.guest_name) && (
                    <optgroup label="Guest_Artifacts" className="bg-slate-50 text-slate-500">
                      {[...new Set(content.filter(c => !c.creator_id && c.guest_name).map(c => c.guest_name))].map(name => (
                        <option key={name} value={`guest:${name}`} className="text-white">{name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {(activeTab === 'payments' || activeTab === 'team') && (
                <div className="pt-6 border-t border-slate-200 mt-4 space-y-6">
                   <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 italic">Tab_Specific_Rules</h5>
                   
                   {activeTab === 'payments' && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Billing_Cycle</label>
                      <select value={pay_month} onChange={e => setFilter('pay_month', e.target.value)} className="w-full bg-indigo-50 border border-indigo-200 rounded-2xl px-5 py-4 text-xs font-black text-indigo-600 uppercase tracking-widest focus:border-emerald-500/50 outline-none transition-all cursor-pointer appearance-none">
                        <option value="all">All_Cycles</option>
                        {[...new Set(payments.map(p => p.paid_at.substring(0, 7)))].sort().reverse().map(month => (
                          <option key={month} value={month}>{new Date(month + '-02').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</option>
                        ))}
                      </select>
                    </div>
                   )}

                   {activeTab === 'team' && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Clearance_Level</label>
                      <select value={team_role} onChange={e => setFilter('team_role', e.target.value)} className="w-full bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-5 py-4 text-xs font-black text-cyan-400 uppercase tracking-widest focus:border-cyan-500/50 outline-none transition-all cursor-pointer appearance-none">
                        <option value="all">All_Levels</option>
                        <option value="staff">Staff (Admin/Manager)</option>
                        <option value="creator">Field_Agents (Creators)</option>
                        <option value="client">Client_Entitites</option>
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
