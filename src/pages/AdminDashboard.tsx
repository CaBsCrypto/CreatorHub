import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Plus, Download, RefreshCw, Sparkles, ExternalLink, LayoutDashboard, List, Users } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { GoogleGenAI } from '@google/genai';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'creators' | 'team'>('overview');
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const summaryData = content.map(c => ({
        platform: c.platform,
        views: c.views || 0,
        likes: c.likes || 0,
        comments: c.comments || 0
      }));

      const prompt = `Analyze the following social media content performance data for a marketing agency and provide a brief, actionable summary (max 3 paragraphs). Highlight which platform is performing best and suggest improvements. Data: ${JSON.stringify(summaryData)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiAnalysis(response.text || "No analysis generated.");
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

  const handleSort = (field: keyof Content) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefreshStats}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Stats
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`${
              activeTab === 'content'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
          >
            <List className="h-4 w-4" />
            Content Explorer
          </button>
          <button
            onClick={() => setActiveTab('creators')}
            className={`${
              activeTab === 'creators'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
          >
            <Users className="h-4 w-4" />
            Creators Analysis
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`${
              activeTab === 'team'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2`}
          >
            <Users className="h-4 w-4" />
            Team Management
          </button>
        </nav>
      </div>

      {isCreating && (
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <h2 className="text-lg font-semibold text-gray-900">Create New Campaign</h2>
          <form onSubmit={handleCreateCampaign} className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Campaign Name</label>
              <div className="mt-2">
                <input
                  type="text"
                  id="name"
                  required
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">Description</label>
              <div className="mt-2">
                <textarea
                  id="description"
                  rows={3}
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Campaigns</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{campaigns.length}</dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Content Pieces</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{content.length}</dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Views</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {content.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString()}
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Engagement</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {content.reduce((acc, curr) => acc + (curr.likes || 0) + (curr.comments || 0), 0).toLocaleString()}
              </dd>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Views by Platform</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">AI Performance Analysis</h2>
                <button
                  onClick={generateAiAnalysis}
                  disabled={isAnalyzing || content.length === 0}
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 disabled:opacity-50"
                >
                  <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                  {isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600">
                {aiAnalysis ? (
                  <div className="whitespace-pre-wrap">{aiAnalysis}</div>
                ) : (
                  <p className="italic text-gray-400">Click the button above to generate an AI-powered analysis of your content performance across all platforms.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Campaign</label>
              <select
                value={filterCampaign}
                onChange={(e) => setFilterCampaign(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Platform</label>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="all">All Platforms</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="x">X (Twitter)</option>
                <option value="coinmarketcap">CoinMarketCap</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Creator</label>
              <select
                value={filterCreator}
                onChange={(e) => setFilterCreator(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="all">All Creators</option>
                {users.filter(u => u.role === 'creator').map(u => (
                  <option key={u.uid} value={u.uid}>{u.displayName || u.email}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Content</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Creator</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Campaign</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('views')}>
                      Views {sortField === 'views' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('likes')}>
                      Likes {sortField === 'likes' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('comments')}>
                      Comments {sortField === 'comments' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('createdAt')}>
                      Date {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAndSortedContent.map((item) => {
                    const campaign = campaigns.find(c => c.id === item.campaignId);
                    const creator = users.find(u => u.uid === item.creatorId);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="font-medium text-gray-900 truncate max-w-[200px]" title={item.title || item.url}>
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 flex items-center gap-1">
                                {item.title || item.url}
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                              </a>
                            </div>
                          </div>
                          <div className="text-gray-500 text-xs mt-1 capitalize">{item.platform}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {creator?.displayName || creator?.email || 'Unknown'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {campaign?.name || 'Unknown'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                          {item.views?.toLocaleString() || 0}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.likes?.toLocaleString() || 0}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.comments?.toLocaleString() || 0}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.uploadedAt ? format(new Date(item.uploadedAt), 'MMM d, yyyy') : format(new Date(item.createdAt), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAndSortedContent.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-gray-500">
                        No content found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'creators' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creatorStats.map(stat => (
              <div key={stat.creatorId} className="bg-white overflow-hidden shadow-sm ring-1 ring-gray-900/5 rounded-xl">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                      {stat.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{stat.name}</h3>
                      <p className="text-sm text-gray-500">{stat.contentCount} posts</p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Views</dt>
                      <dd className="mt-1 text-xl font-semibold text-gray-900">{stat.views.toLocaleString()}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</dt>
                      <dd className="mt-1 text-xl font-semibold text-gray-900">{stat.engagement.toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            ))}
            {creatorStats.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl ring-1 ring-gray-900/5">
                No creator data available yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Team Management</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage your team members and their roles. 
                <br/>- <strong>Creators</strong> can upload content.
                <br/>- <strong>Managers</strong> can view all stats, campaigns, and content, but cannot change roles.
                <br/>- <strong>Admins</strong> have full access.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">User</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3">
                            {(u.displayName || u.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="font-medium text-gray-900">
                            {u.displayName || 'No Name'}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {u.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-700 ring-purple-700/10' :
                          u.role === 'manager' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                          'bg-green-50 text-green-700 ring-green-600/20'
                        }`}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                          disabled={profile?.role !== 'admin' || u.uid === user?.uid}
                          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:bg-gray-100"
                        >
                          <option value="creator">Creator</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

