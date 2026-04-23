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

const sanitizeUrl = (url: string, platform: string): string => {
  if (!url) return url;
  const cleanUrl = url.trim();

  try {
    if (platform === 'instagram') {
      // Handles p/, reels/, reel/, tv/ and URLs with username: instagram.com/user/p/ID
      const igMatch = cleanUrl.match(/(?:instagram\.com\/(?:[^/]+\/)?(?:p|reels|reel|tv)\/)([A-Za-z0-9_-]+)/);
      if (igMatch && igMatch[1]) {
        return `https://www.instagram.com/p/${igMatch[1]}/`;
      }
    }

    if (platform === 'youtube') {
      // Standardize youtu.be and youtube.com/watch
      const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^?&/]+)/);
      if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
      }
    }

    if (platform === 'tiktok') {
      // Standardize tiktok.com/@user/video/ID and strip query params
      const ttMatch = cleanUrl.match(/(?:tiktok\.com\/@[^/]+\/video\/|tiktok\.com\/t\/|vt\.tiktok\.com\/)([^?&/]+)/);
      if (ttMatch && ttMatch[1]) {
        // If it's a short link (t/ or vt.tiktok.com), we can't easily expand it here, 
        // but we can definitely strip query params from standard links
        if (cleanUrl.includes('/video/')) {
           return `https://www.tiktok.com/${cleanUrl.match(/(@[^/]+)/)?.[1] || '@user'}/video/${ttMatch[1]}`;
        }
      }
      // For all TikTok links, at least strip the query parameters
      return cleanUrl.split('?')[0].split('#')[0];
    }

    // Default: just strip query parameters for everything else
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
    description: ''
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
        guest_name: editingContent.guest_name || '',
        description: editingContent.description || ''
      });
    } else {
      setStreamPlatform('twitch');
      setFormData({
        campaign_id: '', creator_id: '', platform: 'youtube', url: '', title: '',
        views: 0, likes: 0, comments: 0, peek_viewers: 0, duration_minutes: 0,
        average_viewers: 0, unique_chatters: 0, unique_viewers: 0, followers: 0,
        new_subscriptions: 0, avg_duration_minutes: 0, shares_count: 0, guest_name: '',
        description: ''
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
    
    // Sanitize URL before processing
    const cleanUrl = sanitizeUrl(formData.url, formData.platform);
    const finalData = { ...formData, url: cleanUrl };

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
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[2.5rem] bg-slate-950/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl ring-1 ring-white/10 border border-white/5 animate-in zoom-in-95 slide-in-from-bottom-10 overflow-y-auto max-h-[min(90vh,calc(100vh-2rem))]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">{editingContent ? 'Edit Intelligence' : 'New Content Link'}</h2>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-widest">{editingContent ? 'Update neural records' : 'Initialize link connection'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all shadow-sm ring-1 ring-white/10">
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
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Assign To</label>
                  <select
                    value={formData.creator_id}
                    onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                    className="block w-full rounded-xl border-white/10 bg-white/5 py-2.5 px-4 text-sm font-medium text-white outline-none focus:bg-white/10 focus:ring-1 focus:ring-emerald-500/50"
                  >
                    <option value="" className="bg-slate-900">Primary Identity</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-slate-900">{u.admin_alias || u.display_name || u.email.split('@')[0]}</option>
                    ))}
                    <option value="guest" className="bg-slate-900">External Entity</option>
                  </select>
                </div>
              )}
            </div>

            {formData.creator_id === 'guest' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">External Identity Label</label>
                <input
                  type="text" required value={formData.guest_name}
                  onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                  placeholder="e.g. Identity Proxy"
                  className="block w-full rounded-xl border-white/10 bg-white/5 py-2.5 px-4 text-sm font-medium text-white outline-none focus:bg-white/10 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            )}
            
            <PlatformSelector
              availablePlatforms={availablePlatforms as any}
              selectedPlatform={formData.platform}
              onSelect={(id) => setFormData({ ...formData, platform: id as any })}
            />

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                {(formData.platform as any) === 'stream' ? 'Capture & Telemetry' : 'Protocol URL'}
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
                    <ExternalLink className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="url" required value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://network.protocol/link"
                    className="block w-full pl-10.5 rounded-xl border-white/10 bg-white/5 py-3 text-sm font-medium text-white outline-none focus:bg-white/10 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
              Abort
            </button>
            <button type="submit" disabled={isProcessing} className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing...' : (editingContent ? 'Sync Records' : 'Initialize Link')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;
