import React from 'react';
import { LayoutDashboard, List, Youtube, Users, Wallet, ShieldCheck, Zap, Trash2, Sparkles } from 'lucide-react';

export const sidebarItems = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'campaigns', label: 'Campañas', icon: List },
  { id: 'content', label: 'Contenido', icon: Youtube },
  { id: 'creators', label: 'Creadores', icon: Users },
  { id: 'payments', label: 'Pagos', icon: Wallet },
  { id: 'team', label: 'Equipo', icon: ShieldCheck },
  { id: 'activity', label: 'Actividad', icon: Zap },
  { id: 'trash', label: 'Papelera', icon: Trash2 }
] as const;

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  resetFilters: (params?: any) => void;
  user: any;
}

const SUPERADMIN_EMAIL = 'cabscryptocontacto@gmail.com';

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, resetFilters, user }) => {
  const displayItems = React.useMemo(() => {
    if (user?.email === SUPERADMIN_EMAIL) {
      return [...sidebarItems, { id: 'scraper', label: 'Salud Logs', icon: ShieldCheck }];
    }
    return sidebarItems;
  }, [user]);

  return (
    <>
      <aside className="w-72 bg-white border-r border-gray-100 p-8 hidden lg:block">
        <div 
          onClick={() => resetFilters({ tab: 'overview' } as any)}
          className="flex items-center gap-3 px-2 mb-10 cursor-pointer group active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
            <Sparkles className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tighter group-hover:text-indigo-600 transition-colors">
            Umbra <span className="text-indigo-600 group-hover:text-indigo-700">Admin</span>
          </span>
        </div>

        <nav className="space-y-2">
          {displayItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'overview') {
                  resetFilters({ tab: 'overview' } as any);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === item.id ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-1 left-0 right-0 z-[60] px-4 pb-4 pt-2 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-[2rem] p-2 flex items-center justify-between pointer-events-auto">
          {displayItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'overview') {
                  resetFilters({ tab: 'overview' } as any);
                } else {
                  setActiveTab(item.id);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-gray-400 hover:text-gray-600'
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
};

export default AdminSidebar;
