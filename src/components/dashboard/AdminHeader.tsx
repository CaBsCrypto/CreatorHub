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
    <header className="flex flex-col items-start gap-8 mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-6 animate-in fade-in slide-in-from-left-4 duration-700">
        <div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-none tracking-tighter uppercase mb-3">
            Panel de <span className="text-indigo-600">Control</span>
          </h1>
          <p className="text-base font-medium text-slate-500 max-w-xl italic">
            Monitorización centralizada de la red de creadores, despliegue de campañas y sincronización de protocolos.
          </p>
        </div>
        <div className="flex-shrink-0">
          <ScraperHealthWidget />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-start gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
        <div className="relative w-full sm:w-auto">
          <button 
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} 
            className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${
              isFilterMenuOpen || activeFiltersCount > 0
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                : 'bg-white text-slate-500 border-gray-100 hover:bg-gray-50 hover:border-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" /> 
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className={`ml-2 w-5 h-5 ${isFilterMenuOpen || activeFiltersCount > 0 ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white'} text-[10px] rounded-full flex items-center justify-center flex-shrink-0 font-black`}>
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
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-100 hover:border-gray-200 active:scale-95 whitespace-nowrap"
        >
          <Search className="h-4 w-4 text-indigo-600" /> Analizar Creador
        </button>
        
        <button 
          onClick={() => setIsCreatingCampaign(true)} 
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> Nueva Campaña
        </button>
        
        <button 
          onClick={() => setIsAddingUser(true)} 
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 whitespace-nowrap"
        >
          <Users className="h-4 w-4 text-indigo-600" /> Nuevo Agente
        </button>

        <a 
          href="/" 
          target="_blank"
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-100 hover:border-indigo-100 active:scale-95 whitespace-nowrap"
        >
          <Globe className="h-4 w-4" /> Portal Público
        </a>
      </div>
    </header>
  );
});

export default AdminHeader;
