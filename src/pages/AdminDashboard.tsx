import React, { useState, useMemo } from 'react';
import { supabase, UserProfile } from '../supabase';
import { useAuth } from '../AuthContext';

// Custom Hooks
import { useDashboardData, getAgencyRank, AGENCY_TIERS } from '../hooks/useDashboardData';
import { useToast } from '../hooks/useToast';
import { useFilterParams } from '../hooks/useTabNavigation';
import { useContentActions } from '../hooks/useContentActions';
import { useAdminActions } from '../hooks/useAdminActions';

// Modular Components (Shared)
import AdminMetricCard from '../components/dashboard/AdminMetricCard';
import CampaignCard from '../components/dashboard/CampaignCard';
import CreatorCard from '../components/dashboard/CreatorCard';
import ContentCard, { ContentItem } from '../components/dashboard/ContentCard';
import TwitchStatsModal from '../components/dashboard/TwitchStatsModal';
import AddCampaignModal from '../components/dashboard/AddCampaignModal';
import AddUserModal from '../components/dashboard/AddUserModal';
import AudienceGeoModal from '../components/dashboard/AudienceGeoModal';
import ContentModal from '../components/dashboard/ContentModal';
import DiscordStatsModal from '../components/dashboard/DiscordStatsModal';
import ContentDetailModal from '../components/dashboard/ContentDetailModal';
import CreatorSearchModal from '../components/dashboard/CreatorSearchModal';
import UserHistoryModal from '../components/dashboard/UserHistoryModal';
import CampaignReportModal from '../components/dashboard/CampaignReportModal';

// Modular Layout Components
import AdminSidebar from '../components/dashboard/AdminSidebar';
import AdminHeader from '../components/dashboard/AdminHeader';
import DeletedItemModal from '../components/dashboard/DeletedItemModal';

// Modular Tab Components — lazy loaded so each tab only downloads when first opened
const OverviewTab = React.lazy(() => import('../components/dashboard/OverviewTab'));
const CampaignsTab = React.lazy(() => import('../components/dashboard/CampaignsTab'));
const CreatorsTab = React.lazy(() => import('../components/dashboard/CreatorsTab'));
const ContentTab = React.lazy(() => import('../components/dashboard/ContentTab'));
const TeamTab = React.lazy(() => import('../components/dashboard/TeamTab'));
const PaymentsTab = React.lazy(() => import('../components/dashboard/PaymentsTab'));
const TrashTab = React.lazy(() => import('../components/dashboard/TrashTab'));
const ActivityTab = React.lazy(() => import('../components/dashboard/ActivityTab'));
const ScraperLogsTab = React.lazy(() => import('../components/dashboard/ScraperLogsTab'));

const TabLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
  </div>
);

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#0f172a', // Dark Slate/Black
  instagram: '#e1306c', // Pink
  youtube: '#ff0000', // Red
  x: '#1da1f2', // Twitter Blue
  twitch: '#9146ff', // Purple
  coinmarketcap: '#0d3efd' // Blue
};

const ADMIN_TABS = ['overview', 'campaigns', 'content', 'creators', 'payments', 'team', 'activity', 'trash', 'scraper'] as const;
type AdminTab = typeof ADMIN_TABS[number];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  
  // Tab management moved to filters hook for atomic state updates
  
  // Modals state
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [isAnalyzingCreator, setIsAnalyzingCreator] = useState(false);
  const [managingUser, setManagingUser] = useState<UserProfile | null>(null);
  const [selectedCampaignReport, setSelectedCampaignReport] = useState<string | null>(null);
  
  // Processing states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyzingTwitch, setIsAnalyzingTwitch] = useState(false);

  // Filters (synced to URL)
  const [filters, setFilter, setFilters, resetFilters] = useFilterParams({ 
    tab: 'overview',
    search: '', 
    platform: 'all', 
    campaign: 'all', 
    creator: 'all', 
    view: 'compact',
    pay_campaign: 'all',
    pay_month: 'all',
    team_role: 'all',
    zero_views: 'false',
    sort_by: 'created_at',
    order: 'desc'
  });
  const activeTab = filters.tab as typeof ADMIN_TABS[number];
  const setActiveTab = (tab: typeof ADMIN_TABS[number]) => setFilter('tab', tab);
  
  const { 
    campaigns, content, users, payments, metrics, creatorStats, campaignStats, 
    refresh, filteredContent, deletedContent, deletedCampaigns, deletedUsers, auditLogs 
  } = useDashboardData('admin', { 
    platform: filters.platform, 
    campaign: filters.campaign, 
    creator: filters.creator,
    showOnlyZeroViews: filters.zero_views === 'true',
    sortBy: filters.sort_by as any,
    order: filters.order as any
  });

  const { isProcessing: isProcessingContent, handleTwitchUpload, handleContentSubmit } = useContentActions(refresh);
  
  const {
    isCreatingCampaign, setIsCreatingCampaign,
    isEditingCampaign, setIsEditingCampaign,
    setEditingCampaignId,
    isAddingUser, setIsAddingUser,
    isTwitchModalOpen, setIsTwitchModalOpen,
    isContentModalOpen, setIsContentModalOpen,
    newCampaign, setNewCampaign,
    newUser, setNewUser,
    twitchStats, setTwitchStats,
    twitchPreview, setTwitchPreview,
    isAddingPayment, setIsAddingPayment,
    newPayment, setNewPayment,
    handleDeleteCampaign,
    handleCreateCampaign,
    handleEditCampaign,
    handleUpdateCampaign,
    handleAddUser,
    handleUpdateUserRole,
    handleRemoveUser,
    handleSaveTwitch,
    handleUpdateUserPayment,
    handleCreatePayment
  } = useAdminActions(refresh, user);

  const searchTerm = filters.search;
  const filterPlatform = filters.platform;
  const filterCampaign = filters.campaign;
  const filterCreator = filters.creator;
  const payCampaign = filters.pay_campaign;
  const payMonth = filters.pay_month;
  const teamRole = filters.team_role;
  const filterZeroViews = filters.zero_views === 'true';
  const sortBy = filters.sort_by;
  const order = filters.order;
  const viewMode = (filters.view as 'grid' | 'compact' | 'gallery') || 'compact';
  const isCompactView = viewMode === 'compact';
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([]);
  const [deletedContentIds, setDeletedContentIds] = useState<string[]>([]);
  const [viewingDeleted, setViewingDeleted] = useState<{ type: 'content' | 'campaign' | 'user', item: any } | null>(null);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchCampaign = payCampaign === 'all' || p.campaign_id === payCampaign;
      const matchMonth = payMonth === 'all' || p.paid_at.startsWith(payMonth);
      return matchCampaign && matchMonth;
    });
  }, [payments, payCampaign, payMonth]);

  const [editingAudienceUser, setEditingAudienceUser] = useState<UserProfile | null>(null);

  const filteredUsers = useMemo(() => {
    let result = users.filter(u => !deletedUserIds.includes(u.id));
    if (teamRole !== 'all') {
      if (teamRole === 'staff') {
        result = result.filter(u => u.role === 'admin' || u.role === 'manager');
      } else {
        result = result.filter(u => u.role === teamRole);
      }
    }
    return result;
  }, [users, deletedUserIds, teamRole]);

  // ... groupedLogs logic kept here as it's purely for presentation in the tab ...
  const handleCopyShareLink = async (token: string, e: React.MouseEvent, type: 'review' | 'slug' = 'review') => {
    e.stopPropagation();
    try {
      const BASE_URL = window.location.origin;
      const path = type === 'slug' ? `/v/${token}` : `/review/${token}`;
      const url = `${BASE_URL}${path}`;
      await navigator.clipboard.writeText(url);
      success(type === 'slug' ? "¡Enlace personalizado copiado!" : "¡Enlace de reporte copiado!");
    } catch (err) {
      toastError("No se pudo copiar el enlace.");
    }
  };

  const groupedLogs = useMemo(() => {
    const groups: Record<string, any[]> = {};
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    auditLogs.forEach(log => {
      const date = new Date(log.created_at);
      const dateStr = date.toLocaleDateString();
      let groupKey = dateStr;
      
      if (dateStr === today) groupKey = 'Hoy';
      else if (dateStr === yesterday) groupKey = 'Ayer';
      else {
        groupKey = date.toLocaleDateString(undefined, { 
          day: 'numeric', 
          month: 'long', 
          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
        });
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(log);
    });

    return Object.entries(groups).sort((a, b) => {
      return new Date(groups[b[0]][0].created_at).getTime() - new Date(groups[a[0]][0].created_at).getTime();
    });
  }, [auditLogs]);


  const handleUpdateAlias = async (alias: string) => {
    if (!managingUser) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ admin_alias: alias || null })
        .eq('id', managingUser.id);
      if (error) throw error;
      success("Apodo guardado correctamente");
      refresh();
      setManagingUser({ ...managingUser, admin_alias: alias || null });
    } catch (err: any) {
      toastError("Error al guardar apodo: " + err.message);
    }
  };

  const handleRestore = async (table: 'content' | 'campaign' | 'user', item: any) => {
    const tableName = table === 'content' ? 'content' : table === 'campaign' ? 'campaigns' : 'users';
    const { error } = await supabase.from(tableName).update({ deleted_at: null }).eq('id', item.id);
    if (!error) {
      success("Restaurado correctamente");
      setViewingDeleted(null);
      refresh();
    } else {
      toastError("Error al restaurar");
    }
  };

  const handlePermanentDelete = async (table: 'content' | 'campaign' | 'user', item: any) => {
    if (confirm("¿Estás seguro de eliminar permanentemente? Esta acción es irreversible.")) {
      const tableName = table === 'content' ? 'content' : table === 'campaign' ? 'campaigns' : 'users';
      const { error } = await supabase.from(tableName).delete().eq('id', item.id);
      if (!error) {
        success("Eliminado permanentemente");
        setViewingDeleted(null);
        refresh();
      } else {
        toastError("Error al eliminar");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        resetFilters={resetFilters} 
        user={user}
      />

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto pb-32 lg:pb-12 bg-gray-50/30">
        <AdminHeader 
          filters={filters}
          setFilter={setFilter}
          resetFilters={resetFilters}
          campaigns={campaigns}
          users={users}
          content={content}
          payments={payments}
          activeTab={activeTab}
          isFilterMenuOpen={isFilterMenuOpen}
          setIsFilterMenuOpen={setIsFilterMenuOpen}
          setIsAnalyzingCreator={setIsAnalyzingCreator}
          setIsCreatingCampaign={setIsCreatingCampaign}
          setIsAddingUser={setIsAddingUser}
        />

        <React.Suspense fallback={<TabLoader />}>


        {activeTab === 'overview' && (
          <OverviewTab
            metrics={metrics}
            campaigns={campaigns}
            filteredContent={filteredContent}
            PLATFORM_COLORS={PLATFORM_COLORS}
            setActiveTab={setActiveTab}
            setFilter={setFilter}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignsTab
            campaignStats={campaignStats}
            onDelete={handleDeleteCampaign}
            onEdit={handleEditCampaign}
            setFilters={setFilters}
            setSelectedCampaignReport={setSelectedCampaignReport}
            onCopyLink={handleCopyShareLink}
          />
        )}

        {activeTab === 'creators' && (
          <CreatorsTab
            creatorStats={creatorStats}
            users={users}
            deletedUserIds={deletedUserIds}
            searchTerm={searchTerm}
            setFilter={setFilter}
            setManagingUser={setManagingUser}
            setEditingAudienceUser={setEditingAudienceUser}
          />
        )}

        {activeTab === 'content' && (
          <ContentTab
            filteredContent={filteredContent}
            deletedContentIds={deletedContentIds}
            searchTerm={searchTerm}
            setFilter={setFilter}
            viewMode={viewMode}
            isCompactView={isCompactView}
            setEditingContent={setEditingContent}
            setIsContentModalOpen={setIsContentModalOpen}
            content={content}
            setIsRefreshing={setIsRefreshing}
            isRefreshing={isRefreshing}
            info={info}
            success={success}
            toastError={toastError}
            refresh={refresh}
            campaigns={campaigns}
            users={users}
            setManagingUser={setManagingUser}
            setDeletedContentIds={setDeletedContentIds}
            resetFilters={resetFilters}
            filterCampaign={filterCampaign}
            filterPlatform={filterPlatform}
            filterCreator={filterCreator}
            filterZeroViews={filterZeroViews}
            sortBy={sortBy}
            order={order}
            setViewingContent={setViewingContent}
          />
        )}

        {activeTab === 'team' && (
          <TeamTab
            filteredUsers={filteredUsers}
            setManagingUser={setManagingUser}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsTab
            filteredPayments={filteredPayments}
            isAddingPayment={isAddingPayment}
            setIsAddingPayment={setIsAddingPayment}
            newPayment={newPayment}
            setNewPayment={setNewPayment}
            users={users}
            campaigns={campaigns}
            refresh={refresh}
            success={success}
            toastError={toastError}
            onSubmit={handleCreatePayment}
            onViewProfile={(userId) => {
              const userObj = users.find(u => u.id === userId);
              if (userObj) setManagingUser(userObj);
            }}
          />
        )}

        {activeTab === 'trash' && (
          <TrashTab 
            deletedContent={deletedContent}
            users={users}
            campaigns={campaigns}
            success={success}
            toastError={toastError}
            refresh={refresh} 
          />
        )}

        {activeTab === 'activity' && (
          <ActivityTab
            groupedLogs={groupedLogs}
            auditLogs={auditLogs}
            refresh={refresh}
          />
        )}

        {activeTab === 'scraper' && (
          <ScraperLogsTab />
        )}
        </React.Suspense>

      {/* Modals */}
        <UserHistoryModal 
          user={managingUser}
          onClose={() => setManagingUser(null)}
          userContent={content.filter(c => c.creator_id === managingUser?.id)}
          userPayments={payments.filter(p => p.creator_id === managingUser?.id)}
          onUpdateRole={(role) => handleUpdateUserRole(managingUser, role, setManagingUser)}
          onRemoveUser={() => handleRemoveUser(managingUser, setManagingUser, setDeletedUserIds)}
          onUpdateAlias={handleUpdateAlias}
          onUpdatePayment={async (data) => {
            if (managingUser) {
              const success = await handleUpdateUserPayment(managingUser.id, data);
              if (success) setManagingUser({ ...managingUser, ...data });
            }
          }}
          onRegisterPayment={(creatorId) => {
            setManagingUser(null);
            setNewPayment(prev => ({ ...prev, creator_id: creatorId }));
            setIsAddingPayment(true);
            setActiveTab('payments');
          }}
        />
        {viewingContent?.platform === 'discord' ? (
          <DiscordStatsModal
            isOpen={!!viewingContent}
            onClose={() => setViewingContent(null)}
            session={viewingContent as any}
          />
        ) : (
          <ContentDetailModal 
            isOpen={!!viewingContent}
            onClose={() => setViewingContent(null)}
            item={viewingContent}
          />
        )}

        <AddCampaignModal 
          isOpen={isCreatingCampaign || isEditingCampaign} 
          isEditing={isEditingCampaign}
          onClose={() => {
            setIsCreatingCampaign(false);
            setIsEditingCampaign(false);
            setEditingCampaignId(null);
            setNewCampaign({ name: '', description: '', client_id: '', twitter_url: '', contact_info: '', budget: 0, slug: '' });
          }} 
          onSubmit={isEditingCampaign ? handleUpdateCampaign : handleCreateCampaign} 
          newCampaign={newCampaign} 
          setNewCampaign={setNewCampaign}
          clients={users.filter(u => u.role === 'client')}
        />
        <AddUserModal 
          isOpen={isAddingUser} 
          onClose={() => setIsAddingUser(false)} 
          onSubmit={handleAddUser} 
          email={newUser.email} 
          setEmail={e => setNewUser({...newUser, email: e})} 
          role={newUser.role} 
          setRole={r => setNewUser({...newUser, role: r, linked_campaign_id: r === 'client' ? newUser.linked_campaign_id : undefined})} 
          campaigns={campaigns}
          linkedCampaignId={newUser.linked_campaign_id}
          setLinkedCampaignId={id => setNewUser({...newUser, linked_campaign_id: id})}
        />
         <AudienceGeoModal user={editingAudienceUser} onClose={() => setEditingAudienceUser(null)} onSave={async (id, geo) => { await supabase.from('users').update({ audience_geo: geo }).eq('id', id); setEditingAudienceUser(null); success("Audiencia actualizada"); }} />
        <TwitchStatsModal isOpen={isTwitchModalOpen} onClose={() => setIsTwitchModalOpen(false)} isAnalyzing={isAnalyzingTwitch} stats={twitchStats} onSave={handleSaveTwitch} previewImage={twitchPreview} />

        <ContentModal 
          isOpen={isContentModalOpen} 
          onClose={() => {
            setIsContentModalOpen(false);
            setEditingContent(null);
          }}
          campaigns={campaigns}
          users={users.filter(u => u.role !== 'client')}
          editingContent={editingContent as any}
          isProcessing={isProcessingContent}
          onTwitchUpload={async (file, creatorId, dCount, aCount, pCount, uvCount, uChatters, vCount, fCount, sCount, title, campaign_id, platform) => {
            await handleTwitchUpload(file, user?.id || '', creatorId || null, editingContent as any, campaigns, dCount, aCount, pCount, uvCount, uChatters, vCount, fCount, sCount, title, campaign_id, platform);
          }}
          onSubmit={async (data) => {
            await handleContentSubmit(data, user?.id || '', editingContent as any, () => setIsContentModalOpen(false));
          }}
        />
        <CreatorSearchModal isOpen={isAnalyzingCreator} onClose={() => setIsAnalyzingCreator(false)} />

        {selectedCampaignReport && (
          <CampaignReportModal
            isOpen={!!selectedCampaignReport}
            onClose={() => setSelectedCampaignReport(null)}
            campaign={campaigns.find(c => c.id === selectedCampaignReport) || null}
            content={content}
            users={users}
            onFilterChange={({ platform, creatorId, campaignId }) => {
              if (platform) setFilter('platform', platform);
              if (creatorId) setFilter('creator', creatorId);
              if (campaignId) setFilter('campaign', campaignId);
              setActiveTab('content');
              setSelectedCampaignReport(null);
              setTimeout(() => {
                document.getElementById('content-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}

        <DeletedItemModal 
          viewingDeleted={viewingDeleted}
          onClose={() => setViewingDeleted(null)}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
        />
      </main>
    </div>
  );
}

