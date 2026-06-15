import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase, Campaign, Content, UserProfile } from '../supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { Globe, StickyNote, Youtube, Instagram, Music2, Twitter, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Refactored Components
import PublicReviewHeader from '../components/public/PublicReviewHeader';
import PublicHeroStats from '../components/public/PublicHeroStats';
import PublicReviewSidebar from '../components/public/PublicReviewSidebar';
import PublicContentGrid from '../components/public/PublicContentGrid';
import PublicModals from '../components/public/PublicModals';

// Hooks & Utils
import { getProxiedUrl } from '../utils/urlHelpers';
import { getReviewTranslations } from '../components/public/translations';

const platformConfig = {
  youtube: { icon: Youtube, color: 'text-red-500', bg: 'bg-red-50', label: 'YouTube' },
  instagram: { icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-50', label: 'Instagram' },
  instagram_story: { icon: Instagram, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Instagram Story' },
  tiktok: { icon: Music2, color: 'text-gray-900', bg: 'bg-gray-100', label: 'TikTok' },
  x: { icon: Twitter, color: 'text-indigo-900', bg: 'bg-indigo-50', label: 'X (Twitter)' },
  coinmarketcap: { icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'CoinMarketCap' },
  twitch: { icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Stream' },
  discord: { icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Discord' },
  baseapp: { icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50', label: 'BaseApp' }
};

function aggregateContentItems(filteredItems: Content[], allItems: Content[]): Content[] {
  const allGroups = new Map<string, Content[]>();
  allItems.forEach(item => {
    const groupId = item.parent_id || item.id;
    if (!allGroups.has(groupId)) {
      allGroups.set(groupId, []);
    }
    allGroups.get(groupId)!.push(item);
  });

  const matchedGroupIds = new Set<string>();
  filteredItems.forEach(item => {
    const groupId = item.parent_id || item.id;
    matchedGroupIds.add(groupId);
  });

  const result: Content[] = [];
  
  matchedGroupIds.forEach(groupId => {
    const groupMembers = allGroups.get(groupId) || [];
    const filteredGroupMembers = groupMembers.filter(m => filteredItems.some(f => f.id === m.id));
    if (filteredGroupMembers.length === 0) return;
    
    const masterInFiltered = filteredGroupMembers.find(m => m.id === groupId);
    const representative = masterInFiltered || filteredGroupMembers[0];
    
    const totalViews = groupMembers.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalLikes = groupMembers.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const totalComments = groupMembers.reduce((acc, curr) => acc + (curr.comments || 0), 0);
    const totalUniqueViewers = groupMembers.reduce((acc, curr) => acc + (curr.unique_viewers || 0), 0);
    const totalPeekViewers = groupMembers.reduce((acc, curr) => acc + (curr.peek_viewers || 0), 0);
    const totalSharesCount = groupMembers.reduce((acc, curr) => acc + (curr.shares_count || 0), 0);
    const totalFollowers = groupMembers.reduce((acc, curr) => acc + (curr.followers || 0), 0);
    const totalNewSubscriptions = groupMembers.reduce((acc, curr) => acc + (curr.new_subscriptions || 0), 0);
    
    const allPlatforms = groupMembers.map(m => m.platform);
    const uniqueGroupPlatforms = [...new Set(allPlatforms)];

    result.push({
      ...representative,
      is_repost: false, // Treat as master to represent group
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      unique_viewers: totalUniqueViewers,
      peek_viewers: totalPeekViewers,
      shares_count: totalSharesCount,
      followers: totalFollowers,
      new_subscriptions: totalNewSubscriptions,
      coupledPlatforms: uniqueGroupPlatforms,
      coupledPosts: groupMembers
    } as any);
  });

  return result.sort((a, b) => (b.views || 0) - (a.views || 0));
}

export default function PublicReview() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [project, setProject] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewingCoupledContent, setViewingCoupledContent] = useState<Content | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filterPlatform, setFilterPlatformLocal] = useState(searchParams.get('platform') || 'all');
  const [filterCreatorId, setFilterCreatorIdLocal] = useState(searchParams.get('creator') || 'all');
  const [activeSection, setActiveSectionLocal] = useState<'content' | 'creators' | 'stats'>('content');
  const [showPlatformsModal, setShowPlatformsModal] = useState(false);
  const [showTop5Modal, setShowTop5Modal] = useState(false);
  const [showCreatorRankingModal, setShowCreatorRankingModal] = useState(false);
  const [modalLimit, setModalLimit] = useState<'5'|'10'|'all'>('10');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [lang, setLangLocal] = useState<'en' | 'es'>((searchParams.get('lang') as 'en' | 'es') || 'en');

  useEffect(() => {
    setFilterPlatformLocal(searchParams.get('platform') || 'all');
    setFilterCreatorIdLocal(searchParams.get('creator') || 'all');
    setActiveSectionLocal((searchParams.get('section') as any) || 'content');
    setLangLocal((searchParams.get('lang') as any) || 'en');
  }, [searchParams]);

  const setFilters = (updates: Partial<{ platform: string; creator: string; section: 'content' | 'creators' | 'stats' }>) => {
    if (updates.platform !== undefined) setFilterPlatformLocal(updates.platform.trim().toLowerCase());
    if (updates.creator !== undefined) setFilterCreatorIdLocal(updates.creator);
    if (updates.section !== undefined) setActiveSectionLocal(updates.section);
    
    const params = new URLSearchParams(searchParams);
    if (updates.platform !== undefined) params.set('platform', updates.platform.trim().toLowerCase());
    if (updates.creator !== undefined) params.set('creator', updates.creator);
    if (updates.section !== undefined) params.set('section', updates.section);
    setSearchParams(params);
  };

  const setFilterPlatform = (val: string) => setFilters({ platform: val });
  const setFilterCreatorId = (val: string) => setFilters({ creator: val });
  const setActiveSection = (val: 'content' | 'creators' | 'stats') => setFilters({ section: val });

  const setLang = (val: 'en' | 'es') => {
    setLangLocal(val);
    const params = new URLSearchParams(searchParams);
    params.set('lang', val);
    setSearchParams(params);
  };

  const t = getReviewTranslations(lang);

  useEffect(() => {
    async function fetchPublicData() {
      if (!token) return;
      try {
        setLoading(true);
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
        const campaignQuery = supabase.from('campaigns').select('*');
        if (isUUID) { campaignQuery.or(`share_token.eq.${token},slug.eq.${token}`); }
        else { campaignQuery.eq('slug', token); }
        
        const { data: campaignData, error: campaignError } = await campaignQuery.single();
        if (campaignError || !campaignData) throw new Error('Campaña no encontrada.');
        setCampaign(campaignData);

        const { data: contentData, error: contentError } = await supabase
          .from('content').select('*').eq('campaign_id', campaignData.id).eq('status', 'active').is('deleted_at', null);
        if (contentError) throw contentError;
        setContent(contentData || []);

        const creatorIds = [...new Set(contentData?.map(c => c.creator_id).filter(Boolean))];
        const nameFallbackMap = new Map<string, string>();
        contentData?.forEach(c => { 
          if (c.creator_id && (c as any).guest_name) nameFallbackMap.set(c.creator_id, (c as any).guest_name); 
        });

        if (creatorIds.length > 0) {
          try {
            const { data: userData } = await supabase.from('users').select('*').in('id', creatorIds);
            const finalUsers = (userData || []).map(u => ({ 
              ...u, 
              display_name: (u as any).admin_alias || u.display_name || nameFallbackMap.get(u.id) || null,
              photo_url: u.photo_url ? getProxiedUrl(u.photo_url, 'https://cdn-icons-png.flaticon.com/512/114/1144760.png') : null
            }));
            const fetchedIds = new Set(finalUsers.map(u => u.id));
            const stubs: UserProfile[] = creatorIds.filter(id => id && !fetchedIds.has(id)).map(id => ({
              id: id as string, role: 'creator', email: '', display_name: nameFallbackMap.get(id as string) || null,
              photo_url: null, payment_method: null, binance_id: null, wallet_address: null,
              wallet_network: null, created_at: new Date().toISOString()
            }));
            setUsers([...finalUsers, ...stubs]);
          } catch {
            setUsers(creatorIds.map(id => ({
              id: id as string, role: 'creator', email: '', display_name: nameFallbackMap.get(id as string) || null,
              photo_url: null, payment_method: null, binance_id: null, wallet_address: null,
              wallet_network: null, created_at: new Date().toISOString()
            })));
          }
        }

        if (campaignData.client_id) {
          const { data: projectData } = await supabase.from('users').select('*').eq('id', campaignData.client_id).single();
          if (projectData) setProject(projectData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicData();
  }, [token]);

  const stats = useMemo(() => {
    if (!campaign) return null;
    const totalViews = content.reduce((s, c) => s + (c.views || 0), 0);
    const totalEngagement = content.reduce((s, c) => s + (c.likes || 0) + (c.comments || 0), 0);
    const platforms: Record<string, number> = {};
    const platformStats: Record<string, { views: number; likes: number; comments: number }> = {};
    
    content.forEach(c => { 
      if (c.platform) { 
        const p = c.platform.toLowerCase(); 
        platforms[p] = (platforms[p] || 0) + 1;
        
        if (!platformStats[p]) {
          platformStats[p] = { views: 0, likes: 0, comments: 0 };
        }
        platformStats[p].views += (c.views || 0);
        platformStats[p].likes += (c.likes || 0);
        platformStats[p].comments += (c.comments || 0);
      } 
    });
    return { totalViews, totalEngagement, platforms, platformStats };
  }, [campaign, content]);

  const filteredContent = useMemo(() => {
    const arr = content.filter(item => {
      const matchPlatform = filterPlatform === 'all' || item.platform?.toLowerCase() === filterPlatform.toLowerCase();
      const matchCreator = filterCreatorId === 'all' || item.creator_id === filterCreatorId;
      return matchPlatform && matchCreator;
    });
    return aggregateContentItems(arr, content);
  }, [content, filterPlatform, filterCreatorId]);

  const rankingContent = useMemo(() => {
    if (modalLimit === '5') return filteredContent.slice(0, 5);
    if (modalLimit === '10') return filteredContent.slice(0, 10);
    return filteredContent;
  }, [filteredContent, modalLimit]);

  const creatorRanking = useMemo(() => {
    return users.map(user => {
      const creatorContent = content.filter(c => c.creator_id === user.id);
      const views = creatorContent.reduce((sum, c) => sum + (c.views || 0), 0);
      const likes = creatorContent.reduce((sum, c) => sum + (c.likes || 0), 0);
      const comments = creatorContent.reduce((sum, c) => sum + (c.comments || 0), 0);
      const postsCount = creatorContent.length;

      return {
        user,
        views,
        likes,
        comments,
        postsCount
      };
    }).sort((a, b) => b.views - a.views);
  }, [users, content]);;

  if (loading) return <LoadingSpinner message={t.loading} />;

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white border border-gray-100 p-12 rounded-[3.5rem] shadow-xl text-center max-w-lg">
          <div className="w-24 h-24 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Globe className="h-12 w-12 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">{t.notFound}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed font-medium">{t.notFoundDesc}</p>
          <a href="/" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 inline-block">{t.backHome}</a>
        </div>
      </div>
    );
  }

  const uniqueContentCount = content.filter(item => !item.is_repost).length;
  const progressPercentage = Math.min(100, Math.round((uniqueContentCount / (campaign.target_posts || 1)) * 100));

  return (
    <div className="min-h-screen bg-[#fafafc] pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      <PublicReviewHeader
        project={project}
        campaign={campaign}
        progressPercentage={progressPercentage}
        lang={lang}
        setLang={setLang}
        filterCreatorId={filterCreatorId}
        filterPlatform={filterPlatform}
        setFilters={setFilters}
        translations={{ clientReport: t.clientReport, live: t.live }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <PublicHeroStats
          stats={stats}
          postsCount={uniqueContentCount}
          creatorsCount={users.length}
          translations={{ totalViews: t.totalViews, posts: t.posts, activeCreators: t.activeCreators }}
          onViewsClick={() => setShowTop5Modal(true)}
          onPostsClick={() => setFilters({ section: 'content', platform: 'all', creator: 'all' })}
          onCreatorsClick={() => setActiveSection('creators')}
        />

        {campaign.notes && (
          <div className="flex justify-center mb-8">
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowNotesModal(true)}
              className="flex items-center gap-2.5 px-6 py-3 bg-white border border-indigo-100 rounded-2xl text-sm font-black text-indigo-600 uppercase tracking-widest shadow-sm hover:shadow-lg hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-300 group"
            >
              <StickyNote className="h-4 w-4 group-hover:rotate-6 transition-transform" />
              {t.additionalInfo}
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            </motion.button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          <PublicContentGrid
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            filteredContent={filteredContent}
            users={users}
            filterPlatform={filterPlatform}
            setFilterPlatform={setFilterPlatform}
            filterCreatorId={filterCreatorId}
            setFilterCreatorId={setFilterCreatorId}
            setFilters={setFilters}
            setSelectedImage={setSelectedImage}
            onCoupledClick={setViewingCoupledContent}
            setShowPlatformsModal={setShowPlatformsModal}
            setShowCreatorRankingModal={setShowCreatorRankingModal}
            lang={lang}
            translations={{
              publishedContent: t.publishedContent,
              creatorDirectory: t.creatorDirectory,
              anonymous: t.anonymous,
              posts: t.posts,
              noResults: t.noResults,
              allPlatforms: t.allPlatforms,
              allCreators: t.allCreators
            }}
          />

          <PublicReviewSidebar
            stats={stats}
            filterPlatform={filterPlatform}
            setFilterPlatform={setFilterPlatform}
            filterCreatorId={filterCreatorId}
            setFilters={setFilters}
            setShowCreatorRankingModal={setShowCreatorRankingModal}
            creatorRanking={creatorRanking}
            lang={lang}
            translations={{ platformDistribution: t.platformDistribution, viewAllPlatforms: t.viewAllPlatforms }}
          />
        </div>
      </div>

      <PublicModals
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        showPlatformsModal={showPlatformsModal}
        setShowPlatformsModal={setShowPlatformsModal}
        showTop5Modal={showTop5Modal}
        setShowTop5Modal={setShowTop5Modal}
        showCreatorRankingModal={showCreatorRankingModal}
        setShowCreatorRankingModal={setShowCreatorRankingModal}
        showNotesModal={showNotesModal}
        setShowNotesModal={setShowNotesModal}
        stats={stats}
        filterPlatform={filterPlatform}
        setFilters={setFilters}
        rankingContent={rankingContent}
        creatorRanking={creatorRanking}
        users={users}
        campaign={campaign}
        modalLimit={modalLimit}
        setModalLimit={setModalLimit}
        lang={lang}
        translations={{
          platformDistribution: t.platformDistribution,
          top5Content: t.top5Content,
          additionalInfo: t.additionalInfo,
          anonymous: t.anonymous,
          close: t.close,
          allContent: t.allContent
        }}
      />

      <AnimatePresence>
        {viewingCoupledContent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setViewingCoupledContent(null)} />
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-8 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Publicaciones Acopladas</h2>
                  <p className="text-xs font-medium text-slate-500 mt-1 font-bold text-slate-500">Este post agrupa las métricas de las siguientes publicaciones</p>
                </div>
                <button onClick={() => setViewingCoupledContent(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-gray-50 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {(viewingCoupledContent as any).coupledPosts?.map((post: any) => {
                  const postConfig = platformConfig[post.platform as 'youtube'] || { icon: Globe, color: 'text-gray-400', bg: 'bg-gray-50', label: post.platform };
                  const PostIcon = postConfig.icon;

                  return (
                    <a
                      key={post.id}
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${postConfig.bg} flex items-center justify-center`}>
                          <PostIcon className={`h-5 w-5 ${postConfig.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-wide truncate max-w-[200px] leading-tight">
                            {postConfig.label}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px] leading-none mt-1">
                            {post.title || post.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Views */}
                        <div className="text-right min-w-[50px]">
                          <p className="text-xs font-black text-slate-800 leading-tight">
                            {(post.views || 0).toLocaleString()}
                          </p>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                            Vistas
                          </p>
                        </div>
                        {/* Likes */}
                        <div className="text-right min-w-[45px]">
                          <p className="text-xs font-black text-slate-700 leading-tight">
                            {(post.likes || 0).toLocaleString()}
                          </p>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                            Likes
                          </p>
                        </div>
                        {/* Comments */}
                        <div className="text-right min-w-[45px]">
                          <p className="text-xs font-black text-slate-700 leading-tight">
                            {(post.comments || 0).toLocaleString()}
                          </p>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                            Coment.
                          </p>
                        </div>
                        <div className="p-2 text-slate-400 group-hover:text-indigo-650 group-hover:bg-white rounded-xl shadow-sm border border-slate-100 group-hover:border-indigo-200 transition-all">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
