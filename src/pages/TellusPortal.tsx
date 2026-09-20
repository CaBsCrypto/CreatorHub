import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UsersRound, ShieldCheck, Sparkles, ArrowRight,
  TrendingUp, RefreshCw, CheckCircle2, Award,
  Cpu, Compass, BookOpen, LogIn, ExternalLink
} from 'lucide-react';
import { useAuth, loginWithGoogle } from '../AuthContext';
import { useTenant } from '../context/TenantContext';

export default function TellusPortal() {
  const { user, profile } = useAuth();
  const { setTenant } = useTenant();
  const navigate = useNavigate();

  // Fija el tenant en Tellus al ingresar
  useEffect(() => {
    setTenant('tellus');
  }, [setTenant]);

  const handleEnterDashboard = () => {
    if (user) {
      navigate('/creator');
    } else {
      loginWithGoogle();
    }
  };

  return (
    <div className="min-h-screen tellus-emerald-aesthetic text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <UsersRound className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black uppercase tracking-wider text-white">Tellus</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Creator Guild
                </span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cooperative Management Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors hidden sm:block px-3 py-2"
            >
              Creator Hub Global
            </button>
            <button
              onClick={handleEnterDashboard}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {user ? (
                <>
                  <span>Mi Panel de Creador</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Acceso Creadores</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 w-full space-y-16">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Portal Exclusivo de Gestión & Sincronización</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08] uppercase">
            Comunidad & <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Management Tellus.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-medium">
            Bienvenido al centro de operaciones para creadores de Tellus Cooperative. Aquí gestionas tus entregables de campaña, sincronizas tus analíticas en tiempo real y coordinas tu impacto en el ecosistema.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={handleEnterDashboard}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/25 active:scale-95"
            >
              <Compass className="h-4 w-4" />
              <span>{user ? 'Entrar a Mi Panel Tellus' : 'Identificarme con Google'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Operational Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.02] space-y-4 hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Métricas en Tiempo Real</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sincronización automatizada para YouTube, TikTok, Twitch, Instagram y X. Registra tu contenido y mantén tus reportes al día con un solo clic.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.02] space-y-4 hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Entregables Asignados</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visualiza los objetivos de tu campaña (videos cortos, streams, game nights o hilos de Twitter) y confirma el cumplimiento de cada hito.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.02] space-y-4 hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Crecimiento & Recompensas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Escala de nivel dentro de la cooperativa mediante volumen de vistas y calidad de entregas, desbloqueando presupuestos prioritarios.
            </p>
          </div>
        </div>

        {/* Creator Guidelines / Protocol */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-emerald-500/20 bg-emerald-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 max-w-2xl relative z-10">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <BookOpen className="h-4 w-4" />
              <span>Protocolo de Operación para Creadores</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Reglas de Juego del Colectivo Tellus
            </h2>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Enlace Directo:</strong> Registra siempre la URL final pública del video o transmisión tras su publicación.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Verificación Automática:</strong> El sistema audita reproducciones, me gusta y comentarios sin intervención manual.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Liquidación Segura:</strong> Configura tu wallet USDT o Binance Pay en los ajustes de tu panel de creador para desembolsos.</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={handleEnterDashboard}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10"
              >
                Acceder a mis Ajustes y Campañas
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <p className="uppercase tracking-widest font-black text-[10px]">
          © {new Date().getFullYear()} Tellus Cooperative • Gestión & Management de Creadores Web3
        </p>
      </footer>
    </div>
  );
}
