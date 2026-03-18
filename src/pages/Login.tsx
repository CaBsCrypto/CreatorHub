import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, loginWithGoogle } from '../AuthContext';
import { LogIn, Sparkles, Zap, ShieldCheck, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  React.useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/creator');
      }
    }
  }, [user, profile, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full animate-bounce-slow" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Branding & Info */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col space-y-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <Sparkles className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase">
              Umbra <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Creator Hub</span>
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
              Potencia tu <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Carrera Viral.
              </span>
            </h1>
            <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
              La plataforma definitiva para creadores de élite. Gestiona campañas, analiza tu rendimiento y escala tu impacto global.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <Zap className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Real-Time</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">Estadísticas actualizadas al segundo de todas tus redes.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Premium Support</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">Managers dedicados para llevar tu contenido al siguiente nivel.</p>
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
          <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="text-center mb-10">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white h-5 w-5" />
                </div>
                <span className="text-xl font-black text-white uppercase tracking-tighter">Umbra</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Bienvenido de nuevo</h2>
              <p className="text-slate-400 font-medium">Ingresa para acceder a tu centro de control.</p>
            </div>

            <div className="space-y-6">
              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-between gap-4 bg-white hover:bg-slate-50 text-slate-900 rounded-[1.25rem] px-6 py-4 font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-xl shadow-indigo-500/10 active:scale-95 group/btn"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <LogIn className="h-4 w-4 text-indigo-600" />
                  </div>
                  Continuar con Google
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-600 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] font-black"><span className="bg-[#0b1121] px-4 text-slate-500">Acceso Exclusivo</span></div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-widest leading-relaxed">
                  Al ingresar, aceptas nuestros <br />
                  <a href="#" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Términos de Servicio</a> y <a href="#" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Privacidad</a>
                </p>
                <div className="flex items-center gap-2 text-slate-600">
                  <Globe className="h-3 w-3" />
                  <span className="text-[9px] font-black uppercase tracking-tight">Umbra Global Network © 2024</span>
                </div>
              </div>
            </div>

            {/* Subtle glow on card hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
