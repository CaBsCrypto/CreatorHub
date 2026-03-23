import React from 'react';
import { X, Youtube, Instagram, Music2, Twitter, Globe, ExternalLink, RefreshCw, Plus } from 'lucide-react';
import { Campaign, Content, UserProfile, supabase } from '../../supabase';
import { useToast } from '../../hooks/useToast';
import { resizeImage } from '../../utils/imageUtils';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  users?: UserProfile[];
  editingContent: Content | null;
  onSubmit: (data: any) => Promise<void>;
  onTwitchUpload: (file: File, creator_id?: string, dCount?: number, aCount?: number, pCount?: number, uvCount?: number, uChatters?: number, vCount?: number, fCount?: number, sCount?: number) => Promise<void>;
  isProcessing: boolean;
}

const platforms = [
  { id: 'youtube', icon: Youtube, color: 'text-red-600', label: 'YouTube' },
  { id: 'instagram', icon: Instagram, color: 'text-pink-600', label: 'Instagram' },
  { id: 'tiktok', icon: Music2, color: 'text-black', label: 'TikTok' },
  { id: 'x', icon: Twitter, color: 'text-indigo-900', label: 'X' },
  { id: 'coinmarketcap', icon: Globe, color: 'text-indigo-600', label: 'CMC' },
  { id: 'stream', icon: Globe, color: 'text-purple-600', label: 'Streams' }
];

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
  const [formData, setFormData] = React.useState({
    campaign_id: editingContent?.campaign_id || '',
    creator_id: editingContent?.creator_id || '',
    platform: editingContent?.platform || 'youtube',
    url: editingContent?.url || '',
    title: editingContent?.title || '',
    views: editingContent?.views || 0,
    likes: editingContent?.likes || 0,
    comments: editingContent?.comments || 0,
    peek_viewers: editingContent?.peek_viewers || 0,
    duration_minutes: editingContent?.duration_minutes || 0,
    average_viewers: editingContent?.average_viewers || 0,
    unique_chatters: editingContent?.unique_chatters || 0,
    unique_viewers: editingContent?.unique_viewers || 0,
    followers: editingContent?.followers || 0,
    new_subscriptions: editingContent?.new_subscriptions || 0,
    guest_name: editingContent?.guest_name || ''
  });
  const [twitchFile, setTwitchFile] = React.useState<File | null>(null);
  const [twitchPreview, setTwitchPreview] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [streamPlatform, setStreamPlatform] = React.useState<'twitch' | 'tiktok'>('twitch');

  // Detect initial stream platform when editing
  React.useEffect(() => {
    if (editingContent?.platform === 'tiktok' && editingContent.duration_minutes > 0) {
      setStreamPlatform('tiktok');
      setFormData(prev => ({ ...prev, platform: 'stream' as any }));
    } else if (editingContent?.platform === 'twitch') {
      setStreamPlatform('twitch');
      setFormData(prev => ({ ...prev, platform: 'stream' as any }));
    }
  }, [editingContent]);

  React.useEffect(() => {
    if (editingContent) {
      setFormData({
        campaign_id: editingContent.campaign_id || '',
        creator_id: editingContent.creator_id || '',
        platform: editingContent.platform || 'youtube',
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
        guest_name: editingContent.guest_name || ''
      });
    } else {
      setFormData({
        campaign_id: campaigns[0]?.id || '',
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
        guest_name: ''
      });
    }
  }, [editingContent, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTwitchFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setTwitchPreview(reader.result as string);
      reader.readAsDataURL(file);
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
        formData.new_subscriptions
      );
    } else {
      onSubmit(finalData);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative w-full max-w-xl rounded-[2.5rem] bg-white p-8 sm:p-10 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10"></div>
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}
            </h2>
            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
              {editingContent ? 'Actualiza las métricas y detalles' : 'Vincula tu nueva publicación'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all hover:rotate-90 shadow-sm"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            {/* Header Fields: Campaign & Creator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100/50">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Campaña</label>
                <select
                  required
                  value={formData.campaign_id}
                  onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                  className="block w-full rounded-2xl border-slate-100 bg-white py-3 px-4 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="" disabled>{campaigns.length > 0 ? "Seleccionar..." : "No hay campañas"}</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {users && users.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Creador</label>
                  <select
                    required={false}
                    value={formData.creator_id}
                    onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                    className="block w-full rounded-2xl border-slate-100 bg-white py-3 px-4 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all"
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
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Nombre del Invitado</label>
                <input
                  type="text"
                  required
                  value={formData.guest_name}
                  onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                  placeholder="Ej: Ibai Llanos"
                  className="block w-full rounded-2xl border-slate-100 bg-slate-50 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            )}
            
            <div className="px-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Seleccionar Plataforma</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, platform: p.id as any })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 ${
                      formData.platform === p.id
                        ? 'border-indigo-600 bg-indigo-600 shadow-lg shadow-indigo-200 scale-105'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p.icon className={`h-6 w-6 mb-2 ${formData.platform === p.id ? 'text-white' : p.color}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${formData.platform === p.id ? 'text-white' : 'text-slate-400'}`}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="px-1 pt-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">
                {(formData.platform as any) === 'stream' ? 'Captura y Datos de Directo' : 'Link de la Publicación'}
              </label>

              {(formData.platform as any) === 'stream' && (
                <div className="flex gap-2 mb-6 bg-slate-100/50 p-2 rounded-2xl border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setStreamPlatform('twitch')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                      streamPlatform === 'twitch' ? 'bg-white shadow-md text-indigo-600 ring-1 ring-slate-100 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" /> Twitch
                  </button>
                  <button
                    type="button"
                    onClick={() => setStreamPlatform('tiktok')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                      streamPlatform === 'tiktok' ? 'bg-white shadow-md text-slate-900 ring-1 ring-slate-100 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Music2 className="h-3.5 w-3.5" /> TikTok
                  </button>
                </div>
              )}

              {(formData.platform as any) === 'stream' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div 
                    className="relative border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer bg-slate-50/50 group"
                    onClick={() => document.getElementById('twitch-upload-modal')?.click()}
                  >
                    {twitchPreview ? (
                      <div className="relative group">
                        <img src={twitchPreview} alt="Preview" className="max-h-48 rounded-2xl shadow-2xl transition-transform group-hover:scale-[1.02]" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                          <Plus className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Plus className="h-6 w-6 text-indigo-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-600">Subir captura de resultados</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">JPG, PNG hasta 10MB</p>
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

                  <div className="p-5 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100/50">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm transition-transform hover:scale-[1.02]">
                          <label className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">
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
                              className="w-full rounded-xl border-slate-50 bg-slate-50/50 py-2 px-1 text-xs focus:ring-2 focus:ring-indigo-500 transition-all font-black text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-slate-700"
                            />
                            <span className="text-slate-300 font-black">:</span>
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
                              className="w-full rounded-xl border-slate-50 bg-slate-50/50 py-2 px-1 text-xs focus:ring-2 focus:ring-indigo-500 transition-all font-black text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-slate-700"
                            />
                          </div>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm transition-transform hover:scale-[1.02]">
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            {streamPlatform === 'tiktok' ? 'Likes' : 'Avg Viewers'}
                          </label>
                          <input
                            type="number"
                            value={(streamPlatform === 'tiktok' ? formData.likes : formData.average_viewers) || ''}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              if (streamPlatform === 'tiktok') setFormData({ ...formData, likes: v });
                              else setFormData({ ...formData, average_viewers: v });
                            }}
                            className="block w-full rounded-xl border-slate-50 bg-slate-50/50 py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 transition-all font-black [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm transition-transform hover:scale-[1.02]">
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            {streamPlatform === 'tiktok' ? 'Coments' : 'Peak'}
                          </label>
                          <input
                            type="number"
                            value={(streamPlatform === 'tiktok' ? formData.comments : formData.peek_viewers) || ''}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              if (streamPlatform === 'tiktok') setFormData({ ...formData, comments: v });
                              else setFormData({ ...formData, peek_viewers: v });
                            }}
                            className="block w-full rounded-xl border-slate-50 bg-slate-50/50 py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 transition-all font-black [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-3">
                        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm transition-transform hover:scale-[1.02]">
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Únicos</label>
                          <input
                            type="number"
                            value={formData.unique_viewers || ''}
                            onChange={(e) => setFormData({ ...formData, unique_viewers: parseInt(e.target.value) || 0 })}
                            className="block w-full rounded-xl border-slate-50 bg-slate-50/50 py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 transition-all font-black [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm transition-transform hover:scale-[1.02]">
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            {streamPlatform === 'tiktok' ? 'Extra' : 'Chatters'}
                          </label>
                          <input
                            type="number"
                            value={(streamPlatform === 'tiktok' ? formData.average_viewers : formData.unique_chatters) || ''}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              if (streamPlatform === 'tiktok') setFormData({ ...formData, average_viewers: v });
                              else setFormData({ ...formData, unique_chatters: v });
                            }}
                            className="block w-full rounded-xl border-slate-50 bg-slate-50/50 py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 transition-all font-black [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm transition-transform hover:scale-[1.02]">
                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            {streamPlatform === 'tiktok' ? 'Vistas' : 'Live Views'}
                          </label>
                          <input
                            type="number"
                            value={formData.views || ''}
                            onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                            className="block w-full rounded-xl border-slate-50 bg-slate-50/50 py-2 px-3 text-xs focus:ring-2 focus:ring-indigo-500 transition-all font-black [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                </div>
              ) : (
                <div className="relative group animate-in fade-in slide-in-from-top-2">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ExternalLink className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="block w-full pl-12 rounded-[1.5rem] border-slate-100 bg-slate-50/50 py-4 text-sm font-bold text-slate-700 shadow-inner focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-300"
                  />
                </div>
              )}
            </div>
          </div>

          {editingContent && (
            <div className="pt-8 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50">
                <RefreshCw className="h-5 w-5 text-indigo-500" />
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Ajuste Manual</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase tracking-tighter">Úsalo si el scraper falló o tiene datos incorrectos</p>
                </div>
              </div>
              
              <div className="px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Título de la Publicación</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="block w-full rounded-2xl border-slate-100 bg-slate-50/30 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50/30 p-4 rounded-3xl border border-emerald-100/50">
                  <label className="block text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3 ml-1">Vistas</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.views}
                    onChange={e => setFormData({...formData, views: parseInt(e.target.value) || 0})}
                    className="block w-full rounded-xl border-transparent bg-white shadow-sm py-2.5 px-3 text-base focus:ring-2 focus:ring-emerald-500 transition-all font-black text-emerald-700 text-center"
                  />
                </div>
                <div className="bg-pink-50/30 p-4 rounded-3xl border border-pink-100/50">
                  <label className="block text-[9px] font-black text-pink-600 uppercase tracking-[0.2em] mb-3 ml-1">Likes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.likes}
                    onChange={e => setFormData({...formData, likes: parseInt(e.target.value) || 0})}
                    className="block w-full rounded-xl border-transparent bg-white shadow-sm py-2.5 px-3 text-base focus:ring-2 focus:ring-pink-500 transition-all font-black text-pink-700 text-center"
                  />
                </div>
                <div className="bg-indigo-50/30 p-4 rounded-3xl border border-indigo-100/50">
                  <label className="block text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 ml-1">Coments</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.comments}
                    onChange={e => setFormData({...formData, comments: parseInt(e.target.value) || 0})}
                    className="block w-full rounded-xl border-transparent bg-white shadow-sm py-2.5 px-3 text-base focus:ring-2 focus:ring-indigo-500 transition-all font-black text-indigo-700 text-center"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl bg-white border border-slate-100 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-[2] px-6 py-4 rounded-2xl bg-indigo-600 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isProcessing && <RefreshCw className="h-5 w-5 animate-spin" />}
              {isProcessing ? 'Procesando...' : (editingContent ? 'Guardar Cambios' : 'Anexar Publicación')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;
