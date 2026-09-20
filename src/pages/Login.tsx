import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, loginWithGoogle } from '../AuthContext';
import { 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [loginError, setLoginError] = React.useState('');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

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
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Login failed", error);
      setLoginError(error?.message || 'Error al iniciar sesión con Google. Intenta nuevamente.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows matching landing page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-300/30 rounded-full blur-[140px] opacity-70" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[150px] opacity-80" />
        <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[140px] opacity-60" />
      </div>

      {/* Return to home button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-xs transition-all backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver al Inicio</span>
        </button>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10 py-12">
        
        {/* Left Column: Platform Branding & Value Props (7 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:flex lg:col-span-7 flex-col space-y-8 pr-4"
        >
          {/* Brand identifier */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight uppercase flex items-center gap-2 text-slate-900">
                Browns <span className="text-indigo-600 font-black">Stats</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 lowercase tracking-normal">
                  by browns.studio
                </span>
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Centro de Comando & <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 bg-clip-text text-transparent">
                Analítica en Vivo.
              </span>
            </h1>
            <p className="text-base xl:text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
              Consola centralizada para el monitoreo de creadores, seguimiento de publicaciones y control multi-organización para marcas y agencias.
            </p>
          </div>

          {/* Features cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs backdrop-blur-sm space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Métricas Automatizadas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Sincronización continua de vistas y engagement en YouTube, TikTok, X, Instagram y Twitch.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 shadow-xs backdrop-blur-sm space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Building2 className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Multi-Organización</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Gestión independiente y reportes segregados para Umbra, Tellus Cooperative y nuevas marcas.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Seguridad RLS Integrada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Paneles Segregados por Rol</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Clean Login Card (5 cols) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5 flex justify-center w-full"
        >
          <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl shadow-indigo-950/5 relative overflow-hidden">
            {/* Top gradient stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-400 to-emerald-500" />
            
            {/* Mobile branding */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight uppercase flex items-center gap-1.5 text-slate-900">
                  Browns <span className="text-indigo-600 font-black">Stats</span>
                </span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">by browns.studio</p>
              </div>
            </div>

            {/* Card Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 text-indigo-600 text-[10px] font-black uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-3">
                <Sparkles className="h-3 w-3" />
                <span>Consola de Acceso</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Iniciar Sesión
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Ingresa con tu cuenta de Google autorizada para acceder a tu panel de administración o creador.
              </p>
            </div>

            {/* Card Content & Action */}
            <div className="space-y-6">
              <button
                onClick={handleLogin}
                disabled={isLoggingIn || loading}
                className="w-full flex items-center justify-between gap-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-indigo-400 rounded-2xl px-6 py-4 font-bold text-xs sm:text-sm shadow-sm hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-200 active:scale-[0.98] group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3.5">
                  {/* Official Google multicolored icon */}
                  <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isLoggingIn ? 'Conectando con Google...' : 'Continuar con Google'}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <div className="relative pt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="bg-white px-4 text-slate-400">Acceso Seguro</span>
                </div>
              </div>

              {/* Status and footer info */}
              <div className="space-y-4 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px] leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-0.5">Permisos por Cuenta</p>
                  Tu rol de acceso (Administrador, Creador o Cliente de Campaña) se sincronizará automáticamente con tu dirección de correo.
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-slate-500 font-semibold">Sistema Activo</span>
                  </div>
                  <span>Browns Stats v2.4</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
