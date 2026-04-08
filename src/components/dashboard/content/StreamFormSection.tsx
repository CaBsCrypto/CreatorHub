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
          onChange={onFileChange}
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
  );
};

export default StreamFormSection;
