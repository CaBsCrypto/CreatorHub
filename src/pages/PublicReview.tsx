import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase, Campaign, Content, UserProfile } from '../supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Zap, Users, Music2, Instagram, Youtube, Twitter, Globe, 
  TrendingUp, Target, BarChart3, Award, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicReview() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [project, setProject] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state for immediate UI response
  const [filterPlatform, setFilterPlatformLocal] = useState(searchParams.get('platform') || 'all');
  const [filterCreatorId, setFilterCreatorIdLocal] = useState(searchParams.get('creator') || 'all');
  const [activeSection, setActiveSectionLocal] = useState<'content' | 'creators'>((searchParams.get('section') as 'content' | 'creators') || 'content');
  const [lang, setLangLocal] = useState<'en' | 'es'>((searchParams.get('lang') as 'en' | 'es') || 'en');

  // Sync URL -> Local (e.g. Back button)
  useEffect(() => {
    setFilterPlatformLocal(searchParams.get('platform') || 'all');
    setFilterCreatorIdLocal(searchParams.get('creator') || 'all');
    setActiveSectionLocal((searchParams.get('section') as any) || 'content');
    setLangLocal((searchParams.get('lang') as any) || 'en');
  }, [searchParams]);

  const setFilterPlatform = (val: string) => {
    const cleanVal = val.trim().toLowerCase();
    console.log('Switching platform filter to:', cleanVal);
    setFilterPlatformLocal(cleanVal);
    const params = new URLSearchParams(searchParams);
    params.set('platform', cleanVal);
    setSearchParams(params);
  };

  const setFilterCreatorId = (val: string) => {
    setFilterCreatorIdLocal(val);
    const params = new URLSearchParams(searchParams);
    params.set('creator', val);
    setSearchParams(params);
  };

  const setActiveSection = (val: 'content' | 'creators') => {
    setActiveSectionLocal(val);
    const params = new URLSearchParams(searchParams);
    params.set('section', val);
    setSearchParams(params);
  };

  const setLang = (val: 'en' | 'es') => {
    setLangLocal(val);
    const params = new URLSearchParams(searchParams);
    params.set('lang', val);
    setSearchParams(params);
  };

  const t = {
    en: {
      clientReport: "Client Report",
      live: "Live",
      posts: "Posts",
      totalViews: "Total Views",
      creators: "Creators",
      activeCreators: "Active Creators",
      filterByPlatform: "FILTER BY PLATFORM",
      allPlatforms: "ALL PLATFORMS",
      creatorDirectory: "CREATOR DIRECTORY",
      allCreators: "ALL CREATORS",
      publishedContent: "PUBLISHED CONTENT",
      views: "Views",
      loading: "Generating report...",
      notFound: "Report not found",
      notFoundDesc: "This report doesn't exist or the link has expired. Please contact your campaign manager.",
      backHome: "Back to Home",
      individualPerf: "View individual performance...",
      anonymous: "Anonymous Creator",
      agency: "Agency",
      searchCreators: "Search creators...",
      platformDistribution: "Platform Distribution",
      noResults: "No content matches the filters",
      viewAllPlatforms: "View all platforms"
    },
    es: {
      clientReport: "Reporte de Cliente",
      live: "En Vivo",
      posts: "Posteos",
      totalViews: "Vistas Totales",
      creators: "Creadores",
      activeCreators: "Participantes",
      filterByPlatform: "FILTRAR POR RED",
      allPlatforms: "TODAS LAS REDES",
      creatorDirectory: "DIRECTORIO DE CREADORES",
      allCreators: "TODOS LOS CREADORES",
      publishedContent: "CONTENIDO PUBLICADO",
      views: "Vistas",
      loading: "Generando reporte...",
      notFound: "Enlace no disponible",
      notFoundDesc: "Este reporte no existe o el enlace ha caducado. Por favor, contacta con tu manager de campaña.",
      backHome: "Volver al inicio",
      individualPerf: "Vea el desempeño individual...",
      anonymous: "Creador Anónimo",
      agency: "Agencia",
      searchCreators: "Buscar creadores...",
      platformDistribution: "Distribución por Red",
      noResults: "No hay contenido que coincida con los filtros",
      viewAllPlatforms: "Ver todas las redes"
    }
  }[lang];

  useEffect(() => {
    async function fetchPublicData() {
      if (!token) return;
      try {
        setLoading(true);
        
        // 1. Fetch Campaign by token
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('share_token', token)
          .single();

        if (campaignError || !campaignData) {
          throw new Error('Campaña no encontrada o enlace inválido.');
        }

        setCampaign(campaignData);

        // 2. Fetch Content for this campaign
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('*')
          .eq('campaign_id', campaignData.id)
          .eq('status', 'active');

        if (contentError) throw contentError;
        setContent(contentData || []);

        // 3. Fetch Users (Creators) involved
        const creatorIds = [...new Set(contentData?.map(c => c.creator_id).filter(Boolean))];
        
        // Collect potential names from content entries (as RLS fallback)
        const nameFallbackMap = new Map<string, string>();
        contentData?.forEach(c => {
          if (c.creator_id && (c as any).guest_name) {
            nameFallbackMap.set(c.creator_id, (c as any).guest_name);
          }
        });

        if (creatorIds.length > 0) {
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .in('id', creatorIds);
            
            if (userError) throw userError;
            
            // Merge fetched users with stubs and fill missing names from guest_name/alias
            const finalUsers = (userData || []).map(u => ({
              ...u,
              display_name: (u as any).admin_alias || u.display_name || nameFallbackMap.get(u.id) || null
            }));
            
            const fetchedUserIds = new Set(finalUsers.map(u => u.id));
            const missingStubs: UserProfile[] = creatorIds
              .filter(id => id && !fetchedUserIds.has(id))
              .map(id => ({
                id,
                role: 'creator',
                email: '',
                display_name: nameFallbackMap.get(id!) || null,
                photo_url: null,
                payment_method: null,
                binance_id: null,
                wallet_address: null,
                wallet_network: null,
                created_at: new Date().toISOString()
              }));

            setUsers([...finalUsers, ...missingStubs]);
          } catch (err) {
            console.warn('Could not fetch user profiles (likely RLS), using stubs:', err);
            const stubs: UserProfile[] = creatorIds.map(id => ({
              id: id!,
              role: 'creator',
              email: '',
              display_name: nameFallbackMap.get(id!) || null,
              photo_url: null,
              payment_method: null,
              binance_id: null,
              wallet_address: null,
              wallet_network: null,
              created_at: new Date().toISOString()
            }));
            setUsers(stubs);
          }
        }

        // 4. Fetch Project (Client) if exists
        if (campaignData.client_id) {
          const { data: projectData, error: projectError } = await supabase
            .from('users')
            .select('*')
            .eq('id', campaignData.client_id)
            .single();
          
          if (!projectError && projectData) {
            setProject(projectData);
          }
        }

      } catch (err: any) {
        console.error('Error fetching public campaign:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicData();
  }, [token]);

  const stats = useMemo(() => {
    if (!campaign) return null;
    
    const totalViews = content.reduce((sum, c) => sum + (c.views || 0), 0);
    const totalLikes = content.reduce((sum, c) => sum + (c.likes || 0), 0);
    const totalComments = content.reduce((sum, c) => sum + (c.comments || 0), 0);
    
    const platforms: Record<string, number> = {};
    content.forEach(c => {
      if (c.platform) {
        const p = c.platform.toLowerCase();
        platforms[p] = (platforms[p] || 0) + 1;
      }
    });

    return { totalViews, totalLikes, totalComments, platforms };
  }, [campaign, content]);

  const filteredContent = useMemo(() => {
    return content.filter(item => {
      const matchPlatform = filterPlatform === 'all' || item.platform?.toLowerCase() === filterPlatform.toLowerCase();
      const matchCreator = filterCreatorId === 'all' || item.creator_id === filterCreatorId;
      return matchPlatform && matchCreator;
    });
  }, [content, filterPlatform, filterCreatorId]);

  const scrollToContent = (immediate = false) => {
    const element = document.getElementById('content-feed');
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: immediate ? 'auto' : 'smooth'
      });
    }
  };

  // Removed automatic scroll on filter/section changes as per user request

  if (loading) return <LoadingSpinner message={t.loading} />;
  
  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 text-center max-w-lg">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Globe className="h-12 w-12 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">{t.notFound}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{t.notFoundDesc}</p>
          <a href="/" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform inline-block">{t.backHome}</a>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min(100, Math.round((content.length / (campaign.target_posts || 1)) * 100));


  return (
    <div className="min-h-screen bg-[#fafbfc] pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              {(filterCreatorId !== 'all' || filterPlatform !== 'all' || activeSection !== 'content') && (
                <button 
                  onClick={() => {
                    setFilterCreatorId('all');
                    setFilterPlatform('all');
                    setActiveSection('content');
                  }}
                  className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-gray-100 shadow-sm"
                  title="Volver"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{t.clientReport}</span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.live}</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase line-clamp-1">
                  {project?.display_name || campaign.name}
                </h1>
                {project && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    {campaign.name}
                  </p>
                )}
              </div>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('es')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'es' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                ES
              </button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Última Actualización</p>
              <p className="text-xs font-bold text-gray-900">{new Date().toLocaleDateString()} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="h-10 w-[1px] bg-gray-100 hidden sm:block" />
            <div className="flex flex-col items-center">
               <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
               </div>
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{progressPercentage}% Completado</span>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <MetricCard
            icon={<Zap className="h-5 w-5" />}
            title={t.totalViews}
            value={stats?.totalViews.toLocaleString() || '0'}
            color="emerald"
          />
          <MetricCard
            icon={<BarChart3 className="h-5 w-5" />}
            title={t.posts}
            value={content.length.toString()}
            color="indigo"
            onClick={() => {
              setActiveSection('content');
              setFilterPlatform('all');
              setFilterCreatorId('all');
            }}
          />
          <MetricCard
            icon={<Users className="h-5 w-5" />}
            title={t.activeCreators}
            value={users.length.toString()}
            color="purple"
            onClick={() => setActiveSection('creators')}
          />
        </div>

        {/* Distribution & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="content-feed">
          {/* Main Content Feed */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Award className="h-4 w-4 text-indigo-500" /> 
                 {activeSection === 'content' ? t.publishedContent : t.creatorDirectory}
               </h3>
               
               <div className="flex items-center gap-2">
                 <select 
                   value={filterPlatform}
                   onChange={(e) => setFilterPlatform(e.target.value)}
                   className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                   <option value="all">{t.allPlatforms}</option>
                   <option value="tiktok">TikTok</option>
                   <option value="instagram">Instagram</option>
                   <option value="youtube">YouTube</option>
                   <option value="x">X / Twitter</option>
                   <option value="twitch">Twitch</option>
                   <option value="coinmarketcap">CMC</option>
                 </select>

                 <select 
                   value={filterCreatorId}
                   onChange={(e) => setFilterCreatorId(e.target.value)}
                   className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                   <option value="all">{t.allCreators}</option>
                   {users.map(u => (
                     <option key={u.id} value={u.id}>{u.display_name || t.anonymous}</option>
                   ))}
                 </select>
               </div>
            </div>

            {activeSection === 'creators' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
                {users.map(user => {
                  const userPosts = content.filter(c => c.creator_id === user.id);
                  const userViews = userPosts.reduce((sum, c) => sum + (c.views || 0), 0);
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        setFilterCreatorId(user.id);
                        setActiveSection('content');
                      }}
                      className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-left group hover:border-indigo-200 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl">
                          {(user.display_name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{(user as any).admin_alias || user.display_name || t.anonymous}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{userPosts.length} {t.posts}</span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{userViews.toLocaleString()} {t.views}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : activeSection === 'content' && filteredContent.length > 0 ? (
                <div className="relative group/scroll">
                  <div 
                    className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 transition-all duration-300 max-h-[75vh] overflow-y-auto pr-6 custom-scrollbar pb-16"
                  >
                    {filteredContent.map(item => {
                      const creator = users.find(u => u.id === item.creator_id);
                      return (
                        <motion.a 
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:bg-blue-100 hover:border-blue-200 transition-all duration-300 block cursor-pointer"
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-[9px] font-bold text-indigo-600">
                                  {(creator?.display_name || '?').charAt(0)}
                                </div>
                                <span className="text-[10px] font-bold text-gray-500">{creator?.display_name || t.anonymous}</span>
                              </div>
                              <span 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setFilterPlatform(item.platform || 'all');
                                }}
                                className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center gap-1 border border-gray-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors cursor-pointer relative z-10"
                              >
                                {getPlatformIcon(item.platform, "h-2.5 w-2.5")} {item.platform}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-gray-900 mb-3 line-clamp-1">{item.title || t.publishedContent}</h4>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                              <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                  <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{t.views}</span>
                                  <span className="text-xs font-black text-gray-900">{item.views?.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.a>
                      );
                    })}
                  </div>
                  {/* Bottom Fade Effect */}
                  <div className="absolute bottom-0 left-0 right-6 h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none z-20 rounded-b-[3rem]" />
                </div>
              ) : activeSection === 'content' && filteredContent.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
                  <Globe className="h-16 w-16 text-gray-100 mx-auto mb-6" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest">{t.noResults}</p>
                </div>
              ) : null
            }
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">{t.platformDistribution}</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setFilterPlatform('all')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl group transition-all duration-200 active:scale-95 border gap-3 mb-2 ${
                    filterPlatform === 'all' ? 'bg-indigo-600 border-transparent shadow-lg shadow-indigo-100' : 'bg-gray-50 border-transparent hover:bg-white hover:shadow-lg hover:border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${filterPlatform === 'all' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Globe className="h-5 w-5" />
                    </div>
                    <span className={`text-sm font-black uppercase tracking-tight truncate ${filterPlatform === 'all' ? 'text-white' : 'text-gray-900'}`}>
                      {t.allPlatforms}
                    </span>
                  </div>
                </button>

                {Object.entries(stats?.platforms || {}).map(([platform, count]) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => {
                      console.log('Sidebar clicked for:', platform);
                      setFilterPlatform(platform);
                      setActiveSection('content');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl group transition-all duration-200 active:scale-95 border gap-3 ${
                      filterPlatform === platform.toLowerCase() ? 'bg-indigo-600 border-transparent shadow-lg shadow-indigo-100' : 'bg-gray-50 border-transparent hover:bg-white hover:shadow-lg hover:border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${filterPlatform === platform.toLowerCase() ? 'bg-white/20 text-white' : getPlatformColor(platform)}`}>
                        {getPlatformIcon(platform, "h-5 w-5")}
                      </div>
                      <span className={`text-sm font-black capitalize tracking-tight truncate ${filterPlatform === platform.toLowerCase() ? 'text-white' : 'text-gray-900'}`}>
                        {platform.toLowerCase() === 'coinmarketcap' ? 'CMC' : platform}
                      </span>
                    </div>
                    <span className={`text-lg font-black shrink-0 ${filterPlatform === platform.toLowerCase() ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
               <TrendingUp className="h-10 w-10 mb-6 opacity-80" />
               <h3 className="text-xl font-black mb-2 leading-tight">Umbra Creator Hub</h3>
               <p className="text-indigo-100 text-sm font-medium opacity-90 leading-relaxed mb-6">{lang === 'en' ? 'Optimizing the connection between brands and creators with real-time metrics.' : 'Optimizando la conexión entre marcas y creadores con métricas en tiempo real.'}</p>
               <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">© 2026 UMBRA AGENCY</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color, onClick }: { title: string, value: string, icon: React.ReactNode, color: 'emerald' | 'indigo' | 'purple' | 'rose', onClick?: () => void }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    rose: 'bg-rose-50 text-rose-600'
  };

  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group text-left w-full transition-all ${onClick ? 'hover:shadow-xl hover:border-indigo-100 active:scale-95' : 'cursor-default'}`}
    >
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${colors[color]} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
      <div className="flex flex-col relative z-10">
        <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center mb-6 shadow-sm`}>
          {icon}
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <span className="text-3xl font-black text-gray-900 tracking-tighter">{value}</span>
      </div>
    </button>
  );
}

function getPlatformIcon(platform: string, className = "h-3.5 w-3.5") {
  switch (platform) {
    case 'tiktok': return <Music2 className={className} />;
    case 'instagram': return <Instagram className={className} />;
    case 'youtube': return <Youtube className={className} />;
    case 'x': return <Twitter className={className} />;
    case 'twitch': return <Globe className={className} />;
    case 'coinmarketcap': return <Zap className={className} />;
    default: return <Globe className={className} />;
  }
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case 'tiktok': return 'bg-gray-900 text-white';
    case 'instagram': return 'bg-pink-50 text-pink-600';
    case 'youtube': return 'bg-rose-50 text-rose-600';
    case 'x': return 'bg-indigo-50 text-indigo-600';
    case 'twitch': return 'bg-purple-50 text-purple-600';
    case 'coinmarketcap': return 'bg-amber-50 text-amber-600';
    default: return 'bg-gray-50 text-gray-600';
  }
}
