import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ImageIcon, X, ExternalLink } from 'lucide-react';
import DiscordIcon from '../../icons/DiscordIcon';

interface DiscordFormSectionProps {
  platform: 'discord' | 'baseapp';
  formData: any;
  setFormData: (data: any) => void;
  twitchFile: File | null;
  setTwitchFile: (file: File | null) => void;
  twitchPreview: string | null;
  setTwitchPreview: (url: string | null) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DiscordFormSection: React.FC<DiscordFormSectionProps> = ({
  platform,
  formData,
  setFormData,
  twitchFile,
  setTwitchFile,
  twitchPreview,
  setTwitchPreview,
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
          placeholder={platform === 'baseapp' ? "Título del Video (ej. Demo 1)" : "Título de la Jornada (ej. Torneo #1)"}
          className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-sm font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 outline-none"
        />
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {platform === 'baseapp' ? <Globe className="h-4 w-4 text-slate-300" /> : <DiscordIcon className="h-4 w-4 text-slate-300" />}
        </div>
        
        {/* Subtle Captura Button */}
        <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center">
          <button
            type="button"
            onClick={() => document.getElementById('discord-upload')?.click()}
            className={`group/btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${twitchFile ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200'}`}
            title={platform === 'baseapp' ? "Subir video/captura" : "Adjuntar captura de resultados"}
          >
            <ImageIcon className={`h-3.5 w-3.5 ${twitchFile ? 'text-indigo-100' : 'group-hover/btn:text-indigo-500'}`} />
            <span className="text-[9px] font-black uppercase tracking-wider">
              {twitchFile ? 'Listo' : platform === 'baseapp' ? 'Subir' : 'Captura'}
            </span>
          </button>
          <input
            type="file"
            id="discord-upload"
            className="hidden"
            accept={platform === 'baseapp' ? "image/*,video/*" : "image/*"}
            onChange={onFileChange}
          />
        </div>
      </div>
      
      {/* Métricas de la Jornada */}
      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <DiscordIcon className="h-3.5 w-3.5 text-indigo-600" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Métricas de la Jornada</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-indigo-100 rounded-xl p-2.5 shadow-sm">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
              Duración Total
            </label>
            <div className="flex gap-1 items-center">
              <input
                type="number"
                placeholder="H"
                value={Math.floor((formData.duration_minutes || 0) / 60) || ''}
                onChange={(e) => {
                  const h = parseInt(e.target.value) || 0;
                  const m = (formData.duration_minutes || 0) % 60;
                  setFormData({ ...formData, duration_minutes: (h * 60) + m });
                }}
                className="w-full bg-slate-50/50 py-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-slate-700 font-mono"
              />
              <span className="text-indigo-200 font-bold">:</span>
              <input
                type="number"
                placeholder="M"
                max="59"
                value={(formData.duration_minutes || 0) % 60 || ''}
                onChange={(e) => {
                  const h = Math.floor((formData.duration_minutes || 0) / 60);
                  const m = parseInt(e.target.value) || 0;
                  setFormData({ ...formData, duration_minutes: (h * 60) + m });
                }}
                className="w-full bg-slate-50/50 py-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-slate-700 font-mono"
              />
            </div>
          </div>
          
          <div className="bg-white border border-indigo-100 rounded-xl p-2.5 shadow-sm">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
              Usu. Únicos
            </label>
            <input
              type="number"
              value={formData.unique_viewers || ''}
              onChange={(e) => setFormData({ ...formData, unique_viewers: parseInt(e.target.value) || 0 })}
              className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700 font-mono"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-indigo-100 rounded-xl p-2.5 shadow-sm">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
              Usu. Simultáneos
            </label>
            <input
              type="number"
              value={formData.peek_viewers || ''}
              onChange={(e) => setFormData({ ...formData, peek_viewers: parseInt(e.target.value) || 0 })}
              className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700 font-mono"
              placeholder="0"
            />
          </div>
          
          <div className="bg-white border border-indigo-100 rounded-xl p-2.5 shadow-sm">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
              Pantallas Comp.
            </label>
            <input
              type="number"
              value={formData.shares_count || ''}
              onChange={(e) => setFormData({ ...formData, shares_count: parseInt(e.target.value) || 0 })}
              className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700 font-mono"
              placeholder="0"
            />
          </div>
        </div>
      </div>
      
      {twitchPreview && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-all"
        >
          {twitchFile?.type.startsWith('video') ? (
            <video src={twitchPreview} className="w-full h-full object-cover" controls />
          ) : (
            <img src={twitchPreview} alt="Preview" className="w-full h-full object-cover" />
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <button 
              type="button"
              onClick={() => { setTwitchFile(null); setTwitchPreview(null); }}
              className="bg-slate-900/40 backdrop-blur-md hover:bg-red-500 text-white p-1.5 rounded-lg transition-all"
              title="Eliminar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <ExternalLink className="h-4 w-4 text-slate-300 transition-colors" />
        </div>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder={platform === 'baseapp' ? "URL del Post (opcional)" : "Link de la Jornada (opcional)"}
          className="block w-full pl-10.5 rounded-xl border-slate-200 bg-slate-50/30 py-3 text-sm font-medium text-slate-700 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
        />
      </div>
    </div>
  );
};

export default DiscordFormSection;
