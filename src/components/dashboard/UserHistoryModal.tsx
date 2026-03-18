import React, { useState } from 'react';
import { 
  X, Users, Mail, ShieldCheck, Calendar, 
  Trash2, AlertTriangle, CheckCircle2, 
  ExternalLink, Youtube, Instagram, Zap, Globe, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, Content, supabase, UserRole } from '../../supabase';

interface UserHistoryModalProps {
  user: UserProfile | null;
  onClose: () => void;
  userContent: Content[];
  onUpdateRole: (newRole: UserRole) => Promise<void>;
  onRemoveUser: () => Promise<void>;
}

export default function UserHistoryModal({ 
  user, 
  onClose, 
  userContent, 
  onUpdateRole, 
  onRemoveUser 
}: UserHistoryModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

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
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Decoration */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${
          user.role === 'admin' ? 'bg-rose-500' : 
          user.role === 'manager' ? 'bg-amber-500' : 'bg-emerald-500'
        }`} />
        
        {/* Modal Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
              user.role === 'admin' ? 'bg-rose-50 text-rose-600' : 
              user.role === 'manager' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Users className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                {user.display_name || user.email.split('@')[0]}
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  user.role === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                  user.role === 'manager' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {user.role}
                </span>
              </h2>
              <div className="flex items-center gap-4 mt-1 text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {user.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Miembro desde {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition-all hover:rotate-90">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-8 pb-8 flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area: History */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-500" /> Actividad Reciente
              </h3>
              
              <div className="space-y-3">
                {userContent.length > 0 ? (
                  userContent.map((item, i) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          {item.platform === 'youtube' ? <Youtube className="h-6 w-6 text-red-600" /> :
                           item.platform === 'instagram' ? <Instagram className="h-6 w-6 text-pink-600" /> :
                           <Globe className="h-6 w-6 text-indigo-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 line-clamp-1">{item.title || 'Contenido'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {new Date(item.created_at).toLocaleDateString()} • {(item.views || 0).toLocaleString()} vistas
                          </p>
                        </div>
                      </div>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                    <Zap className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-400">Sin actividad reciente registrada.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area: Management */}
          <div className="space-y-8">
            {/* Role Management */}
            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Cambiar Rol</h3>
              <div className="space-y-2">
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    disabled={isUpdating}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      selectedRole === r 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
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
                  className="w-full mt-4 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isUpdating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                  Guardar Cambios
                </motion.button>
              )}
            </div>

            {/* Dangerous Actions */}
            <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100">
              <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" /> Zona de Peligro
              </h3>
              
              {!isConfirmingDelete ? (
                <button 
                  onClick={() => setIsConfirmingDelete(true)}
                  className="w-full px-4 py-3 bg-white text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                >
                  Remover de la Agencia
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
                      {deleteConfirmStep < 2 ? 'Sí, Continuar' : 'Confirmar'}
                    </button>
                    <button 
                      onClick={() => { setIsConfirmingDelete(false); setDeleteConfirmStep(0); }}
                      className="px-3 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg text-[9px] font-black uppercase tracking-widest"
                    >
                      No
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
