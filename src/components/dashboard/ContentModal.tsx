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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-[2rem] bg-white p-8 sm:p-10 shadow-xl ring-1 ring-slate-100 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden">
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {editingContent ? 'Actualiza los detalles de tu publicación' : 'Vincula una nueva publicación a tu campaña'}
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
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Campaña</label>
                <select
                  required
                  value={formData.campaign_id}
                  onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/30 py-2.5 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                >
                  <option value="" disabled>{campaigns.length > 0 ? "Seleccionar..." : "No hay campañas"}</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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
                {platforms.map((p) => (
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
            
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                {(formData.platform as any) === 'stream' ? 'Captura y Resultados' : 'URL del Contenido'}
              </label>

              {(formData.platform as any) === 'stream' && (
                <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-xl mb-4 ring-1 ring-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setStreamPlatform('twitch')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      streamPlatform === 'twitch' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Globe className="h-3 w-3" /> Twitch
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
              )}

              {(formData.platform as any) === 'stream' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
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

                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
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
                            {streamPlatform === 'tiktok' ? 'Likes' : 'Avg View'}
                          </label>
                          <input
                            type="number"
                            value={(streamPlatform === 'tiktok' ? formData.likes : formData.average_viewers) || ''}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              if (streamPlatform === 'tiktok') setFormData({ ...formData, likes: v });
                              else setFormData({ ...formData, average_viewers: v });
                            }}
                            className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                            {streamPlatform === 'tiktok' ? 'Coment' : 'Peak'}
                          </label>
                          <input
                            type="number"
                            value={(streamPlatform === 'tiktok' ? formData.comments : formData.peek_viewers) || ''}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 0;
                              if (streamPlatform === 'tiktok') setFormData({ ...formData, comments: v });
                              else setFormData({ ...formData, peek_viewers: v });
                            }}
                            className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Únicos</label>
                          <input
                            type="number"
                            value={formData.unique_viewers || ''}
                            onChange={(e) => setFormData({ ...formData, unique_viewers: parseInt(e.target.value) || 0 })}
                            className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
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
                            className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                            {streamPlatform === 'tiktok' ? 'Vistas' : 'Vistas V.'}
                          </label>
                          <input
                            type="number"
                            value={formData.views || ''}
                            onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                            className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                            placeholder="0"
                          />
                        </div>
                      </div>
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

          {editingContent && (
            <div className="pt-6 border-t border-slate-100 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
                <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Ajuste Manual de Métricas</h3>
              </div>
              
              <div className="px-0.5">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Título de la Publicación</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/30 py-2.5 px-4 text-sm font-medium text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Vistas</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.views}
                    onChange={e => setFormData({...formData, views: parseInt(e.target.value) || 0})}
                    className="block w-full bg-white border border-slate-200 rounded-lg py-1.5 text-center text-sm font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Likes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.likes}
                    onChange={e => setFormData({...formData, likes: parseInt(e.target.value) || 0})}
                    className="block w-full bg-white border border-slate-200 rounded-lg py-1.5 text-center text-sm font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Coments</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.comments}
                    onChange={e => setFormData({...formData, comments: parseInt(e.target.value) || 0})}
                    className="block w-full bg-white border border-slate-200 rounded-lg py-1.5 text-center text-sm font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

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
