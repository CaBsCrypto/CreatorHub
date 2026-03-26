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
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((u, i) => (
          <motion.div 
            key={u.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setManagingUser(u)}
            className={`bg-white p-6 rounded-[2.5rem] border hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden ${
              u.role === 'admin' ? 'border-rose-300 shadow-sm shadow-rose-100/50' :
              u.role === 'manager' ? 'border-amber-300 shadow-sm shadow-amber-100/50' :
              'border-gray-100 shadow-sm'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                  u.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                  u.role === 'manager' ? 'bg-amber-50 text-amber-600' :
                  'bg-indigo-50 text-indigo-600'
                }`}>
                  <Users className="h-7 w-7" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  u.role === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                  u.role === 'manager' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {u.role}
                </div>
              </div>
              
              <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                {u.display_name || u.email.split('@')[0]}
              </h3>
              <p className="text-sm text-gray-400 mb-6 truncate">{u.email}</p>
              
              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-gray-400 uppercase">Miembro desde</span>
                   <span className="text-[10px] font-black text-gray-900">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  Gestionar <Plus className="h-3 w-3" />
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
