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
      <div className="flex flex-col items-center justify-center py-40 animate-in fade-in duration-1000">
        <div className="w-24 h-24 glass-dark rounded-[2rem] flex items-center justify-center mb-6 border border-white/5">
          <Users className="h-10 w-10 text-slate-800" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-widest italic">No_Agents_Found</h3>
        <p className="text-sm text-slate-500 mt-2 font-medium">Verify system parameters and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUsers.map((u, i) => (
          <motion.div 
            key={u.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.7 }}
            onClick={() => setManagingUser(u)}
            className={`glass-dark p-8 rounded-[3rem] border hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all duration-500 group cursor-pointer relative overflow-hidden ${
              u.role === 'admin' ? 'border-emerald-500/30' :
              u.role === 'manager' ? 'border-cyan-500/20' :
              'border-white/5'
            }`}
          >
            {/* Background Accent */}
            <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 ${
              u.role === 'admin' ? 'bg-emerald-500' :
              u.role === 'manager' ? 'bg-cyan-500' :
              'bg-white'
            }`} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl group-hover:scale-110 group-hover:rotate-6 ${
                  u.role === 'admin' ? 'bg-slate-900 border border-emerald-500/20 text-emerald-500' :
                  u.role === 'manager' ? 'bg-slate-900 border border-cyan-500/20 text-cyan-400' :
                  'bg-slate-900 border border-white/5 text-slate-400'
                }`}>
                  <Users className="h-8 w-8" />
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic ${
                  u.role === 'admin' ? 'bg-white text-slate-950' :
                  u.role === 'manager' ? 'bg-slate-800 text-cyan-400 border border-cyan-500/20' :
                  'bg-slate-800 text-slate-400 border border-white/10'
                }`}>
                  {u.role}_PROTOCOL
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors tracking-tighter uppercase">
                {u.display_name || u.email.split('@')[0]}
              </h3>
              <p className="text-[10px] font-black text-slate-600 mb-8 truncate font-mono tracking-widest uppercase">ID: {u.id.slice(0, 12)}</p>
              
              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                   <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Active_Since</span>
                   <span className="text-[11px] font-black text-white tabular-nums">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 italic">
                  Settings <Plus className="h-4 w-4" />
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
