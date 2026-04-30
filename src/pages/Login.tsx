import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, loginWithGoogle } from '../AuthContext';
import { LogIn, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden selection:bg-red-500/30">
      <div className="grain-overlay opacity-10" />
      
      {/* Subtle background glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[100px]" />
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
             <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/20">
                <Sparkles className="text-black h-8 w-8" />
             </div>
             <span className="text-3xl font-black text-white tracking-[0.2em] uppercase">
               Umbra <span className="text-red-600">Hub</span>
             </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl font-black text-white leading-[1.1] tracking-tighter uppercase">
              Mide tu <br />
              <span className="text-red-600">Impacto.</span>
            </h1>
            <p className="text-xl text-white/40 font-medium max-w-lg leading-relaxed">
              La plataforma definitiva para creadores de Web3. Analiza, optimiza y domina la narrativa cultural con precisión técnica.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-10">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-red-500">
                <Zap className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Real-Time Metrics</span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed">Sincronización instantánea con el ecosistema global de contenido.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-red-500">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Agency Grade</span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed">Infraestructura de nivel institucional para el crecimiento de talentos.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] p-12 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
            
            <div className="text-center mb-12">
              <div className="lg:hidden flex items-center justify-center gap-4 mb-10">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                  <Sparkles className="text-black h-6 w-6" />
                </div>
                <span className="text-2xl font-black text-white uppercase tracking-tighter">Umbra</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter">Acceso</h2>
              <p className="text-white/40 font-medium text-sm">Ingresa al centro de comando de Umbra.</p>
            </div>

            <div className="space-y-8">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-between gap-4 bg-red-600 text-black rounded-2xl px-8 py-5 font-black uppercase tracking-widest text-[10px] transition-all duration-300 hover:bg-red-500 hover:scale-[1.02] active:scale-95 group/btn"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center">
                    <LogIn className="h-4 w-4 text-black" />
                  </div>
                  Continuar con Google
                </div>
                <ArrowRight className="h-4 w-4 text-black group-hover/btn:translate-x-2 transition-transform" />
              </button>

              {loginError && (
                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest text-center bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3">{loginError}</p>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-black"><span className="bg-[#0a0a0a] px-6 text-white/20 italic">Acceso Restringido</span></div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <p className="text-[9px] text-white/20 text-center font-black uppercase tracking-[0.2em] leading-relaxed">
                  Al ingresar, confirmas la aceptación de los <br />
                  <a href="#" className="text-red-500 hover:text-red-400 transition-colors">Términos del Protocolo</a>
                </p>
                <div className="flex items-center gap-3 text-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
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
