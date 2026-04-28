import React from 'react';
import { X, Users, Mail, ShieldCheck } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  email: string;
  setEmail: (email: string) => void;
  role: 'creator' | 'manager' | 'admin' | 'client';
  setRole: (role: any) => void;
  campaigns: any[];
  linkedCampaignId?: string;
  setLinkedCampaignId: (id: string) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  email,
  setEmail,
  role,
  setRole,
  campaigns,
  linkedCampaignId,
  setLinkedCampaignId
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-50/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-[2.5rem] bg-slate-50/80 backdrop-blur-2xl p-8 shadow-2xl ring-1 ring-white/10 border border-slate-200 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        {/* Cinematic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none opacity-20" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-600/05 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
            <Users className="h-6 w-6 text-indigo-600" /> New Identity
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-all hover:rotate-90">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Network Credential (Email)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 rounded-2xl border-slate-200 bg-white/5 py-3 text-sm font-medium text-white focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all outline-none font-mono"
                placeholder="identity@umbra.agency"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Privilege Level</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['creator', 'manager', 'admin', 'client'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    role === r 
                      ? 'border-emerald-500/50 bg-indigo-50 text-indigo-600 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' 
                      : 'border-slate-200 bg-white/5 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  <ShieldCheck className={`h-5 w-5 mb-1 ${role === r ? 'text-indigo-600' : 'text-slate-600'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest capitalize">{r}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-slate-500 font-medium">
              {role === 'creator' && 'Field Agent: Dashboard access for content synchronization and reporting.'}
              {role === 'manager' && 'Command Ops: Strategic management and content validation privileges.'}
              {role === 'admin' && 'Central Intelligence: Full system access and organizational control.'}
              {role === 'client' && 'Guest Observer: Analytical viewing for designated strategic campaigns.'}
            </p>
          </div>

          {role === 'client' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Link Strategic Campaign (Optional)</label>
              <select
                className="block w-full rounded-2xl border-slate-200 bg-white/5 py-3 px-4 text-sm font-medium text-white focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all outline-none appearance-none"
                value={linkedCampaignId || ''}
                onChange={(e) => setLinkedCampaignId(e.target.value)}
              >
                <option value="" className="bg-white">Awaiting assignment</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id} className="bg-white">{c.name}</option>
                ))}
              </select>
              <p className="mt-2 text-[10px] text-slate-600 italic font-medium">Observer will gain immediate access to selected campaign data.</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-colors"
            >
              Abort
            </button>
            <button
              type="submit"
              className="flex-2 px-8 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98]"
            >
              Confirm Identity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
