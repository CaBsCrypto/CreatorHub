import React from 'react';
import { X, Youtube, Instagram, Music2, Twitter, Globe, ExternalLink, RefreshCw, Plus } from 'lucide-react';
import { Campaign, Content } from '../../supabase';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  editingContent: Content | null;
  onSubmit: (data: any) => Promise<void>;
  onTwitchUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
}

const platforms = [
  { id: 'youtube', icon: Youtube, color: 'text-red-600' },
  { id: 'instagram', icon: Instagram, color: 'text-pink-600' },
  { id: 'tiktok', icon: Music2, color: 'text-black' },
  { id: 'x', icon: Twitter, color: 'text-blue-400' },
  { id: 'coinmarketcap', icon: Globe, color: 'text-indigo-600' },
  { id: 'twitch', icon: Globe, color: 'text-purple-600' }
];

const ContentModal: React.FC<ContentModalProps> = ({ 
  isOpen, 
  onClose, 
  campaigns, 
  editingContent, 
  onSubmit, 
  onTwitchUpload, 
  isProcessing 
}) => {
  const [formData, setFormData] = React.useState({
    campaign_id: editingContent?.campaign_id || '',
    platform: editingContent?.platform || 'youtube',
    url: editingContent?.url || ''
  });
  const [twitchFile, setTwitchFile] = React.useState<File | null>(null);
  const [twitchPreview, setTwitchPreview] = React.useState<string | null>(null);

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
      onTwitchUpload(twitchFile);
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
                        ? 'border-indigo-600 bg-indigo-50/50'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <p.icon className={`h-5 w-5 ${p.color}`} />
                    <span className="text-[10px] mt-1 font-medium capitalize">{p.id === 'coinmarketcap' ? 'CMC' : p.id}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {formData.platform === 'twitch' ? 'Captura de Estadísticas' : 'URL del Contenido'}
              </label>
              {formData.platform === 'twitch' ? (
                <div className="space-y-3">
                  <div 
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer"
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

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
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
