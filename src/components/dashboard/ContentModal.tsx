import React from 'react';
import { X, Youtube, Instagram, Music2, Twitter, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase, Campaign, Content, UserProfile } from '../../supabase';
import { resizeImage } from '../../utils/imageUtils';
import DiscordIcon from '../icons/DiscordIcon';

// Modular Components
import PlatformSelector from './content/PlatformSelector';
import StreamFormSection from './content/StreamFormSection';
import DiscordFormSection from './content/DiscordFormSection';
import CampaignSelector from './content/CampaignSelector';

import StoryFormSection from './content/StoryFormSection';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  users?: UserProfile[];
  editingContent: Content | null;
  onSubmit: (data: any) => Promise<void>;
  onTwitchUpload: (file: File, creator_id?: string, dCount?: number, aCount?: number, pCount?: number, uvCount?: number, uChatters?: number, vCount?: number, fCount?: number, sCount?: number, shCount?: number, title?: string, campaign_id?: string, platform?: 'twitch' | 'tiktok' | 'discord' | 'baseapp' | 'instagram_story', likes?: number, comments?: number, contentType?: 'video_largo' | 'video_corto' | null, isRepost?: boolean, parentId?: string | null) => Promise<void>;
  isProcessing: boolean;
}

const sanitizeUrl = (url: string, platform: string): string => {
  if (!url) return url;
  const cleanUrl = url.trim();

  try {
    if (platform === 'instagram') {
      const igMatch = cleanUrl.match(/(?:instagram\.com\/(?:[^/]+\/)?(?:p|reels|reel|tv)\/)([A-Za-z0-9_-]+)/);
      if (igMatch && igMatch[1]) return `https://www.instagram.com/p/${igMatch[1]}/`;
    }
    if (platform === 'youtube') {
      const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^?&/]+)/);
      if (ytMatch && ytMatch[1]) return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
    }
    if (platform === 'tiktok') {
      const ttMatch = cleanUrl.match(/(?:tiktok\.com\/@[^/]+\/video\/|tiktok\.com\/t\/|vt\.tiktok\.com\/)([^?&/]+)/);
      if (ttMatch && ttMatch[1]) {
        if (cleanUrl.includes('/video/')) return `https://www.tiktok.com/${cleanUrl.match(/(@[^/]+)/)?.[1] || '@user'}/video/${ttMatch[1]}`;
      }
      return cleanUrl.split('?')[0].split('#')[0];
    }
    return cleanUrl.split('?')[0].split('#')[0];
  } catch (e) {
    return cleanUrl;
  }
};

const ContentModal: React.FC<ContentModalProps> = ({ 
  isOpen, onClose, campaigns, users, editingContent, onSubmit, onTwitchUpload, isProcessing 
}) => {
  const [formData, setFormData] = React.useState({
    campaign_id: '',
    creator_id: '',
    platform: 'youtube',
    url: '',
    title: '',
    views: 0,
    likes: 0,
    comments: 0,
    peek_viewers: 0,
    duration_minutes: 0,
    average_viewers: 0,
    unique_chatters: 0,
    unique_viewers: 0,
    followers: 0,
    new_subscriptions: 0,
    avg_duration_minutes: 0,
    shares_count: 0,
    guest_name: '',
    description: '',
    content_type: null as 'video_largo' | 'video_corto' | null,
    is_repost: false,
    parent_id: ''
  });

  const [campaignContents, setCampaignContents] = React.useState<Content[]>([]);
  const [isMultiPlatform, setIsMultiPlatform] = React.useState(false);
  const [multiPlatformUrls, setMultiPlatformUrls] = React.useState<Record<string, string>>({
    youtube: '',
    tiktok: '',
    instagram: '',
    x: ''
  });

  const [twitchFile, setTwitchFile] = React.useState<File | null>(null);
  const [twitchPreview, setTwitchPreview] = React.useState<string | null>(null);
  const [streamPlatform, setStreamPlatform] = React.useState<'twitch' | 'tiktok'>('twitch');
  const [isCampaignListOpen, setIsCampaignListOpen] = React.useState(false);
  const [isAnalyzingScreenshot, setIsAnalyzingScreenshot] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const availablePlatforms = React.useMemo(() => [
    { id: 'youtube', icon: Youtube, color: 'text-red-600', label: 'YouTube' },
    { id: 'instagram', icon: Instagram, color: 'text-pink-600', label: 'Instagram' },
    { id: 'instagram_story', icon: Instagram, color: 'text-rose-500', label: 'Historia IG' },
    { id: 'tiktok', icon: Music2, color: 'text-black', label: 'TikTok' },
    { id: 'x', icon: Twitter, color: 'text-slate-900', label: 'X' },
    { id: 'coinmarketcap', icon: Globe, color: 'text-indigo-600', label: 'CMC' },
    { id: 'stream', icon: Globe, color: 'text-purple-600', label: 'Streams' },
    { id: 'baseapp', icon: Globe, color: 'text-blue-600', label: 'BaseApp' },
    { id: 'discord', icon: DiscordIcon, color: 'text-indigo-500', label: 'Discord' }
  ], []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsCampaignListOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [selectedChildIds, setSelectedChildIds] = React.useState<string[]>([]);
  const [showCoupling, setShowCoupling] = React.useState(false);

  React.useEffect(() => {
    setTwitchFile(null);
    setTwitchPreview(null);
    setIsMultiPlatform(false);
    setMultiPlatformUrls({ youtube: '', tiktok: '', instagram: '', x: '' });
    setSelectedChildIds([]);
    setShowCoupling(false);

    if (editingContent) {
      const isStream = editingContent.platform === 'twitch' || (editingContent.platform === 'tiktok' && (editingContent.duration_minutes || 0) > 0);
      if (isStream) setStreamPlatform(editingContent.platform === 'tiktok' ? 'tiktok' : 'twitch');
      setFormData({
        campaign_id: editingContent.campaign_id || '',
        creator_id: editingContent.creator_id || '',
        platform: isStream ? ('stream' as any) : (editingContent.platform || 'youtube'),
        url: editingContent.url || '',
        title: editingContent.title || '',
        views: editingContent.views || 0,
        likes: editingContent.likes || 0,
        comments: editingContent.comments || 0,
        peek_viewers: editingContent.peek_viewers || 0,
        duration_minutes: editingContent.duration_minutes || 0,
        average_viewers: editingContent.average_viewers || 0,
        unique_chatters: editingContent.unique_chatters || 0,
        unique_viewers: editingContent.unique_viewers || 0,
        followers: editingContent.followers || 0,
        new_subscriptions: editingContent.new_subscriptions || 0,
        avg_duration_minutes: editingContent.avg_duration_minutes || 0,
        shares_count: editingContent.shares_count || 0,
        guest_name: editingContent.guest_name || '',
        description: editingContent.description || '',
        content_type: editingContent.content_type || null,
        is_repost: editingContent.is_repost || false,
        parent_id: editingContent.parent_id || ''
      });

      // Cargar posts hijos si es publicación principal
      if (!editingContent.is_repost) {
        const fetchChildren = async () => {
          try {
            const { data, error } = await supabase
              .from('content')
              .select('id')
              .eq('parent_id', editingContent.id)
              .is('deleted_at', null);
            if (!error && data) {
              const ids = data.map(d => d.id);
              setSelectedChildIds(ids);
              if (ids.length > 0) {
                setShowCoupling(true);
              }
            }
          } catch (err) {
            console.error("Error al cargar posts hijos:", err);
          }
        };
        fetchChildren();
      }
    } else {
      setStreamPlatform('twitch');
      setFormData({
        campaign_id: '', creator_id: '', platform: 'youtube', url: '', title: '',
        views: 0, likes: 0, comments: 0, peek_viewers: 0, duration_minutes: 0,
        average_viewers: 0, unique_chatters: 0, unique_viewers: 0, followers: 0,
        new_subscriptions: 0, avg_duration_minutes: 0, shares_count: 0, guest_name: '',
        description: '',
        content_type: null,
        is_repost: false,
        parent_id: ''
      });
    }
  }, [editingContent, isOpen]);

  // Fetch campaign contents when campaign changes
  React.useEffect(() => {
    if (!formData.campaign_id) {
      setCampaignContents([]);
      return;
    }
    const fetchContents = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('id, title, url, platform, creator_id, guest_name, parent_id')
          .eq('campaign_id', formData.campaign_id)
          .is('deleted_at', null);
        if (!error && data) {
          setCampaignContents(data);
        }
      } catch (err) {
        console.error("Error fetching campaign contents for linking:", err);
      }
    };
    fetchContents();
  }, [formData.campaign_id]);

  const linkableContents = React.useMemo(() => {
    return campaignContents.filter(item => {
      // No debe ser repost
      if (item.is_repost) return false;
      // Excluir el post que se está editando
      if (editingContent && item.id === editingContent.id) return false;
      
      // Si el post tiene un creador específico asignado
      if (formData.creator_id && formData.creator_id !== 'guest') {
        return item.creator_id === formData.creator_id;
      }
      
      // Si es un invitado externo (guest)
      if (formData.creator_id === 'guest' && formData.guest_name) {
        return item.guest_name === formData.guest_name;
      }
      
      return true;
    });
  }, [campaignContents, editingContent, formData.creator_id, formData.guest_name]);

  const eligibleChildContents = React.useMemo(() => {
    return campaignContents.filter(item => {
      // Excluir el post que se está editando
      if (editingContent && item.id === editingContent.id) return false;
      
      // Debe pertenecer al mismo creador
      if (formData.creator_id && formData.creator_id !== 'guest') {
        if (item.creator_id !== formData.creator_id) return false;
      } else if (formData.creator_id === 'guest' && formData.guest_name) {
        if (item.guest_name !== formData.guest_name) return false;
      }
      
      // Debe ser un post independiente (sin parent_id) o ya ser hijo de este post
      return !item.parent_id || (editingContent && item.parent_id === editingContent.id);
    });
  }, [campaignContents, editingContent, formData.creator_id, formData.guest_name]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTwitchPreview(reader.result as string);
      reader.readAsDataURL(file);
      setIsAnalyzingScreenshot(true);
      try {
        const base64 = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.readAsDataURL(file);
        });
        const optimizedBase64 = await resizeImage(base64, 1280, 1280);
        const response = await fetch(optimizedBase64);
        const blob = await response.blob();
        setTwitchFile(new File([blob], file.name, { type: 'image/jpeg' }));

        // Send to Gemini AI for stats analysis
        const { data: { session } } = await supabase.auth.getSession();
        const analyzeRes = await fetch('/api/analyze-twitch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ image: optimizedBase64 })
        });

        if (analyzeRes.ok) {
          const data = await analyzeRes.json();
          if (data && !data.error) {
            setFormData(prev => ({
              ...prev,
              duration_minutes: data.duration_minutes || prev.duration_minutes,
              average_viewers: data.average_viewers || prev.average_viewers,
              peek_viewers: data.peek_viewers || prev.peek_viewers,
              unique_viewers: data.unique_viewers || prev.unique_viewers,
              unique_chatters: data.unique_chatters || prev.unique_chatters,
              views: data.views || prev.views,
              likes: data.likes || prev.likes,
              comments: data.comments || prev.comments,
              title: data.title || prev.title || 'Resumen de Stream'
            }));
          }
        }
      } catch (err) {
        console.error("AI Analysis failed:", err);
      } finally {
        setIsAnalyzingScreenshot(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = sanitizeUrl(formData.url, formData.platform);
    const finalData = { 
      ...formData, 
      url: cleanUrl,
      isMultiPlatform,
      multiUrls: Object.entries(multiPlatformUrls).map(([p, u]) => ({ platform: p, url: u })),
      selectedChildIds
    };
    if ((finalData.platform as any) === 'stream') finalData.platform = streamPlatform as any;
    if ((formData.platform as any) === 'stream' && twitchFile) {
      onTwitchUpload(twitchFile, formData.creator_id, formData.duration_minutes, formData.average_viewers, formData.peek_viewers, formData.unique_viewers, formData.unique_chatters, formData.views, formData.followers, formData.new_subscriptions, formData.shares_count, formData.title, formData.campaign_id, (formData.platform as any) === 'discord' ? 'discord' : streamPlatform, formData.likes, formData.comments, formData.content_type, formData.is_repost, formData.parent_id);
    } else if ((formData.platform === 'discord' || formData.platform === ('baseapp' as any)) && twitchFile) {
       onTwitchUpload(twitchFile, formData.creator_id, formData.duration_minutes, 0, formData.peek_viewers, formData.unique_viewers, 0, formData.views, 0, 0, formData.shares_count, formData.title, formData.campaign_id, formData.platform as 'discord' | 'baseapp' as any, 0, 0, formData.content_type, formData.is_repost, formData.parent_id);
    } else if ((formData.platform as any) === 'instagram_story' && twitchFile) {
       onTwitchUpload(twitchFile, formData.creator_id, 0, 0, 0, 0, 0, formData.views, 0, 0, 0, formData.title, formData.campaign_id, 'instagram_story', formData.likes, formData.comments, formData.content_type, formData.is_repost, formData.parent_id);
    } else {
      onSubmit(finalData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-8 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">{editingContent ? 'Actualiza los detalles de la publicación' : 'Sincroniza un nuevo link con la plataforma'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-gray-50 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampaignSelector
                campaigns={campaigns}
                selectedCampaignId={formData.campaign_id}
                onSelect={(id) => setFormData({ ...formData, campaign_id: id })}
                isOpen={isCampaignListOpen}
                setIsOpen={setIsCampaignListOpen}
                dropdownRef={dropdownRef}
              />
              {users && users.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Asignar a</label>
                  <select
                    value={formData.creator_id}
                    onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                    className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                  >
                    <option value="">Seleccionar Creador</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.admin_alias || u.display_name || u.email.split('@')[0]}</option>
                    ))}
                    <option value="guest">Invitado Externo</option>
                  </select>
                </div>
              )}
            </div>

            {formData.creator_id === 'guest' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre Invitado</label>
                <input
                  type="text" required value={formData.guest_name}
                  onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                  placeholder="Ej: Proxy User"
                  className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
              </div>
            )}
            
            <PlatformSelector
              availablePlatforms={availablePlatforms as any}
              selectedPlatform={formData.platform}
              onSelect={(id) => setFormData({ ...formData, platform: id as any })}
            />

            {/* --- Sección Unificada: Carga y Mismos Posts --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* --- Carga Multi-plataforma --- */}
              {!editingContent && !['discord', 'baseapp', 'instagram_story'].includes(formData.platform) && (
                <div className="border border-gray-100 rounded-2xl p-4 bg-slate-50/50 space-y-4 animate-in fade-in h-fit">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isMultiPlatform}
                      onChange={(e) => {
                        setIsMultiPlatform(e.target.checked);
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, is_repost: false, parent_id: '' }));
                        }
                      }}
                      className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Multi-plataforma</span>
                  </label>
                  {isMultiPlatform && (
                    <div className="space-y-3 pt-2 pl-4 border-l-2 border-indigo-100 animate-in slide-in-from-left-2 duration-200">
                      <p className="text-[9px] font-bold text-indigo-500 italic mb-1">
                        * Omitiendo {formData.platform.toUpperCase()} (plataforma principal)
                      </p>
                      {['youtube', 'tiktok', 'instagram', 'x'].map(plat => {
                        if (plat === formData.platform) return null;
                        const isChecked = multiPlatformUrls[plat] !== undefined;
                        return (
                          <div key={plat} className="space-y-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setMultiPlatformUrls(prev => ({ ...prev, [plat]: '' }));
                                  } else {
                                    setMultiPlatformUrls(prev => {
                                      const copy = { ...prev };
                                      delete copy[plat];
                                      return copy;
                                    });
                                  }
                                }}
                                className="w-3.5 h-3.5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                                URL {plat.toUpperCase()}
                              </span>
                            </label>
                            {isChecked && (
                              <input
                                type="url"
                                value={multiPlatformUrls[plat] || ''}
                                onChange={(e) => setMultiPlatformUrls(prev => ({ ...prev, [plat]: e.target.value }))}
                                placeholder={`https://${plat}.com/...`}
                                className="block w-full rounded-xl border border-gray-100 bg-white py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* --- Mismo Post / Vinculación --- */}
              {!isMultiPlatform && (
                <div className="border border-gray-100 rounded-2xl p-4 bg-slate-50/50 space-y-4 animate-in fade-in h-fit">
                  {formData.is_repost ? (
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.is_repost}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            is_repost: e.target.checked,
                            parent_id: e.target.checked ? formData.parent_id : ''
                          })}
                          className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Es un Mismo Post</span>
                      </label>
                      <div className="space-y-2 pt-2 pl-4 border-l-2 border-indigo-100 animate-in slide-in-from-left-2 duration-200">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Publicación Principal</label>
                        <select
                          value={formData.parent_id || ''}
                          onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                          className="block w-full rounded-xl border border-gray-100 bg-white py-2 px-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                        >
                          <option value="">Seleccionar Publicación Principal</option>
                          {linkableContents.map(c => (
                            <option key={c.id} value={c.id}>
                              [{c.platform.toUpperCase()}] {c.title || c.url.substring(0, 40) + '...'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showCoupling}
                          onChange={(e) => {
                            setShowCoupling(e.target.checked);
                            if (!e.target.checked) {
                              setSelectedChildIds([]);
                            }
                          }}
                          className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Acoplar Mismos Posts</span>
                      </label>
                      
                      {showCoupling && (
                        <div className="space-y-3 pt-2 pl-4 border-l-2 border-indigo-100 animate-in slide-in-from-left-2 duration-200">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">
                            Seleccionar posts del mismo creador:
                          </p>
                          {eligibleChildContents.length > 0 ? (
                            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                              {eligibleChildContents.map(c => {
                                const isChecked = selectedChildIds.includes(c.id);
                                return (
                                  <label key={c.id} className="flex items-start gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-all">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedChildIds(prev => [...prev, c.id]);
                                        } else {
                                          setSelectedChildIds(prev => prev.filter(id => id !== c.id));
                                        }
                                      }}
                                      className="w-3.5 h-3.5 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 mt-0.5"
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider leading-none mb-0.5">
                                        [{c.platform.toUpperCase()}]
                                      </span>
                                      <span className="text-[9px] font-bold text-slate-600 truncate max-w-[200px]">
                                        {c.title || c.url}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[9px] font-medium text-slate-400 italic">
                              No hay otros posts independientes de este creador en esta campaña.
                            </p>
                          )}
                        </div>
                      )}

                      {!showCoupling && (
                        <div className="pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, is_repost: true }))}
                            className="text-[9px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            ¿Vincular este post a otro principal?
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!['stream', 'instagram_story', 'discord', 'baseapp'].includes(formData.platform) ? (
              ['youtube', 'tiktok', 'instagram'].includes(formData.platform) ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      URL de la publicación
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ExternalLink className="h-4 w-4 text-slate-300" />
                      </div>
                      <input
                        type="url" required value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://plataforma.com/video/..."
                        className="block w-full pl-11 rounded-xl border border-gray-100 bg-gray-50 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Formato
                    </label>
                    <select
                      value={formData.content_type || ''}
                      onChange={(e) => setFormData({ ...formData, content_type: (e.target.value as any) || null })}
                      className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-3.5 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 cursor-pointer"
                    >
                      <option value="">No especificado</option>
                      <option value="video_largo">Video Largo</option>
                      <option value="video_corto">Video Corto</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    URL de la publicación
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ExternalLink className="h-4 w-4 text-slate-300" />
                    </div>
                    <input
                      type="url" required value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://plataforma.com/..."
                      className="block w-full pl-11 rounded-xl border border-gray-100 bg-gray-50 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                    />
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    {['stream', 'instagram_story'].includes(formData.platform) 
                      ? 'Captura y Métricas' 
                      : formData.platform === 'discord' 
                        ? 'Reporte de Sesión Discord' 
                        : 'Reporte de Sesión BaseApp'}
                  </label>

                  {(formData.platform as any) === 'stream' ? (
                    <StreamFormSection
                      formData={formData} setFormData={setFormData}
                      streamPlatform={streamPlatform} setStreamPlatform={setStreamPlatform}
                      twitchPreview={twitchPreview} onFileChange={handleFileChange}
                      isAnalyzing={isAnalyzingScreenshot}
                    />
                  ) : (formData.platform as any) === 'discord' || (formData.platform as any) === 'baseapp' ? (
                    <DiscordFormSection
                      platform={formData.platform as any}
                      formData={formData} setFormData={setFormData}
                      twitchFile={twitchFile} setTwitchFile={setTwitchFile}
                      twitchPreview={twitchPreview} setTwitchPreview={setTwitchPreview}
                      onFileChange={handleFileChange}
                      isAnalyzing={isAnalyzingScreenshot}
                    />
                  ) : (
                    <StoryFormSection
                      formData={formData} setFormData={setFormData}
                      twitchPreview={twitchPreview} onFileChange={handleFileChange}
                      isAnalyzing={isAnalyzingScreenshot}
                    />
                  )}
                </div>

                {['stream'].includes(formData.platform) && (
                  <div className="animate-in fade-in slide-in-from-top-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tipo de Formato</label>
                    <select
                      value={formData.content_type || ''}
                      onChange={(e) => setFormData({ ...formData, content_type: (e.target.value as any) || null })}
                      className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 cursor-pointer"
                    >
                      <option value="">No especificado</option>
                      <option value="video_largo">Video Largo</option>
                      <option value="video_corto">Video Corto</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-50">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-gray-50 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isProcessing} className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
              {isProcessing 
                ? 'Procesando...' 
                : (editingContent 
                    ? 'Guardar Cambios' 
                    : (['stream', 'discord', 'baseapp', 'instagram_story'].includes(formData.platform) ? 'Guardar' : 'Sincronizar')
                  )
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;
