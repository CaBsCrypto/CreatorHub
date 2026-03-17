import React, { useState, useEffect, useMemo } from 'react';
import { supabase, Campaign, Content, UserProfile } from '../supabase';
import { useAuth } from '../AuthContext';
import { Plus, X, Download, RefreshCw, Sparkles, ExternalLink, LayoutDashboard, List, Users, Youtube, Instagram, Globe, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2, Target, Music2, TrendingUp, BarChart3, Award, Wallet, CheckCircle2, Zap, Trophy, Flame } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';

// Database types are imported from supabase.ts

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'content' | 'creators' | 'team' | 'calendar'>('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '', target_posts: 3 });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'creator' | 'manager' | 'admin'>('creator');
  
  // Manual Content Assignment State
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [isFetchingContentMetadata, setIsFetchingContentMetadata] = useState(false);
  const [manualContent, setManualContent] = useState({ 
    campaign_id: '', 
    creator_id: '', 
    platform: 'youtube', 
    url: '' 
  });

  // Filters for Content Explorer
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Content>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingAudienceUser, setEditingAudienceUser] = useState<UserProfile | null>(null);

  // Twitch OCR State
  const [isAnalyzingTwitch, setIsAnalyzingTwitch] = useState(false);
  const [twitchStats, setTwitchStats] = useState<any>(null);
  const [isTwitchModalOpen, setIsTwitchModalOpen] = useState(false);
  const [twitchFile, setTwitchFile] = useState<File | null>(null);
  const [twitchPublicUrl, setTwitchPublicUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch initial data
    const fetchData = async () => {
      const [camps, conts, usrs] = await Promise.all([
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('content').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*')
      ]);

      if (camps.data) setCampaigns(camps.data as Campaign[]);
      if (conts.data) setContent(conts.data as Content[]);
      if (usrs.data) setUsers(usrs.data as UserProfile[]);
    };

    fetchData();

    // Set up real-time subscriptions
    const campaignsSub = supabase.channel('public:campaigns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => {
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }).then(({ data }) => setCampaigns((data as Campaign[]) || []));
      }).subscribe();

    const contentSub = supabase.channel('public:content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, () => {
        supabase.from('content').select('*').order('created_at', { ascending: false }).then(({ data }) => setContent((data as Content[]) || []));
      }).subscribe();

    const usersSub = supabase.channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        supabase.from('users').select('*').then(({ data }) => setUsers((data as UserProfile[]) || []));
      }).subscribe();

    return () => {
      supabase.removeChannel(campaignsSub);
      supabase.removeChannel(contentSub);
      supabase.removeChannel(usersSub);
    };
  }, [user]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.role !== 'admin') return;

    try {
      const { error } = await supabase.from('campaigns').insert([{
        name: newCampaign.name,
        description: newCampaign.description,
        status: 'active',
        target_posts: newCampaign.target_posts,
        created_by: user.id
      }]);
      
      if (error) throw error;
      
      setIsCreating(false);
      setNewCampaign({ name: '', description: '', target_posts: 3 });
    } catch (error: any) {
      console.error("🔥 Error saving campaign to Supabase:", error);
      alert("Error saving campaign: " + (error.message || "Unknown error"));
    }
  };

  const handleRoleChange = async (uid: string, newRole: string) => {
    if (profile?.role !== 'admin') {
      alert("Only administrators can change roles.");
      return;
    }
    
    // Optimistic update
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === uid ? { ...u, role: newRole as any } : u));

    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', uid);
      if (error) throw error;
      console.log(`Successfully updated role for user ${uid} to ${newRole}`);
    } catch (error: any) {
      console.error("Error updating role:", error);
      alert("Error updating role: " + error.message);
      // Rollback
      setUsers(previousUsers);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.role !== 'admin') return;
    
    try {
      const { data, error } = await supabase.from('users').insert([{
        email: newUserEmail.toLowerCase().trim(),
        role: newUserRole,
        display_name: newUserEmail.split('@')[0],
      }]).select();

      if (error) {
        if (error.code === '23505') { // Unique violation
          alert("This user already exists in the system.");
        } else {
          throw error;
        }
        return;
      }

      alert(`User ${newUserEmail} added successfully as ${newUserRole}.`);
      setIsAddingUser(false);
      setNewUserEmail('');
      setNewUserRole('creator');
      
      // Update local state if not already handled by subscription
      if (data) {
        setUsers(prev => [...prev, ...data]);
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      alert("Error adding user: " + error.message);
    }
  };

  const handleManualContentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.role !== 'admin') return;
    if (!manualContent.campaign_id || !manualContent.creator_id || !manualContent.url) {
      alert("Please fill in all fields.");
      return;
    }

    setIsFetchingContentMetadata(true);
    try {
      let title = 'New Manual Upload';
      let views = 0;
      let likes = 0;
      let comments = 0;
      let thumbnail = '';

      try {
        const response = await fetch('/api/fetch-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: manualContent.url,
            platform: manualContent.platform
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.title) title = data.title;
          if (data.views) views = data.views;
          if (data.likes) likes = data.likes;
          if (data.comments) comments = data.comments;
          if (data.thumbnail) thumbnail = data.thumbnail;
        }
      } catch (apiError) {
        console.error("Failed to fetch metadata from API:", apiError);
      }

      const { data, error } = await supabase.from('content').insert([{
        campaign_id: manualContent.campaign_id,
        creator_id: manualContent.creator_id,
        platform: manualContent.platform,
        url: manualContent.url,
        title: title,
        views: views,
        likes: likes,
        comments: comments,
        thumbnail: thumbnail,
        uploaded_at: new Date().toISOString()
      }]).select().single();
      
      if (error) throw error;

      alert(`Content "${title}" successfully assigned.`);
      setIsUploadingContent(false);
      setManualContent({ campaign_id: '', creator_id: '', platform: 'youtube', url: '' });
      
      if (data) {
        setContent(prev => [data as Content, ...prev]);
      }
    } catch (error: any) {
      console.error("Error creating manual content:", error);
      alert("Error adding manual content: " + error.message);
    } finally {
      setIsFetchingContentMetadata(false);
    }
  };

  const handleTwitchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingTwitch(true);
    setTwitchStats(null);
    setTwitchFile(file);
    setTwitchPublicUrl(null);
    setIsTwitchModalOpen(true);

    try {
      // 1. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `admin/${Date.now()}.${fileExt}`;
      const filePath = `twitch_stats/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content-attachments')
        .getPublicUrl(filePath);
      
      setTwitchPublicUrl(publicUrl);

      // 2. Prepare for OCR
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const response = await fetch('/api/analyze-twitch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 })
          });

          if (!response.ok) throw new Error("Failed to analyze image");
          const data = await response.json();
          setTwitchStats(data);
        } catch (err: any) {
          console.error("Twitch analysis error:", err);
          alert("Error analizando la imagen: " + err.message);
        } finally {
          setIsAnalyzingTwitch(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Storage upload or file reading error:", err);
      alert("Error al procesar archivo: " + err.message);
      setIsAnalyzingTwitch(false);
    }
  };

  const saveTwitchStats = async () => {
    if (!twitchStats || !user) return;
    
    // In a real scenario, the admin would select a creator and a campaign first.
    // For now, let's ask for them or use placeholders if not selected.
    const creatorId = filterCreator !== 'all' ? filterCreator : null;
    const campaignId = filterCampaign !== 'all' ? filterCampaign : campaigns[0]?.id;

    if (!creatorId) {
      alert("Por favor selecciona un creador en el filtro superior antes de guardar.");
      return;
    }

    try {
      const { error } = await supabase.from('content').insert([{
        campaign_id: campaignId,
        creator_id: creatorId,
        platform: 'twitch',
        url: 'https://twitch.tv/' + (twitchStats.title || 'stream'),
        title: twitchStats.title || 'Stream de Twitch',
        views: twitchStats.views || 0,
        peek_viewers: twitchStats.peek_viewers || 0,
        duration_minutes: twitchStats.duration_minutes || 0,
        thumbnail: twitchPublicUrl,
        uploaded_at: twitchStats.stream_date || new Date().toISOString()
      }]);

      if (error) throw error;
      
      alert("Estadísticas de Twitch guardadas con éxito!");
      setIsTwitchModalOpen(false);
      setTwitchStats(null);
    } catch (err: any) {
      console.error("Error saving twitch stats:", err);
      alert("Error guardando estadísticas: " + err.message);
    }
  };

  const handleSaveAudience = async (userId: string, geo: Record<string, number>) => {
    try {
      const { error } = await supabase.from('users').update({
        audience_geo: geo
      }).eq('id', userId);
      
      if (error) throw error;
      
      setEditingAudienceUser(null);
      // Local state is updated via subscription
    } catch (error: any) {
      console.error("Error saving audience geo:", error);
      alert("Error saving audience: " + error.message);
    }
  };
  const handleDeleteCampaign = async (campaign_id: string) => {
    if (profile?.role !== 'admin') {
      alert("Only administrators can delete campaigns.");
      return;
    }
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta campaña? No se puede deshacer.")) return;
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', campaign_id);
      if (error) throw error;
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      alert("Error deleting campaign: " + error.message);
    }
  };

  const handleDeleteContent = async (content_id: string) => {
    if (profile?.role !== 'admin') return;
    if (!window.confirm("¿Estás seguro de que deseas eliminar este contenido?")) return;
    
    try {
      const { error } = await supabase.from('content').delete().eq('id', content_id);
      if (error) throw error;
      
      // Update local state if needed
      setContent(prev => prev.filter(c => c.id !== content_id));
    } catch (error: any) {
      console.error("Error deleting content:", error);
      alert("Error eliminando contenido: " + error.message);
    }
  };

  const handleSyncSingle = async (item: Content) => {
    if (profile?.role !== 'admin') return;
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/refresh-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ id: item.id, url: item.url, platform: item.platform }]
        })
      });

      if (!response.ok) throw new Error("API Refresh failed");
      
      const { results } = await response.json();
      if (results && results.length > 0) {
        const res = results[0];
        const { error } = await supabase.from('content').update({
          views: res.views,
          likes: res.likes,
          comments: res.comments,
          title: res.title,
          thumbnail: res.thumbnail
        }).eq('id', res.id);
        
        if (error) throw error;

        // Update local state
        setContent(prev => prev.map(c => c.id === item.id ? {
          ...c,
          views: res.views,
          likes: res.likes,
          comments: res.comments,
          title: res.title,
          thumbnail: res.thumbnail
        } : c));
      }
    } catch (error: any) {
      console.error("Failed to sync item", error);
      alert("Error al sincronizar: " + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshStats = async () => {
    if (profile?.role !== 'admin') return;
    setIsRefreshing(true);
    try {
      const refreshableItems = content.filter(item => item.url && item.platform);
      if (refreshableItems.length === 0) {
        alert("No hay contenido válido para actualizar.");
        return;
      }

      let updatedCount = 0;
      // Use sequential loop to avoid Vercel timeout (10s) on bulk jobs
      for (const item of refreshableItems) {
        try {
          const response = await fetch('/api/refresh-metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: [{ id: item.id, url: item.url, platform: item.platform }]
            })
          });

          if (response.ok) {
            const { results } = await response.json();
            if (results && results.length > 0) {
              const res = results[0];
              const { error } = await supabase.from('content').update({
                views: res.views,
                likes: res.likes,
                comments: res.comments,
                title: res.title,
                thumbnail: res.thumbnail
              }).eq('id', res.id);
              if (!error) updatedCount++;
            }
          }
        } catch (e) {
          console.error(`Error refreshing item ${item.id}:`, e);
        }
      }

      const { data: newData } = await supabase
        .from('content')
        .select('*')
        .order('uploaded_at', { ascending: false });
      
      if (newData) setContent(newData as Content[]);
      alert(`Actualización finalizada: ${updatedCount} de ${refreshableItems.length} publicaciones actualizadas.`);
    } catch (err: any) {
      console.error("Critical refresh error:", err);
      alert("Error crítico al actualizar: " + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const generateAiAnalysis = async () => {
    if (content.length === 0) {
      alert("No content available to analyze.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const summaryData = content.map(c => ({
        platform: c.platform,
        views: c.views || 0,
        likes: c.likes || 0,
        comments: c.comments || 0
      }));

      const response = await fetch('/api/analyze-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryData })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Backend AI call failed");
      }
      const data = await response.json();
      setAiAnalysis(data.analysis || "No analysis generated.");
    } catch (error: any) {
      console.error("AI Analysis failed", error);
      alert(error.message || "Failed to generate AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToCSV = () => {
    const data = content.map(c => {
      const campaign = campaigns.find(camp => camp.id === c.campaign_id);
      const creator = users.find(u => u.id === c.creator_id);
      return {
        'Campaign Name': campaign?.name || 'Unknown',
        'Creator': creator?.display_name || creator?.email || c.creator_id,
        'Platform': c.platform,
        'URL': c.url,
        'Title': c.title || '',
        'Views': c.views || 0,
        'Likes': c.likes || 0,
        'Comments': c.comments || 0,
        'Uploaded At': c.uploaded_at ? format(new Date(c.uploaded_at), 'yyyy-MM-dd') : '',
      };
    });

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `content_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const platformData = [
    { name: 'YouTube', value: content.filter(c => c.platform === 'youtube').reduce((acc, curr) => acc + (curr.views || 0), 0) },
    { name: 'Instagram', value: content.filter(c => c.platform === 'instagram').reduce((acc, curr) => acc + (curr.views || 0), 0) },
    { name: 'TikTok', value: content.filter(c => c.platform === 'tiktok').reduce((acc, curr) => acc + (curr.views || 0), 0) },
    { name: 'X', value: content.filter(c => c.platform === 'x').reduce((acc, curr) => acc + (curr.views || 0), 0) },
    { name: 'CoinMarketCap', value: content.filter(c => c.platform === 'coinmarketcap').reduce((acc, curr) => acc + (curr.views || 0), 0) },
  ].filter(p => p.value > 0);

  const geoData = useMemo(() => {
    const totals: Record<string, number> = {};
    let activeCreators = 0;

    users.forEach(u => {
      if (u.role === 'creator') {
        let geo = u.audience_geo;
        
        // Safety: handle cases where it might come back as a string from some drivers
        if (typeof geo === 'string') {
          try { geo = JSON.parse(geo); } catch (e) { geo = {}; }
        }
        
        if (geo && Object.keys(geo).length > 0) {
          activeCreators++;
          Object.entries(geo).forEach(([country, percentage]) => {
            const val = typeof percentage === 'number' ? percentage : parseInt(percentage as any) || 0;
            totals[country] = (totals[country] || 0) + val;
          });
        }
      }
    });
    
    console.log(`[GEO_DEBUG] Active Creators: ${activeCreators}, Totals:`, totals);

    const averaged = Object.entries(totals)
      .map(([name, value]) => ({ 
        name, 
        value: activeCreators > 0 ? Math.round(value / activeCreators) : value 
      }))
      .sort((a, b) => b.value - a.value);

    return averaged;
  }, [users]);

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
    // 7 days x 24 hours
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const matrix: any[] = [];
    
    // Initialize matrix
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 24; j++) {
        matrix.push({ day: days[i], hour: j, count: 0, dayIdx: (i + 1) % 7 }); // (i+1)%7 maps 0 (Lun) to 1, ..., 6 (Dom) to 0
      }
    }

    content.forEach(c => {
      if (!c.created_at) return;
      const date = new Date(c.created_at);
      const dayIdx = date.getDay(); // 0 is Sunday, 1 is Monday
      const hour = date.getHours();
      
      const cell = matrix.find(m => m.dayIdx === dayIdx && m.hour === hour);
      if (cell) cell.count += 1;
    });

    return matrix;
  }, [content]);

  const COLORS = ['#4f46e5', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#f43f5e', '#10b981'];

  const filteredAndSortedContent = useMemo(() => {
    let result = [...content];

    if (filterCampaign !== 'all') {
      result = result.filter(c => c.campaign_id === filterCampaign);
    }
    if (filterPlatform !== 'all') {
      result = result.filter(c => c.platform === filterPlatform);
    }
    if (filterCreator !== 'all') {
      result = result.filter(c => c.creator_id === filterCreator);
    }

    result.sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [content, filterCampaign, filterPlatform, filterCreator, sortField, sortOrder]);

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

  const creatorStats = useMemo(() => {
    const stats: Record<string, { views: number, engagement: number, contentCount: number, estimatedValue: number }> = {};
    const CPM = 2.0; // $2.00 per 1000 views

    content.forEach(c => {
      if (!stats[c.creator_id]) {
        stats[c.creator_id] = { views: 0, engagement: 0, contentCount: 0, estimatedValue: 0 };
      }
      const views = (c.views || 0);
      stats[c.creator_id].views += views;
      stats[c.creator_id].engagement += (c.likes || 0) + (c.comments || 0);
      stats[c.creator_id].contentCount += 1;
      stats[c.creator_id].estimatedValue += (views / 1000) * CPM;
    });
    return Object.entries(stats).map(([creator_id, data]) => {
      const user = users.find(u => u.id === creator_id);
      const rank = getAgencyRank(data.contentCount, data.views);
      return {
        creator_id,
        name: user?.display_name || user?.email || creator_id,
        paymentMethod: user?.payment_method,
        paymentId: user?.payment_method === 'binance' ? user.binance_id : user?.wallet_address,
        rank,
        ...data
      };
    }).sort((a, b) => b.views - a.views);
  }, [content, users]);

  const creatorChartData = useMemo(() => {
    return creatorStats.map(stat => ({
      name: stat.name.split(' ')[0] || stat.name, // Use first name for compactness
      views: stat.views,
      engagement: stat.engagement
    })).slice(0, 7); // Top 7 creators for the chart
  }, [creatorStats]);

  const handleSort = (field: keyof Content) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stats = [
    { name: 'Total Campaigns', value: campaigns.length, icon: List, onClick: () => setActiveTab('campaigns') },
    { name: 'Total Content Pieces', value: content.length, icon: Youtube, onClick: () => setActiveTab('content') },
    { name: 'Total Users', value: users.length, icon: Users, onClick: () => setActiveTab('team') },
    { 
      name: 'Total Creators', 
      value: users.filter(u => u.role === 'creator').length, 
      icon: Target, 
      onClick: () => setActiveTab('creators') 
    },
    { name: 'Total Views', value: content.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString(), icon: Globe },
  ];

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'campaigns', name: 'Campaigns', icon: Target },
    { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
    { id: 'content', name: 'Content Explorer', icon: List },
    { id: 'creators', name: 'Creators Analysis', icon: Users },
    { id: 'team', name: 'Team Management', icon: Users },
  ];

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentCalendarDate));
    const end = endOfWeek(endOfMonth(currentCalendarDate));
    return eachDayOfInterval({ start, end });
  }, [currentCalendarDate]);

  const nextMonth = () => setCurrentCalendarDate(addMonths(currentCalendarDate, 1));
  const prevMonth = () => setCurrentCalendarDate(subMonths(currentCalendarDate, 1));

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-gray-50 -m-4 sm:-m-6 lg:-m-8">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500 hover:text-gray-600">
          <List className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar / Drawer */}
      <aside className={`
        fixed inset-0 z-50 lg:relative lg:z-0
        transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 bg-white border-r border-gray-200 flex-shrink-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 hidden lg:block">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="flex-1 px-4 space-y-1 mt-4">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.name}
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-100 space-y-2">
            {profile?.role === 'admin' && (
              <button onClick={handleRefreshStats} disabled={isRefreshing} className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Actualizar Global'}
              </button>
            )}
            <button onClick={exportToCSV} className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
              <Download className="h-3 w-3" />
              Export CSV
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h2>
            {activeTab === 'campaigns' && profile?.role === 'admin' && (
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Campaign</span>
              </button>
            )}
          </div>

          {isCreating && (
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New Campaign</h3>
                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600"><Plus className="h-5 w-5 transform rotate-45" /></button>
              </div>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                  <input
                    type="text" required value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={3} value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Posts per Creator</label>
                  <input
                    type="number" min="1" required value={newCampaign.target_posts}
                    onChange={(e) => setNewCampaign({ ...newCampaign, target_posts: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all">Save Campaign</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {stats.map((stat, idx) => (
                  <motion.div 
                    key={stat.name} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => stat.onClick ? stat.onClick() : undefined}
                    className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${stat.onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <stat.icon className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Views by Platform (%)</h3>
                  <div className="w-full h-[350px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento Mensual (Vistas)</h3>
                  <div className="w-full h-[350px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    Próximos Ascensos
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </h3>
                  <div className="space-y-4 h-72 overflow-y-auto pr-2 custom-scrollbar">
                    {creatorStats
                      .filter(s => {
                        if (!s.rank.next) return false;
                        const progress = ((s.contentCount / s.rank.next.minPosts) + (s.views / s.rank.next.minViews)) / 2;
                        return progress >= 0.8;
                      })
                      .map((stat) => {
                        const progress = Math.round(Math.min(100, ((stat.contentCount / stat.rank.next!.minPosts) + (stat.views / stat.rank.next!.minViews)) / 2 * 100));
                        
                        return (
                          <div key={stat.creator_id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${stat.rank.color} flex items-center justify-center text-white ring-2 ring-white shadow-sm`}>
                                  {React.createElement(stat.rank.icon, { className: "h-3 w-3" })}
                                </div>
                                <span className="text-sm font-bold text-slate-800">{stat.name}</span>
                              </div>
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{progress}%</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rumbo a:</span>
                              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-white px-2 py-0.5 rounded border border-indigo-100">{stat.rank.next?.name}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-slate-200">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className={`h-full bg-gradient-to-r ${stat.rank.next?.color} rounded-full`}
                              />
                            </div>
                          </div>
                        );
                    })}
                    {creatorStats.filter(s => s.rank.next && (((s.contentCount / s.rank.next.minPosts) + (s.views / s.rank.next.minViews)) / 2) >= 0.8).length === 0 && (
                      <div className="text-center py-10 flex flex-col items-center justify-center space-y-2 opacity-40">
                        <TrendingUp className="h-8 w-8 text-slate-300" />
                        <span className="text-xs font-bold text-slate-400 uppercase">Sin ascensos inminentes</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    Pulso de Actividad (Heatmap)
                    <CalendarIcon className="h-4 w-4 text-orange-500" />
                  </h3>
                  <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="min-w-[800px]">
                      <div className="grid gap-1" style={{ gridTemplateColumns: '48px repeat(24, minmax(0, 1fr))' }}>
                        <div className="h-8 w-12 text-[10px] font-bold text-gray-400 flex items-center">Día</div>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="h-8 w-full text-[10px] font-bold text-gray-400 flex items-center justify-center">
                            {i}h
                          </div>
                        ))}
                        
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, dIdx) => (
                          <React.Fragment key={day}>
                            <div className="h-8 w-12 text-[11px] font-bold text-gray-600 flex items-center">{day}</div>
                            {Array.from({ length: 24 }).map((_, h) => {
                              const cell = heatmapData.find(m => m.day === day && m.hour === h) || { count: 0 };
                              const opacity = Math.min(cell.count / 5, 1); // Intensity based on count
                              return (
                                <div 
                                  key={h}
                                  className="h-8 w-full rounded-sm transition-all hover:ring-2 hover:ring-indigo-300 cursor-help"
                                  title={`${day} ${h}:00 - ${cell.count} posts`}
                                  style={{ 
                                    backgroundColor: cell.count > 0 ? `rgba(79, 70, 229, ${0.1 + opacity * 0.9})` : '#f3f4f6' 
                                  }}
                                ></div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 rounded-sm"></div> Sin actividad</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-200 rounded-sm"></div> Baja</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-600 rounded-sm"></div> Alta frecuencia</div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Twitch Stats Assistant (Beta)</h3>
                    <div className="flex gap-2">
                      <label className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 cursor-pointer">
                        <Download className="h-3 w-3" />
                        Subir Captura
                        <input type="file" className="hidden" accept="image/*" onChange={handleTwitchUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="p-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                      <Music2 className="h-6 w-6 text-indigo-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Analiza tus streams con IA Vision</p>
                    <p className="text-xs text-gray-400 max-w-xs">Sube una imagen de tu panel de Twitch y deja que Gemini procese las estadísticas por ti.</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                    <button
                      onClick={generateAiAnalysis} disabled={isAnalyzing || content.length === 0}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                    >
                      <Sparkles className={`h-3 w-3 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                      {isAnalyzing ? 'Analyzing...' : 'Refresh AI'}
                    </button>
                  </div>
                  <div className="min-h-[260px] max-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl p-8 text-center bg-gray-50/50 overflow-auto">
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-gray-600 font-medium">Analizando datos con Inteligencia Artificial...</p>
                        <p className="text-xs text-gray-400">Esto puede tardar unos segundos (Probando {content.length} piezas de contenido)</p>
                      </div>
                    ) : aiAnalysis ? (
                      <div className="w-full text-left">
                        <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {aiAnalysis}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Sparkles className="h-10 w-10 text-indigo-200 mb-4" />
                        <p className="text-gray-500 font-medium italic">No analysis yet. Click the button above to generate one.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Campaigns List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
                </div>
                {campaigns.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {campaigns.map((camp) => (
                          <tr key={camp.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{camp.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{camp.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{camp.created_at ? format(new Date(camp.created_at), 'MMM d, yyyy') : ''}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              {profile?.role === 'admin' && (
                                <button 
                                  onClick={() => handleDeleteCampaign(camp.id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                                  title="Delete Campaign"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No active campaigns. Click "New Campaign" to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Filters Area */}
              <div className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Campaign</label>
                    <select value={filterCampaign} onChange={(e) => setFilterCampaign(e.target.value)} className="w-full bg-gray-50 border-none rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500">
                      <option value="all">All Campaigns</option>
                      {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Platform</label>
                    <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="w-full bg-gray-50 border-none rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500">
                      <option value="all">All Platforms</option>
                      {['youtube', 'instagram', 'tiktok', 'x', 'coinmarketcap'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Creator</label>
                    <select value={filterCreator} onChange={(e) => setFilterCreator(e.target.value)} className="w-full bg-gray-50 border-none rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500">
                      <option value="all">All Creators</option>
                      {users.filter(u => u.role === 'creator').map(u => <option key={u.id} value={u.id}>{u.display_name || u.email}</option>)}
                    </select>
                  </div>
                </div>
                {profile?.role === 'admin' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsUploadingContent(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Content
                    </button>
                    <button
                      onClick={handleRefreshStats}
                      disabled={isRefreshing}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Actualizar Todo
                    </button>
                  </div>
                )}
              </div>

              {isUploadingContent && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Anexar Contenido Manualmente</h3>
                    <button onClick={() => setIsUploadingContent(false)} className="text-gray-400 hover:text-gray-600"><Plus className="h-4 w-4 transform rotate-45" /></button>
                  </div>
                  <form onSubmit={handleManualContentUpload} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Creador</label>
                      <select 
                        required value={manualContent.creator_id} 
                        onChange={(e) => setManualContent({...manualContent, creator_id: e.target.value})}
                        className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Seleccionar Creador</option>
                        {users.filter(u => u.role === 'creator').map(u => (
                          <option key={u.id} value={u.id}>{u.display_name || u.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Campaña</label>
                      <select 
                        required value={manualContent.campaign_id} 
                        onChange={(e) => setManualContent({...manualContent, campaign_id: e.target.value})}
                        className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Seleccionar Campaña</option>
                        {campaigns.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Plataforma</label>
                      <select 
                        required value={manualContent.platform} 
                        onChange={(e) => setManualContent({...manualContent, platform: e.target.value as any})}
                        className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="x">X (Twitter)</option>
                        <option value="coinmarketcap">CoinMarketCap</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">URL del Contenido</label>
                      <input 
                        type="url" required placeholder="https://..."
                        value={manualContent.url} onChange={(e) => setManualContent({...manualContent, url: e.target.value})}
                        className="w-full rounded-lg border-gray-200 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-2">
                       <button 
                        type="button" onClick={() => setIsUploadingContent(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" disabled={isFetchingContentMetadata}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-500 transition-all disabled:opacity-50"
                      >
                        {isFetchingContentMetadata ? 'Obteniendo Datos...' : 'Anexar Contenido'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Desktop View Table */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                </table>
              </div>

              {/* Mobile View Cards */}
              <div className="lg:hidden space-y-4">
                {filteredAndSortedContent.map((item) => {
                  const creator = users.find(u => u.id === item.creator_id);
                  return (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                      <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100 overflow-hidden">
                        {item.thumbnail ? <img src={item.thumbnail} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><Globe className="h-6 w-6 text-gray-200" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate text-sm">{item.title || item.url}</h4>
                        <p className="text-xs text-gray-500 mb-2">{creator?.display_name || creator?.email}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="bg-gray-50 px-2 py-1 rounded text-[10px] font-bold text-gray-700">Views: {item.views?.toLocaleString()}</div>
                          {item.platform === 'twitch' ? (
                            <div className="bg-gray-50 px-2 py-1 rounded text-[10px] text-gray-600">Peak: {item.peek_viewers || 0}</div>
                          ) : (
                            <div className="bg-gray-50 px-2 py-1 rounded text-[10px] text-gray-600">Likes: {item.likes || 0}</div>
                          )}
                        </div>
                        <a href={item.url} target="_blank" className="mt-2 text-[10px] text-indigo-600 font-medium flex items-center gap-1">Link <ExternalLink className="h-2 w-2" /></a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{format(currentCalendarDate, 'MMMM yyyy')}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={() => setCurrentCalendarDate(new Date())} className="px-3 py-1.5 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors text-gray-600">Today</button>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"><ChevronRight className="h-5 w-5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-3 border-r border-gray-100 last:border-r-0">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-[120px]">
                {calendarDays.map((day, dayIdx) => {
                  const dayContent = content.filter(c => c.uploaded_at && isSameDay(new Date(c.uploaded_at), day));
                  return (
                    <div 
                      key={day.toString()} 
                      className={`
                        p-2 border-b border-r border-gray-100 last:border-r-0 overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer group
                        ${!isSameMonth(day, currentCalendarDate) ? 'bg-gray-50/50' : 'bg-white'}
                        ${dayIdx % 7 === 6 ? 'border-r-0' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday(day) ? 'bg-indigo-600 text-white' : !isSameMonth(day, currentCalendarDate) ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        {dayContent.length > 0 && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">{dayContent.length}</span>
                        )}
                      </div>
                      <div className="space-y-1 overflow-y-auto max-h-[80px] pr-1 custom-scrollbar">
                        {dayContent.map(item => {
                          const creator = users.find(u => u.id === item.creator_id);
                          return (
                            <div key={item.id} className="text-[10px] bg-white border border-gray-100 shadow-sm p-1.5 rounded truncate flex items-center gap-1 group-hover:border-indigo-200 transition-colors" title={item.title || item.url}>
                              <span className="font-semibold text-gray-700 truncate">{creator?.display_name?.split(' ')[0] || 'User'}:</span>
                              <span className="text-gray-500 truncate">{item.title || item.platform}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'creators' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {creatorStats.map((stat, idx) => (
                <motion.div 
                  key={stat.creator_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className="relative overflow-hidden bg-white rounded-[32px] p-8 shadow-sm hover:shadow-2xl border border-gray-100 group transition-all duration-500"
                >
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[64px] -z-0 transition-transform group-hover:scale-110 duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="relative flex-shrink-0">
                        <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${stat.rank.color} flex items-center justify-center text-white shadow-lg ring-4 ring-white transition-all duration-700`}>
                          {React.createElement(stat.rank.icon, { className: "h-10 w-10 text-white" })}
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-white shadow-md flex items-center justify-center border border-gray-50">
                          <span className="text-xs font-black text-gray-900">{stat.rank.level}</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-2xl font-black text-gray-900 truncate leading-tight">{stat.name}</h3>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${stat.rank.color} text-[10px] font-black text-white uppercase tracking-widest mt-2 shadow-sm`}>
                          {stat.rank.name}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 hover:border-indigo-100 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <BarChart3 className="h-3 w-3 text-slate-400" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Views</p>
                        </div>
                        <p className="text-2xl font-black text-slate-900 truncate tracking-tight">{stat.views.toLocaleString()}</p>
                      </div>
                      
                      <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-50 hover:border-emerald-100 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Plus className="h-3 w-3 text-emerald-500" />
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Posts</p>
                        </div>
                        <p className="text-2xl font-black text-emerald-700 tracking-tight">
                          {stat.contentCount}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Rank Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progreso de Rango</span>
                            {stat.rank.next && (
                              <span className="text-[9px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Hacia {stat.rank.next.name}</span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-gray-900">
                            {stat.rank.next 
                              ? `${Math.round(Math.min(100, (stat.contentCount / stat.rank.next.minPosts) * 100))}%`
                              : 'MAX'
                            }
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.rank.next ? Math.min((stat.contentCount / stat.rank.next.minPosts) * 100, 100) : 100}%` }}
                            className={`h-full bg-gradient-to-r ${stat.rank.color} rounded-full`}
                          />
                        </div>
                      </div>

                      {/* Payment Badge Footer */}
                      <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pago Preferido</span>
                          <div className="mt-1 flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${stat.paymentMethod ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            <span className="text-xs font-bold text-gray-700 uppercase">{stat.paymentMethod || 'Pendiente'}</span>
                          </div>
                        </div>
                        <button className="h-10 px-4 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors">
                          Ver Perfil
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-500">Manage access and permissions</p>
                </div>
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => setIsAddingUser(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add User</span>
                  </button>
                )}
              </div>

              {isAddingUser && (
                <div className="p-6 bg-indigo-50 border-b border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Quick Add User (By Email)</h4>
                    <button onClick={() => setIsAddingUser(false)} className="text-indigo-400 hover:text-indigo-600"><Plus className="h-4 w-4 transform rotate-45" /></button>
                  </div>
                  <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="email" required placeholder="email@example.com"
                        value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border bg-white"
                      />
                    </div>
                    <div className="w-full sm:w-40">
                      <select
                        value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as any)}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 border bg-white"
                      >
                        <option value="creator">Creator</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-500 transition-all"
                    >
                      Invite User
                    </button>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-100">
                              {u.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{u.display_name || u.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            u.role === 'admin' ? 'bg-purple-50 text-purple-700 ring-purple-700/10' :
                            u.role === 'manager' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                            'bg-green-50 text-green-700 ring-green-700/10'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* Placeholder for 'Created' date if available, or empty */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right flex items-center justify-end gap-2">
                          {u.role === 'creator' && (
                            <button
                              onClick={() => setEditingAudienceUser(u)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                              title="Set Audience"
                            >
                              <Globe className="h-4 w-4" />
                            </button>
                          )}
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={profile?.role !== 'admin' || u.id === user?.id}
                            className="text-xs border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                          >
                            <option value="creator">Creator</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Audience Management Modal - Admin Side */}
        <AnimatePresence>
          {editingAudienceUser && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" 
                onClick={() => setEditingAudienceUser(null)}
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
                      <Globe className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Audience Profile</h3>
                      <p className="text-xs text-gray-500">Set percentages for **{editingAudienceUser.display_name || editingAudienceUser.email}**</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingAudienceUser(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-2">
                    {['Chile', 'Argentina', 'México', 'España', 'Colombia', 'Perú', 'USA', 'Brasil', 'Otros'].map(country => {
                      const geo = editingAudienceUser.audience_geo || {};
                      const isSelected = !!geo[country];
                      return (
                        <button
                          key={country}
                          onClick={() => {
                            const newGeo = { ...geo };
                            if (isSelected) {
                              delete newGeo[country];
                            } else if (Object.keys(newGeo).length < 3) {
                              newGeo[country] = 33;
                            }
                            setEditingAudienceUser({ ...editingAudienceUser, audience_geo: newGeo });
                          }}
                          className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all border ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                              : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-200'
                          }`}
                        >
                          {country}
                        </button>
                      );
                    })}
                  </div>

                  {Object.keys(editingAudienceUser.audience_geo || {}).length > 0 && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      {Object.entries(editingAudienceUser.audience_geo || {}).map(([country, percentage]) => (
                        <div key={country} className="flex items-center gap-4">
                          <span className="text-sm font-bold text-gray-700 w-24 truncate">{country}</span>
                          <div className="flex-1 flex items-center gap-2">
                            <input 
                              type="range" min="1" max="100" value={percentage}
                              onChange={(e) => {
                                const newGeo = { ...(editingAudienceUser.audience_geo || {}) };
                                newGeo[country] = parseInt(e.target.value);
                                setEditingAudienceUser({ ...editingAudienceUser, audience_geo: newGeo });
                              }}
                              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="w-12 text-right text-sm font-black text-indigo-600">{percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setEditingAudienceUser(null)} className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all text-sm">Cancel</button>
                    <button 
                      onClick={() => handleSaveAudience(editingAudienceUser.id, editingAudienceUser.audience_geo || {})}
                      className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-500 shadow-lg shadow-indigo-100 transition-all text-sm"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
      {/* Twitch OCR Modal */}
      {isTwitchModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsTwitchModalOpen(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-900/10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Music2 className="text-purple-600 h-6 w-6" />
                Estadísticas de Twitch
              </h2>
              <button 
                onClick={() => setIsTwitchModalOpen(false)} 
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {isAnalyzingTwitch ? (
              <div className="py-12 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-bold">Gemini está leyendo la captura...</p>
                <p className="text-xs text-gray-400 animate-pulse">Analizando píxeles, textos y números</p>
              </div>
            ) : twitchStats ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                    <span className="text-xs font-bold text-gray-500 uppercase">Título</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px] truncate">{twitchStats.title || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Vistas</span>
                      <p className="text-xl font-black text-indigo-600">{twitchStats.views?.toLocaleString() || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Pico Viewers</span>
                      <p className="text-xl font-black text-purple-600">{twitchStats.peek_viewers?.toLocaleString() || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Duración</span>
                      <p className="text-sm font-bold text-gray-700">{twitchStats.duration_minutes || 0} min</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Fecha</span>
                      <p className="text-sm font-bold text-gray-700">{twitchStats.stream_date ? format(new Date(twitchStats.stream_date), 'dd/MM/yyyy') : 'Hoy'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex gap-3 items-start">
                  <Sparkles className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    Asegúrate de haber seleccionado al <b>Creador</b> y la <b>Campaña</b> en los filtros del Dashboard antes de guardar.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsTwitchModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Borrar
                  </button>
                  <button
                    onClick={saveTwitchStats}
                    className="flex-2 px-6 py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all"
                  >
                    Confirmar y Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Algo salió mal. Por favor intenta subir la imagen de nuevo.
              </div>
            )}
           </motion.div>
        </div>
      )}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl w-full h-[80vh] flex flex-col items-center justify-center">
             <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-indigo-400 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <img src={previewImage} className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
            <p className="text-white/60 text-sm mt-4 font-medium">Captura original de estadísticas</p>
          </div>
        </div>
      )}
    </div>
  );
}
