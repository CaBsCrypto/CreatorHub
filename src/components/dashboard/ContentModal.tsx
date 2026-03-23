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
  { id: 'twitch', icon: Globe, color: 'text-purple-600', label: 'Twitch' }
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
    if (formData.platform === 'twitch' && twitchFile) {
      console.log("Submitting Twitch Content:", { 
        creator_id: formData.creator_id, 
        views: formData.views, 
        peek: formData.peek_viewers, 
        duration: formData.duration_minutes, 
        average: formData.average_viewers 
      });
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
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-900/10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Ingresa el enlace de tu publicación</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Campaña Activa</label>
              <select
                required
                value={formData.campaign_id}
                onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="" disabled>{campaigns.length > 0 ? "Seleccionar campaña" : "No hay campañas activas"}</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {users && users.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Asignar a Creador</label>
                <select
                  required={false}
                  value={formData.creator_id}
                  onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Mi Cuenta (Automático)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.admin_alias || u.display_name || u.email.split('@')[0]}</option>
                  ))}
                  <option value="guest">Invitado (Añadir Manualmente)</option>
                </select>
              </div>
            )}

            {formData.creator_id === 'guest' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre del Invitado</label>
                <input
                  type="text"
                  required
                  value={formData.guest_name}
                  onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                  placeholder="Ej: Ibai Llanos"
                  className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plataforma</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, platform: p.id as any })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                      formData.platform === p.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <p.icon className={`h-5 w-5 ${p.color}`} />
                    <span className={`text-[9px] mt-1 font-black uppercase tracking-widest ${formData.platform === p.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {formData.platform === 'twitch' ? 'Captura de Estadísticas' : 'URL del Contenido'}
              </label>
              {formData.platform === 'twitch' ? (
                <div className="space-y-4">
                  <div 
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer bg-gray-50/30"
                    onClick={() => document.getElementById('twitch-upload-modal')?.click()}
                  >
                    {twitchPreview ? (
                      <img src={twitchPreview} alt="Preview" className="max-h-40 rounded-lg shadow-sm" />
                    ) : (
                      <>
                        <Plus className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Haz clic para subir captura</p>
                      </>
                    )}
                    <input
                      type="file"
                      id="twitch-upload-modal"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* AI Autocomplete removed for speed and manual reliability as requested */}

                  <div className="pt-2 px-3 pb-3 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-1">
                          <label className="block text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-1 ml-0.5">Duración (Stream)</label>
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
                              className="w-full rounded-lg border-gray-100 bg-white py-1.5 px-0.5 text-[10px] focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
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
                              className="w-full rounded-lg border-gray-100 bg-white py-1.5 px-0.5 text-[10px] focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-0.5">Promedio (Avg)</label>
                          <input
                            type="number"
                            value={formData.average_viewers || ''}
                            onChange={(e) => setFormData({ ...formData, average_viewers: parseInt(e.target.value) || 0 })}
                            className="block w-full rounded-lg border-gray-100 bg-white py-1.5 px-2 text-[10px] focus:ring-1 focus:ring-indigo-500 transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-0.5">Máximo (Peak)</label>
                          <input
                            type="number"
                            value={formData.peek_viewers || ''}
                            onChange={(e) => setFormData({ ...formData, peek_viewers: parseInt(e.target.value) || 0 })}
                            className="block w-full rounded-lg border-gray-100 bg-white py-1.5 px-2 text-[10px] focus:ring-1 focus:ring-indigo-500 transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-0.5">Esp. Únicos</label>
                          <input
                            type="number"
                            value={formData.unique_viewers || ''}
                            onChange={(e) => setFormData({ ...formData, unique_viewers: parseInt(e.target.value) || 0 })}
                            className="block w-full rounded-lg border-gray-100 bg-white py-1.5 px-2 text-[10px] focus:ring-1 focus:ring-indigo-500 transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100/50">
                        <div className="col-span-1">
                          <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-0.5">Chatters Ún.</label>
                          <input
                            type="number"
                            value={formData.unique_chatters || ''}
                            onChange={(e) => setFormData({ ...formData, unique_chatters: parseInt(e.target.value) || 0 })}
                            className="block w-full rounded-lg border-gray-100 bg-white py-1.5 px-2 text-[10px] focus:ring-1 focus:ring-indigo-500 transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-0.5">Vistas en Vivo</label>
                          <input
                            type="number"
                            value={formData.views || ''}
                            onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                            className="block w-full rounded-lg border-gray-100 bg-white py-1.5 px-2 text-[10px] focus:ring-1 focus:ring-indigo-500 transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-0.5">Seguidores</label>
                          <input
                            type="number"
                            value={formData.followers || ''}
                            onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
                            className="block w-full rounded-lg border-gray-100 bg-white py-1.5 px-2 text-[10px] focus:ring-1 focus:ring-indigo-500 transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-0.5">Nvas. Subs</label>
                          <input
                            type="number"
                            value={formData.new_subscriptions || ''}
                            onChange={(e) => setFormData({ ...formData, new_subscriptions: parseInt(e.target.value) || 0 })}
                            className="block w-full rounded-lg border-gray-100 bg-white py-1.5 px-2 text-[10px] focus:ring-1 focus:ring-indigo-500 transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://www.instagram.com/reel/..."
                    className="block w-full pl-10 rounded-xl border-gray-200 bg-gray-50/50 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              )}
            </div>
          </div>

          {editingContent && (
            <div className="pt-6 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-indigo-500" /> Ajuste Manual de Métricas
              </h3>
              <p className="text-[10px] text-gray-500 font-medium leading-tight">
                Usa estos campos si el scraper falló (ej. TikToks con 0 vistas o títulos incorrectos). 
                Al guardar, la campaña usará exactamente los números que escribas aquí.
              </p>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Título de la Publicación</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="block w-full rounded-xl border-gray-200 bg-white shadow-sm py-2.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Vistas</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.views}
                    onChange={e => setFormData({...formData, views: parseInt(e.target.value) || 0})}
                    className="block w-full rounded-xl border-gray-200 bg-white shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Likes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.likes}
                    onChange={e => setFormData({...formData, likes: parseInt(e.target.value) || 0})}
                    className="block w-full rounded-xl border-gray-200 bg-white shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Comentarios</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.comments}
                    onChange={e => setFormData({...formData, comments: parseInt(e.target.value) || 0})}
                    className="block w-full rounded-xl border-gray-200 bg-white shadow-sm py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
