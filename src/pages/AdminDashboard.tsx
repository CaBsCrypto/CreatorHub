import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Plus, Download, RefreshCw, Sparkles, ExternalLink, LayoutDashboard, List, Users, Youtube, Instagram, Globe, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed';
  createdBy: string;
  createdAt: string;
}

interface Content {
  id: string;
  campaignId: string;
  creatorId: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'x' | 'coinmarketcap';
  url: string;
  title: string;
  thumbnail?: string;
  views: number;
  likes: number;
  comments: number;
  uploadedAt: string;
  createdAt: string;
}

interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
}

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'creators' | 'team' | 'calendar'>('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '' });

  // Filters for Content Explorer
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Content>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!user) return;

    const qCampaigns = query(collection(db, 'campaigns'));
    const unsubscribeCampaigns = onSnapshot(qCampaigns, (snapshot) => {
      const camps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
      setCampaigns(camps);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'campaigns'));

    const qContent = query(collection(db, 'content'));
    const unsubscribeContent = onSnapshot(qContent, (snapshot) => {
      const conts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content));
      setContent(conts);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'content'));

    const qUsers = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const usrs = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setUsers(usrs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    return () => {
      unsubscribeCampaigns();
      unsubscribeContent();
      unsubscribeUsers();
    };
  }, [user]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'campaigns'), {
        name: newCampaign.name,
        description: newCampaign.description,
        status: 'active',
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      });
      setIsCreating(false);
      setNewCampaign({ name: '', description: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'campaigns');
    }
  };

  const handleRoleChange = async (uid: string, newRole: string) => {
    if (profile?.role !== 'admin') {
      alert("Only administrators can change roles.");
      return;
    }
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
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
              await updateDoc(doc(db, 'content', item.id), {
                views: data.views ?? item.views,
                likes: data.likes ?? item.likes,
                comments: data.comments ?? item.comments,
                title: data.title ?? item.title
              });
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

      if (!response.ok) throw new Error("Backend AI call failed");
      const data = await response.json();
      setAiAnalysis(data.analysis || "No analysis generated.");
    } catch (error) {
      console.error("AI Analysis failed", error);
      alert("Failed to generate AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToCSV = () => {
    const data = content.map(c => {
      const campaign = campaigns.find(camp => camp.id === c.campaignId);
      const creator = users.find(u => u.uid === c.creatorId);
      return {
        'Campaign Name': campaign?.name || 'Unknown',
        'Creator': creator?.displayName || creator?.email || c.creatorId,
        'Platform': c.platform,
        'URL': c.url,
        'Title': c.title || '',
        'Views': c.views || 0,
        'Likes': c.likes || 0,
        'Comments': c.comments || 0,
        'Uploaded At': c.uploadedAt ? format(new Date(c.uploadedAt), 'yyyy-MM-dd') : '',
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
    { name: 'YouTube', views: content.filter(c => c.platform === 'youtube').reduce((acc, curr) => acc + (curr.views || 0), 0) },
    { name: 'Instagram', views: content.filter(c => c.platform === 'instagram').reduce((acc, curr) => acc + (curr.views || 0), 0) },
    { name: 'TikTok', views: content.filter(c => c.platform === 'tiktok').reduce((acc, curr) => acc + (curr.views || 0), 0) },
    { name: 'X', views: content.filter(c => c.platform === 'x').reduce((acc, curr) => acc + (curr.views || 0), 0) },
    { name: 'CoinMarketCap', views: content.filter(c => c.platform === 'coinmarketcap').reduce((acc, curr) => acc + (curr.views || 0), 0) },
  ];

  const filteredAndSortedContent = useMemo(() => {
    let result = [...content];

    if (filterCampaign !== 'all') {
      result = result.filter(c => c.campaignId === filterCampaign);
    }
    if (filterPlatform !== 'all') {
      result = result.filter(c => c.platform === filterPlatform);
    }
    if (filterCreator !== 'all') {
      result = result.filter(c => c.creatorId === filterCreator);
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
    const stats: Record<string, { views: number, engagement: number, contentCount: number }> = {};
    content.forEach(c => {
      if (!stats[c.creatorId]) {
        stats[c.creatorId] = { views: 0, engagement: 0, contentCount: 0 };
      }
      stats[c.creatorId].views += (c.views || 0);
      stats[c.creatorId].engagement += (c.likes || 0) + (c.comments || 0);
      stats[c.creatorId].contentCount += 1;
    });
    return Object.entries(stats).map(([creatorId, data]) => {
      const user = users.find(u => u.uid === creatorId);
      return {
        creatorId,
        name: user?.displayName || user?.email || creatorId,
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
    { name: 'Total Campaigns', value: campaigns.length, icon: List, onClick: () => setActiveTab('overview') }, // Remains on overview, maybe opens new campaign modal? Just overview for now.
    { name: 'Total Content Pieces', value: content.length, icon: Youtube, onClick: () => setActiveTab('content') },
    { 
      name: 'Total Creators', 
      value: new Set([...users.filter(u => u.role === 'creator').map(u => u.uid), ...content.map(c => c.creatorId)]).size, 
      icon: Users, 
      onClick: () => setActiveTab('creators') 
    },
    { name: 'Total Views', value: content.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString(), icon: Globe },
  ];

  const navigation = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
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
            {activeTab === 'overview' && (
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
                <div className="flex justify-end gap-3">
                  <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all">Save Campaign</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div 
                    key={stat.name} 
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
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Views by Platform</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="views" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Creators: Views vs Engagement</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={creatorChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }} 
                          itemStyle={{ fontSize: '13px' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                        <Area type="monotone" dataKey="engagement" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" />
                      </AreaChart>
                    </ResponsiveContainer>
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
                  <div className="prose prose-sm max-w-none text-gray-600 h-[260px] overflow-auto">
                    {aiAnalysis ? (
                      <div className="whitespace-pre-wrap leading-relaxed">{aiAnalysis}</div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                        <Sparkles className="h-8 w-8 text-indigo-200" />
                        <p className="text-gray-400 italic">No analysis yet. Click the button above to generate one.</p>
                      </div>
                    )}
                  </div>
                </div>
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
                    {users.filter(u => u.role === 'creator').map(u => <option key={u.uid} value={u.uid}>{u.displayName || u.email}</option>)}
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
                      const creator = users.find(u => u.uid === item.creatorId);
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
                          <td className="px-6 py-4 text-sm text-gray-600">{creator?.displayName || creator?.email}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.views?.toLocaleString()}</td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            L: {item.likes || 0} / C: {item.comments || 0}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{item.uploadedAt ? format(new Date(item.uploadedAt), 'MMM d, yyyy') : 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Cards */}
              <div className="lg:hidden space-y-4">
                {filteredAndSortedContent.map((item) => {
                  const creator = users.find(u => u.uid === item.creatorId);
                  return (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                      <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100 overflow-hidden">
                        {item.thumbnail ? <img src={item.thumbnail} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><Globe className="h-6 w-6 text-gray-200" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate text-sm">{item.title || item.url}</h4>
                        <p className="text-xs text-gray-500 mb-2">{creator?.displayName || creator?.email}</p>
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
                  const dayContent = content.filter(c => c.uploadedAt && isSameDay(new Date(c.uploadedAt), day));
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
                          const creator = users.find(u => u.uid === item.creatorId);
                          return (
                            <div key={item.id} className="text-[10px] bg-white border border-gray-100 shadow-sm p-1.5 rounded truncate flex items-center gap-1 group-hover:border-indigo-200 transition-colors" title={item.title || item.url}>
                              <span className="font-semibold text-gray-700 truncate">{creator?.displayName?.split(' ')[0] || 'User'}:</span>
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
                <div key={stat.creatorId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group hover:border-indigo-200 transition-all">
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
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Engagement</p>
                      <p className="text-lg font-bold text-gray-900">{stat.engagement.toLocaleString()}</p>
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
              </div>
              
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
                      <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs border border-gray-200">
                              {(u.displayName || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{u.displayName || 'No name'}</p>
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
                            onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                            disabled={profile?.role !== 'admin' || u.uid === user?.uid}
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

