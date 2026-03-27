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
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">Panel de Control</h1>
        <p className="text-sm font-medium text-gray-400">Gestiona la agencia, creadores y campañas activas.</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto animate-in fade-in slide-in-from-right-4 duration-500 relative">
        <div className="relative">
          <button 
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} 
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all active:scale-95 border ${
              isFilterMenuOpen || activeFiltersCount > 0
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' 
                : 'bg-white text-gray-900 border-gray-100 shadow-sm hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" /> 
            Filtros
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center animate-bounce">
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
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100"
        >
          <Search className="h-4 w-4" /> Analizar
        </button>
        <button 
          onClick={() => setIsCreatingCampaign(true)} 
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Nueva Campaña
        </button>
        <button 
          onClick={() => setIsAddingUser(true)} 
          className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white text-gray-900 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 transition-all"
        >
          <Users className="h-4 w-4" /> Añadir Miembro
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
