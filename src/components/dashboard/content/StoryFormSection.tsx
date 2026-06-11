import React from 'react';
import { Plus, Eye } from 'lucide-react';

interface StoryFormSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  twitchPreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzing?: boolean;
}

const StoryFormSection: React.FC<StoryFormSectionProps> = ({
  formData,
  setFormData,
  twitchPreview,
  onFileChange,
  isAnalyzing = false
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400 mb-5">
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
          Tema / Título de la Historia
        </label>
        <div className="relative group">
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ej: Promo Lanzamiento / Compartiendo Sorteo"
            className="block w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-slate-400 outline-none uppercase tracking-tight"
          />
        </div>
      </div>

      <div 
        className="relative border border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-indigo-500/50 hover:bg-slate-50/50 transition-all cursor-pointer bg-gray-50 group overflow-hidden"
        onClick={() => !isAnalyzing && document.getElementById('story-upload-modal')?.click()}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center py-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[10px] font-black text-indigo-600 mb-1 uppercase tracking-widest animate-pulse">Analizando captura con IA...</p>
            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Extrayendo visualizaciones</p>
          </div>
        ) : twitchPreview ? (
          <div className="relative group/img w-full flex justify-center">
            <img src={twitchPreview} alt="Story Preview" className="max-h-36 rounded-xl border border-gray-100 transition-transform group-hover/img:scale-[1.02]" />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-xs">
              <Plus className="h-6 w-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Plus className="h-6 w-6 text-slate-400 mb-2 group-hover:text-indigo-600 transition-colors" />
            <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Subir captura de visualizaciones</p>
            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Soporta JPG, PNG</p>
          </div>
        )}
        <input
          type="file"
          id="story-upload-modal"
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
          disabled={isAnalyzing}
        />
      </div>

      <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-indigo-500" />
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Visualizaciones (Views)
            </label>
          </div>
          <input
            type="number"
            required
            value={formData.views || ''}
            onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
            className="w-24 bg-gray-50 border border-gray-100 py-1.5 px-3 rounded-lg text-sm font-black text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-rose-500" />
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Interacciones
            </label>
          </div>
          <input
            type="number"
            value={formData.likes || ''}
            onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
            className="w-24 bg-gray-50 border border-gray-100 py-1.5 px-3 rounded-lg text-sm font-black text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-sky-500" />
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Actividad en Perfil
            </label>
          </div>
          <input
            type="number"
            value={formData.comments || ''}
            onChange={(e) => setFormData({ ...formData, comments: parseInt(e.target.value) || 0 })}
            className="w-24 bg-gray-50 border border-gray-100 py-1.5 px-3 rounded-lg text-sm font-black text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};

export default StoryFormSection;
