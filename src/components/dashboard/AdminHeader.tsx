import React from 'react';
import { Filter, Search, Plus, Users } from 'lucide-react';
import FilterMenu from './FilterMenu';

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

const AdminHeader: React.FC<AdminHeaderProps> = ({
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
}) => {
  const { platform, campaign, creator, pay_month, team_role } = filters;

  const activeFiltersCount = [platform, campaign, creator, pay_month, team_role].filter(f => f !== 'all').length;

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
      <div className="animate-in fade-in slide-in-from-left-4 duration-700">
        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-2">Panel de Control</h1>
        <p className="text-base font-bold text-gray-400 max-w-md">Gestiona la agencia, creadores y campañas activas.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 xl:flex items-center gap-3 md:gap-4 w-full lg:w-auto animate-in fade-in slide-in-from-right-4 duration-700 relative">
        <div className="relative col-span-1 md:col-span-1 xl:col-auto">
          <button 
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} 
            className={`w-full flex items-center justify-center gap-2 px-4 md:px-6 py-3.5 rounded-2xl md:rounded-[1.25rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 border-2 ${
              isFilterMenuOpen || activeFiltersCount > 0
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' 
                : 'bg-white text-gray-900 border-slate-100 shadow-sm hover:bg-slate-50 hover:border-slate-200'
            }`}
          >
            <Filter className="h-4 w-4" /> 
            <span className="hidden sm:inline">Filtros</span>
            <span className="sm:hidden">Filtrar</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">
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
          className="col-span-1 md:col-span-1 xl:col-auto w-full flex items-center justify-center gap-2 px-4 md:px-6 py-3.5 bg-indigo-50/50 text-indigo-600 rounded-2xl md:rounded-[1.25rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] hover:bg-indigo-100/50 transition-all active:scale-95 border-2 border-indigo-100/50"
        >
          <Search className="h-4 w-4" /> Analizar
        </button>
        
        <button 
          onClick={() => setIsCreatingCampaign(true)} 
          className="col-span-2 md:col-span-1 xl:col-auto w-full flex items-center justify-center gap-2 px-4 md:px-7 py-3.5 bg-indigo-600 text-white rounded-2xl md:rounded-[1.25rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95 border-2 border-indigo-600"
        >
          <Plus className="h-4 w-4" /> Nueva Campaña
        </button>
        
        <button 
          onClick={() => setIsAddingUser(true)} 
          className="col-span-2 md:col-span-1 xl:col-auto w-full flex items-center justify-center gap-2 px-4 md:px-6 py-3.5 bg-white text-gray-900 rounded-2xl md:rounded-[1.25rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] shadow-sm border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95"
        >
          <Users className="h-4 w-4" /> Añadir Miembro
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
