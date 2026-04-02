import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase, Campaign, Content, UserProfile } from '../supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Zap, Users, Music2, Instagram, Youtube, Twitter, Globe,
  TrendingUp, BarChart3, Award, ArrowLeft, PieChart, LayoutGrid, X,
  Eye, Heart, MessageCircle, ExternalLink, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function getProxiedUrl(url: string | null | undefined, fallback: string) {
  if (!url) return fallback;
  if (url.includes('weserv.nl') || url.includes('base64')) return url;
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=${encodeURIComponent(fallback)}`;
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
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filterPlatform, setFilterPlatformLocal] = useState(searchParams.get('platform') || 'all');
  const [filterCreatorId, setFilterCreatorIdLocal] = useState(searchParams.get('creator') || 'all');
  const [activeSection, setActiveSectionLocal] = useState<'content' | 'creators' | 'stats'>('content');
  const [showPlatformsModal, setShowPlatformsModal] = useState(false);
  const [showTop5Modal, setShowTop5Modal] = useState(false);
  const [modalLimit, setModalLimit] = useState<'5'|'10'|'all'>('10');
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

  const t = {
    en: {
      clientReport: "Campaign Report", live: "Live", posts: "Posts",
      totalViews: "Total Views", creators: "Creators", activeCreators: "Creators",
      filterByPlatform: "FILTER BY PLATFORM", allPlatforms: "ALL PLATFORMS",
      creatorDirectory: "CREATOR DIRECTORY", allCreators: "ALL CREATORS",
      publishedContent: "PUBLISHED CONTENT", views: "Views",
      loading: "Generating report...", notFound: "Report not found",
      notFoundDesc: "This report doesn't exist or the link has expired.",
      backHome: "Back to Home", anonymous: "Anonymous Creator",
      searchCreators: "Search creators...", platformDistribution: "Platforms",
      noResults: "No content matches the filters", viewAllPlatforms: "View all",
      engagement: "Engagement", top5Content: "Content Ranking"
    },
    es: {
      clientReport: "Reporte de Campaña", live: "En Vivo", posts: "Posts",
      totalViews: "Vistas Totales", creators: "Creadores", activeCreators: "Creadores",
      filterByPlatform: "FILTRAR POR RED", allPlatforms: "TODAS LAS REDES",
      creatorDirectory: "DIRECTORIO DE CREADORES", allCreators: "TODOS",
      publishedContent: "CONTENIDO PUBLICADO", views: "Vistas",
      loading: "Generando reporte...", notFound: "Enlace no disponible",
      notFoundDesc: "Este reporte no existe o el enlace ha caducado.",
      backHome: "Volver al inicio", anonymous: "Creador Anónimo",
      searchCreators: "Buscar creadores...", platformDistribution: "Plataformas",
      noResults: "Sin contenido para los filtros seleccionados", viewAllPlatforms: "Ver todo",
      engagement: "Engagement", top5Content: "Ranking de Contenido"
    }
  }[lang];

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
          .from('content').select('*').eq('campaign_id', campaignData.id).eq('status', 'active');
        if (contentError) throw contentError;
        setContent(contentData || []);

        const creatorIds = [...new Set(contentData?.map(c => c.creator_id).filter(Boolean))];
        const nameFallbackMap = new Map<string, string>();
        contentData?.forEach(c => { if (c.creator_id && (c as any).guest_name) nameFallbackMap.set(c.creator_id, (c as any).guest_name); });

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
  }, [content]);

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

  const animatedViews = useCountUp(stats?.totalViews || 0);
  const animatedPosts = useCountUp(content.length);
  const animatedCreators = useCountUp(users.length);
  const animatedEngagement = useCountUp(stats?.totalEngagement || 0);

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

  const progressPercentage = Math.min(100, Math.round((content.length / (campaign.target_posts || 1)) * 100));

  return (
    <div className="min-h-screen bg-[#fafafc] pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Premium Light Header */}
      <div className="relative bg-white/70 border-b border-gray-100 sticky top-0 z-50 backdrop-blur-xl">
        {/* Subtle indigo top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
            {(filterCreatorId !== 'all' || filterPlatform !== 'all') && (
              <button
                onClick={() => setFilters({ creator: 'all', platform: 'all', section: 'content' })}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 transition-all border border-gray-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}

            {/* Logo/Brand area */}
            <div className="flex items-center gap-3 min-w-0">
              {project?.photo_url ? (
                <img src={project.photo_url} alt="" className="w-10 h-10 rounded-2xl object-cover ring-4 ring-indigo-50 flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-100">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="hidden sm:inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[9px] font-black uppercase tracking-widest">{t.clientReport}</span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.live}</span>
                </div>
                <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  {project?.display_name || campaign.name}
                </h1>
                {project && <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{campaign.name}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center bg-gray-50 p-0.5 rounded-xl border border-gray-200">
              {(['en', 'es'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === l ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                >{l.toUpperCase()}</button>
              ))}
            </div>

            {/* Progress Ring (desktop) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-1000 rounded-full" style={{ width: `${progressPercentage}%` }} />
              </div>
              <span className="text-[10px] font-black text-indigo-600">{progressPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Stats — Glassmorphism cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-8 mb-8">
          <HeroStatCard
            icon={<Eye className="h-5 w-5" />}
            label={t.totalViews}
            value={animatedViews.toLocaleString()}
            color="indigo"
            onClick={() => setShowTop5Modal(true)}
          />
          <HeroStatCard
            icon={<BarChart3 className="h-5 w-5" />}
            label={t.posts}
            value={animatedPosts.toString()}
            color="purple"
            onClick={() => setFilters({ section: 'content', platform: 'all', creator: 'all' })}
          />
          <HeroStatCard
            icon={<Users className="h-5 w-5" />}
            label={t.activeCreators}
            value={animatedCreators.toString()}
            color="emerald"
            onClick={() => setActiveSection('creators')}
          />
        </div>

        {/* Mobile Nav Tabs */}
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="flex-1 flex items-center bg-white/5 border border-white/10 p-1 rounded-2xl">
            {[
              { id: 'content', label: lang === 'en' ? 'Feed' : 'Contenido', icon: LayoutGrid },
              { id: 'creators', label: lang === 'en' ? 'Creators' : 'Autores', icon: Users }
            ].map(tab => (
              <button key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSection === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowPlatformsModal(true)}
            className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
          >
            <PieChart className="h-5 w-5" />
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          {/* Content / Creators Area */}
          <div className={`lg:col-span-3 ${activeSection === 'stats' ? 'hidden lg:block' : 'block'}`}>
            {/* Section Header + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-indigo-500" />
                  {activeSection === 'content' ? t.publishedContent : t.creatorDirectory}
                </h3>
                {filterCreatorId !== 'all' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[9px] font-black uppercase">
                    {users.find(u => u.id === filterCreatorId)?.display_name || t.anonymous}
                    <button onClick={() => setFilters({ creator: 'all' })} className="hover:text-indigo-800"><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                {filterPlatform !== 'all' && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[9px] font-black uppercase">
                    {filterPlatform}
                    <button onClick={() => setFilters({ platform: 'all' })} className="hover:text-indigo-800"><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-500 outline-none focus:border-indigo-400 transition-colors cursor-pointer shadow-sm"
                >
                  <option value="all">{t.allPlatforms}</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="x">X / Twitter</option>
                  <option value="twitch">Stream</option>
                  <option value="coinmarketcap">CMC</option>
                </select>
                <select value={filterCreatorId} onChange={e => setFilterCreatorId(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-500 outline-none focus:border-indigo-400 transition-colors cursor-pointer shadow-sm"
                >
                  <option value="all">{t.allCreators}</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.display_name || t.anonymous}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Creators Grid */}
            {activeSection === 'creators' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-4">
                {users.map((u, i) => {
                  const posts = content.filter(c => c.creator_id === u.id);
                  const views = posts.reduce((s, c) => s + (c.views || 0), 0);
                  const isFiltered = filterCreatorId === u.id;
                  return (
                    <motion.button
                      key={u.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setFilters({ creator: isFiltered ? 'all' : u.id, section: 'content' })}
                      className={`p-5 rounded-[1.75rem] border text-left group transition-all duration-300 ${
                        isFiltered
                          ? 'bg-indigo-50 border-indigo-200 shadow-md'
                          : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-white font-black text-xl shadow-lg ${
                            !u.photo_url ? 'bg-indigo-600' : ''
                          }`}>
                            {u.photo_url
                              ? <img src={u.photo_url} alt={u.display_name || ''} className="w-full h-full object-cover" />
                              : (u.display_name || '?').charAt(0).toUpperCase()
                            }
                          </div>
                          {isFiltered && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                              <X className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm leading-tight">{u.display_name || t.anonymous}</p>
                          <div className="flex items-center justify-center gap-2 mt-1.5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{posts.length} {t.posts}</span>
                            <span className="w-0.5 h-3 bg-gray-200 rounded-full" />
                            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{views.toLocaleString()}</span>
                          </div>
                        </div>
                        <ChevronRight className={`h-3.5 w-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors ${isFiltered ? 'rotate-90' : ''}`} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 max-h-[78vh] overflow-y-auto pr-1 pb-12" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1e2e transparent' }}>
                  {filteredContent.map((item, i) => {
                    const creator = users.find(u => u.id === item.creator_id);
                    const isStream = item.platform === 'twitch';
                    const platformColors: Record<string, string> = {
                      youtube: 'from-rose-600 to-red-700', instagram: 'from-pink-600 to-rose-600',
                      tiktok: 'from-gray-800 to-gray-900', x: 'from-sky-600 to-blue-700',
                      twitch: 'from-violet-700 to-purple-800', coinmarketcap: 'from-amber-600 to-orange-600',
                    };
                    const gradient = platformColors[item.platform] || 'from-indigo-600 to-blue-700';

                    return (
                      <motion.a
                        key={item.id}
                        href={isStream ? '#' : item.url}
                        onClick={(e) => { if (isStream && item.thumbnail) { e.preventDefault(); setSelectedImage(item.thumbnail); } }}
                        target={isStream ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025 }}
                        className="bg-white border border-gray-100 rounded-xl overflow-hidden group hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col cursor-pointer"
                      >
                        {/* Thumbnail / Color Bar */}
                        {isStream && item.thumbnail ? (
                          <div className="relative h-16 overflow-hidden flex-shrink-0 bg-gray-100">
                            <img src={getProxiedUrl(item.thumbnail, 'https://cdn-icons-png.flaticon.com/512/174/174855.png')} alt={item.title || 'Stream'} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                            <span className="absolute top-1.5 right-1.5 px-1 py-0.5 bg-indigo-600 text-white text-[6px] font-black uppercase tracking-wider rounded">STREAM</span>
                            <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-end justify-between">
                              <div>
                                <p className="text-[6px] font-black text-white/70 uppercase">Views</p>
                                <p className="text-[10px] font-black text-white leading-none">{(item.views || 0).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ) : item.thumbnail ? (
                          <div className="relative h-14 overflow-hidden flex-shrink-0 bg-gray-50">
                            <img src={getProxiedUrl(item.thumbnail, 'https://cdn-icons-png.flaticon.com/512/174/174855.png')} alt={item.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>
                        ) : (
                          <div className={`h-1 w-full bg-gradient-to-r ${gradient} flex-shrink-0`} />
                        )}

                        <div className="p-2 flex flex-col gap-1 flex-1">
                          {/* Creator + platform row */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 min-w-0">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black text-white overflow-hidden flex-shrink-0 ${!creator?.photo_url ? `bg-gradient-to-br ${gradient}` : ''}`}>
                                {creator?.photo_url
                                  ? <img src={creator.photo_url} alt="" className="w-full h-full object-cover" />
                                  : (creator?.display_name || '?').charAt(0).toUpperCase()
                                }
                              </div>
                              <span className="text-[8px] font-bold text-slate-500 truncate">{creator?.display_name || t.anonymous}</span>
                            </div>
                          </div>
                          {/* Title */}
                          <p className="text-[9px] font-bold text-slate-800 line-clamp-2 leading-tight flex-1">
                            {item.title || (isStream ? `Stream · ${new Date(item.uploaded_at || item.created_at).toLocaleDateString()}` : '—')}
                          </p>

                          {/* Stats row */}
                          <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                            <div className="flex items-center gap-1">
                              <Eye className="h-2 w-2 text-gray-300" />
                              <span className="text-[8px] font-black text-slate-900">{(item.views ?? 0).toLocaleString()}</span>
                            </div>
                            {!isStream && (item.likes || 0) > 0 && (
                              <div className="flex items-center gap-1">
                                <Heart className="h-2 w-2 text-gray-300" />
                                <span className="text-[8px] font-black text-gray-500">{(item.likes || 0).toLocaleString()}</span>
                              </div>
                            )}
                            <ExternalLink className="h-2 w-2 text-gray-200 ml-auto group-hover:text-indigo-400 transition-colors" />
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center shadow-sm">
                <Globe className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t.noResults}</p>
              </div>
            )}
          </div>

          {/* Sidebar — Platforms + Brand */}
          <div className="hidden lg:flex flex-col gap-6">
            {/* Platform Filter Panel */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">{t.platformDistribution}</h3>
              <div className="space-y-2">
                {filterPlatform !== 'all' && (
                  <button onClick={() => setFilterPlatform('all')}
                    className="flex items-center gap-1.5 py-2 text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" /> {t.viewAllPlatforms}
                  </button>
                )}
                {Object.entries(stats?.platforms || {}).map(([platform, count]) => (
                  <button key={platform} onClick={() => setFilters({ platform, section: 'content' })}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 border gap-3 ${
                      filterPlatform === platform.toLowerCase()
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100'
                        : 'bg-white border-gray-50 hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                        filterPlatform === platform.toLowerCase() ? 'bg-white/20 text-white' : getPlatformColor(platform)
                      }`}>
                        {getPlatformIcon(platform, 'h-4 w-4')}
                      </div>
                      <span className={`text-sm font-black capitalize ${filterPlatform === platform.toLowerCase() ? 'text-white' : 'text-slate-700'}`}>
                        {platform.toLowerCase() === 'coinmarketcap' ? 'CMC' : platform.toLowerCase() === 'twitch' ? 'Stream' : platform}
                      </span>
                    </div>
                    <span className={`text-base font-black ${filterPlatform === platform.toLowerCase() ? 'text-white' : 'text-slate-400'}`}>{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Card */}
            <div className="relative bg-white border border-gray-100 rounded-[2rem] p-6 overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-100">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">Umbra Creator Hub</h3>
                <p className="text-gray-500 text-xs font-medium leading-relaxed mb-4">
                  {lang === 'en'
                    ? 'Real-time campaign metrics connecting brands with top creators.'
                    : 'Métricas de campaña en tiempo real.'}
                </p>
                <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">© 2026 UMBRA AGENCY</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full rounded-[2rem] overflow-hidden shadow-2xl z-10"
              onClick={e => e.stopPropagation()}
            >
              <img src={getProxiedUrl(selectedImage, 'https://cdn-icons-png.flaticon.com/512/174/174855.png')} alt="Preview" className="w-full h-auto max-h-[85vh] object-contain" />
              <button onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platforms Modal (Mobile) */}
      <AnimatePresence>
        {showPlatformsModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPlatformsModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-lg bg-white border-t border-gray-100 rounded-t-[2.5rem] p-6 shadow-2xl"
            >
              <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.platformDistribution}</h3>
                <button onClick={() => setShowPlatformsModal(false)} className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {Object.entries(stats?.platforms || {}).map(([platform, count]) => (
                  <button key={platform}
                    onClick={() => { setFilters({ platform, section: 'content' }); setShowPlatformsModal(false); }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-95 ${
                      filterPlatform === platform.toLowerCase()
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100'
                        : 'bg-white border-gray-100 hover:border-indigo-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${filterPlatform === platform.toLowerCase() ? 'bg-white/20 text-white' : getPlatformColor(platform)}`}>
                        {getPlatformIcon(platform, 'h-4 w-4')}
                      </div>
                      <span className={`font-black capitalize ${filterPlatform === platform.toLowerCase() ? 'text-white' : 'text-slate-700'}`}>
                        {platform.toLowerCase() === 'coinmarketcap' ? 'CMC' : platform.toLowerCase() === 'twitch' ? 'Stream' : platform}
                      </span>
                    </div>
                    <span className={`text-xl font-black ${filterPlatform === platform.toLowerCase() ? 'text-white' : 'text-slate-400'}`}>{count}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowPlatformsModal(false)}
                className="w-full mt-5 py-4 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-gray-100"
              >
                {lang === 'en' ? 'Close' : 'Cerrar'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top 5 Modal */}
      <AnimatePresence>
        {showTop5Modal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTop5Modal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.top5Content}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={modalLimit}
                    onChange={(e: any) => setModalLimit(e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-500 outline-none focus:border-indigo-400 transition-colors cursor-pointer"
                  >
                    <option value="5">Top 5</option>
                    <option value="10">Top 10</option>
                    <option value="all">{lang === 'en' ? 'All Content' : 'Todos'}</option>
                  </select>
                  <button onClick={() => setShowTop5Modal(false)} className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                {rankingContent.map((item, index) => {
                  const creator = users.find(u => u.id === item.creator_id);
                  const isStream = item.platform === 'twitch';
                  return (
                    <a
                      key={item.id || index}
                      href={isStream ? '#' : item.url}
                      target={isStream ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all group"
                    >
                      <div className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-lg font-black text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate mb-1">{item.title || (isStream ? `Stream · ${new Date(item.uploaded_at || item.created_at).toLocaleDateString()}` : '—')}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-500">{creator?.display_name || t.anonymous}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-[10px] font-black text-indigo-600 flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {(item.views || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors text-gray-400">
                         {getPlatformIcon(item.platform || '', 'h-4 w-4')}
                      </div>
                    </a>
                  )
                })}
              </div>
              <button onClick={() => setShowTop5Modal(false)}
                className="w-full mt-6 py-4 bg-gray-50 border border-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-gray-100"
              >
                {lang === 'en' ? 'Close' : 'Cerrar'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeroStatCard({ icon, label, value, color, onClick }: {
  icon: React.ReactNode; label: string; value: string;
  color: 'indigo' | 'purple' | 'emerald' | 'rose'; onClick?: () => void;
}) {
  const colors = {
    indigo: { bg: 'bg-white hover:bg-gray-50', border: 'border-gray-100 hover:border-indigo-100', icon: 'bg-indigo-50 text-indigo-600', text: 'text-indigo-600' },
    purple: { bg: 'bg-white hover:bg-gray-50', border: 'border-gray-100 hover:border-purple-100', icon: 'bg-purple-50 text-purple-600', text: 'text-purple-600' },
    emerald: { bg: 'bg-white hover:bg-gray-50', border: 'border-gray-100 hover:border-emerald-100', icon: 'bg-emerald-50 text-emerald-600', text: 'text-emerald-600' },
    rose: { bg: 'bg-white hover:bg-gray-50', border: 'border-gray-100 hover:border-rose-100', icon: 'bg-rose-50 text-rose-600', text: 'text-rose-600' },
  }[color];

  return (
    <motion.button
      whileHover={{ y: -4, boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.1)" }}
      onClick={onClick}
      disabled={!onClick}
      className={`relative ${colors.bg} border ${colors.border} rounded-[2.5rem] p-5 sm:p-6 text-left w-full overflow-hidden group transition-all duration-300 shadow-sm ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-gray-50 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl ${colors.icon} flex items-center justify-center mb-4 relative z-10 shadow-sm`}>
        <div className="h-4 w-4 sm:h-5 sm:w-5">{icon}</div>
      </div>
      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">{label}</p>
      <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter relative z-10">{value}</span>
    </motion.button>
  );
}

function getPlatformIcon(platform: string, className = 'h-4 w-4') {
  switch (platform) {
    case 'tiktok': return <Music2 className={className} />;
    case 'instagram': return <Instagram className={className} />;
    case 'youtube': return <Youtube className={className} />;
    case 'x': return <Twitter className={className} />;
    case 'twitch': return <Zap className={className} />;
    case 'coinmarketcap': return <TrendingUp className={className} />;
    default: return <Globe className={className} />;
  }
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case 'tiktok': return 'bg-slate-900 text-white';
    case 'instagram': return 'bg-pink-50 text-pink-600';
    case 'youtube': return 'bg-red-50 text-red-600';
    case 'x': return 'bg-sky-50 text-sky-600';
    case 'twitch': return 'bg-indigo-50 text-indigo-600';
    case 'coinmarketcap': return 'bg-amber-50 text-amber-600';
    default: return 'bg-gray-50 text-gray-400';
  }
}
