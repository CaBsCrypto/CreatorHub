import React, { useState, useEffect, useMemo } from 'react';
import { supabase, Campaign, Content } from '../supabase';
import { useAuth } from '../AuthContext';
import { Youtube, Instagram, Twitter, Music2, Globe, ExternalLink, Edit2, Trash2, Plus, LogOut, Layout, Users, BarChart3, ChevronRight, ChevronLeft, Lock, X, Sparkles, Wallet, CheckCircle2, TrendingUp, Award, RefreshCw, Zap, Target, Layers, Clock, Flame, ShieldCheck, Trophy, Heart, Calendar as CalendarIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [previewRankIndex, setPreviewRankIndex] = useState<number | null>(null);
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

  const statsMetrics = useMemo(() => {
    const totalPosts = content.length;
    const totalViews = content.reduce((acc, curr) => acc + (curr.views || 0), 0);
    return { totalPosts, totalViews };
  }, [content]);

  const AGENCY_TIERS = [
    { 
      name: 'Rookie Agent', 
      level: 1,
      minPosts: 0,
      minViews: 0,
      color: 'from-slate-600 to-slate-800', 
      icon: Globe,
      benefits: ['Acceso a Dashboard', 'Registro de Contenido']
    },
    { 
      name: 'Rising Star', 
      level: 2,
      minPosts: 2,
      minViews: 5000,
      color: 'from-teal-500 to-emerald-600', 
      icon: Sparkles,
      benefits: ['Soporte Directo', 'Campañas Silver']
    },
    { 
      name: 'Active Creator', 
      level: 3,
      minPosts: 5,
      minViews: 15000,
      color: 'from-emerald-500 to-teal-600', 
      icon: CheckCircle2,
      benefits: ['Pagos 48h', 'Campañas Gold']
    },
    { 
      name: 'Pro Artist', 
      level: 4,
      minPosts: 10,
      minViews: 30000,
      color: 'from-blue-500 to-indigo-600', 
      icon: TrendingUp,
      benefits: ['Manager Personal', 'Bonos por Impacto']
    },
    { 
      name: 'Elite Partner', 
      level: 5,
      minPosts: 25,
      minViews: 75000,
      color: 'from-indigo-600 to-purple-700', 
      icon: Award,
      benefits: ['Revenue Share +5%', 'Eventos VIP']
    },
    { 
      name: 'Viral Master', 
      level: 6,
      minPosts: 50,
      minViews: 200000,
      color: 'from-fuchsia-600 to-purple-700', 
      icon: Zap,
      benefits: ['Campañas Exclusivas', 'Menciones en Redes']
    },
    { 
      name: 'Iconic Legend', 
      level: 7,
      minPosts: 100,
      minViews: 500000,
      color: 'from-rose-600 to-orange-600', 
      icon: Trophy,
      benefits: ['Viajes de Equipo', 'Regalos de Marca']
    },
    { 
      name: 'Umbra Titan', 
      level: 8,
      minPosts: 250,
      minViews: 1000000,
      color: 'from-amber-500 to-orange-600', 
      icon: Flame,
      benefits: ['Socio de Agencia', 'Acceso a Fundadores']
    }
  ];

  const getAgencyRank = (posts: number, views: number) => {
    // Current rank is the highest tier where user meets BOTH or EITHER? 
    // Usually it's progressive. Let's find the current one.
    let currentTierIndex = 0;
    for (let i = AGENCY_TIERS.length - 1; i >= 0; i--) {
      if (posts >= AGENCY_TIERS[i].minPosts || views >= AGENCY_TIERS[i].minViews) {
        currentTierIndex = i;
        break;
      }
    }
    
    const currentTier = AGENCY_TIERS[currentTierIndex];
    const nextTier = currentTierIndex < AGENCY_TIERS.length - 1 ? AGENCY_TIERS[currentTierIndex + 1] : null;

    return {
      ...currentTier,
      index: currentTierIndex,
      next: nextTier ? { ...nextTier, index: currentTierIndex + 1 } : null
    };
  };

  const agencyRank = getAgencyRank(statsMetrics.totalPosts, statsMetrics.totalViews);
  const RankIcon = agencyRank.icon;

  const badges = useMemo(() => {
    const totalPosts = content.length;
    const totalViews = content.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const platforms = new Set(content.map(c => c.platform));
    
    const now = new Date();
    const last24h = content.filter(c => {
      const uploadDate = new Date(c.created_at);
      return (now.getTime() - uploadDate.getTime()) <= 24 * 60 * 60 * 1000;
    });
    
    const totalLikes = content.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const avgLikes = totalPosts > 0 ? totalLikes / totalPosts : 0;

    return [
      {
        id: 'pionero',
        name: 'Pionero',
        description: 'Tu primer paso en la agencia.',
        requirement: 'Sube al menos 1 video o post.',
        icon: Sparkles,
        unlocked: totalPosts >= 1,
        color: 'from-emerald-400 to-teal-500'
      },
      {
        id: 'viral',
        name: 'Viral Master',
        description: 'Impacto masivo en redes.',
        requirement: 'Alcanza 10,000+ vistas totales.',
        icon: Zap,
        unlocked: totalViews >= 10000,
        color: 'from-orange-400 to-rose-500'
      },
      {
        id: 'constante',
        name: 'Constante',
        description: 'Compromiso total con el contenido.',
        requirement: 'Publica 5 o más contenidos.',
        icon: Target,
        unlocked: totalPosts >= 5,
        color: 'from-blue-400 to-indigo-500'
      },
      {
        id: 'maraton',
        name: 'Maratón',
        description: 'Máxima productividad diaria.',
        requirement: 'Sube 3+ posts en menos de 24h.',
        icon: Flame,
        unlocked: last24h.length >= 3,
        color: 'from-rose-500 to-orange-600'
      },
      {
        id: 'heroe',
        name: 'Héroe Local',
        description: 'Referente de la audiencia.',
        requirement: 'Supera las 25,000 vistas totales.',
        icon: ShieldCheck,
        unlocked: totalViews >= 25000,
        color: 'from-cyan-500 to-blue-600'
      },
      {
        id: 'enganchado',
        name: 'Enganchado',
        description: 'Contenido que enamora.',
        requirement: 'Promedio de 500+ likes por post.',
        icon: Heart,
        unlocked: avgLikes >= 500,
        color: 'from-pink-500 to-rose-600'
      },
      {
        id: 'camaleon',
        name: 'Camaleón',
        description: 'Presencia omnicanal.',
        requirement: 'Actividad en 3+ plataformas.',
        icon: Layers,
        unlocked: platforms.size >= 3,
        color: 'from-indigo-500 to-violet-600'
      },
      {
        id: 'noctambulo',
        name: 'Noctámbulo',
        description: 'Creatividad bajo las estrellas.',
        requirement: 'Sube contenido entre 00:00 y 06:00.',
        icon: Clock,
        unlocked: content.some(c => {
          const hour = new Date(c.created_at).getHours();
          return hour >= 0 && hour < 6;
        }),
        color: 'from-slate-700 to-indigo-950'
      },
      {
        id: 'multitasker',
        name: 'Multitasker',
        description: 'Dominio de múltiples formatos.',
        requirement: 'Actividad en 2+ plataformas.',
        icon: Trophy,
        unlocked: platforms.size >= 2,
        color: 'from-indigo-400 to-purple-500'
      },
      {
        id: 'streamer',
        name: 'T-Streamer',
        description: 'Pionero de las transmisiones.',
        requirement: 'Añade estadísticas de Twitch.',
        icon: Globe,
        unlocked: platforms.has('twitch'),
        color: 'from-purple-400 to-indigo-600'
      }
    ];
  }, [content]);

  const isWalletMissing = !profile?.payment_method || (profile.payment_method === 'binance' && !profile.binance_id) || (profile.payment_method === 'wallet' && !profile.wallet_address);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Wallet Alert */}
      <AnimatePresence>
        {isWalletMissing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-xl">
                <Wallet className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Método de pago no configurado</h4>
                <p className="text-xs text-amber-700">Configura tu wallet o Binance ID para poder recibir tus pagos.</p>
              </div>
            </div>
            <button 
              onClick={openPaymentModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Configurar Ahora
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
        {/* Seniority Passport Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className={`relative overflow-hidden bg-gradient-to-br transition-all duration-700 ${
            previewRankIndex !== null 
              ? AGENCY_TIERS[previewRankIndex].color 
              : agencyRank.color
          } p-6 rounded-3xl shadow-lg border border-white/10 group hover:shadow-xl`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe className="h-24 w-24 text-white" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest px-2 py-0.5 bg-black/10 rounded-full border border-white/10">
                      Pasaporte Umbra
                    </span>
                    {previewRankIndex !== null && previewRankIndex !== agencyRank.index && (
                      <span className="text-[10px] font-black text-yellow-300 uppercase tracking-widest px-2 py-0.5 bg-black/20 rounded-full animate-pulse">
                        Vista Previa
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {previewRankIndex !== null ? AGENCY_TIERS[previewRankIndex].name : agencyRank.name}
                  </h3>
                </div>
                {React.createElement(previewRankIndex !== null ? AGENCY_TIERS[previewRankIndex].icon : agencyRank.icon, {
                  className: "h-8 w-8 text-white animate-bounce-slow"
                })}
              </div>

              {/* Benefits Highlight */}
              <div className="flex flex-wrap gap-2">
                {(previewRankIndex !== null ? AGENCY_TIERS[previewRankIndex].benefits : agencyRank.benefits).map((benefit, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/5">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-tighter">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-white/80 uppercase tracking-widest">
                  <span>Progreso al Siguiente Nivel</span>
                  {agencyRank.next && (
                    <span>Meta: {agencyRank.next.minPosts} Posts / {agencyRank.next.minViews.toLocaleString()} Vistas</span>
                  )}
                </div>
                <div className="h-4 bg-black/20 rounded-full p-1 border border-white/10 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, Math.max(10, 
                        agencyRank.next 
                          ? ((statsMetrics.totalPosts / agencyRank.next.minPosts) * 100)
                          : 100
                      ))}%` 
                    }}
                    className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  />
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {AGENCY_TIERS.map((tier, idx) => {
                    const isCurrent = agencyRank.index === idx;
                    const isPreview = previewRankIndex === idx;
                    const isLocked = idx > agencyRank.index;

                    return (
                      <button
                        key={idx}
                        onClick={() => setPreviewRankIndex(idx)}
                        className={`h-2 transition-all duration-300 rounded-full ${
                          isPreview || (previewRankIndex === null && isCurrent)
                            ? 'w-6 bg-white' 
                            : 'w-2 bg-white/30 hover:bg-white/50'
                        } relative overflow-hidden`}
                      >
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <Lock className="h-1 w-1 text-white/50" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {previewRankIndex !== null && previewRankIndex !== agencyRank.index && (
                  <button 
                    onClick={() => setPreviewRankIndex(null)}
                    className="text-[9px] font-black text-white/80 uppercase tracking-widest bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                  >
                    Volver a mi nivel
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between text-white/60">
                <p className="text-[10px] font-medium leading-tight">
                  {previewRankIndex !== null && previewRankIndex > agencyRank.index 
                    ? `Te faltan ${Math.max(0, AGENCY_TIERS[previewRankIndex].minPosts - statsMetrics.totalPosts)} posts para este rango.`
                    : 'Nivel actual alcanzado por tu rendimiento.'}
                </p>
                {previewRankIndex !== null && previewRankIndex > agencyRank.index && (
                  <Lock className="h-4 w-4 opacity-50" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

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
          className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            {agencyRank.next ? (
              React.createElement(agencyRank.next.icon, { className: `h-24 w-24 text-slate-100` })
            ) : (
              <Trophy className="h-24 w-24 text-amber-100" />
            )}
          </div>
          
          <div className="relative z-10">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full inline-block mb-3 border border-indigo-100">
              Próximo Gran Salto
            </p>
            
            {agencyRank.next ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight">
                    {agencyRank.next.name}
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">
                    Meta: {agencyRank.next.minPosts} posts & {agencyRank.next.minViews.toLocaleString()} views
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-gray-500 uppercase">Progreso General</span>
                      <span className="text-indigo-600">
                        {Math.round(Math.min(100, ((totalContent / agencyRank.next.minPosts) + (totalViews / agencyRank.next.minViews)) / 2 * 100))}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((totalContent / agencyRank.next.minPosts) + (totalViews / agencyRank.next.minViews)) / 2 * 100)}%` }}
                        className={`h-full bg-gradient-to-r ${agencyRank.next.color} rounded-full`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {totalContent < agencyRank.next.minPosts && (
                      <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                        <Plus className="h-3 w-3 text-indigo-500" /> Faltan {agencyRank.next.minPosts - totalContent} publicaciones
                      </p>
                    )}
                    {totalViews < agencyRank.next.minViews && (
                      <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                        <TrendingUp className="h-3 w-3 text-indigo-500" /> Faltan {(agencyRank.next.minViews - totalViews).toLocaleString()} vistas
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-amber-500 leading-tight">¡Rango Máximo!</h3>
                <p className="text-xs font-bold text-gray-500">
                  Eres un Titán de Umbra. Has alcanzado la cima del Olimpo de creadores.
                </p>
                <div className="pt-4">
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-xl border border-amber-100 uppercase tracking-widest">
                    Inmortal de la Agencia
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* Journey Map Section */}
      <div className="bg-white/50 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900 leading-tight">Mi Camino en Umbra</h2>
            <p className="text-sm text-gray-500 font-medium">Visualiza tu ascenso en las jerarquías de la agencia.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100">
            <Trophy className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
              {agencyRank.name}
            </span>
          </div>
        </div>

        <div className="relative mt-4">
          {/* Path Line */}
          <div className="absolute top-[34px] left-8 right-8 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(agencyRank.index / (AGENCY_TIERS.length - 1)) * 100}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            />
          </div>

          <div className="relative flex justify-between items-start">
            {AGENCY_TIERS.map((tier, idx) => {
              const isPast = idx < agencyRank.index;
              const isCurrent = idx === agencyRank.index;
              const isFuture = idx > agencyRank.index;
              const TierIcon = tier.icon;

              return (
                <div key={idx} className="flex flex-col items-center group/node relative">
                  {/* Milestone Node */}
                  <motion.div
                    whileHover={{ scale: 1.15, y: -2 }}
                    className={`
                      relative z-10 w-16 h-16 rounded-3xl flex items-center justify-center border-4 transition-all duration-500 cursor-help
                      ${isPast ? 'bg-white border-indigo-500 shadow-lg shadow-indigo-100' : ''}
                      ${isCurrent ? `bg-gradient-to-br ${tier.color} border-white shadow-2xl ring-4 ring-indigo-50` : ''}
                      ${isFuture ? 'bg-white border-slate-100 text-slate-300' : ''}
                    `}
                  >
                    {isPast ? (
                      <CheckCircle2 className="h-8 w-8 text-indigo-500" />
                    ) : (
                      <TierIcon className={`h-8 w-8 ${isCurrent ? 'text-white translate-y-[-2px]' : ''}`} />
                    )}

                    {/* Meta Popover */}
                    <div className="absolute bottom-full mb-6 opacity-0 group-hover/node:opacity-100 pointer-events-none transition-all duration-300 translate-y-4 group-hover/node:translate-y-0 z-50">
                      <div className="bg-slate-900 border border-white/10 p-5 rounded-[2rem] shadow-2xl min-w-[220px] backdrop-blur-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                            <TierIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nivel {tier.level}</p>
                            <p className="text-xs font-black text-white">{tier.name}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-white/60">Posts req.</span>
                            <span className="text-white font-bold">{tier.minPosts}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-white/60">Vistas req.</span>
                            <span className="text-white font-bold">{tier.minViews.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/5">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">Privilegios:</p>
                          {tier.benefits.map((benefit, bIdx) => (
                            <p key={bIdx} className="text-[10px] text-emerald-400 flex items-center gap-1.5 py-0.5">
                              <Sparkles className="h-2.5 w-2.5" />
                              {benefit}
                            </p>
                          ))}
                        </div>

                        {/* Speech Bubble Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Label Below Path */}
                  <div className="mt-4 text-center max-w-[80px]">
                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isCurrent ? 'text-indigo-600' : isPast ? 'text-slate-900' : 'text-slate-300'}`}>
                      {tier.name.split(' ')[0]}
                    </p>
                    <p className={`text-[8px] font-bold uppercase mt-1 ${isCurrent ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {tier.name.split(' ')[1] || ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white/50 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-gray-900">Mis Logros</h2>
            <p className="text-sm text-gray-500 font-medium">Desbloquea insignias por tu actividad y rendimiento.</p>
          </div>
          <div className="px-4 py-1.5 bg-indigo-50 rounded-full">
            <span className="text-xs font-bold text-indigo-600">
              {badges.filter(b => b.unlocked).length} / {badges.length} desbloqueados
            </span>
          </div>
        </div>
        
        <div className="relative group/carousel">
          {/* Navigation Arrows */}
          <button 
            onClick={() => carouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-xl border border-gray-100 text-gray-400 hover:text-indigo-600 hover:scale-110 active:scale-90 transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button 
            onClick={() => carouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-xl border border-gray-100 text-gray-400 hover:text-indigo-600 hover:scale-110 active:scale-90 transition-all opacity-0 group-hover/carousel:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div 
            ref={carouselRef}
            className="flex gap-10 overflow-x-auto pb-8 snap-x snap-mandatory scroll-smooth hide-scrollbar px-4 -mx-4"
          >
            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            
            {badges.map((badge, idx) => {
              const Icon = badge.icon;
              const isSelected = selectedBadge?.id === badge.id;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedBadge(isSelected ? null : badge)}
                  className={`relative flex flex-col items-center text-center shrink-0 w-36 snap-center group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 drop-shadow-xl z-10' : ''}`}
                >
                  <div className={`
                    relative h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500
                    ${badge.unlocked 
                      ? `bg-gradient-to-br ${badge.color} shadow-lg shadow-indigo-100 ring-4 ${isSelected ? 'ring-indigo-500' : 'ring-white'}` 
                      : `bg-white border-2 border-dashed ${isSelected ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-md' : 'border-gray-100 shadow-sm'}`}
                  `}>
                    <Icon className={`h-10 w-10 transition-transform duration-500 group-hover:scale-110 ${badge.unlocked ? 'text-white' : isSelected ? 'text-indigo-400' : 'text-gray-200'}`} />
                    {!badge.unlocked && !isSelected && (
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    {badge.unlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-md border border-gray-50"
                      >
                        <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                      </motion.div>
                    )}
                  </div>
                  <div className="mt-5 px-2">
                    <p className={`text-sm font-black whitespace-nowrap transition-colors ${badge.unlocked || isSelected ? 'text-gray-900' : 'text-gray-400'}`}>{badge.name}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-tighter mt-1 transition-colors ${isSelected ? 'text-indigo-600' : 'text-gray-400 opacity-60'}`}>
                      {badge.unlocked ? 'Desbloqueado' : 'Bloqueado'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selectedBadge && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <selectedBadge.icon className="h-32 w-32 text-indigo-600" />
                </div>
                <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${selectedBadge.color} flex items-center justify-center shadow-lg shrink-0`}>
                  <selectedBadge.icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h3 className="text-xl font-black text-gray-900">{selectedBadge.name}</h3>
                  <p className="text-sm text-gray-600 font-medium">{selectedBadge.description}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-indigo-100 shadow-sm">
                      <Target className="h-3 w-3 text-indigo-500" />
                      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Requisito: {selectedBadge.requirement}</span>
                    </div>
                    {selectedBadge.unlocked && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Logrado</span>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBadge(null)}
                  className="p-2 hover:bg-white rounded-full transition-colors self-start"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex justify-center gap-1.5 mt-4">
            {badges.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i < badges.filter(b => b.unlocked).length ? 'w-4 bg-indigo-500' : 'w-2 bg-gray-100'}`} 
              />
            ))}
          </div>
        </div>
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
  );
}
