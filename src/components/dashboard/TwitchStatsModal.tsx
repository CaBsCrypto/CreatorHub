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
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500"></div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Análisis IA de Twitch</h2>
            <p className="text-sm text-gray-500 font-medium">Extraemos métricas directamente de tu captura de pantalla.</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-gray-50 text-gray-400 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
            {previewImage ? (
              <img src={previewImage} alt="Stream Capture" className="object-cover w-full h-full" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300 flex-col gap-2">
                <Globe className="h-10 w-10 opacity-20" />
                <span className="text-[10px] uppercase font-black tracking-widest opacity-20">Procesando Imagen...</span>
              </div>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Escaneando con IA...</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
              Resultados del Escaneo {stats && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </h3>
            
            {stats ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Título del Stream</p>
                  <p className="text-sm font-bold text-gray-900">{stats.title || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Vistas Totales</p>
                    <p className="text-xl font-black text-gray-900">{stats.views?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Pico de Viewers</p>
                    <p className="text-xl font-black text-gray-900">{stats.peek_viewers?.toLocaleString() || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-[10px] font-medium text-amber-800 leading-tight">
                    Verifica los datos antes de guardar. La IA puede cometer errores según la calidad de la imagen.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-gray-400">
                <p className="text-xs font-medium">Sube una captura de pantalla de tu dashboard de Twitch para ver las métricas aquí.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-2xl border border-gray-100 text-sm font-black text-gray-600 uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={!stats || isAnalyzing}
            className="flex-[2] px-8 py-4 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            Guardar y Asignar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwitchStatsModal;
