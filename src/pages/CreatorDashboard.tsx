import React, { useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { 
  Sparkles, Youtube, Instagram, Globe, 
  ExternalLink, TrendingUp, Zap, Trophy, Flame, CheckCircle2,
  LayoutDashboard, Upload, Wallet, Plus, RefreshCw, BarChart3, List, Award,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Hooks
import { useDashboardData, getAgencyRank, AGENCY_TIERS } from '../hooks/useDashboardData';
import { useToast } from '../hooks/useToast';

// Modular Components
import StatsCard from '../components/dashboard/StatsCard';
import RankCard from '../components/dashboard/RankCard';
import JourneyMap from '../components/dashboard/JourneyMap';
import BadgeItem from '../components/dashboard/BadgeItem';
import ContentCard from '../components/dashboard/ContentCard';
import PaymentModal from '../components/dashboard/PaymentModal';
import ContentModal from '../components/dashboard/ContentModal';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const { success, error: toastError, info } = useToast();
  const { content, metrics, refresh } = useDashboardData('creator');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'journey'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [previewRankIndex, setPreviewRankIndex] = useState<number | null>(null);

  // Derived state
  const currentRankIndex = useMemo(() => {
    for (let i = AGENCY_TIERS.length - 1; i >= 0; i--) {
      if (metrics.totalPosts >= AGENCY_TIERS[i].minPosts || metrics.totalViews >= AGENCY_TIERS[i].minViews) return i;
    }
    return 0;
  }, [metrics]);

  const myRank = AGENCY_TIERS[currentRankIndex];

  const handleSavePayment = async (data: any) => {
    setIsSavingPayment(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          payment_method: data.payment_method,
          binance_id: data.binance_id,
          wallet_address: data.wallet_address,
          wallet_network: data.wallet_network
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      success("Ajustes de pago guardados");
      setIsPaymentModalOpen(false);
      await refresh();
    } catch (err: any) {
      toastError("Error al guardar ajustes: " + err.message);
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    info("Sincronizando tus métricas...");
    try {
      const { data } = await supabase.from('content').select('id, url, platform').eq('creator_id', user?.id);
      if (data && data.length > 0) {
        const response = await fetch('/api/refresh-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: data })
        });
        const result = await response.json();
        if (result.success) {
          await refresh();
          success("Métricas actualizadas correctamente");
        } else {
          throw new Error(result.error);
        }
      } else {
        info("No tienes contenido para sincronizar");
      }
    } catch (err: any) {
      toastError("Error al sincronizar métricas: " + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tight">Hola, {profile?.display_name || 'Creador'}</h1>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mt-0.5">
            <span className={`w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse`} />
            Tu carrera en Umbra: <span className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">{myRank.name}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <button onClick={handleRefresh} disabled={isRefreshing} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-gray-100 hover:bg-gray-50 transition-all ${isRefreshing ? 'opacity-50' : ''}`}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
          <button onClick={() => setIsContentModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            <Plus className="h-4 w-4" />
            Nuevo Contenido
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
          { id: 'content', label: 'Mi Contenido', icon: List },
          { id: 'journey', label: 'Mi Camino', icon: Trophy }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-none flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <StatsCard label="Vistas Totales" value={metrics.totalViews.toLocaleString()} trend="+12% vs mes anterior" icon={TrendingUp} iconColor="text-indigo-600" />
            <StatsCard label="Promedio Vistas" value={Math.round(metrics.totalViews / (metrics.totalPosts || 1)).toLocaleString()} icon={Zap} iconColor="text-rose-600" />
            <StatsCard label="Publicaciones" value={metrics.totalPosts} icon={List} iconColor="text-teal-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            <div className="lg:col-span-2">
              <RankCard 
                tiers={AGENCY_TIERS}
                currentRankIndex={currentRankIndex}
                previewRankIndex={previewRankIndex}
                onPreviewRank={setPreviewRankIndex}
                totalPosts={metrics.totalPosts}
                totalViews={metrics.totalViews}
              />
            </div>
            {!profile?.payment_method ? (
              <div className="h-full bg-gradient-to-br from-rose-500 via-pink-600 to-orange-500 p-6 rounded-3xl shadow-xl shadow-rose-100 flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-white/80 mb-3">
                    <AlertCircle className="h-4 w-4 text-amber-300 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Pendiente</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 leading-tight tracking-tight drop-shadow-sm">Activa tus Pagos</h3>
                  <p className="text-white/70 text-xs font-medium mb-6">Configura un método para recibir tus recompensas y acumular beneficios.</p>
                </div>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-3.5 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-lg active:scale-95"
                >
                  Configurar Ahora
                </button>
              </div>
            ) : (
              <div className="h-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-indigo-500" /> Pagos
                    </h3>
                    <div className="p-1.5 bg-emerald-50 rounded-lg">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Método Activo</p>
                      <p className="text-xs font-black text-gray-900 uppercase">{profile.payment_method === 'binance' ? 'Binance Pay' : 'Crypto Wallet'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Identificador</p>
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {profile.payment_method === 'binance' ? profile.binance_id : profile.wallet_address}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                  Cambiar Método
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {content.map((item, i) => (
            <ContentCard key={item.id} item={item} index={i} onEdit={() => {}} onDelete={async () => { 
                if(confirm("¿Eliminar contenido?")) {
                    await supabase.from('content').delete().eq('id', item.id);
                    success("Contenido eliminado");
                }
            }} />
          ))}
          <button onClick={() => setIsContentModalOpen(true)} className="aspect-square rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all group">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-all">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Añadir Contenido</span>
          </button>
        </div>
      )}

      {activeTab === 'journey' && (
        <div className="animate-in fade-in duration-500">
          <JourneyMap tiers={AGENCY_TIERS} currentRankIndex={currentRankIndex} />
        </div>
      )}

      <ContentModal 
        isOpen={isContentModalOpen} 
        onClose={() => setIsContentModalOpen(false)} 
        campaigns={[]} // Creator dashboard might need to fetch available campaigns or just show their own
        editingContent={null}
        isProcessing={false}
        onTwitchUpload={async () => {}}
        onSubmit={async (data) => {
          const { error } = await supabase.from('content').insert([{
            ...data,
            creator_id: user?.id,
            status: 'active',
            uploaded_at: new Date().toISOString()
          }]);
          if (error) {
            toastError("Error al guardar contenido: " + error.message);
          } else {
            success("Contenido guardado");
            setIsContentModalOpen(false);
            refresh();
          }
        }}
      />
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        profile={profile}
        onSave={handleSavePayment}
        isSaving={isSavingPayment}
      />
    </div>
  );
}
