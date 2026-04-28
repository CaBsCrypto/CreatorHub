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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 backdrop-blur-3xl">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-600 transition-colors">
            <BarChart3 className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search campaigns_repository..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-sm font-medium text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-indigo-200 transition-all placeholder:text-slate-600"
          />
        </div>
        <div className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-200">
          {filteredStats.length} {filteredStats.length === 1 ? 'Campaign_Active' : 'Campaigns_Active'}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 glass-dark rounded-[3rem] border border-slate-200">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 border border-slate-200 shadow-2xl">
            <BarChart3 className="h-10 w-10 text-slate-700" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">Null_Data_Detected</h3>
          <p className="text-sm text-slate-500 mt-2 font-medium italic">No se encontraron campañas bajo este protocolo de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
