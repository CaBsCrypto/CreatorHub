import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase, Campaign, Content, UserProfile } from '../supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { Globe, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';

// Refactored Components
import PublicReviewHeader from '../components/public/PublicReviewHeader';
import PublicHeroStats from '../components/public/PublicHeroStats';
import PublicReviewSidebar from '../components/public/PublicReviewSidebar';
import PublicContentGrid from '../components/public/PublicContentGrid';
import PublicModals from '../components/public/PublicModals';

// Hooks & Utils
import { getProxiedUrl } from '../utils/urlHelpers';
import { getReviewTranslations } from '../components/public/translations';

export default function PublicReview() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [project, setProject] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filterPlatform, setFilterPlatformLocal] = useState(searchParams.get('platform') || 'all');
  const [filterCreatorId, setFilterCreatorIdLocal] = useState(searchParams.get('creator') || 'all');
  const [activeSection, setActiveSectionLocal] = useState<'content' | 'creators' | 'stats'>('content');
  const [showPlatformsModal, setShowPlatformsModal] = useState(false);
  const [showTop5Modal, setShowTop5Modal] = useState(false);
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
              photo_url: u.photo_url ? getProxiedUrl(u.photo_url, 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png') : null
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
    content.forEach(c => { if (c.platform) { const p = c.platform.toLowerCase(); platforms[p] = (platforms[p] || 0) + 1; } });
    return { totalViews, totalEngagement, platforms };
  }, [campaign, content]);

  const filteredContent = useMemo(() => {
    const arr = content.filter(item => {
      const matchPlatform = filterPlatform === 'all' || item.platform?.toLowerCase() === filterPlatform.toLowerCase();
      const matchCreator = filterCreatorId === 'all' || item.creator_id === filterCreatorId;
      return matchPlatform && matchCreator;
    });
    return arr.sort((a, b) => (b.views || 0) - (a.views || 0));
  }, [content, filterPlatform, filterCreatorId]);

  const rankingContent = useMemo(() => {
    if (modalLimit === '5') return filteredContent.slice(0, 5);
    if (modalLimit === '10') return filteredContent.slice(0, 10);
    return filteredContent;
  }, [filteredContent, modalLimit]);

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
            setShowPlatformsModal={setShowPlatformsModal}
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
            setFilters={setFilters}
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
        showNotesModal={showNotesModal}
        setShowNotesModal={setShowNotesModal}
        stats={stats}
        filterPlatform={filterPlatform}
        setFilters={setFilters}
        rankingContent={rankingContent}
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
    </div>
  );
}
