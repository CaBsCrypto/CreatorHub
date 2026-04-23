import React from 'react';
import { Globe, Music2, Plus } from 'lucide-react';

interface StreamFormSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  streamPlatform: 'twitch' | 'tiktok';
  setStreamPlatform: (val: 'twitch' | 'tiktok') => void;
  twitchPreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StreamFormSection: React.FC<StreamFormSectionProps> = ({
  formData,
  setFormData,
  streamPlatform,
  setStreamPlatform,
  twitchPreview,
  onFileChange
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400 mb-5">
      <div className="relative group">
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Mission Broadcast Title (e.g. Protocol Alpha)"
          className="block w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white focus:ring-1 focus:ring-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600 outline-none uppercase tracking-tight"
        />
      </div>

      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl ring-1 ring-white/10">
        <button
          type="button"
          onClick={() => setStreamPlatform('twitch')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
            streamPlatform === 'twitch' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Globe className="h-3 w-3" /> Twitch
        </button>
        <button
          type="button"
          onClick={() => setStreamPlatform('tiktok')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
            streamPlatform === 'tiktok' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Music2 className="h-3 w-3" /> TikTok
        </button>
      </div>
      
      <div 
        className="relative border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-emerald-500/50 hover:bg-white/5 transition-all cursor-pointer bg-white/5 group overflow-hidden"
        onClick={() => document.getElementById('twitch-upload-modal')?.click()}
      >
        {twitchPreview ? (
          <div className="relative group/img w-full flex justify-center">
            <img src={twitchPreview} alt="Preview" className="max-h-32 rounded-xl border border-white/10 transition-transform group-hover/img:scale-[1.02] grayscale hover:grayscale-0" />
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Plus className="h-6 w-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Plus className="h-6 w-6 text-slate-700 mb-2 group-hover:text-emerald-500 transition-colors" />
            <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Inject Results Capture</p>
            <p className="text-[8px] text-slate-700 uppercase font-black tracking-[0.3em]">Telemetry.JPG</p>
          </div>
        )}
        <input
          type="file"
          id="twitch-upload-modal"
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
        />
      </div>

      <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5">
            <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-0.5">
              {streamPlatform === 'tiktok' ? 'Session' : 'Uptime'}
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
                className="w-full bg-white/5 py-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
              />
              <span className="text-slate-700 font-bold">:</span>
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
                className="w-full bg-white/5 py-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
              />
            </div>
          </div>
          <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5">
            <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-0.5">
              {streamPlatform === 'tiktok' ? 'Reach' : 'Avg Tele'}
            </label>
            <input
              type="number"
              value={(streamPlatform === 'tiktok' ? formData.views : formData.average_viewers) || ''}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 0;
                if (streamPlatform === 'tiktok') setFormData({ ...formData, views: v });
                else setFormData({ ...formData, average_viewers: v });
              }}
              className="block w-full bg-white/5 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
              placeholder="0"
            />
          </div>
          <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5">
            <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-0.5">
              {streamPlatform === 'tiktok' ? 'Unique' : 'Peak'}
            </label>
            <input
              type="number"
              value={(streamPlatform === 'tiktok' ? formData.unique_viewers : formData.peek_viewers) || ''}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 0;
                if (streamPlatform === 'tiktok') setFormData({ ...formData, unique_viewers: v });
                else setFormData({ ...formData, peek_viewers: v });
              }}
              className="block w-full bg-white/5 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
              placeholder="0"
            />
          </div>
        </div>

        <div className={`grid gap-2 mt-2 ${streamPlatform === 'twitch' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {streamPlatform === 'twitch' && (
            <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5 shadow-sm">
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-0.5">Unique</label>
              <input
                type="number"
                value={formData.unique_viewers || ''}
                onChange={(e) => setFormData({ ...formData, unique_viewers: parseInt(e.target.value) || 0 })}
                className="block w-full bg-white/5 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
                placeholder="0"
              />
            </div>
          )}
          <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5 shadow-sm">
            <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-0.5">
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
              className="block w-full bg-white/5 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
              placeholder="0"
            />
          </div>
          <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5 shadow-sm">
            <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-0.5">
              {streamPlatform === 'tiktok' ? 'Coment' : 'VOD Views'}
            </label>
            <input
              type="number"
              value={(streamPlatform === 'tiktok' ? formData.comments : formData.views) || ''}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 0;
                if (streamPlatform === 'tiktok') setFormData({ ...formData, comments: v });
                else setFormData({ ...formData, views: v });
              }}
              className="block w-full bg-white/5 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamFormSection;
