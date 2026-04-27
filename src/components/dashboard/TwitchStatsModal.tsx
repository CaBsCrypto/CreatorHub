import React from 'react';
import { X, Globe, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface TwitchStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAnalyzing: boolean;
  stats: any | null;
  onSave: () => Promise<void>;
  previewImage: string | null;
}

const TwitchStatsModal: React.FC<TwitchStatsModalProps> = ({
  isOpen,
  onClose,
  isAnalyzing,
  stats,
  onSave,
  previewImage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-50/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-slate-50/80 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-white/10 border border-slate-200 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500"></div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">AI Neural Scan: Twitch</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Deep metric extraction from telemetry captures.</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/5 text-slate-500 transition-all hover:rotate-90">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-white/5 border border-slate-200 shadow-inner">
            {previewImage ? (
              <img src={previewImage} alt="Stream Capture" className="object-cover w-full h-full opacity-60 grayscale hover:grayscale-0 transition-all duration-500" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-700 flex-col gap-2">
                <Globe className="h-10 w-10 opacity-20" />
                <span className="text-[10px] uppercase font-black tracking-widest opacity-20">Awaiting Telemetry...</span>
              </div>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-md flex items-center justify-center flex-col gap-4">
                <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-xs font-black text-white uppercase tracking-widest">Neural Scan in Progress...</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              Extraction Results {stats && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
            </h3>
            
            {stats ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-slate-200">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Stream Broadcast Title</p>
                  <p className="text-sm font-black text-white uppercase tracking-tight">{stats.title || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Impressions</p>
                    <p className="text-xl font-black text-white font-mono">{stats.views?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Concurrent Peak</p>
                    <p className="text-xl font-black text-white font-mono">{stats.peek_viewers?.toLocaleString() || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-[9px] font-bold text-amber-400 uppercase leading-tight tracking-wider">
                    Validate telemetry before commit. AI interpretation may vary by capture quality.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-slate-700">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting valid telemetry input stream...</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-2xl border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white/5 transition-all"
          >
            Abort
          </button>
          <button
            onClick={onSave}
            disabled={!stats || isAnalyzing}
            className="flex-[2] px-8 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            Commit Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwitchStatsModal;
