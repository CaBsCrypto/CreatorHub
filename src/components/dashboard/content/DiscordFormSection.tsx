import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ImageIcon, X, ExternalLink, Plus, Monitor } from 'lucide-react';
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
      {/* Title Section */}
      <div className="relative group">
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={platform === 'baseapp' ? "Título del Video (ej. Demo 1)" : "Título de la Jornada (ej. Torneo #1)"}
          className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-sm font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 outline-none"
        />
      </div>

      {/* Description Section (New) */}
      <div className="relative group">
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción / Notas de la sesión (ej. Resultados del evento, detalles del ganador...)"
          rows={3}
          className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-sm font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 outline-none resize-none"
        />
      </div>

      {/* Large Upload Box (Only for Discord) */}
      {platform === 'discord' && (
        <div 
          className="relative border border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-slate-50/50 transition-all cursor-pointer bg-slate-50/20 group"
          onClick={() => document.getElementById('discord-upload-modal')?.click()}
        >
          {twitchPreview ? (
            <div className="relative group/img">
              {twitchFile?.type.startsWith('video') ? (
                 <div className="flex flex-col items-center">
                   <Monitor className="h-8 w-8 text-indigo-500 mb-2" />
                   <p className="text-[10px] font-bold text-slate-700">Video Adjuntado</p>
                 </div>
              ) : (
                <img src={twitchPreview} alt="Preview" className="max-h-32 rounded-xl border border-slate-100 transition-transform group-hover/img:scale-[1.02]" />
              )}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Plus className="h-6 w-6 text-slate-300 mb-2 group-hover:text-indigo-500 transition-colors" />
              <p className="text-[11px] font-semibold text-slate-500 mb-1">
                Subir captura de resultados
              </p>
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">PNG, JPG</p>
            </div>
          )}
          <input
            type="file"
            id="discord-upload-modal"
            className="hidden"
            accept="image/*"
            onChange={onFileChange}
          />
        </div>
      )}

      {/* Metrics Grid (Only for Discord) */}
      {platform === 'discord' && (
        <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-white border border-slate-200 rounded-xl p-2.5">
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
                  className="w-full bg-slate-50/50 py-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-slate-700"
                />
                <span className="text-slate-300 font-bold">:</span>
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
                  className="w-full bg-slate-50/50 py-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-slate-700"
                />
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-2.5">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Usu. Simultáneos
              </label>
              <input
                type="number"
                value={formData.peek_viewers || ''}
                onChange={(e) => setFormData({ ...formData, peek_viewers: parseInt(e.target.value) || 0 })}
                className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white border border-slate-200 rounded-xl p-2.5">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Usu. Únicos
              </label>
              <input
                type="number"
                value={formData.unique_viewers || ''}
                onChange={(e) => setFormData({ ...formData, unique_viewers: parseInt(e.target.value) || 0 })}
                className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                placeholder="0"
              />
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-2.5">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">
                Pantallas Comp.
              </label>
              <input
                type="number"
                value={formData.shares_count || ''}
                onChange={(e) => setFormData({ ...formData, shares_count: parseInt(e.target.value) || 0 })}
                className="block w-full bg-slate-50/50 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-center outline-none [appearance:textfield] text-slate-700"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Optional Link Section */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <ExternalLink className="h-4 w-4 text-slate-300" />
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
