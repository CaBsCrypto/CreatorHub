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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              <Globe className="h-6 w-6 text-indigo-600" /> Audiencia por País
            </h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Demografía de <b className="text-indigo-600">{user.display_name}</b></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 text-slate-400 transition-all border border-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {Object.entries(geo).length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
              {Object.entries(geo).map(([country, percentage]) => (
                <div key={country} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{country}</p>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{percentage}% del total</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(country)} className="p-2 text-slate-400 hover:text-rose-500 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 border-2 border-dashed border-gray-100 rounded-3xl">
              <p className="text-[10px] font-black uppercase tracking-widest">Sin datos geográficos</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">País / Región</label>
              <input
                type="text"
                placeholder="Ej. España"
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 px-4 text-xs font-bold text-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all uppercase outline-none"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Porcentaje (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50 py-3 px-4 text-xs font-bold text-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                value={newPercentage}
                onChange={(e) => setNewPercentage(parseInt(e.target.value))}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all border border-indigo-100 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Agregar Registro
          </button>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-4 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(user.id, geo)}
            className="flex-[2] px-8 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudienceGeoModal;
