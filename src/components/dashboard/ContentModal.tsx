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
  onTwitchUpload: (file: File, creator_id?: string, views?: number, peek?: number) => Promise<void>;
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
    comments: editingContent?.comments || 0
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
        comments: editingContent.comments || 0
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
        comments: 0
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
      console.log("Submitting Twitch Content:", { creator_id: formData.creator_id, views: formData.views, peek: formData.likes });
      onTwitchUpload(twitchFile, formData.creator_id, formData.views, formData.likes);
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
                </select>
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

                  {twitchPreview && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          if (twitchPreview && twitchPreview.length > 5 * 1024 * 1024) {
                            toastError("La imagen es muy pesada para la IA. Intenta con una captura de pantalla más pequeña.");
                            return;
                          }
                          setIsAnalyzing(true);
                          
                          // Compress image before sending to AI to avoid payload limits
                          const compressedImage = await resizeImage(twitchPreview, 1024, 1024);
                          console.log(`Original size: ${twitchPreview.length}, Compressed size: ${compressedImage.length}`);
                          
                          const { data: { session } } = await supabase.auth.getSession();
                          const res = await fetch('/api/analyze-twitch', {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${session?.access_token}`
                            },
                            body: JSON.stringify({ image: compressedImage })
                          });
                          
                          const data = await res.json();
                          
                          if (!res.ok) {
                            throw new Error(data.details || data.message || data.error || "Error desconocido en el servidor");
                          }

                          if (data.views !== undefined) {
                            setFormData(prev => ({
                              ...prev,
                              views: data.views || 0,
                              likes: data.peek_viewers || 0,
                              title: data.title || prev.title
                            }));
                          }
                        } catch (err: any) {
                          console.error("AI Analysis failed:", err);
                          toastError("Error de IA: " + err.message);
                        } finally {
                          setIsAnalyzing(false);
                        }
                      }}
                      disabled={isAnalyzing}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-all border border-purple-100"
                    >
                      {isAnalyzing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                      {isAnalyzing ? "Analizando imagen..." : "Auto-completar con IA ✨"}
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Vistas Totales</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej: 1500"
                        value={formData.views}
                        onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                        className="block w-full rounded-xl border-gray-200 bg-white py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Peak Viewers</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej: 150"
                        value={formData.likes} // We use 'likes' temporarily as 'peek' proxy in form or add dedicated state
                        onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                        className="block w-full rounded-xl border-gray-200 bg-white py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                      />
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
