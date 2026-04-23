import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, loginWithGoogle } from '../AuthContext';
import { LogIn, Sparkles, Zap, ShieldCheck, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loginError, setLoginError] = React.useState('');

  React.useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin' || profile.role === 'manager') {
        navigate('/admin');
      } else if (profile.role === 'client') {
        navigate('/client');
      } else {
        navigate('/creator');
      }
    }
  }, [user, profile, navigate]);

  const handleLogin = async () => {
    setLoginError('');
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Login failed", error);
      setLoginError(error?.message || 'Error al iniciar sesión. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic Overlays */}
      <div className="grain-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="nebula-glow top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/10" />
        <div className="nebula-glow bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/05" />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side: Branding & Info */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col space-y-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent" />
              <Sparkles className="text-emerald-400 h-8 w-8 relative z-10" />
            </div>
            <span className="text-3xl font-black text-white tracking-[0.2em] uppercase">
              Umbra <span className="text-emerald-500">Hub</span>
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl font-black text-white leading-[1.1] tracking-tighter uppercase">
              Mide tu <br />
              <span className="gradient-text">Impacto.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
              La plataforma definitiva para creadores de Web3. Analiza, optimiza y domina la narrativa cultural con precisión técnica.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-10">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-emerald-400">
                <Zap className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Real-Time Metrics</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Sincronización instantánea con el ecosistema global de contenido.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-cyan-400">
                <ShieldCheck className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Agency Grade</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Infraestructura de nivel institucional para el crecimiento de talentos.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-md glass-dark rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-600" />
            
            <div className="text-center mb-12">
              <div className="lg:hidden flex items-center justify-center gap-4 mb-10">
                <div className="w-12 h-12 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-emerald-500 h-6 w-6" />
                </div>
                <span className="text-2xl font-black text-white uppercase tracking-tighter">Umbra</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter">Acceso</h2>
              <p className="text-slate-400 font-medium text-sm">Ingresa al centro de comando de Umbra.</p>
            </div>

            <div className="space-y-8">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-between gap-4 bg-white text-slate-950 rounded-2xl px-8 py-5 font-black uppercase tracking-widest text-[10px] transition-all duration-500 hover:scale-[1.02] shadow-xl active:scale-95 group/btn"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center">
                    <LogIn className="h-4 w-4 text-white" />
                  </div>
                  Continuar con Google
                </div>
                <ArrowRight className="h-4 w-4 text-slate-950 group-hover/btn:translate-x-2 transition-transform" />
              </button>

              {loginError && (
                <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest text-center bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{loginError}</p>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-black"><span className="bg-slate-950 px-6 text-slate-600 italic">Auth_Restricted</span></div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <p className="text-[9px] text-slate-500 text-center font-black uppercase tracking-[0.2em] leading-relaxed opacity-60">
                  Al ingresar, confirmas la aceptación de los <br />
                  <a href="#" className="text-emerald-500 hover:text-emerald-400 transition-colors">Términos del Protocolo</a>
                </p>
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-[0.5em]">Umbra_Network_Node</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
