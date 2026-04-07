import React, { useState, useEffect } from 'react';
import { Rocket, List, BarChart3, LogOut, Zap, LayoutDashboard, StickyNote, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, Campaign, Content, UserProfile } from '../supabase';
import { useAuth, logout } from '../AuthContext';
import { useToast } from '../hooks/useToast';
import CampaignReportModal from '../components/dashboard/CampaignReportModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const { error: toastError } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignReport, setSelectedCampaignReport] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    try {
      setLoading(true);
      
      // 1. Fetch campaigns assigned to this client
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('client_id', user?.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;
      setCampaigns(campaignsData || []);

      if (campaignsData && campaignsData.length > 0) {
        const campaignIds = campaignsData.map(c => c.id);
        
        // 2. Fetch content for these campaigns
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('*')
          .is('deleted_at', null)
          .in('campaign_id', campaignIds);
        
        if (contentError) throw contentError;
        setContent(contentData || []);

        // 3. Fetch payments for these campaigns to calculate budget spent
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .in('campaign_id', campaignIds);
        
        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);

        // 4. Fetch all users to show in reports
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .is('deleted_at', null);
        
        if (usersError) throw usersError;
        setUsers(usersData || []);
      }
    } catch (err: any) {
      console.error("Fetch Data Error:", err);
      toastError("Error al cargar datos: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner message="Cargando tu panel de cliente..." />;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 flex items-center gap-3">
              <span className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
                <BarChart3 className="h-8 w-8" />
              </span>
              ¡Hola, {profile?.display_name || 'Cliente'}!
            </h1>
            <p className="text-gray-500 font-medium">Gracias por colaborar con <strong>Umbra</strong>. Aquí puedes ver los resultados detallados de nuestra campaña.</p>
          </div>
          
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
          >
            <LogOut className="h-4 w-4" /> Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Campañas Activas</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-gray-900 leading-none">{campaigns.filter(c => c.status === 'active').length}</span>
            <span className="text-sm font-bold text-indigo-500 mb-1">TOTAL</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Posts Publicados</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-gray-900 leading-none">{content.length}</span>
            <span className="text-sm font-bold text-emerald-500 mb-1">CONTENIDOS</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Vistas Totales</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-gray-900 leading-none">
              {content.reduce((sum, item) => sum + (item.views || 0), 0).toLocaleString()}
            </span>
            <Zap className="h-5 w-5 text-amber-500 mb-1 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <h2 className="text-xl font-black text-gray-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
        <Rocket className="h-5 w-5 text-indigo-500 shadow-sm" /> Mis Campañas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns.map((campaign) => (
          <motion.div 
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 relative overflow-hidden group"
          >
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  campaign.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}>
                  {campaign.status}
                </div>
                <BarChart3 className="h-5 w-5 text-gray-200 group-hover:text-indigo-200 transition-colors" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{campaign.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[40px] leading-relaxed">{campaign.description || 'Sin descripción.'}</p>
              
              {/* 📝 Note Toggle if exists */}
              {campaign.notes && (
                <div className="mb-6">
                  <button
                    onClick={() => setExpandedNotes(prev => ({ ...prev, [campaign.id]: !prev[campaign.id] }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      expandedNotes[campaign.id] 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    <StickyNote className="h-3.5 w-3.5" />
                    Info Adicional
                    {expandedNotes[campaign.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  <AnimatePresence>
                    {expandedNotes[campaign.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 relative">
                          <div className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          <div className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap break-words max-h-40 overflow-y-auto pr-2 custom-scrollbar italic">
                            "{campaign.notes}"
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Budget Info */}
              <div className="bg-gray-50/50 rounded-2xl p-4 mb-8 border border-gray-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Presupuesto Total</span>
                  <span className="text-sm font-black text-gray-900">${(campaign.budget || 0).toLocaleString()}</span>
                </div>
                {campaign.budget ? (
                  <>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          (payments.filter(p => p.campaign_id === campaign.id).reduce((sum, p) => sum + (p.amount || 0), 0) / campaign.budget) > 0.9 
                            ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, (payments.filter(p => p.campaign_id === campaign.id).reduce((sum, p) => sum + (p.amount || 0), 0) / campaign.budget) * 100)}%` }} 
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-indigo-600">Gastado: ${payments.filter(p => p.campaign_id === campaign.id).reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}</span>
                      <span className="text-gray-400">Restante: ${(campaign.budget - payments.filter(p => p.campaign_id === campaign.id).reduce((sum, p) => sum + (p.amount || 0), 0)).toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-center py-1">Sin presupuesto asignado</p>
                )}
              </div>
              
              <button 
                onClick={() => setSelectedCampaignReport(campaign.id)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" /> Ver Reporte Detallado
              </button>
            </div>
          </motion.div>
        ))}

        {campaigns.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-gray-100 border-dashed">
             <Rocket className="h-16 w-16 text-gray-100 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-gray-300">No tienes campañas asignadas todavía.</h3>
             <p className="text-gray-400 mt-2">Contacta con tu administrador para vincular tus proyectos.</p>
          </div>
        )}
      </div>

      {selectedCampaignReport && (
        <CampaignReportModal
          isOpen={!!selectedCampaignReport}
          onClose={() => setSelectedCampaignReport(null)}
          campaign={campaigns.find(c => c.id === selectedCampaignReport) || null}
          content={content}
          users={users}
          // Clients don't have the deep-linking filter functionality as they don't see the content list
        />
      )}
    </div>
  );
}
