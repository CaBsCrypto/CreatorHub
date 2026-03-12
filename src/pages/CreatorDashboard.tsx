import React, { useState, useEffect } from 'react';
import { supabase, Campaign, Content } from '../supabase';
import { useAuth } from '../AuthContext';
import { Youtube, Instagram, Twitter, Music2, Globe, ExternalLink, Edit2, Trash2, Plus, LogOut, Layout, Users, BarChart3, ChevronRight, X, Sparkles, Wallet, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [newContent, setNewContent] = useState({ campaign_id: '', platform: 'youtube', url: '' });
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);

  // Payment Settings State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payment_method, setPaymentMethod] = useState<'binance' | 'wallet'>('binance');
  const [binance_id, setBinanceId] = useState('');
  const [wallet_address, setWalletAddress] = useState('');
  const [wallet_network, setWalletNetwork] = useState('BSC');
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  const openPaymentModal = () => {
    setPaymentMethod(profile?.payment_method || 'binance');
    setBinanceId(profile?.binance_id || '');
    setWalletAddress(profile?.wallet_address || '');
    setWalletNetwork(profile?.wallet_network || 'BSC');
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingPayment(true);
    try {
      const { error } = await supabase.from('users').update({
        payment_method,
        binance_id: payment_method === 'binance' ? binance_id : null,
        wallet_address: payment_method === 'wallet' ? wallet_address : null,
        wallet_network: payment_method === 'wallet' ? wallet_network : null,
      }).eq('id', user.id);
      
      if (error) throw error;
      
      setIsPaymentModalOpen(false);
    } catch (error: any) {
      console.error("Error saving payment config:", error);
      alert("Error saving payment info: " + error.message);
    } finally {
      setIsSavingPayment(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [camps, conts] = await Promise.all([
        supabase.from('campaigns').select('*').eq('status', 'active').order('created_at', { ascending: false }),
        supabase.from('content').select('*').eq('creator_id', user.id).order('created_at', { ascending: false })
      ]);
      if (camps.data) setCampaigns(camps.data as Campaign[]);
      if (conts.data) setContent(conts.data as Content[]);
    };

    fetchData();

    if (profile?.audience_geo) {
      setSelectedCountries(Object.keys(profile.audience_geo));
    }

    const campaignsSub = supabase.channel('public:campaigns_creator')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns', filter: "status=eq.active" }, () => {
        supabase.from('campaigns').select('*').eq('status', 'active').order('created_at', { ascending: false }).then(({ data }) => setCampaigns((data as Campaign[]) || []));
      }).subscribe();

    const contentSub = supabase.channel('public:content_creator')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content', filter: `creator_id=eq.${user.id}` }, () => {
        supabase.from('content').select('*').eq('creator_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setContent((data as Content[]) || []));
      }).subscribe();

    return () => {
      supabase.removeChannel(campaignsSub);
      supabase.removeChannel(contentSub);
    };
  }, [user]);

  const handleUploadContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsFetchingMetadata(true);
    try {
      // 1. Fetch metadata from our backend API
      let title = 'New Upload';
      let views = 0;
      let likes = 0;
      let comments = 0;

      try {
        const response = await fetch('/api/fetch-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: newContent.url,
            platform: newContent.platform
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.title) title = data.title;
          if (data.views) views = data.views;
          if (data.likes) likes = data.likes;
          if (data.comments) comments = data.comments;
        }
      } catch (apiError) {
        console.error("Failed to fetch metadata from API:", apiError);
        // Continue with defaults if API fails
      }

      // 2. Save to Firestore
      const { error } = await supabase.from('content').insert([{
        campaign_id: newContent.campaign_id,
        creator_id: user.id,
        platform: newContent.platform,
        url: newContent.url,
        title: title,
        views: views,
        likes: likes,
        comments: comments
      }]);
      
      if (error) throw error;

      // Notify admin of new content
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: '📷 Nuevo Contenido Subido',
          html: `<p>Un creador ha subido nuevo contenido.</p>
                 <ul>
                   <li><strong>Creador:</strong> ${profile?.display_name || user.email}</li>
                   <li><strong>Plataforma:</strong> ${newContent.platform}</li>
                   <li><strong>Título:</strong> ${title}</li>
                   <li><strong>URL:</strong> <a href="${newContent.url}">${newContent.url}</a></li>
                 </ul>`
        })
      }).catch(err => console.error("Notification failed:", err));

      setIsUploading(false);
      setNewContent({ campaign_id: '', platform: 'youtube', url: '' });
    } catch (error: any) {
      console.error("Error creating content:", error);
      alert("Error adding content: " + error.message);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingContent) return;

    setIsFetchingMetadata(true);
    try {
      let title = editingContent.title;
      let views = editingContent.views;
      let likes = editingContent.likes;
      let comments = editingContent.comments;

      // If URL or platform changed, fetch new metadata
      const originalContent = content.find(c => c.id === editingContent.id);
      if (originalContent && (originalContent.url !== editingContent.url || originalContent.platform !== editingContent.platform)) {
        try {
          const response = await fetch('/api/fetch-metadata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: editingContent.url,
              platform: editingContent.platform
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.title) title = data.title;
            if (data.views) views = data.views;
            if (data.likes) likes = data.likes;
            if (data.comments) comments = data.comments;
          }
        } catch (apiError) {
          console.error("Failed to fetch metadata from API:", apiError);
        }
      }

      const { error } = await supabase.from('content').update({
        campaign_id: editingContent.campaign_id,
        platform: editingContent.platform,
        url: editingContent.url,
        title: title,
        views: views,
        likes: likes,
        comments: comments,
      }).eq('id', editingContent.id);
      
      if (error) throw error;
      setEditingContent(null);
    } catch (error: any) {
      console.error("Error updating content:", error);
      alert("Error updating content: " + error.message);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const totalViews = content.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalContent = content.length;

  const creatorStats = campaigns.map(camp => {
    const campaignContent = content.filter(c => c.campaign_id === camp.id);
    const target = camp.target_posts || 3;
    const progress = Math.min((campaignContent.length / target) * 100, 100);
    return {
      ...camp,
      uploaded: campaignContent.length,
      target,
      progress
    };
  });

  const handleUpdateProfile = async (countries: string[]) => {
    if (!user) return;
    try {
      const geo: Record<string, number> = {};
      countries.forEach(c => geo[c] = 1); // Simple mapping for now
      const { error } = await supabase.from('users').update({
        audience_geo: geo
      }).eq('id', user.id);
      if (error) throw error;
      setSelectedCountries(countries);
    } catch (e) {
      console.error("Error updating profile", e);
    }
  };

  const confirmDelete = async () => {
    if (!contentToDelete) return;
    try {
      const { error } = await supabase.from('content').delete().eq('id', contentToDelete);
      if (error) throw error;
      setContentToDelete(null);
    } catch (error: any) {
      console.error("Error deleting content:", error);
      alert("Error deleting content: " + error.message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Hola, <span className="text-indigo-600">{profile?.display_name || 'Creador'}</span>! 👋
          </h1>
          <p className="text-gray-500 font-medium">Aquí tienes el resumen de tu impacto hoy.</p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsProfileOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all"
          >
            <Users className="h-4 w-4 text-indigo-500" />
            <span>Mi Audiencia</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openPaymentModal}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all"
          >
            <Wallet className="h-4 w-4 text-emerald-500" />
            <span>Pagos</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setIsUploading(true); setEditingContent(null); }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            Subir Contenido
          </motion.button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Vistas Totales</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{totalViews.toLocaleString()}</h3>
          </div>
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Videos Subidos</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{totalContent}</h3>
          </div>
          <div className="h-12 w-12 bg-rose-50 rounded-xl flex items-center justify-center">
            <Youtube className="h-6 w-6 text-rose-600" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg border border-indigo-500 flex items-center justify-between text-white"
        >
          <div>
            <p className="text-sm font-bold text-indigo-100 uppercase tracking-wider">Campañas Activas</p>
            <h3 className="text-3xl font-black mt-1">{campaigns.length}</h3>
          </div>
          <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
            <Award className="h-6 w-6 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Gamification Session - Active Campaigns Progress */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            Objetivos de Campaña
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {creatorStats.map((camp, idx) => (
            <motion.div 
              key={camp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
              className="relative p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-gray-900 truncate pr-2">{camp.name}</h4>
                <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${camp.progress === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {camp.progress === 100 ? 'Completado' : 'En Progreso'}
                </div>
              </div>
              
              <div className="mb-2 flex justify-between text-xs font-bold text-gray-600">
                <span>{camp.uploaded} / {camp.target} posts</span>
                <span>{Math.round(camp.progress)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${camp.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-3 rounded-full ${camp.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                />
              </div>
              
              {camp.progress === 100 && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}
          {campaigns.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 italic">
              No hay campañas activas en este momento.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <h2 className="text-xl font-black text-gray-900">Mi Contenido Reciente</h2>
      </div>

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsPaymentModalOpen(false)}></div>
          <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-in zoom-in-95 duration-200">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Wallet className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">Payment Information</h3>
                  <div className="mt-2 text-sm text-gray-500 mb-4">
                    How would you like to receive your payments? Choose Binance Pay or a direct Crypto Wallet.
                  </div>
                  <form onSubmit={handleSavePayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">Payment Method</label>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('binance')}
                          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset transition-colors ${
                            payment_method === 'binance' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Binance Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wallet')}
                          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset transition-colors ${
                            payment_method === 'wallet' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Crypto Wallet
                        </button>
                      </div>
                    </div>

                    {payment_method === 'binance' ? (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label htmlFor="binance_id" className="block text-sm font-medium leading-6 text-gray-900">Binance Pay ID</label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id="binance_id"
                            required
                            value={binance_id}
                            onChange={(e) => setBinanceId(e.target.value)}
                            placeholder="Enter your Binance Pay ID"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                        <div>
                          <label htmlFor="wallet_network" className="block text-sm font-medium leading-6 text-gray-900">Network</label>
                          <div className="mt-2">
                            <select
                              id="wallet_network"
                              value={wallet_network}
                              onChange={(e) => setWalletNetwork(e.target.value)}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                              <option value="BSC">BNB Smart Chain (BEP20)</option>
                              <option value="Polygon">Polygon (MATIC)</option>
                              <option value="Ethereum">Ethereum (ERC20)</option>
                              <option value="Solana">Solana (SOL)</option>
                              <option value="Arbitrum">Arbitrum One</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="wallet_address" className="block text-sm font-medium leading-6 text-gray-900">Wallet Address</label>
                          <div className="mt-2">
                            <input
                              type="text"
                              id="wallet_address"
                              required
                              value={wallet_address}
                              onChange={(e) => setWalletAddress(e.target.value)}
                              placeholder="0x..."
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        disabled={isSavingPayment}
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-50"
                      >
                        {isSavingPayment ? 'Saving...' : 'Save Settings'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPaymentModalOpen(false)}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(isUploading || editingContent) && (
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 max-w-3xl mx-auto overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingContent ? 'Edit Content' : 'Upload New Content'}
            </h2>
            <button onClick={() => { setIsUploading(false); setEditingContent(null); }} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={editingContent ? handleUpdateContent : handleUploadContent} className="space-y-4">
            <div>
              <label htmlFor="campaign" className="block text-sm font-medium leading-6 text-gray-900">Campaign</label>
              <div className="mt-2">
                <select
                  id="campaign"
                  required
                  value={editingContent ? editingContent.campaign_id : newContent.campaign_id}
                  onChange={(e) => editingContent 
                    ? setEditingContent({ ...editingContent, campaign_id: e.target.value })
                    : setNewContent({ ...newContent, campaign_id: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="" disabled>{campaigns.length > 0 ? "Select a campaign" : "No active campaigns found"}</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="platform" className="block text-sm font-medium leading-6 text-gray-900">Platform</label>
              <div className="mt-2">
                <select
                  id="platform"
                  required
                  value={editingContent ? editingContent.platform : newContent.platform}
                  onChange={(e) => editingContent
                    ? setEditingContent({ ...editingContent, platform: e.target.value as any })
                    : setNewContent({ ...newContent, platform: e.target.value as any })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="x">X (Twitter)</option>
                  <option value="coinmarketcap">CoinMarketCap</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium leading-6 text-gray-900">Content URL</label>
              <div className="mt-2">
                <input
                  type="url"
                  id="url"
                  required
                  value={editingContent ? editingContent.url : newContent.url}
                  onChange={(e) => editingContent
                    ? setEditingContent({ ...editingContent, url: e.target.value })
                    : setNewContent({ ...newContent, url: e.target.value })}
                  placeholder="https://..."
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsUploading(false); setEditingContent(null); }}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isFetchingMetadata}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingMetadata ? 'Fetching Data...' : (editingContent ? 'Update' : 'Upload')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {content.map((item) => (
          <div key={item.id} className="group relative flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5 hover:shadow-md hover:ring-indigo-100 transition-all duration-300">
            {/* Thumbnail Header */}
            <div className="relative aspect-video w-full sm:w-40 sm:h-24 sm:aspect-auto shrink-0 overflow-hidden rounded-xl bg-gray-100">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.title || "Content thumbnail"} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
                  <div className="text-indigo-200">
                    {item.platform === 'youtube' && <Youtube className="h-8 w-8" />}
                    {item.platform === 'instagram' && <Instagram className="h-8 w-8" />}
                    {item.platform === 'tiktok' && <Music2 className="h-8 w-8" />}
                    {item.platform === 'x' && <Twitter className="h-8 w-8" />}
                    {item.platform === 'coinmarketcap' && <Globe className="h-8 w-8" />}
                  </div>
                </div>
              )}
              {/* Platform Badge overlay */}
              <div className="absolute top-2 right-2 p-1 rounded-md bg-white/90 backdrop-blur shadow-sm">
                {item.platform === 'youtube' && <Youtube className="h-3.5 w-3.5 text-red-600" />}
                {item.platform === 'instagram' && <Instagram className="h-3.5 w-3.5 text-pink-600" />}
                {item.platform === 'tiktok' && <Music2 className="h-3.5 w-3.5 text-black" />}
                {item.platform === 'x' && <Twitter className="h-3.5 w-3.5 text-black" />}
                {item.platform === 'coinmarketcap' && <Globe className="h-3.5 w-3.5 text-blue-600" />}
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between h-full w-full min-w-0">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-indigo-600 mb-1 tracking-wide uppercase">
                    {campaigns.find(c => c.id === item.campaign_id)?.name || 'General'}
                  </p>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors" 
                    title={item.title || item.url}
                  >
                    {item.title || item.url}
                  </a>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditingContent(item); setIsUploading(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setContentToDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                  <span className="font-bold text-gray-700">{item.views?.toLocaleString() || 0}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Views</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                  <span className="font-bold text-gray-700">{item.likes?.toLocaleString() || 0}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Likes</span>
                </div>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md transition-colors">
                  View Link <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
        {content.length === 0 && !isUploading && !editingContent && (
          <div className="col-span-full py-16 px-4">
            <div className="max-w-md mx-auto text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shadow-sm ring-4 ring-indigo-50/50">
                <Sparkles className="h-10 w-10 animate-pulse" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido a Umbra Creator Hub!</h2>
                <p className="text-gray-500 text-lg leading-relaxed">
                  Aún no has subido contenido. Comienza compartiendo tu primer trabajo para empezar a trackear tus métricas y ver tu impacto.
                </p>
              </div>
              <button
                onClick={() => setIsUploading(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-indigo-500 hover:scale-105 transition-all duration-300 active:scale-95"
              >
                <Plus className="h-6 w-6" />
                Subir mi primer contenido
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audience Profile Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" 
              onClick={() => setIsProfileOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Mi Audiencia</h3>
                </div>
                <button onClick={() => setIsProfileOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Selecciona tus **3 países principales** de audiencia. Esto nos ayuda a mostrarte mejores oportunidades de campaña.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {['Chile', 'Argentina', 'México', 'España', 'Colombia', 'Perú', 'USA', 'Brasil', 'Otros'].map(country => {
                  const isSelected = selectedCountries.includes(country);
                  return (
                    <motion.button
                      key={country}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (isSelected) {
                          handleUpdateProfile(selectedCountries.filter(c => c !== country));
                        } else if (selectedCountries.length < 3) {
                          handleUpdateProfile([...selectedCountries, country]);
                        }
                      }}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border-2 ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                          : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-200'
                      }`}
                    >
                      {country}
                    </motion.button>
                  );
                })}
              </div>
              
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800 transition-all"
                >
                  Confirmar Selección
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {contentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Content</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this content? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setContentToDelete(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
