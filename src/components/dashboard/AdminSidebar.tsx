import React from 'react';
import { LayoutDashboard, List, Youtube, Users, Wallet, ShieldCheck, Zap, Trash2, Sparkles, UserCircle } from 'lucide-react';

export const sidebarItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campañas', icon: List },
  { id: 'content', label: 'Contenido', icon: Youtube },
  { id: 'creators', label: 'Creadores', icon: Users },
  { id: 'payments', label: 'Pagos', icon: Wallet },
  { id: 'team', label: 'Equipo', icon: ShieldCheck },
  { id: 'activity', label: 'Actividad', icon: Zap },
  { id: 'trash', label: 'Papelera', icon: Trash2 },
  { id: 'creator-pov', label: 'POV Creador', icon: UserCircle }
] as const;

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  resetFilters: (params?: any) => void;
  user: any;
}

const SUPERADMIN_EMAIL = 'cabscryptocontacto@gmail.com';

const AdminSidebar = React.memo(({ activeTab, setActiveTab, resetFilters, user }: AdminSidebarProps) => {
  const displayItems = React.useMemo(() => {
    if (user?.email === SUPERADMIN_EMAIL) {
      return [...sidebarItems, { id: 'scraper', label: 'Nodes_Health', icon: ShieldCheck }];
    }
    return sidebarItems;
  }, [user]);

  return (
    <>
      <aside className="w-80 glass-dark border-r border-white/5 p-10 hidden lg:flex flex-col h-screen sticky top-0">
        <div 
          onClick={() => resetFilters({ tab: 'overview' } as any)}
          className="flex items-center gap-4 mb-14 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-[15deg] transition-all duration-500 group-hover:scale-110">
            <Sparkles className="text-slate-950 h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-emerald-400 transition-colors">
              Umbra_<span className="text-emerald-500">Node</span>
            </span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Admin_Protocol</span>
          </div>
        </div>

        <nav className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-2">
          {displayItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'overview') {
                  resetFilters({ tab: 'overview' } as any);
                } else if (item.id === 'creator-pov') {
                  window.open('/creator', '_blank');
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 group ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20 scale-105 border border-white/10' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon className={`h-4 w-4 transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-125'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-10 pt-10 border-t border-white/5">
          <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-900/50 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <UserCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Master_Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-[60] pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-3 flex items-center justify-between pointer-events-auto overflow-x-auto no-scrollbar gap-2">
          {displayItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'overview') {
                  resetFilters({ tab: 'overview' } as any);
                } else if (item.id === 'creator-pov') {
                  window.open('/creator', '_blank');
                } else {
                  setActiveTab(item.id);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-none flex flex-col items-center justify-center min-w-[70px] py-3 px-2 rounded-2xl transition-all duration-500 ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-2xl scale-105' 
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 mb-1.5 ${activeTab === item.id ? 'animate-in zoom-in duration-500' : ''}`} />
              <span className="text-[8px] font-black uppercase tracking-tighter truncate px-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
});

export default AdminSidebar;
