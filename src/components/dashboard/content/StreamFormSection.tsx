import React from 'react';
import { Globe, Music2, Plus } from 'lucide-react';

interface StreamFormSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  streamPlatform: 'twitch' | 'tiktok';
  setStreamPlatform: (val: 'twitch' | 'tiktok') => void;
  twitchPreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzing?: boolean;
}

const StreamFormSection: React.FC<StreamFormSectionProps> = ({
  formData,
  setFormData,
  streamPlatform,
  setStreamPlatform,
  twitchPreview,
  onFileChange,
  isAnalyzing = false
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400 mb-5">
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Título del Stream</label>
        <div className="relative group">
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ej: Torneo Semanal Fortnite / Charla con la comunidad"
            className="block w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-slate-400 outline-none uppercase tracking-tight"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
        <button
          type="button"
          onClick={() => setStreamPlatform('twitch')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
            streamPlatform === 'twitch' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Globe className="h-3 w-3" /> Twitch
        </button>
        <button
          type="button"
          onClick={() => setStreamPlatform('tiktok')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
            streamPlatform === 'tiktok' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Music2 className="h-3 w-3" /> TikTok
        </button>
      </div>
      
      <div 
        className="relative border border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-indigo-500/50 hover:bg-slate-50/50 transition-all cursor-pointer bg-gray-50 group overflow-hidden"
        onClick={() => !isAnalyzing && document.getElementById('twitch-upload-modal')?.click()}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center py-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[10px] font-black text-indigo-600 mb-1 uppercase tracking-widest animate-pulse">Analizando captura con IA...</p>
            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Extrayendo métricas</p>
          </div>
        ) : twitchPreview ? (
          <div className="relative group/img w-full flex justify-center">
            <img src={twitchPreview} alt="Preview" className="max-h-36 rounded-xl border border-gray-100 transition-transform group-hover/img:scale-[1.02]" />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-xs">
              <Plus className="h-6 w-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Plus className="h-6 w-6 text-slate-400 mb-2 group-hover:text-indigo-600 transition-colors" />
            <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Subir captura del resumen</p>
            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Soporta JPG, PNG</p>
          </div>
        )}
        <input
          type="file"
          id="twitch-upload-modal"
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
          disabled={isAnalyzing}
        />
      </div>

      <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-xs">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5 text-center">
              {streamPlatform === 'tiktok' ? 'Sesión' : 'Uptime'}
            </label>
            <div className="flex gap-1 items-center justify-center">
              <input
                type="number"
                placeholder="H"
                value={Math.floor(formData.duration_minutes / 60) || ''}
                onChange={(e) => {
                  const h = parseInt(e.target.value) || 0;
                  const m = formData.duration_minutes % 60;
                  setFormData({ ...formData, duration_minutes: (h * 60) + m });
                }}
                className="w-14 bg-gray-50 border border-gray-100 py-1 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-slate-400 font-bold">:</span>
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
                className="w-14 bg-gray-50 border border-gray-100 py-1 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-xs">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5 text-center">
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
              className="block w-full bg-gray-50 border border-gray-100 py-1 px-1 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-xs">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5 text-center">
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
              className="block w-full bg-gray-50 border border-gray-100 py-1 px-1 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
          </div>
        </div>

        <div className={`grid gap-3 mt-3 ${streamPlatform === 'twitch' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {streamPlatform === 'twitch' && (
            <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-xs">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5 text-center">Unique</label>
              <input
                type="number"
                value={formData.unique_viewers || ''}
                onChange={(e) => setFormData({ ...formData, unique_viewers: parseInt(e.target.value) || 0 })}
                className="block w-full bg-gray-50 border border-gray-100 py-1 px-1 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
            </div>
          )}
          <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-xs">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5 text-center">
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
              className="block w-full bg-gray-50 border border-gray-100 py-1 px-1 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-xs">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5 text-center">
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
              className="block w-full bg-gray-50 border border-gray-100 py-1 px-1 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamFormSection;
