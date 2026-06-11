import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ImageIcon, X, ExternalLink, Plus, Monitor, Type, FileText, Clock, Users, Eye } from 'lucide-react';

interface DiscordFormSectionProps {
  platform: 'discord' | 'baseapp';
  formData: any;
  setFormData: (data: any) => void;
  twitchFile: File | null;
  setTwitchFile: (file: File | null) => void;
  twitchPreview: string | null;
  setTwitchPreview: (url: string | null) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzing?: boolean;
}

const DiscordFormSection: React.FC<DiscordFormSectionProps> = ({
  platform,
  formData,
  setFormData,
  twitchFile,
  setTwitchFile,
  twitchPreview,
  setTwitchPreview,
  onFileChange,
  isAnalyzing = false
}) => {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400 mb-5">
      {/* Title Section */}
      <div>
        <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 ml-1">
          {platform === 'baseapp' ? 'Título de la Actividad / Demo' : 'Título del Evento / Jornada'}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Type className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={platform === 'baseapp' ? "Ej: Presentación Demo 1" : "Ej: Gamenight Semanal / Scrims #1"}
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400 outline-none uppercase tracking-tight shadow-sm"
          />
        </div>
      </div>

      {/* Description Section */}
      <div>
        <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 ml-1">
          Resumen / Descripción de la Actividad
        </label>
        <div className="relative group">
          <div className="absolute top-3 left-3.5 pointer-events-none">
            <FileText className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Escribe un breve resumen de lo ocurrido (Ej: Detalles de ganadores, dinámicas...)"
            rows={3}
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400 outline-none resize-none font-sans shadow-sm"
          />
        </div>
      </div>

      {/* Capture Section */}
      <div>
        <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 ml-1">
          Captura de Pantalla / Evidencia (Opcional)
        </label>
        <div 
          className="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer bg-white group overflow-hidden shadow-sm"
          onClick={() => !isAnalyzing && document.getElementById('discord-upload-modal')?.click()}
        >
          {isAnalyzing ? (
            <div className="flex flex-col items-center py-4">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[10px] font-black text-indigo-600 mb-1 uppercase tracking-widest animate-pulse">Analizando captura con IA...</p>
              <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Extrayendo métricas</p>
            </div>
          ) : twitchPreview ? (
            <div className="relative group/img w-full flex justify-center">
              {twitchFile?.type.startsWith('video') ? (
                 <div className="flex flex-col items-center">
                   <Monitor className="h-8 w-8 text-indigo-600 mb-2" />
                   <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Video Stream Injected</p>
                 </div>
              ) : (
                <img src={twitchPreview} alt="Preview" className="max-h-36 rounded-xl border border-gray-100 transition-transform group-hover/img:scale-[1.02]" />
              )}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-xs">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                <ImageIcon className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black text-slate-600 mb-1 uppercase tracking-widest">Haga clic o arrastre una captura aquí</p>
              <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Soporta JPG, PNG</p>
            </div>
          )}
          <input
            type="file"
            id="discord-upload-modal"
            className="hidden"
            accept="image/*"
            onChange={onFileChange}
            disabled={isAnalyzing}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 ml-1">
          Métricas de la Actividad
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Duration Card */}
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Duración / Uptime
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <input
                  type="number"
                  placeholder="Horas"
                  value={Math.floor((formData.duration_minutes || 0) / 60) || ''}
                  onChange={(e) => {
                    const h = parseInt(e.target.value) || 0;
                    const m = (formData.duration_minutes || 0) % 60;
                    setFormData({ ...formData, duration_minutes: (h * 60) + m });
                  }}
                  className="w-full bg-gray-50 border border-gray-100 py-1.5 px-3 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono"
                />
              </div>
              <span className="text-slate-400 font-bold">:</span>
              <div className="flex-1 relative">
                <input
                  type="number"
                  placeholder="Minutos"
                  max="59"
                  value={(formData.duration_minutes || 0) % 60 || ''}
                  onChange={(e) => {
                    const h = Math.floor((formData.duration_minutes || 0) / 60);
                    const m = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, duration_minutes: (h * 60) + m });
                  }}
                  className="w-full bg-gray-50 border border-gray-100 py-1.5 px-3 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Peak Viewers Card */}
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Máx Espectadores (Peak)
              </span>
            </div>
            <input
              type="number"
              value={formData.peek_viewers || ''}
              onChange={(e) => setFormData({ ...formData, peek_viewers: parseInt(e.target.value) || 0 })}
              className="block w-full bg-gray-50 border border-gray-100 py-1.5 px-3 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono"
              placeholder="0"
            />
          </div>

          {/* Unique Viewers Card */}
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-indigo-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Usuarios Únicos (Views)
              </span>
            </div>
            <input
              type="number"
              value={formData.unique_viewers || ''}
              onChange={(e) => setFormData({ ...formData, unique_viewers: parseInt(e.target.value) || 0 })}
              className="block w-full bg-gray-50 border border-gray-100 py-1.5 px-3 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono"
              placeholder="0"
            />
          </div>

          {/* Screen Shares Card */}
          <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="h-4 w-4 text-indigo-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Pantallas Compartidas
              </span>
            </div>
            <input
              type="number"
              value={formData.shares_count || ''}
              onChange={(e) => setFormData({ ...formData, shares_count: parseInt(e.target.value) || 0 })}
              className="block w-full bg-gray-50 border border-gray-100 py-1.5 px-3 rounded-lg text-xs font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 text-slate-700 font-mono"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Optional Link Section */}
      <div>
        <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 ml-1">
          Enlace de Transmisión / Canal (Opcional)
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <ExternalLink className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://discord.com/channels/..."
            className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default DiscordFormSection;
