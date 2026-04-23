import React, { useState } from 'react';
import { X, Globe, Plus, Trash2, MapPin } from 'lucide-react';
import { UserProfile } from '../../supabase';

interface AudienceGeoModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onSave: (userId: string, geo: Record<string, number>) => Promise<void>;
}

const AudienceGeoModal: React.FC<AudienceGeoModalProps> = ({ user, onClose, onSave }) => {
  const [geo, setGeo] = useState<Record<string, number>>(user?.audience_geo || {});
  const [newCountry, setNewCountry] = useState('');
  const [newPercentage, setNewPercentage] = useState(0);

  if (!user) return null;

  const handleAdd = () => {
    if (newCountry && newPercentage > 0) {
      setGeo({ ...geo, [newCountry]: newPercentage });
      setNewCountry('');
      setNewPercentage(0);
    }
  };

  const handleRemove = (country: string) => {
    const next = { ...geo };
    delete next[country];
    setGeo(next);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-[2.5rem] bg-slate-950/80 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/10 border border-white/5 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
              <Globe className="h-6 w-6 text-emerald-500" /> Geolocation Intel
            </h2>
            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Target demographics for <b className="text-emerald-400">{user.display_name}</b>.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-all border border-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {Object.entries(geo).length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
              {Object.entries(geo).map(([country, percentage]) => (
                <div key={country} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-white/5">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">{country}</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono">{percentage}% Signal</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(country)} className="p-2 text-slate-700 hover:text-rose-500 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-700 border border-dashed border-white/5 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest italic">No geographic data injected.</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Zone / Sector</label>
              <input
                type="text"
                placeholder="e.g. United Kingdom"
                className="block w-full rounded-2xl border border-white/5 bg-white/5 py-3 px-4 text-xs font-black text-white focus:ring-1 focus:ring-emerald-500/50 transition-all uppercase placeholder:text-slate-800 outline-none"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Quantum Ratio (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="block w-full rounded-2xl border border-white/5 bg-white/5 py-3 px-4 text-xs font-black text-white focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono placeholder:text-slate-800 outline-none"
                value={newPercentage}
                onChange={(e) => setNewPercentage(parseInt(e.target.value))}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
          >
            <Plus className="h-4 w-4" /> Inject Coordinate
          </button>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 hover:text-white transition-all"
          >
            Abort
          </button>
          <button
            onClick={() => onSave(user.id, geo)}
            className="flex-[2] px-8 py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            Sync Coordinates
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudienceGeoModal;
