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
          placeholder={platform === 'baseapp' ? "Operation Blueprint (e.g. Demo 1)" : "Mission Log Title (e.g. Scrims #1)"}
          className="block w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600 outline-none uppercase tracking-tight"
        />
      </div>

      {/* Description Section (New) */}
      <div className="relative group">
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Strategic summary / Intel briefing notes (e.g. Winner details, event metrics...)"
          rows={3}
          className="block w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600 outline-none resize-none font-mono"
        />
      </div>

      {/* Large Upload Box (Only for Discord) */}
      {platform === 'discord' && (
        <div 
          className="relative border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-emerald-500/50 hover:bg-white/5 transition-all cursor-pointer bg-white/5 group overflow-hidden"
          onClick={() => document.getElementById('discord-upload-modal')?.click()}
        >
          {twitchPreview ? (
            <div className="relative group/img w-full flex justify-center">
              {twitchFile?.type.startsWith('video') ? (
                 <div className="flex flex-col items-center">
                   <Monitor className="h-8 w-8 text-emerald-500 mb-2" />
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Video Stream Injected</p>
                 </div>
              ) : (
                <img src={twitchPreview} alt="Preview" className="max-h-32 rounded-xl border border-white/10 transition-transform group-hover/img:scale-[1.02] grayscale hover:grayscale-0" />
              )}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Plus className="h-6 w-6 text-white" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Plus className="h-6 w-6 text-slate-700 mb-2 group-hover:text-emerald-500 transition-colors" />
              <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Capture Intelligence</p>
              <p className="text-[8px] text-slate-700 uppercase font-black tracking-[0.3em]">Telemetry.JPG</p>
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
      {/* Metrics Grid (Only for Discord) */}
      {platform === 'discord' && (
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5">
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-0.5">
                Operation Uptime
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
                  className="w-full bg-white/5 py-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
                />
                <span className="text-slate-700 font-bold">:</span>
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
                  className="w-full bg-white/5 py-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
                />
              </div>
            </div>
            
            <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5">
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-0.5">
                Concurrent Users
              </label>
              <input
                type="number"
                value={formData.peek_viewers || ''}
                onChange={(e) => setFormData({ ...formData, peek_viewers: parseInt(e.target.value) || 0 })}
                className="block w-full bg-white/5 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5">
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-0.5">
                Unique Entities
              </label>
              <input
                type="number"
                value={formData.unique_viewers || ''}
                onChange={(e) => setFormData({ ...formData, unique_viewers: parseInt(e.target.value) || 0 })}
                className="block w-full bg-white/5 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
                placeholder="0"
              />
            </div>
            
            <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5">
              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-0.5">
                Signal Shares
              </label>
              <input
                type="number"
                value={formData.shares_count || ''}
                onChange={(e) => setFormData({ ...formData, shares_count: parseInt(e.target.value) || 0 })}
                className="block w-full bg-white/5 py-1 px-1 rounded text-xs focus:ring-1 focus:ring-emerald-500/50 transition-all font-black text-center outline-none [appearance:textfield] text-white font-mono"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Optional Link Section */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <ExternalLink className="h-4 w-4 text-slate-500" />
        </div>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder={platform === 'baseapp' ? "Post Transmission URL (optional)" : "Mission Log URL (optional)"}
          className="block w-full pl-10.5 rounded-xl border-white/10 bg-white/5 py-3 text-sm font-medium text-white focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/10 transition-all outline-none font-mono"
        />
      </div>
    </div>
  );
};

export default DiscordFormSection;
