import React from 'react';
import { X, Youtube, Instagram, Music2, Twitter, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { Campaign, Content, UserProfile } from '../../supabase';
import { resizeImage } from '../../utils/imageUtils';
import DiscordIcon from '../icons/DiscordIcon';

// Modular Components
import PlatformSelector from './content/PlatformSelector';
import StreamFormSection from './content/StreamFormSection';
import DiscordFormSection from './content/DiscordFormSection';
import CampaignSelector from './content/CampaignSelector';

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
    guest_name: ''
  });

  const [twitchFile, setTwitchFile] = React.useState<File | null>(null);
  const [twitchPreview, setTwitchPreview] = React.useState<string | null>(null);
  const [streamPlatform, setStreamPlatform] = React.useState<'twitch' | 'tiktok'>('twitch');
  const [isCampaignListOpen, setIsCampaignListOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Constants
  const availablePlatforms = React.useMemo(() => [
    { id: 'youtube', icon: Youtube, color: 'text-red-600', label: 'YouTube' },
    { id: 'instagram', icon: Instagram, color: 'text-pink-600', label: 'Instagram' },
    { id: 'tiktok', icon: Music2, color: 'text-black', label: 'TikTok' },
    { id: 'x', icon: Twitter, color: 'text-indigo-900', label: 'X' },
    { id: 'coinmarketcap', icon: Globe, color: 'text-indigo-600', label: 'CMC' },
    { id: 'stream', icon: Globe, color: 'text-purple-600', label: 'Streams' },
    { id: 'baseapp', icon: Globe, color: 'text-blue-600', label: 'BaseApp' },
    { id: 'discord', icon: DiscordIcon, color: 'text-indigo-500', label: 'Discord' }
  ], []);

  // Click outside for dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCampaignListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync / Reset Form
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
        campaign_id: '', creator_id: '', platform: 'youtube', url: '', title: '',
        views: 0, likes: 0, comments: 0, peek_viewers: 0, duration_minutes: 0,
        average_viewers: 0, unique_chatters: 0, unique_viewers: 0, followers: 0,
        new_subscriptions: 0, avg_duration_minutes: 0, shares_count: 0, guest_name: ''
      });
    }
  }, [editingContent, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTwitchPreview(reader.result as string);
      reader.readAsDataURL(file);

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
      } catch (err) {
        setTwitchFile(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    if ((finalData.platform as any) === 'stream') {
      finalData.platform = streamPlatform as any;
    }

    if ((formData.platform as any) === 'stream' && twitchFile) {
      onTwitchUpload(
        twitchFile, formData.creator_id, formData.duration_minutes,
        formData.average_viewers, formData.peek_viewers, formData.unique_viewers,
        formData.unique_chatters, formData.views, formData.followers,
        formData.new_subscriptions, formData.shares_count, formData.title,
        formData.campaign_id, (formData.platform as any) === 'discord' ? 'discord' : streamPlatform
      );
    } else if ((formData.platform === 'discord' || formData.platform === ('baseapp' as any)) && twitchFile) {
       onTwitchUpload(
        twitchFile, formData.creator_id, formData.duration_minutes,
        0, formData.peek_viewers, formData.unique_viewers, 0, formData.views,
        0, 0, formData.shares_count, formData.title, formData.campaign_id,
        formData.platform as 'discord' | 'baseapp' as any
      );
    } else {
      onSubmit(finalData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[2rem] bg-white p-6 sm:p-8 shadow-xl ring-1 ring-slate-100 animate-in zoom-in-95 slide-in-from-bottom-10 overflow-y-auto max-h-[min(90vh,calc(100vh-2rem))]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{editingContent ? 'Actualiza los detalles' : 'Vincula una nueva publicación'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm ring-1 ring-slate-100">
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
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Asignar a</label>
                  <select
                    value={formData.creator_id}
                    onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                    className="block w-full rounded-xl border-slate-200 bg-slate-50/30 py-2.5 px-4 text-sm font-medium text-slate-700 outline-none"
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
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nombre del Invitado</label>
                <input
                  type="text" required value={formData.guest_name}
                  onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                  placeholder="Ej: Ibai Llanos"
                  className="block w-full rounded-xl border-slate-200 bg-slate-50/30 py-2.5 px-4 text-sm font-medium outline-none"
                />
              </div>
            )}
            
            <PlatformSelector
              availablePlatforms={availablePlatforms}
              selectedPlatform={formData.platform}
              onSelect={(id) => setFormData({ ...formData, platform: id as any })}
            />

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                {(formData.platform as any) === 'stream' ? 'Captura y Resultados' : (formData.platform as any) === 'baseapp' ? 'Video Entregable' : 'URL del Contenido'}
              </label>

              {(formData.platform as any) === 'stream' ? (
                <StreamFormSection
                  formData={formData} setFormData={setFormData}
                  streamPlatform={streamPlatform} setStreamPlatform={setStreamPlatform}
                  twitchPreview={twitchPreview} onFileChange={handleFileChange}
                />
              ) : (formData.platform as any) === 'discord' || (formData.platform as any) === 'baseapp' ? (
                <DiscordFormSection
                  platform={formData.platform as any}
                  formData={formData} setFormData={setFormData}
                  twitchFile={twitchFile} setTwitchFile={setTwitchFile}
                  twitchPreview={twitchPreview} setTwitchPreview={setTwitchPreview}
                  onFileChange={handleFileChange}
                />
              ) : (
                <div className="relative group animate-in fade-in slide-in-from-top-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <ExternalLink className="h-4 w-4 text-slate-300" />
                  </div>
                  <input
                    type="url" required value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="block w-full pl-10.5 rounded-xl border-slate-200 bg-slate-50/30 py-3 text-sm font-medium text-slate-700 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isProcessing} className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
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
