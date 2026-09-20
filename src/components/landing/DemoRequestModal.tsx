import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, CheckCircle2, Building2, User, Mail, Users, MessageSquare, AlertCircle } from 'lucide-react';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
  initialEmail?: string;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  theme = 'dark',
  initialEmail = ''
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: initialEmail,
    company: '',
    creators_volume: '10-50',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync initialEmail when modal opens
  React.useEffect(() => {
    if (isOpen && initialEmail) {
      setFormData(prev => ({
        ...prev,
        email: prev.email || initialEmail
      }));
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo enviar la solicitud');
      }

      setStatus('success');
    } catch (err: any) {
      console.error('Demo request failed:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Error de conexión. Inténtalo nuevamente.');
    }
  };

  const handleResetAndClose = () => {
    setStatus('idle');
    setFormData({ name: '', email: '', company: '', creators_volume: '10-50', message: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 backdrop-blur-md transition-colors ${
          isLight ? 'bg-slate-900/40' : 'bg-slate-950/80'
        }`}
        onClick={handleResetAndClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden transition-colors border ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-900' 
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className={`absolute top-5 right-5 p-2 rounded-xl transition-colors ${
            isLight 
              ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        {status === 'success' ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className={`text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              ¡Solicitud Recibida!
            </h3>
            <p className={`text-sm max-w-sm mx-auto leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Hemos registrado los datos de tu empresa. Nuestro equipo te contactará en menos de 24 horas para coordinar tu acceso y demo guiada.
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30"
            >
              Entendido
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 text-indigo-500 text-xs font-black uppercase tracking-widest mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Browns Stats · Enterprise & Agency</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Solicitar Acceso / Demo
            </h2>
            <p className={`text-xs sm:text-sm mb-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Descubre cómo centralizar el monitoreo de creadores y entregar métricas en vivo a tus clientes.
            </p>

            {status === 'error' && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre o rol"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:border-indigo-500 ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400' 
                        : 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Email Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="contacto@agencia.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:border-indigo-500 ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400' 
                          : 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Empresa o Agencia
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Nombre de tu empresa"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:border-indigo-500 ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400' 
                          : 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Volumen de Creadores o Campañas Mensuales
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1 - 10', '10 - 50', '50+'].map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setFormData({ ...formData, creators_volume: vol })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        formData.creators_volume === vol
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                          : isLight
                            ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {vol} creadores
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  ¿Cómo podemos ayudarte? (Opcional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    rows={2}
                    placeholder="Cuéntanos brevemente sobre tus clientes o necesidades de monitoreo..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm transition-colors focus:outline-none focus:border-indigo-500 resize-none ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400' 
                        : 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span>Enviando solicitud...</span>
                ) : (
                  <>
                    <span>Enviar Solicitud</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DemoRequestModal;
