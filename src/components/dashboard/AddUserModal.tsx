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
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-gray-900/10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" /> Añadir Usuario
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 rounded-2xl border-gray-100 bg-gray-50/50 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="ejemplo@umbra.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rol del Usuario</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['creator', 'manager', 'admin', 'client'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    role === r 
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' 
                      : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <ShieldCheck className={`h-5 w-5 mb-1 ${role === r ? 'text-indigo-600' : 'text-gray-300'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest capitalize">{r}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-gray-400 font-medium">
              {role === 'creator' && 'Acceso al dashboard de creadores para subir contenido.'}
              {role === 'manager' && 'Acceso a gestión de campañas y revisión de contenido.'}
              {role === 'admin' && 'Acceso total a la plataforma y configuración de usuarios.'}
              {role === 'client' && 'Acceso restringido para ver métricas de sus campañas asignadas.'}
            </p>
          </div>

          {role === 'client' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Vincular a Campaña Actual (Opcional)</label>
              <select
                className="block w-full rounded-2xl border-gray-100 bg-gray-50/50 py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                value={linkedCampaignId || ''}
                onChange={(e) => setLinkedCampaignId(e.target.value)}
              >
                <option value="">No vincular todavía</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="mt-2 text-[10px] text-gray-400 italic font-medium">El cliente podrá ver los resultados de esta campaña inmediatamente al entrar.</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-100 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-2 px-8 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              Añadir Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
