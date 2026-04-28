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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        <div className="relative z-10 flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Users className="h-6 w-6 text-indigo-600" /> Nuevo Usuario
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 text-slate-400 transition-all hover:rotate-90">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-11 rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500/50 transition-all outline-none font-mono"
                placeholder="ejemplo@umbra.agency"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nivel de Acceso</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['creator', 'manager', 'admin', 'client'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    role === r 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg shadow-indigo-100' 
                      : 'border-gray-100 bg-gray-50/50 text-slate-400 hover:bg-white hover:border-gray-200'
                  }`}
                >
                  <ShieldCheck className={`h-5 w-5 mb-1 ${role === r ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{r}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-slate-400 font-medium">
              {role === 'creator' && 'Creador: Acceso al panel para sincronizar contenido y ver estadísticas.'}
              {role === 'manager' && 'Manager: Gestión estratégica y privilegios de validación de contenido.'}
              {role === 'admin' && 'Administrador: Acceso total al sistema y control organizacional.'}
              {role === 'client' && 'Cliente: Visualización analítica de campañas estratégicas designadas.'}
            </p>
          </div>

          {role === 'client' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Vincular a Campaña (Opcional)</label>
              <select
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3.5 px-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none appearance-none"
                value={linkedCampaignId || ''}
                onChange={(e) => setLinkedCampaignId(e.target.value)}
              >
                <option value="">Sin asignar</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-3.5 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
