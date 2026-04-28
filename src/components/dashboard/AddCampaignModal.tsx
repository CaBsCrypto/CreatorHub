import React from 'react';
import { X, Target, List, Maximize2 } from 'lucide-react';

interface AddCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newCampaign: { 
    name: string; 
    description: string; 
    client_id?: string | null;
    twitter_url?: string | null;
    contact_info?: string | null;
    budget?: number;
    slug?: string | null;
    notes?: string | null;
  };
  setNewCampaign: (campaign: any) => void;
  clients: any[];
  creators: any[];
  isEditing?: boolean;
}

const AddCampaignModal: React.FC<AddCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newCampaign,
  setNewCampaign,
  clients,
  creators,
  isEditing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-50/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-slate-50/80 backdrop-blur-2xl p-8 shadow-2xl ring-1 ring-white/10 border border-slate-200 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 no-scrollbar">
        {/* Cinematic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none opacity-20" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
            {isEditing ? <Target className="h-6 w-6 text-indigo-600" /> : <List className="h-6 w-6 text-indigo-600" />}
            {isEditing ? 'Edit Campaign' : 'New Campaign'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-all hover:rotate-90">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6 pb-2">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Campaign Identifier</label>
            <input
              type="text"
              required
              className="block w-full rounded-2xl border-slate-200 bg-white/5 py-3 px-4 text-sm font-medium text-white focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 focus:border-emerald-500/50 transition-all outline-none"
              placeholder="e.g., Summer Launch 2024"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Mission Briefing</label>
            <textarea
              className="block w-full rounded-2xl border-slate-200 bg-white/5 py-3 px-4 text-sm font-medium text-white focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 focus:border-emerald-500/50 transition-all outline-none resize-y min-h-[100px]"
              rows={3}
              placeholder="Strategic objectives and goals..."
              value={newCampaign.description}
              onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">Strategic Narrative (Internal)</label>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Maximize2 className="h-3 w-3" /> Expandable Field
              </span>
            </div>
            <textarea
              className="block w-full rounded-2xl border-indigo-500/20 bg-indigo-500/5 py-3 px-4 text-sm font-medium text-white focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 focus:border-indigo-500/50 transition-all outline-none resize-y min-h-[150px]"
              rows={8}
              placeholder="Additional details, requirements, or links for creators... (e.g., Wallets, transaction hashes, folder links)"
              value={newCampaign.notes || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, notes: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Twitter / X Handle</label>
              <input
                type="text"
                className="block w-full rounded-2xl border-slate-200 bg-white/5 py-3 px-4 text-sm font-medium text-white focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 focus:border-emerald-500/50 transition-all outline-none"
                placeholder="@handle"
                value={newCampaign.twitter_url || ''}
                onChange={(e) => setNewCampaign({ ...newCampaign, twitter_url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Telegram Contact</label>
              <input
                type="text"
                className="block w-full rounded-2xl border-slate-200 bg-white/5 py-3 px-4 text-sm font-medium text-white focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 focus:border-emerald-500/50 transition-all outline-none"
                placeholder="@username"
                value={newCampaign.contact_info || ''}
                onChange={(e) => setNewCampaign({ ...newCampaign, contact_info: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Assigned Budget (USDT)</label>
            <input
              type="number"
              step="0.01"
              className="block w-full rounded-2xl border-slate-200 bg-white/5 py-3 px-4 text-sm font-medium text-white focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 focus:border-emerald-500/50 transition-all outline-none font-mono"
              placeholder="0.00"
              value={newCampaign.budget || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="bg-indigo-500/5 p-5 rounded-[2rem] border border-indigo-500/20">
            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Friendly Endpoint (Slug Premium)</label>
            <input
              type="text"
              className="block w-full rounded-2xl border-slate-200 bg-white/5 py-3 px-4 text-sm font-black text-indigo-400 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none shadow-sm font-mono"
              placeholder="campaign-identifier-1234"
              value={newCampaign.slug || ''}
              onChange={(e) => setNewCampaign({ ...newCampaign, slug: e.target.value })}
            />
            <p className="mt-2 text-[9px] text-indigo-400/60 font-bold leading-relaxed">
              ⚡ Exclusive access endpoint. Auto-generated if left empty.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Deploy Agents</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {creators.map(creator => (
                <label key={creator.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-emerald-500/50 transition-all cursor-pointer"
                    checked={(newCampaign as any).assigned_creator_ids?.includes(creator.id)}
                    onChange={(e) => {
                      const currentIds = (newCampaign as any).assigned_creator_ids || [];
                      const newIds = e.target.checked 
                        ? [...currentIds, creator.id]
                        : currentIds.filter((id: string) => id !== creator.id);
                      setNewCampaign({ ...newCampaign, assigned_creator_ids: newIds });
                    }}
                  />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">
                    {creator.display_name || creator.email.split('@')[0]}
                  </span>
                </label>
              ))}
            </div>
            {creators.length === 0 && (
              <p className="text-[10px] font-medium text-slate-500 italic">No available agents for deployment.</p>
            )}
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-transparent sm:static">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-colors"
            >
              Abort
            </button>
            <button
              type="submit"
              className="flex-[2] px-8 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              {isEditing ? 'Save Changes' : 'Initialize Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCampaignModal;
