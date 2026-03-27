import React from 'react';
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {campaignStats.map((campaign, i) => {
        return (
          <CampaignCard 
            key={campaign.id} 
            campaign={campaign} 
            index={i} 
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
