import React from 'react';
import { BarChart3 } from 'lucide-react';
import CampaignCard from './CampaignCard';

const CampaignsTab: React.FC<{
  campaignStats: any[];
  onDelete: (id: string) => void;
  onEdit: (campaign: any) => void;
  setFilters: (filters: any) => void;
  setSelectedCampaignReport: (id: string) => void;
  onCopyLink: (token: string, e: React.MouseEvent, type?: 'review' | 'slug') => void;
}> = ({
  campaignStats,
  onDelete,
  onEdit,
  setFilters,
  setSelectedCampaignReport,
  onCopyLink
}) => {
  if (campaignStats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-gray-200" />
        </div>
        <h3 className="text-lg font-black text-gray-900">No hay campañas</h3>
        <p className="text-sm text-gray-400">Crea tu primera campaña para empezar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {campaignStats.map((campaign, i) => {
        return (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            totalViews={campaign.views}
            totalPosts={campaign.contentCount}
            spent={campaign.spent}
            remaining={campaign.remaining}
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
          />
        );
      })}
    </div>
  );
};

export default CampaignsTab;
