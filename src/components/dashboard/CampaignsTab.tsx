import React from 'react';
import { BarChart3 } from 'lucide-react';
import CampaignCard from './CampaignCard';
import { CardSkeleton } from './Skeleton';

const CampaignsTab = React.memo(({
  campaignStats,
  role = 'admin',
  onDelete,
  onEdit,
  onEditNotes,
  setFilters,
  setSelectedCampaignReport,
  onCopyLink,
  onClearNote,
  isLoading
}: {
  campaignStats: any[];
  role?: 'admin' | 'creator';
  onDelete: (id: string) => void;
  onEdit: (campaign: any) => void;
  onEditNotes?: (campaign: any) => void;
  setFilters: (filters: any) => void;
  setSelectedCampaignReport: (id: string) => void;
  onCopyLink: (token: string, e: React.MouseEvent, type?: 'review' | 'slug') => void;
  onClearNote?: (id: string) => void;
  isLoading?: boolean;
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <BarChart3 className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar campañas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-slate-400 outline-none"
          />
        </div>
        <div className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 whitespace-nowrap">
          {filteredStats.length} {filteredStats.length === 1 ? 'Campaña' : 'Campañas'}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
            <BarChart3 className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sin resultados</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">No se encontraron campañas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStats.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              totalViews={campaign.views}
              totalPosts={campaign.contentCount}
              spent={campaign.spent}
              remaining={campaign.remaining}
              isAssigned={campaign.isAssigned}
              isPersonal={campaign.isPersonal}
              role={role}
              onDelete={onDelete}
              onEdit={() => onEdit(campaign)}
              onEditNotes={onEditNotes}
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
});

export default CampaignsTab;
