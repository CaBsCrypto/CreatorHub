import React, { useState, useEffect, useMemo } from 'react';
import { supabase, Campaign, Content, UserProfile } from '../supabase';
import { useAuth } from '../AuthContext';
import { Plus, Download, RefreshCw, Sparkles, ExternalLink, LayoutDashboard, List, Users, Youtube, Instagram, Globe, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2, Target } from 'lucide-react';
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

  // Filters for Content Explorer
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Content>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
    if (!user) return;

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
    if (profile?.role !== 'admin' && profile?.role !== 'manager') {
      alert("Only administrators and managers can change roles.");
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
    if (profile?.role !== 'admin' && profile?.role !== 'manager') return;
    
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

  const handleDeleteCampaign = async (campaign_id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta campaña? No se puede deshacer.")) return;
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', campaign_id);
      if (error) throw error;
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      alert("Error deleting campaign: " + error.message);
    }
  };

  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    try {
      let updatedCount = 0;
      for (const item of content) {
        if (item.url && item.platform) {
          try {
            const response = await fetch('/api/fetch-metadata', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: item.url,
                platform: item.platform
              })
            });

            if (response.ok) {
              const data = await response.json();
              await supabase.from('content').update({
                views: data.views ?? item.views,
                likes: data.likes ?? item.likes,
                comments: data.comments ?? item.comments,
                title: data.title ?? item.title
              }).eq('id', item.id);
              updatedCount++;
            }
          } catch (apiError) {
            console.error(`Failed to refresh stats for ${item.url}:`, apiError);
          }
        }
      }
      alert(`Successfully refreshed stats for ${updatedCount} items.`);
    } catch (error) {
      console.error("Failed to refresh stats", error);
      alert("Failed to trigger stats refresh.");
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
    const counts: Record<string, number> = {};
    users.forEach(u => {
      if (u.audience_geo) {
        Object.keys(u.audience_geo).forEach(country => {
          counts[country] = (counts[country] || 0) + 1;
        });
      }
    });
    
    const sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return sorted.length > 0 ? sorted : [
      { name: 'Sin Datos', value: 1 }
    ];
  }, [users]);

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
      return {
        creator_id,
        name: user?.display_name || user?.email || creator_id,
        paymentMethod: user?.payment_method,
        paymentId: user?.payment_method === 'binance' ? user.binance_id : user?.wallet_address,
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
            <button onClick={handleRefreshStats} disabled={isRefreshing} className="flex items-center gap-2 w-full px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
            </button>
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
            {activeTab === 'campaigns' && (
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
                  <div className="h-72">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience by Country (%)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={geoData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {geoData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    Top Creators Leaderboard
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                  </h3>
                  <div className="space-y-5 h-72 overflow-y-auto pr-2 custom-scrollbar">
                    {creatorStats.slice(0, 5).map((stat, index) => {
                      const maxViews = Math.max(...creatorStats.map(s => s.views)) || 1;
                      const viewPercentage = (stat.views / maxViews) * 100;
                      
                      return (
                        <div key={stat.creator_id} className="relative group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' : 
                                index === 1 ? 'bg-slate-100 text-slate-700 ring-2 ring-slate-200' : 
                                index === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' : 
                                'bg-indigo-50 text-indigo-700'
                              }`}>
                                #{index + 1}
                              </span>
                              <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{stat.name}</span>
                            </div>
                             <div className="flex items-center gap-3 text-xs font-medium">
                               <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{stat.views.toLocaleString()} views</span>
                               <span 
                                 className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold cursor-help"
                                 title="Valor estimado basado en un CPM de $2.00 USD por cada 1,000 vistas"
                               >
                                 ${stat.estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ROI
                               </span>
                             </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${viewPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    {creatorStats.length === 0 && (
                      <div className="text-center py-10 flex flex-col items-center justify-center space-y-2">
                        <Users className="h-8 w-8 text-gray-300" />
                        <span className="text-sm text-gray-500">No creators with data yet.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    Campaign Progress
                    <Target className="h-4 w-4 text-indigo-500" />
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {campaigns.map((camp, idx) => {
                      const totalPosts = content.filter(c => c.campaign_id === camp.id).length;
                      const target = camp.target_posts || 3;
                      const progress = Math.min((totalPosts / target) * 100, 100);
                      return (
                        <motion.div 
                          key={camp.id} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-sm font-bold text-gray-900 truncate pr-2" title={camp.name}>{camp.name}</h4>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1 }}
                              className="bg-indigo-600 h-2 rounded-full transition-all"
                            ></motion.div>
                          </div>
                          <p className="text-[10px] font-bold text-gray-500">{totalPosts} / {target} posts</p>
                        </motion.div>
                      );
                    })}
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
                              <button 
                                onClick={() => handleDeleteCampaign(camp.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                                title="Delete Campaign"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
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

              {/* Desktop View Table */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Creator</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600" onClick={() => handleSort('views')}>Views {sortField === 'views' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metrics</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAndSortedContent.map((item) => {
                      const creator = users.find(u => u.id === item.creator_id);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                {item.thumbnail ? <img src={item.thumbnail} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><Globe className="h-4 w-4 text-gray-300" /></div>}
                              </div>
                              <div className="max-w-[240px]">
                                <a href={item.url} target="_blank" className="text-sm font-medium text-gray-900 group flex items-center gap-1">
                                  <span className="truncate">{item.title || item.url}</span>
                                  <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                                <p className="text-xs text-gray-500 capitalize">{item.platform}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{creator?.display_name || creator?.email}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.views?.toLocaleString()}</td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            L: {item.likes || 0} / C: {item.comments || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{item.uploaded_at ? format(new Date(item.uploaded_at), 'MMM d, yyyy') : 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
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
                          <div className="bg-gray-50 px-2 py-1 rounded text-[10px] text-gray-600">Likes: {item.likes || 0}</div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {creatorStats.map(stat => (
                <div key={stat.creator_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-100">
                      {stat.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 truncate">{stat.name}</h3>
                      <p className="text-xs text-gray-500">{stat.contentCount} posts uploaded</p>
                    </div>
                  </div>
                                   <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-gray-50 rounded-lg">
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Views</p>
                       <p className="text-lg font-bold text-gray-900">{stat.views.toLocaleString()}</p>
                     </div>
                     <div 
                       className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 cursor-help"
                       title="Cálculo basado en $2.00 USD por cada 1,000 vistas (CPM Estimado)"
                     >
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Est. Value ($)</p>
                       <p className="text-lg font-bold text-emerald-700">
                         ${stat.estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </p>
                     </div>
                   </div>

                   {/* Payment Info */}
                   <div className="mt-4 pt-4 border-t border-gray-100">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Info</p>
                     <div className="flex items-center gap-2">
                       <div className="px-2 py-1 rounded-md bg-indigo-50 text-[10px] font-black text-indigo-700 uppercase">
                         {stat.paymentMethod || 'Not Set'}
                       </div>
                       <div className="text-xs text-gray-600 truncate font-mono bg-gray-50 px-2 py-1 rounded-md flex-1">
                         {stat.paymentId || '---'}
                       </div>
                     </div>
                   </div>
                </div>
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
                <button
                  onClick={() => setIsAddingUser(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add User</span>
                </button>
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
                    <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all">
                      Invite
                    </button>
                  </form>
                  <p className="mt-2 text-[10px] text-indigo-600">The user will be recognized by their email the next time they log in with Google.</p>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs border border-gray-200">
                              {(u.display_name || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{u.display_name || 'No name'}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                            u.role === 'manager' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={(profile?.role !== 'admin' && profile?.role !== 'manager') || u.id === user?.id}
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
      </main>
    </div>
  );
}

