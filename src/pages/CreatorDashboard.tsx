import React, { useState, useEffect, useMemo } from 'react';
import { supabase, Campaign, Content } from '../supabase';
import { useAuth } from '../AuthContext';
import { Youtube, Instagram, Twitter, Music2, Globe, ExternalLink, Edit2, Trash2, Plus, LogOut, Layout, Users, BarChart3, ChevronRight, X, Sparkles, Wallet, CheckCircle2, TrendingUp, Award, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
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
  const [twitchFile, setTwitchFile] = useState<File | null>(null);
  const [twitchPreview, setTwitchPreview] = useState<string | null>(null);

  // Payment Settings State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payment_method, setPaymentMethod] = useState<'binance' | 'wallet'>('binance');
  const [binance_id, setBinanceId] = useState('');
  const [wallet_address, setWalletAddress] = useState('');
  const [wallet_network, setWalletNetwork] = useState('BSC');
  const [isSavingPayment, setIsSavingPayment] = useState(false);

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
      let thumbnail = '';

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
          if (data.title && data.title !== "") title = data.title;
          if (typeof data.views === 'number') views = data.views;
          if (typeof data.likes === 'number') likes = data.likes;
          if (typeof data.comments === 'number') comments = data.comments;
          if (data.thumbnail && data.thumbnail !== "") thumbnail = data.thumbnail;
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
        comments: comments,
        thumbnail: thumbnail
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
      let thumbnail = editingContent.thumbnail || '';

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
            if (typeof data.views === 'number') views = data.views;
            if (typeof data.likes === 'number') likes = data.likes;
            if (typeof data.comments === 'number') comments = data.comments;
            if (data.thumbnail) thumbnail = data.thumbnail;
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
        thumbnail: thumbnail
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

  const handleTwitchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !twitchFile) return;

    setIsFetchingMetadata(true);
    try {
      // 1. Upload image to Supabase Storage
      const fileExt = twitchFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `twitch_stats/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content-attachments')
        .upload(filePath, twitchFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content-attachments')
        .getPublicUrl(filePath);

      // 3. Convert file to Base64 for OCR
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(twitchFile);
      });
      const base64 = await base64Promise;

      // 4. Analyze via AI
      const response = await fetch('/api/analyze-twitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });

      if (!response.ok) throw new Error("Failed to analyze image");
      const stats = await response.json();

      // 5. Save to database
      const { error } = await supabase.from('content').insert([{
        campaign_id: newContent.campaign_id,
        creator_id: user.id,
        platform: 'twitch',
        url: 'https://twitch.tv/' + (stats.title || 'stream'),
        title: stats.title || 'Twitch Stream Stats',
        views: stats.views || 0,
        likes: 0,
        comments: 0,
        peek_viewers: stats.peek_viewers || 0,
        duration_minutes: stats.duration_minutes || 0,
        thumbnail: publicUrl,
        uploaded_at: stats.stream_date || new Date().toISOString()
      }]);

      if (error) throw error;

      setIsUploading(false);
      setNewContent({ campaign_id: '', platform: 'youtube', url: '' });
      setTwitchFile(null);
      setTwitchPreview(null);
    } catch (error: any) {
      console.error("Twitch upload error:", error);
      alert("Error uploading Twitch stats: " + error.message);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTwitchFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setTwitchPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const totalViews = content.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalContent = content.length;

  const growthData = useMemo(() => {
    const months: Record<string, number> = {};
    content.forEach(c => {
      if (!c.created_at) return;
      const date = new Date(c.created_at);
      const monthKey = format(date, 'MMM yyyy');
      months[monthKey] = (months[monthKey] || 0) + (c.views || 0);
    });
    return Object.entries(months)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [content]);

  const heatmapData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const matrix: any[] = [];
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 24; j++) {
        matrix.push({ day: days[i], hour: j, count: 0, dayIdx: (i + 1) % 7 });
      }
    }
    content.forEach(c => {
      if (!c.created_at) return;
      const date = new Date(c.created_at);
      const dayIdx = date.getDay();
      const hour = date.getHours();
      const cell = matrix.find(m => m.dayIdx === dayIdx && m.hour === hour);
      if (cell) cell.count += 1;
    });
    return matrix;
  }, [content]);

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
        
        <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => { 
              setIsUploading(true); 
              setEditingContent(null);
              setNewContent(prev => ({ ...prev, platform: 'youtube' }));
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all"
          >
            <Plus className="h-4 w-4 text-indigo-600" />
            Subir Contenido
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { 
              setIsUploading(true); 
              setEditingContent(null);
              setNewContent(prev => ({ ...prev, platform: 'twitch' }));
              setTwitchFile(null);
              setTwitchPreview(null);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all"
          >
            <Globe className="h-4 w-4" />
            Estadísticas Stream
          </motion.button>
        </div>
      </div>
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-24 w-24 text-indigo-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Impacto Total</p>
            <h3 className="text-4xl font-black text-gray-900 mt-2">{totalViews.toLocaleString()}</h3>
            <p className="text-xs font-bold text-indigo-500 mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Vistas acumuladas
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:border-rose-100 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Youtube className="h-24 w-24 text-rose-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Portfolio</p>
            <h3 className="text-4xl font-black text-gray-900 mt-2">{totalContent}</h3>
            <p className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Videos publicados
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden bg-indigo-600 p-6 rounded-3xl shadow-lg border border-indigo-500 group hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="h-24 w-24 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest">Nivel Agencia</p>
            <h3 className="text-4xl font-black text-white mt-2">VIP</h3>
            <p className="text-xs font-bold text-indigo-100 mt-2 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {campaigns.length} campañas activas
            </p>
          </div>
        </motion.div>
      </div>

      {/* Analytics Session - Personal Growth & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            Tu Crecimiento
            <TrendingUp className="h-5 w-5 text-indigo-500" />
          </h2>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorViewsCreator" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorViewsCreator)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            Tu Ritmo (Heatmap)
            <CalendarIcon className="h-5 w-5 text-orange-500" />
          </h2>
          <div className="overflow-x-auto pb-2 custom-scrollbar">
            <div className="grid gap-1" style={{ gridTemplateColumns: '40px repeat(24, minmax(0, 1fr))' }}>
              <div className="h-6 w-10 text-[9px] font-bold text-gray-400">Día</div>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="h-6 w-full text-[9px] font-bold text-gray-400 flex items-center justify-center">{i}h</div>
              ))}
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <React.Fragment key={day}>
                  <div className="h-6 w-10 text-[10px] font-bold text-gray-600 flex items-center">{day}</div>
                  {Array.from({ length: 24 }).map((_, h) => {
                    const cell = heatmapData.find(m => m.day === day && m.hour === h) || { count: 0 };
                    const opacity = Math.min(cell.count / 3, 1);
                    return (
                      <div 
                        key={h}
                        className="h-6 w-full rounded-sm transition-all hover:ring-2 hover:ring-indigo-300 cursor-help"
                        title={`${day} ${h}:00 - ${cell.count} posts`}
                        style={{ backgroundColor: cell.count > 0 ? `rgba(79, 70, 229, ${0.1 + opacity * 0.9})` : '#f8fafc' }}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-100 rounded-sm"></div> Inactivo</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-500 rounded-sm"></div> Activo</div>
          </div>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => { setIsUploading(false); setEditingContent(null); }}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-900/10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingContent ? 'Editar Contenido' : 'Nuevo Contenido'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Ingresa el enlace de tu publicación</p>
              </div>
              <button 
                onClick={() => { setIsUploading(false); setEditingContent(null); }} 
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Cerrar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={newContent.platform === 'twitch' ? handleTwitchUpload : (editingContent ? handleUpdateContent : handleUploadContent)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="campaign" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Campaña Activa</label>
                  <select
                    id="campaign"
                    required
                    value={editingContent ? editingContent.campaign_id : newContent.campaign_id}
                    onChange={(e) => editingContent 
                      ? setEditingContent({ ...editingContent, campaign_id: e.target.value })
                      : setNewContent({ ...newContent, campaign_id: e.target.value })}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="" disabled>{campaigns.length > 0 ? "Seleccionar campaña" : "No hay campañas activas"}</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="platform" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Plataforma</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'youtube', icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' },
                      { id: 'instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
                      { id: 'tiktok', icon: Music2, color: 'text-black', bg: 'bg-gray-100' },
                      { id: 'x', icon: Twitter, color: 'text-blue-400', bg: 'bg-blue-50' },
                      { id: 'coinmarketcap', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { id: 'twitch', icon: Globe, color: 'text-purple-600', bg: 'bg-indigo-50' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => editingContent
                          ? setEditingContent({ ...editingContent, platform: p.id as any })
                          : setNewContent({ ...newContent, platform: p.id as any })}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                          (editingContent ? editingContent.platform : newContent.platform) === p.id
                            ? 'border-indigo-600 bg-indigo-50/50'
                            : 'border-transparent bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <p.icon className={`h-5 w-5 ${p.color}`} />
                        <span className="text-[10px] mt-1 font-medium capitalize">{p.id === 'coinmarketcap' ? 'CMC' : p.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="url" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {newContent.platform === 'twitch' ? 'Captura de Estadísticas' : 'URL del Contenido'}
                  </label>
                  {newContent.platform === 'twitch' ? (
                    <div className="space-y-3">
                      <div 
                        className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('twitch-upload')?.click()}
                      >
                        {twitchPreview ? (
                          <img src={twitchPreview} alt="Preview" className="max-h-40 rounded-lg shadow-sm" />
                        ) : (
                          <>
                            <Plus className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Haz clic para subir captura</p>
                          </>
                        )}
                        <input
                          type="file"
                          id="twitch-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                      {twitchFile && <p className="text-xs text-indigo-600 font-bold">{twitchFile.name}</p>}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        id="url"
                        required
                        value={editingContent ? editingContent.url : newContent.url}
                        onChange={(e) => editingContent
                          ? setEditingContent({ ...editingContent, url: e.target.value })
                          : setNewContent({ ...newContent, url: e.target.value })}
                        placeholder="https://www.instagram.com/reel/..."
                        className="block w-full pl-10 rounded-xl border-gray-200 bg-gray-50/50 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsUploading(false); setEditingContent(null); }}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isFetchingMetadata}
                  className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isFetchingMetadata && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {isFetchingMetadata ? 'Buscando Datos...' : (editingContent ? 'Guardar Cambios' : 'Anexar Link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-black text-gray-900 border-l-4 border-indigo-600 pl-4 uppercase tracking-wider">Posts & Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.filter(item => item.platform !== 'twitch').map((item, idx) => (
            <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * idx }}
            className="group relative flex flex-col rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 ring-1 ring-gray-100 hover:ring-indigo-100 transition-all duration-500"
          >
            {/* Thumbnail Header */}
            <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.title || "Content thumbnail"} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
                  <div className="text-indigo-200">
                    {item.platform === 'youtube' && <Youtube className="h-12 w-12" />}
                    {item.platform === 'instagram' && <Instagram className="h-12 w-12" />}
                    {item.platform === 'tiktok' && <Music2 className="h-12 w-12" />}
                    {item.platform === 'x' && <Twitter className="h-12 w-12" />}
                    {item.platform === 'twitch' && <Globe className="h-12 w-12 opacity-50" />}
                  </div>
                </div>
              )}
              
              {/* Overlay Glass Badge */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-white/20">
                  {item.platform === 'youtube' && <Youtube className="h-3.5 w-3.5 text-red-600" />}
                  {item.platform === 'instagram' && <Instagram className="h-3.5 w-3.5 text-pink-600" />}
                  {item.platform === 'tiktok' && <Music2 className="h-3.5 w-3.5 text-black" />}
                  {item.platform === 'x' && <Twitter className="h-3.5 w-3.5 text-black" />}
                  {item.platform === 'twitch' && <Globe className="h-3.5 w-3.5 text-indigo-600" />}
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">{item.platform}</span>
                </div>
              </div>

              {/* Action Buttons overlay */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                <button onClick={() => { setEditingContent(item); setIsUploading(true); }} className="p-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg text-gray-600 hover:text-indigo-600 transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => setContentToDelete(item.id)} className="p-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg text-gray-600 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
              <div className="flex-1">
                <p className="text-[10px] font-black text-indigo-600 mb-2 tracking-[0.2em] uppercase">
                  {campaigns.find(c => c.id === item.campaign_id)?.name || 'General'}
                </p>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors"
                >
                  {item.title || item.url}
                </a>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-gray-900 leading-none">{item.views?.toLocaleString() || 0}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Views</span>
                  </div>
                  <div className="w-[1px] h-6 bg-gray-100" />
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-gray-900 leading-none">
                      {item.platform === 'twitch' ? (item.peek_viewers || 0).toLocaleString() : (item.likes || 0).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">
                      {item.platform === 'twitch' ? 'Peak' : 'Likes'}
                    </span>
                  </div>
                </div>
                
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="h-10 w-10 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
        {content.filter(item => item.platform !== 'twitch').length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
            No hay videos subidos aún.
          </div>
        )}
      </div>
    </div>

      <div className="space-y-6 pt-10">
        <h2 className="text-xl font-black text-gray-900 border-l-4 border-purple-600 pl-4 uppercase tracking-wider">Streams (Twitch)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.filter(item => item.platform === 'twitch').map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="group relative flex flex-col rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-xl ring-1 ring-gray-100 hover:ring-purple-100 transition-all duration-500"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                    <Globe className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Twitch</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <button onClick={() => { setEditingContent(item); setIsUploading(true); }} className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-indigo-600 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setContentToDelete(item.id)} className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h4 className="text-lg font-bold text-gray-900 line-clamp-1 mb-6">{item.title || 'Stream sin título'}</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center">
                    <span className="text-2xl font-black text-gray-900">{(item.views || 0).toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">Vistas</span>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4 flex flex-col items-center">
                    <span className="text-2xl font-black text-purple-600">{(item.peek_viewers || 0).toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-purple-400 uppercase mt-1">Peak</span>
                  </div>
                  <div className="col-span-2 bg-gray-50 rounded-2xl px-4 py-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500">Duración:</span>
                    <span className="text-sm font-black text-gray-900">{item.duration_minutes || 0} min</span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>{item.uploaded_at ? format(new Date(item.uploaded_at), 'MMM d, yyyy') : 'Sin fecha'}</span>
                  <a href={item.url} target="_blank" className="text-purple-600 hover:underline">Ver Stream</a>
                </div>
              </div>
            </motion.div>
          ))}
          {content.filter(item => item.platform === 'twitch').length === 0 && (
            <div className="col-span-full py-8 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
              No hay streams registrados aún.
            </div>
          )}
        </div>
      </div>

      {content.length === 0 && !isUploading && !editingContent && (
        <div className="py-16 px-4">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  setIsUploading(true);
                  setEditingContent(null);
                  setNewContent(prev => ({ ...prev, platform: 'youtube' }));
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-gray-700 shadow-lg ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:scale-105 transition-all duration-300 active:scale-95 w-full sm:w-auto"
              >
                <Plus className="h-6 w-6 text-indigo-600" />
                Subir Video/Post
              </button>
              <button
                onClick={() => {
                  setIsUploading(true);
                  setEditingContent(null);
                  setNewContent(prev => ({ ...prev, platform: 'twitch' }));
                  setTwitchFile(null);
                  setTwitchPreview(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:scale-105 transition-all duration-300 active:scale-95 w-full sm:w-auto"
              >
                <Globe className="h-6 w-6" />
                Estadísticas Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
