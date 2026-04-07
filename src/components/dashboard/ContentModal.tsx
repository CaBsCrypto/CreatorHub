import React from 'react';
import { X, Youtube, Instagram, Music2, Twitter, Globe, ExternalLink, RefreshCw, Plus, Image as ImageIcon, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Campaign, Content, UserProfile, supabase } from '../../supabase';
import { useToast } from '../../hooks/useToast';
import { resizeImage } from '../../utils/imageUtils';
import DiscordIcon from '../icons/DiscordIcon';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  users?: UserProfile[];
  editingContent: Content | null;
  onSubmit: (data: any) => Promise<void>;
  onTwitchUpload: (file: File, creator_id?: string, dCount?: number, aCount?: number, pCount?: number, uvCount?: number, uChatters?: number, vCount?: number, fCount?: number, sCount?: number, shCount?: number, title?: string, campaign_id?: string, platform?: 'twitch' | 'tiktok' | 'discord') => Promise<void>;
  isProcessing: boolean;
}

const ContentModal: React.FC<ContentModalProps> = ({ 
  isOpen, 
  onClose, 
  campaigns, 
  users,
  editingContent, 
  onSubmit, 
  onTwitchUpload, 
  isProcessing 
}) => {
  const { error: toastError } = useToast();

  // Dynamic platforms list based on access (Admins have Discord)
  const availablePlatforms = React.useMemo(() => [
    { id: 'youtube', icon: Youtube, color: 'text-red-600', label: 'YouTube' },
    { id: 'instagram', icon: Instagram, color: 'text-pink-600', label: 'Instagram' },
    { id: 'tiktok', icon: Music2, color: 'text-black', label: 'TikTok' },
    { id: 'x', icon: Twitter, color: 'text-indigo-900', label: 'X' },
    { id: 'coinmarketcap', icon: Globe, color: 'text-indigo-600', label: 'CMC' },
    { id: 'stream', icon: Globe, color: 'text-purple-600', label: 'Streams' },
    ...(users && users.length > 0 ? [{ id: 'discord', icon: DiscordIcon, color: 'text-indigo-500', label: 'Discord' }] : [])
  ], [users]);
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
    guest_name: ''
  });
  const [twitchFile, setTwitchFile] = React.useState<File | null>(null);
  const [twitchPreview, setTwitchPreview] = React.useState<string | null>(null);
  const [streamPlatform, setStreamPlatform] = React.useState<'twitch' | 'tiktok'>('twitch');
  const [campaignSearchQuery, setCampaignSearchQuery] = React.useState('');
  const [isCampaignListOpen, setIsCampaignListOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Filtered campaigns based on search query
  const filteredCampaigns = React.useMemo(() => {
    if (!campaignSearchQuery.trim()) return campaigns;
    return campaigns.filter(c => 
      c.name.toLowerCase().includes(campaignSearchQuery.toLowerCase())
    );
  }, [campaigns, campaignSearchQuery]);

  // Click outside listener
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCampaignListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Single effect: reset form + detect stream platform atomically
  React.useEffect(() => {
    setTwitchFile(null);
    setTwitchPreview(null);

    if (editingContent) {
      const isStream = editingContent.platform === 'twitch' ||
        (editingContent.platform === 'tiktok' && (editingContent.duration_minutes || 0) > 0);

      if (isStream) {
        setStreamPlatform(editingContent.platform === 'tiktok' ? 'tiktok' : 'twitch');
      }

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
        guest_name: editingContent.guest_name || ''
      });
    } else {
      setStreamPlatform('twitch');
      setFormData({
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
        guest_name: ''
      });
    }
  }, [editingContent, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setTwitchPreview(reader.result as string);
      reader.readAsDataURL(file);

      // --- Optimization: Resize image before storing ---
      try {
        const base64 = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.readAsDataURL(file);
        });

        // Resize to 1280px max with 0.7 quality via imageUtils
        const optimizedBase64 = await resizeImage(base64, 1280, 1280);
        
        // Convert base64 back to a Blob/File for upload
        const response = await fetch(optimizedBase64);
        const blob = await response.blob();
        const optimizedFile = new File([blob], file.name, { type: 'image/jpeg' });
        
        setTwitchFile(optimizedFile);
      } catch (err) {
        console.warn("Image optimization failed, falling back to original", err);
        setTwitchFile(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    
    // Resolve 'stream' platform to actual platform before submitting
    if ((finalData.platform as any) === 'stream') {
      finalData.platform = streamPlatform as any;
    }

    if ((formData.platform as any) === 'stream' && twitchFile) {
      onTwitchUpload(
        twitchFile, 
        formData.creator_id, 
        formData.duration_minutes,
        formData.average_viewers,
        formData.peek_viewers, 
        formData.unique_viewers,
        formData.unique_chatters,
        formData.views,
        formData.followers,
        formData.new_subscriptions,
        formData.shares_count,
        formData.title,
        formData.campaign_id,
        (formData.platform as any) === 'discord' ? 'discord' : streamPlatform
      );
    } else if (formData.platform === 'discord' && twitchFile) {
       onTwitchUpload(
        twitchFile, 
        formData.creator_id, 
        formData.duration_minutes,
        0, // average
        formData.peek_viewers, 
        formData.views, // uniques
        0, // chatters
        formData.views, // total views
        0, // followers
        0, // subs
        formData.shares_count,
        formData.title,
        formData.campaign_id,
        'discord'
      );
    } else {
      onSubmit(finalData);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-[2rem] bg-white p-6 sm:p-8 shadow-xl ring-1 ring-slate-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-y-auto max-h-[min(90vh,calc(100vh-2rem))]">
        
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {editingContent ? 'Actualiza los detalles' : 'Vincula una nueva publicación'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm ring-1 ring-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Header Fields: Campaign & Creator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Campaña</label>
                
                {/* Custom Select Trigger */}
                <button
                  type="button"
                  onClick={() => setIsCampaignListOpen(!isCampaignListOpen)}
                  className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50/30 py-2.5 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-left"
                >
                  <span className={formData.campaign_id ? 'text-slate-900' : 'text-slate-400'}>
                    {formData.campaign_id 
                      ? campaigns.find(c => c.id === formData.campaign_id)?.name || 'Seleccionar...'
                      : 'Seleccionar...'}
                  </span>
                  <ExternalLink className={`h-4 w-4 text-slate-300 transition-transform duration-300 ${isCampaignListOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isCampaignListOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute z-[110] left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                    >
                      {/* Search Bar within Dropdown */}
                      <div className="p-2 border-b border-slate-50 flex items-center gap-2 sticky top-0 bg-white/80 backdrop-blur-md">
                        <Search className="h-3.5 w-3.5 text-slate-400 ml-1.5" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Buscar campaña..."
                          value={campaignSearchQuery}
                          onChange={(e) => setCampaignSearchQuery(e.target.value)}
                          className="w-full bg-transparent border-none text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0 outline-none py-1"
                        />
                      </div>

                      {/* Options List */}
                      <div className="max-h-48 overflow-y-auto pt-1 pb-2">
                        {filteredCampaigns.length > 0 ? (
                          filteredCampaigns.map(c => {
                            const isSelected = formData.campaign_id === c.id;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, campaign_id: c.id });
                                  setIsCampaignListOpen(false);
                                  setCampaignSearchQuery('');
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all ${
                                  isSelected 
                                    ? 'bg-indigo-50 text-indigo-600' 
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <span>{c.name}</span>
                                {isSelected && <Check className="h-3.5 w-3.5" />}
                              </button>
                            );
                          })
                        ) : (
                          <div className="px-4 py-8 text-center text-slate-400 italic text-[11px]">
                            No se encontraron campañas
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Hidden input for HTML validation if needed, or keeping formData as is */}
                <input type="hidden" required value={formData.campaign_id} />
              </div>

              {users && users.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Asignar a</label>
                  <select
                    required={false}
                    value={formData.creator_id}
                    onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                    className="block w-full rounded-xl border-slate-200 bg-slate-50/30 py-2.5 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                  >
                    <option value="">Mi Cuenta</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.admin_alias || u.display_name || u.email.split('@')[0]}</option>
                    ))}
                    <option value="guest">Invitado</option>
                  </select>
                </div>
              )}
            </div>

            {formData.creator_id === 'guest' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nombre del Invitado</label>
                <input
                  type="text"
                  required
                  value={formData.guest_name}
                  onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                  placeholder="Ej: Ibai Llanos"
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/30 py-2.5 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                />
              </div>
            )}
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">Plataforma</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {availablePlatforms.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, platform: p.id as any })}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 ${
                      formData.platform === p.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p.icon className={`h-5 w-5 mb-1.5 ${formData.platform === p.id ? 'text-indigo-600' : p.color}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${formData.platform === p.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                {(formData.platform as any) === 'stream' ? 'Captura y Resultados' : 'URL del Contenido'}
              </label>

              {(formData.platform as any) === 'stream' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400 mb-5">
                  <div className="relative group">
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Título del Stream (ej. Stream 24/03)"
                      className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-sm font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-xl ring-1 ring-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setStreamPlatform('twitch')}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        streamPlatform === 'twitch' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Globe className="h-3 w-3" /> Stream
                    </button>
                    <button
                      type="button"
                      onClick={() => setStreamPlatform('tiktok')}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        streamPlatform === 'tiktok' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Music2 className="h-3 w-3" /> TikTok
                    </button>
                  </div>
                  <div 
                    className="relative border border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-slate-50/50 transition-all cursor-pointer bg-slate-50/20 group"
                    onClick={() => document.getElementById('twitch-upload-modal')?.click()}
                  >
                    {twitchPreview ? (
                      <div className="relative group/img">
                        <img src={twitchPreview} alt="Preview" className="max-h-32 rounded-xl border border-slate-100 transition-transform group-hover/img:scale-[1.02]" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <Plus className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Plus className="h-6 w-6 text-slate-300 mb-2 group-hover:text-indigo-500 transition-colors" />
                        <p className="text-[11px] font-semibold text-slate-500 mb-1">Subir captura de resultados</p>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">PNG, JPG</p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="twitch-upload-modal"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                          {streamPlatform === 'tiktok' ? 'Tiempo' : 'Duración'}
                        </label>
                        <div className="flex gap-1 items-center">
                          <input
                            type="number"
                            placeholder="H"
                            value={Math.floor(formData.duration_minutes / 60) || ''}
                            onChange={(e) => {
                              const h = parseInt(e.target.value) || 0;
                              const m = formData.duration_minutes % 60;
                              setFormData({ ...formData, duration_minutes: (h * 60) + m });
                            }}
                            className="w-full bg-slate-50/50 py-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-slate-700"
                          />
                          <span className="text-slate-300 font-bold">:</span>
                          <input
                            type="number"
                            placeholder="M"
                            max="59"
                            value={formData.duration_minutes % 60 || ''}
                            onChange={(e) => {
                              const h = Math.floor(formData.duration_minutes / 60);
                              const m = parseInt(e.target.value) || 0;
                              setFormData({ ...formData, duration_minutes: (h * 60) + m });
                            }}
                            className="w-full bg-slate-50/50 py-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-slate-700"
                          />
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                          {streamPlatform === 'tiktok' ? 'Vistas' : 'Avg View'}
                        </label>
                        <input
                          type="number"
                          value={(streamPlatform === 'tiktok' ? formData.views : formData.average_viewers) || ''}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0;
                            if (streamPlatform === 'tiktok') setFormData({ ...formData, views: v });
                            else setFormData({ ...formData, average_viewers: v });
                          }}
                          className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                          placeholder="0"
                        />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                          {streamPlatform === 'tiktok' ? 'Únicos' : 'Peak'}
                        </label>
                        <input
                          type="number"
                          value={(streamPlatform === 'tiktok' ? formData.unique_viewers : formData.peek_viewers) || ''}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0;
                            if (streamPlatform === 'tiktok') setFormData({ ...formData, unique_viewers: v });
                            else setFormData({ ...formData, peek_viewers: v });
                          }}
                          className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className={`grid gap-2 mt-2 ${streamPlatform === 'twitch' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      {streamPlatform === 'twitch' && (
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Únicos</label>
                          <input
                            type="number"
                            value={formData.unique_viewers || ''}
                            onChange={(e) => setFormData({ ...formData, unique_viewers: parseInt(e.target.value) || 0 })}
                            className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                      )}
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                          {streamPlatform === 'tiktok' ? 'Likes' : 'Chatters'}
                        </label>
                        <input
                          type="number"
                          value={(streamPlatform === 'tiktok' ? formData.likes : formData.unique_chatters) || ''}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0;
                            if (streamPlatform === 'tiktok') setFormData({ ...formData, likes: v });
                            else setFormData({ ...formData, unique_chatters: v });
                          }}
                          className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                          placeholder="0"
                        />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                          {streamPlatform === 'tiktok' ? 'Coment' : 'Vistas V.'}
                        </label>
                        <input
                          type="number"
                          value={(streamPlatform === 'tiktok' ? formData.comments : formData.views) || ''}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0;
                            if (streamPlatform === 'tiktok') setFormData({ ...formData, comments: v });
                            else setFormData({ ...formData, views: v });
                          }}
                          className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (formData.platform as any) === 'discord' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400 mb-5">
                   <div className="relative group">
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Título de la Jornada (ej. Torneo #1)"
                      className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-sm font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 outline-none"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <DiscordIcon className="h-4 w-4 text-slate-300" />
                    </div>
                    
                    {/* Subtle Captura Button */}
                    <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center">
                      <button
                        type="button"
                        onClick={() => document.getElementById('discord-upload')?.click()}
                        className={`group/btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${twitchFile ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200'}`}
                        title="Adjuntar captura de resultados"
                      >
                        <ImageIcon className={`h-3.5 w-3.5 ${twitchFile ? 'text-indigo-100' : 'group-hover/btn:text-indigo-500'}`} />
                        <span className="text-[9px] font-black uppercase tracking-wider">
                          {twitchFile ? 'Captura Lista' : 'Captura'}
                        </span>
                      </button>
                      <input
                        type="file"
                        id="discord-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  
                  {twitchPreview && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
                    >
                      <img src={twitchPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-3">
                        <button 
                          type="button"
                          onClick={() => { setTwitchFile(null); setTwitchPreview(null); }}
                          className="bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-1.5 rounded-lg transition-all"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-3 gap-2">
                       <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Duración</label>
                        <div className="flex gap-1 items-center">
                          <input
                            type="number"
                            placeholder="H"
                            value={Math.floor(formData.duration_minutes / 60) || ''}
                            onChange={(e) => {
                              const h = parseInt(e.target.value) || 0;
                              const m = formData.duration_minutes % 60;
                              setFormData({ ...formData, duration_minutes: (h * 60) + m });
                            }}
                            className="w-full bg-slate-50/50 py-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                          />
                          <span className="text-slate-300 font-bold">:</span>
                          <input
                            type="number"
                            placeholder="M"
                            max="59"
                            value={formData.duration_minutes % 60 || ''}
                            onChange={(e) => {
                              const h = Math.floor(formData.duration_minutes / 60);
                              const m = parseInt(e.target.value) || 0;
                              setFormData({ ...formData, duration_minutes: (h * 60) + m });
                            }}
                            className="w-full bg-slate-50/50 py-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                          />
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Simultáneos</label>
                        <input
                          type="number"
                          value={formData.peek_viewers || ''}
                          onChange={(e) => setFormData({ ...formData, peek_viewers: parseInt(e.target.value) || 0 })}
                          className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                          placeholder="0"
                        />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Únicos</label>
                        <input
                          type="number"
                          value={formData.views || ''}
                          onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                          className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Pantallas Compartidas</label>
                        <input
                          type="number"
                          value={formData.shares_count || ''}
                          onChange={(e) => setFormData({ ...formData, shares_count: parseInt(e.target.value) || 0 })}
                          className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <ExternalLink className="h-4 w-4 text-slate-300 transition-colors" />
                    </div>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="Link de la Jornada (opcional)"
                      className="block w-full pl-10.5 rounded-xl border-slate-200 bg-slate-50/30 py-3 text-sm font-medium text-slate-700 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative group animate-in fade-in slide-in-from-top-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <ExternalLink className="h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="block w-full pl-10.5 rounded-xl border-slate-200 bg-slate-50/30 py-3 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-300 outline-none"
                  />
                </div>
              )}
            </div>
          </div>


          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
              {isProcessing ? 'Procesando...' : (editingContent ? 'Guardar Cambios' : 'Anexar Link')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;
