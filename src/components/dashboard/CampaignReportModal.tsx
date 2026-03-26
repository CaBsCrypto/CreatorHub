import React, { useMemo } from 'react';
import { X, Download, Youtube, Instagram, Twitter, Globe, Zap, Users, Music2, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Campaign, Content, UserProfile } from '../../supabase';
import { useToast } from '../../hooks/useToast';

interface CampaignReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  content: Content[];
  users: UserProfile[];
  onFilterChange?: (filters: { platform?: string; creatorId?: string; campaignId?: string }) => void;
}

export default function CampaignReportModal({ 
  isOpen, 
  onClose, 
  campaign, 
  content, 
  users,
  onFilterChange
}: CampaignReportModalProps) {
  
  const { success, error: toastError } = useToast();
  const [filterPlatform, setFilterPlatform] = React.useState('all');

  const campaignContent = useMemo(() => {
    if (!campaign) return [];
    let filtered = content.filter(c => c.campaign_id === campaign.id);
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(c => c.platform === filterPlatform);
    }
    return filtered;
  }, [campaign, content, filterPlatform]);

  const stats = useMemo(() => {
    const defaultPlatforms = { tiktok: 0, instagram: 0, youtube: 0, x: 0, x_video: 0, twitch: 0, coinmarketcap: 0 };
    const platformCounts = { ...defaultPlatforms };
    let totalViews = 0;
    
    // Group by creator
    const creatorStats: Record<string, {
      user: UserProfile | undefined,
      totalPosts: number,
      totalViews: number,
      platforms: typeof defaultPlatforms
    }> = {};

    campaignContent.forEach(item => {
      // Platform totals
      const p = item.platform as any;
      if (p in platformCounts) {
        platformCounts[p as keyof typeof platformCounts]++;
      }
      totalViews += (item.views || 0);

      // Creator totals
      if (item.creator_id) {
        if (!creatorStats[item.creator_id]) {
          creatorStats[item.creator_id] = {
            user: users.find(u => u.id === item.creator_id),
            totalPosts: 0,
            totalViews: 0,
            platforms: { ...defaultPlatforms }
          };
        }
        creatorStats[item.creator_id].totalPosts++;
        creatorStats[item.creator_id].totalViews += (item.views || 0);
        const p = item.platform as any;
        if (p in creatorStats[item.creator_id].platforms) {
          (creatorStats[item.creator_id].platforms as any)[p]++;
        }
      }
    });

    return { platformCounts, totalViews, creatorStats: Object.values(creatorStats) };
  }, [campaignContent, users]);

  const handleCopyToClipboard = async () => {
    try {
      if (!campaign || campaignContent.length === 0) return;

      const mappedContent = campaignContent.map(item => {
        const creator = users.find(u => u.id === item.creator_id);
        const name = creator?.admin_alias || creator?.display_name || creator?.email?.split('@')[0] || 'Desconocido';
        return { ...item, creatorName: name };
      });

      // Sort alphabetically by creator name, then by platform
      mappedContent.sort((a, b) => {
        if (a.creatorName < b.creatorName) return -1;
        if (a.creatorName > b.creatorName) return 1;
        return a.platform.localeCompare(b.platform);
      });

      const headers = ['Nombre Creador', 'Plataforma', 'URL', 'Vistas'];
      let tsvContent = headers.join('\t') + '\n';

      mappedContent.forEach(item => {
        const p = item.platform as any;
        let platformLabel = p.toUpperCase();
        if (p === 'x' || p === 'x_video') platformLabel = 'X';
        if (p === 'coinmarketcap') platformLabel = 'CMC (TEXTO)';

        const row = [
          item.creatorName.replace(/\t/g, ' '),
          platformLabel,
          item.url,
          item.views || 0
        ];
        tsvContent += row.join('\t') + '\n';
      });

      await navigator.clipboard.writeText(tsvContent);
      success("¡Copiado! Pégalo (Ctrl+V) en tu Google Sheet");
    } catch (err: any) {
      console.error("Clipboard Export Error:", err);
      toastError("Hubo un error al copiar al portapapeles.");
    }
  };

  const handleCopyBreakdown = async () => {
    try {
      if (!campaign || stats.creatorStats.length === 0) return;

      const headers = ['Creador', 'TikTok', 'Instagram', 'YouTube', 'X', 'CMC', 'Twitch', 'Vistas Totales'];
      let tsvContent = headers.join('\t') + '\n';

      stats.creatorStats.forEach(creator => {
        const name = creator.user?.admin_alias || creator.user?.display_name || creator.user?.email || 'Desconocido';
        const row = [
          name.replace(/\t/g, ' '),
          creator.platforms.tiktok,
          creator.platforms.instagram,
          creator.platforms.youtube,
          creator.platforms.x + creator.platforms.x_video,
          creator.platforms.coinmarketcap,
          creator.platforms.twitch,
          creator.totalViews
        ];
        tsvContent += row.join('\t') + '\n';
      });

      await navigator.clipboard.writeText(tsvContent);
      success("¡Desglose copiado! Pégalo en tu Google Sheet");
    } catch (err: any) {
      console.error("Breakdown Export Error:", err);
      toastError("Hubo un error al copiar el desglose.");
    }
  };

  if (!isOpen) return null;
  if (!campaign) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="bg-rose-500 text-white p-12 rounded-3xl shadow-2xl text-center max-w-lg">
          <Zap className="h-16 w-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-black uppercase tracking-widest mb-4">¡Error de Modal!</h2>
          <p className="text-lg font-medium opacity-90">
            El modal se abrió pero no recibió la información de la campaña correcta. ID detectado: {String(campaign)}
          </p>
          <button onClick={onClose} className="mt-8 px-6 py-3 bg-white text-rose-600 rounded-xl font-bold hover:scale-105 transition-transform">
            Cerrar esta ventana
          </button>
        </div>
      </div>
    );
  }

  const totalContent = campaignContent.length;
  const progressPercentage = Math.min(100, Math.round((totalContent / (campaign.target_posts || 1)) * 100));

  const PlatformIcon = ({ platform, className = "w-4 h-4" }: { platform: string, className?: string }) => {
    switch (platform) {
      case 'tiktok': return <Music2 className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'youtube': return <Youtube className={className} />;
      case 'x': return <Twitter className={className} />;
      case 'x_video': return <Twitter className={className} />;
      case 'twitch': return <Globe className={className} />;
      case 'coinmarketcap': return <Zap className={className} />;
      default: return <Globe className={className} />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-md" 
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="p-8 pb-6 flex justify-between items-start border-b border-gray-100">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  campaign.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {campaign.status}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600">
                  Meta: {campaign.target_posts} Posts
                </span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{campaign.name}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {campaign.twitter_url && (
                  <a 
                    href={campaign.twitter_url.startsWith('http') ? campaign.twitter_url : `https://x.com/${campaign.twitter_url.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                  >
                    <Twitter className="h-3.5 w-3.5" /> {campaign.twitter_url}
                  </a>
                )}
                {campaign.contact_info && (
                  <a 
                    href={campaign.contact_info.startsWith('http') ? campaign.contact_info : `https://t.me/${campaign.contact_info.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1.5 text-[10px] font-black text-sky-600 uppercase tracking-widest hover:bg-sky-50 px-2 py-1 rounded-lg transition-all"
                  >
                    <Globe className="h-3.5 w-3.5" /> {campaign.contact_info}
                  </a>
                )}
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest px-2">
                  Reporte detallado de rendimiento
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all outline-none cursor-pointer"
              >
                <option value="all">Todas las Redes</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="x">X / Twitter</option>
                <option value="twitch">Twitch</option>
                <option value="coinmarketcap">CoinMarketCap</option>
              </select>
              <button 
                onClick={handleCopyToClipboard}
                disabled={campaignContent.length === 0}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" /> Copiar para Sheets
              </button>
              <button onClick={onClose} className="p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition-all hover:rotate-90">
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/50">
            {/* Global Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Progreso de la Campaña</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-black text-gray-900">{totalContent}</span>
                  <span className="text-sm font-bold text-gray-400 mb-1">/ {campaign.target_posts} posts</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Vistas Acumuladas</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-gray-900">{stats.totalViews.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Distribución por Red</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.platformCounts).map(([platform, count]) => count > 0 && (
                    <div key={platform} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                      <PlatformIcon platform={platform} className="h-3.5 w-3.5 text-gray-600" />
                      <span className="text-xs font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                  {campaignContent.length === 0 && <span className="text-xs text-gray-400">Sin contenido publicado</span>}
                </div>
              </div>
            </div>

            {/* Breakdown by Creator */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" /> Desglose por Creador
                </h3>
                <button 
                  onClick={handleCopyBreakdown}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95"
                >
                  <Download className="h-3 w-3" /> Copiar Desglose
                </button>
              </div>
              
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Creador</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">TikTok</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Instagram</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">YouTube</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">X</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">CMC</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Twitch</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stats.creatorStats.map((creator) => (
                        <tr key={creator.user?.id || Math.random()} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                {(creator.user?.display_name || creator.user?.email || '?').charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{creator.user?.display_name || 'Sin Nombre'}</p>
                                <p className="text-[10px] text-gray-500 font-medium">{creator.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => onFilterChange?.({ platform: 'tiktok', creatorId: creator.user?.id, campaignId: campaign.id })}
                              className={`bg-transparent border-none p-0 outline-none text-sm font-bold transition-all hover:scale-110 ${creator.platforms.tiktok > 0 ? 'text-gray-900 cursor-pointer hover:text-indigo-600' : 'text-gray-300'}`}
                              disabled={creator.platforms.tiktok === 0}
                            >
                              {creator.platforms.tiktok}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => onFilterChange?.({ platform: 'instagram', creatorId: creator.user?.id, campaignId: campaign.id })}
                              className={`bg-transparent border-none p-0 outline-none text-sm font-bold transition-all hover:scale-110 ${creator.platforms.instagram > 0 ? 'text-pink-600 cursor-pointer hover:opacity-70' : 'text-gray-300'}`}
                              disabled={creator.platforms.instagram === 0}
                            >
                              {creator.platforms.instagram}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => onFilterChange?.({ platform: 'youtube', creatorId: creator.user?.id, campaignId: campaign.id })}
                              className={`bg-transparent border-none p-0 outline-none text-sm font-bold transition-all hover:scale-110 ${creator.platforms.youtube > 0 ? 'text-red-600 cursor-pointer hover:opacity-70' : 'text-gray-300'}`}
                              disabled={creator.platforms.youtube === 0}
                            >
                              {creator.platforms.youtube}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => onFilterChange?.({ platform: 'x', creatorId: creator.user?.id, campaignId: campaign.id })}
                              className={`bg-transparent border-none p-0 outline-none text-sm font-bold transition-all hover:scale-110 ${(creator.platforms.x + creator.platforms.x_video) > 0 ? 'text-indigo-900 cursor-pointer hover:text-indigo-600' : 'text-gray-300'}`}
                              disabled={(creator.platforms.x + creator.platforms.x_video) === 0}
                            >
                              {creator.platforms.x + creator.platforms.x_video}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => onFilterChange?.({ platform: 'coinmarketcap', creatorId: creator.user?.id, campaignId: campaign.id })}
                              className={`bg-transparent border-none p-0 outline-none text-sm font-bold transition-all hover:scale-110 ${creator.platforms.coinmarketcap > 0 ? 'text-indigo-600 cursor-pointer hover:opacity-70' : 'text-gray-300'}`}
                              disabled={creator.platforms.coinmarketcap === 0}
                            >
                              {creator.platforms.coinmarketcap}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => onFilterChange?.({ platform: 'twitch', creatorId: creator.user?.id, campaignId: campaign.id })}
                              className={`bg-transparent border-none p-0 outline-none text-sm font-bold transition-all hover:scale-110 ${creator.platforms.twitch > 0 ? 'text-purple-600 cursor-pointer hover:opacity-70' : 'text-gray-300'}`}
                              disabled={creator.platforms.twitch === 0}
                            >
                              {creator.platforms.twitch}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black text-gray-900">{creator.totalViews.toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                      {stats.creatorStats.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                            No hay creadores participando en esta campaña aún.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
