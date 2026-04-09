import React from 'react';
import { BarChart3 } from 'lucide-react';
import CampaignCard from './CampaignCard';
import { CardSkeleton } from './Skeleton';

const CampaignsTab: React.FC<{
  campaignStats: any[];
  role?: 'admin' | 'creator';
  onDelete: (id: string) => void;
  onEdit: (campaign: any) => void;
  setFilters: (filters: any) => void;
  setSelectedCampaignReport: (id: string) => void;
  onCopyLink: (token: string, e: React.MouseEvent, type?: 'review' | 'slug') => void;
  onClearNote?: (id: string) => void;
  isLoading?: boolean;
}> = ({
  campaignStats,
  role = 'admin',
  onDelete,
  onEdit,
  setFilters,
  setSelectedCampaignReport,
  onCopyLink,
  onClearNote,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredStats = React.useMemo(() => {
    if (!searchTerm.trim()) return campaignStats;
    const query = searchTerm.toLowerCase().trim();
    return campaignStats.filter(c => 
      c.name?.toLowerCase().includes(query) || 
      c.description?.toLowerCase().includes(query)
    );
  }, [campaignStats, searchTerm]);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            <BarChart3 className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Buscar campaña por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
          {filteredStats.length} {filteredStats.length === 1 ? 'Campaña' : 'Campañas'}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <BarChart3 className="h-8 w-8 text-gray-200" />
          </div>
          <h3 className="text-lg font-black text-gray-900">Sin resultados</h3>
          <p className="text-sm text-gray-400">Prueba con otros términos de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStats.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              totalViews={campaign.views}
              totalPosts={campaign.contentCount}
              spent={campaign.spent}
              remaining={campaign.remaining}
              isAssigned={campaign.isAssigned}
              role={role}
              onDelete={onDelete}
              onEdit={() => onEdit(campaign)}
              onClick={(id) => {
                setFilters({
                  tab: 'content',
                  campaign: id,
                  creator: 'all'
                });
              }}
              onViewReport={(id, e) => {
                e.stopPropagation();
                setSelectedCampaignReport(id);
              }}
              onCopyLink={onCopyLink}
              onClearNote={onClearNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignsTab;
