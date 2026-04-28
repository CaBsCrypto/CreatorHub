import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 border border-gray-100 shadow-sm">
          <Users className="h-10 w-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">No se encontraron miembros</h3>
        <p className="text-sm text-slate-400 mt-2 font-medium">Verifica los filtros e intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUsers.map((u, i) => (
          <motion.div 
            key={u.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            onClick={() => setManagingUser(u)}
            className={`bg-white p-8 rounded-[3rem] border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer relative overflow-hidden`}
          >
            <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 bg-indigo-600`} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-100 bg-gray-50 group-hover:scale-110 group-hover:rotate-6 ${
                  u.role === 'admin' ? 'text-indigo-600' :
                  u.role === 'manager' ? 'text-cyan-600' :
                  'text-slate-400'
                }`}>
                  <Users className="h-8 w-8" />
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                  u.role === 'manager' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                  'bg-gray-50 text-slate-400 border-gray-200'
                }`}>
                  {u.role}
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tighter uppercase">
                {u.display_name || u.email.split('@')[0]}
              </h3>
              <p className="text-[10px] font-black text-slate-400 mb-8 truncate tracking-widest uppercase">ID: {u.id.slice(0, 12)}</p>
              
              <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Activo desde</span>
                   <span className="text-[11px] font-black text-slate-900 tabular-nums">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  Configurar <Plus className="h-4 w-4" />
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
