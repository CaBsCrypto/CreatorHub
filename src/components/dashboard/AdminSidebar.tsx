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
      return [...sidebarItems, { id: 'scraper', label: 'Salud Logs', icon: ShieldCheck }];
    }
    return sidebarItems;
  }, [user]);

  return (
    <>
      <aside className="w-72 bg-[#050505] border-r border-white/5 p-8 hidden lg:flex flex-col h-screen sticky top-0">
        <div 
          onClick={() => resetFilters({ tab: 'overview' } as any)}
          className="flex items-center gap-3 px-2 mb-10 cursor-pointer group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20 group-hover:rotate-12 transition-transform">
            <Sparkles className="text-black h-5 w-5" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter group-hover:text-red-500 transition-colors">
            Umbra <span className="text-red-600 group-hover:text-red-700">Admin</span>
          </span>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar pr-2">
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
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === item.id 
                  ? 'bg-red-600/10 text-red-500 shadow-[inset_0_0_15px_rgba(220,38,38,0.1)] border border-red-500/20' 
                  : 'text-white/20 hover:bg-white/[0.03] hover:text-white/60'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-red-900/20 flex items-center justify-center border border-red-500/20">
              <UserCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-wider">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Protocolo_Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-1 left-0 right-0 z-[60] px-4 pb-4 pt-2 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem] p-2 flex items-center justify-between pointer-events-auto">
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
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-red-600 text-black shadow-lg shadow-red-900/40' 
                  : 'text-white/20 hover:text-white/40'
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'animate-in zoom-in-75 duration-300 mb-0.5' : 'mb-0.5'}`} />
              <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5 block w-full text-center truncate px-0.5">
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
