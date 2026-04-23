import React from 'react';
import { Filter, Search, Plus, Users, Globe } from 'lucide-react';
import FilterMenu from './FilterMenu';
import ScraperHealthWidget from './ScraperHealthWidget';

interface AdminHeaderProps {
  filters: any;
  setFilter: (key: string, value: any) => void;
  resetFilters: (params?: any) => void;
  campaigns: any[];
  users: any[];
  content: any[];
  payments: any[];
  activeTab: string;
  setIsFilterMenuOpen: (isOpen: boolean) => void;
  isFilterMenuOpen: boolean;
  setIsAnalyzingCreator: (isOpen: boolean) => void;
  setIsCreatingCampaign: (isOpen: boolean) => void;
  setIsAddingUser: (isOpen: boolean) => void;
}

const AdminHeader = React.memo(({
  filters,
  setFilter,
  resetFilters,
  campaigns,
  users,
  content,
  payments,
  activeTab,
  setIsFilterMenuOpen,
  isFilterMenuOpen,
  setIsAnalyzingCreator,
  setIsCreatingCampaign,
  setIsAddingUser
}: AdminHeaderProps) => {
  const { platform, campaign, creator, pay_month, team_role } = filters;

  const activeFiltersCount = [platform, campaign, creator, pay_month, team_role].filter(f => f !== 'all').length;

  return (
    <header className="flex flex-col items-start gap-12 mb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-8 animate-in fade-in slide-in-from-left-6 duration-1000">
        <div>
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-none tracking-tighter uppercase mb-4">
            Command_<span className="text-emerald-500">Center</span>
          </h1>
          <p className="text-lg font-medium text-slate-500 max-w-xl italic">
            Monitorización centralizada de la red de creadores, despliegue de campañas y sincronización de protocolos.
          </p>
        </div>
        <div className="flex-shrink-0">
          <ScraperHealthWidget />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-start gap-5 w-full animate-in fade-in slide-in-from-bottom-6 duration-1000 relative">
        <div className="relative w-full sm:w-auto">
          <button 
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} 
            className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 border-2 whitespace-nowrap active:scale-95 ${
              isFilterMenuOpen || activeFiltersCount > 0
                ? 'bg-white text-slate-950 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                : 'bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:border-white/20'
            }`}
          >
            <Filter className="h-4 w-4" /> 
            <span>Filters_Protocol</span>
            {activeFiltersCount > 0 && (
              <span className="ml-2 w-5 h-5 bg-emerald-500 text-slate-950 text-[10px] rounded-full flex items-center justify-center flex-shrink-0 animate-pulse font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <FilterMenu 
            isOpen={isFilterMenuOpen}
            onClose={() => setIsFilterMenuOpen(false)}
            filters={filters}
            setFilter={setFilter}
            resetFilters={resetFilters}
            campaigns={campaigns}
            users={users}
            content={content}
            payments={payments}
            activeTab={activeTab}
          />
        </div>

        <button 
          onClick={() => setIsAnalyzingCreator(true)} 
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900/50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 hover:text-white transition-all duration-500 border-2 border-white/5 hover:border-white/20 active:scale-95 whitespace-nowrap"
        >
          <Search className="h-4 w-4 text-emerald-500" /> Analysis_Node
        </button>
        
        <button 
          onClick={() => setIsCreatingCampaign(true)} 
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all duration-500 border-2 border-emerald-500/50 active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> Deploy_Campaign
        </button>
        
        <button 
          onClick={() => setIsAddingUser(true)} 
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl border-2 border-white/10 hover:border-white/30 transition-all duration-500 active:scale-95 whitespace-nowrap"
        >
          <Users className="h-4 w-4 text-emerald-500" /> New_Agent
        </button>

        <a 
          href="/" 
          target="_blank"
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900/50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-500 border-2 border-white/5 hover:border-emerald-500/20 active:scale-95 whitespace-nowrap"
        >
          <Globe className="h-4 w-4" /> Public_Portal
        </a>
      </div>
    </header>
  );
});

export default AdminHeader;
