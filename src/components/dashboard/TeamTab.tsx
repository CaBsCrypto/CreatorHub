import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Shield, User } from 'lucide-react';

interface TeamTabProps {
  filteredUsers: any[];
  setManagingUser: (user: any) => void;
}

const TeamTab: React.FC<TeamTabProps> = ({
  filteredUsers,
  setManagingUser
}) => {
  if (filteredUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-700">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
          <Users className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Sin miembros</h3>
        <p className="text-sm text-slate-500 mt-1">No se encontraron agentes en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((u, i) => (
          <motion.div 
            key={u.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            onClick={() => setManagingUser(u)}
            className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Background Accent */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 ${
              u.role === 'admin' ? 'bg-indigo-600' :
              u.role === 'manager' ? 'bg-cyan-500' :
              'bg-gray-400'
            }`} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                  u.role === 'admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                  u.role === 'manager' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' :
                  'bg-gray-50 border-gray-100 text-slate-400'
                }`}>
                  {u.role === 'admin' ? <Shield className="h-7 w-7" /> : <User className="h-7 w-7" />}
                </div>
                
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  u.role === 'admin' ? 'bg-indigo-600 text-white border-indigo-600' :
                  u.role === 'manager' ? 'bg-cyan-600 text-white border-cyan-600' :
                  'bg-gray-100 text-slate-500 border-gray-200'
                }`}>
                  {u.role}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors tracking-tight uppercase">
                {u.display_name || u.email.split('@')[0]}
              </h3>
              <p className="text-[9px] font-black text-slate-400 mb-6 truncate font-mono tracking-widest uppercase italic">
                {u.admin_alias ? `@${u.admin_alias}` : u.email}
              </p>
              
              <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Activo desde</span>
                   <span className="text-xs font-black text-slate-700 tabular-nums">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  Ajustes <Plus className="h-3 w-3" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamTab;
