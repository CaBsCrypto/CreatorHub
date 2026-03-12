import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Youtube, Instagram, Twitter, Music2, Globe, ExternalLink, Edit2, Trash2, Plus, LogOut, Layout, Users, BarChart3, ChevronRight, X, Sparkles, Wallet } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed';
}

interface Content {
  id: string;
  url: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'x' | 'coinmarketcap';
  title?: string;
  thumbnail?: string;
  views: number;
  likes: number;
  comments: number;
  campaignId: string;
  creatorId: string;
  status: 'active' | 'archived';
  createdAt: any;
  uploadedAt?: any;
}

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [newContent, setNewContent] = useState({ campaignId: '', platform: 'youtube', url: '' });
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);

  // Payment Settings State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'binance' | 'wallet'>('binance');
  const [binanceId, setBinanceId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletNetwork, setWalletNetwork] = useState('BSC');
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const openPaymentModal = () => {
    setPaymentMethod(profile?.paymentMethod || 'binance');
    setBinanceId(profile?.binanceId || '');
    setWalletAddress(profile?.walletAddress || '');
    setWalletNetwork(profile?.walletNetwork || 'BSC');
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingPayment(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        paymentMethod,
        binanceId: paymentMethod === 'binance' ? binanceId : null,
        walletAddress: paymentMethod === 'wallet' ? walletAddress : null,
        walletNetwork: paymentMethod === 'wallet' ? walletNetwork : null,
      });
      setIsPaymentModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setIsSavingPayment(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const qCampaigns = query(collection(db, 'campaigns'), where('status', '==', 'active'));
    const unsubscribeCampaigns = onSnapshot(qCampaigns, (snapshot) => {
      const camps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
      setCampaigns(camps);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'campaigns'));

    const qContent = query(collection(db, 'content'), where('creatorId', '==', user.uid));
    const unsubscribeContent = onSnapshot(qContent, (snapshot) => {
      const conts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content));
      setContent(conts);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'content'));

    return () => {
      unsubscribeCampaigns();
      unsubscribeContent();
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
      await addDoc(collection(db, 'content'), {
        campaignId: newContent.campaignId,
        creatorId: user.uid,
        platform: newContent.platform,
        url: newContent.url,
        title: title,
        views: views,
        likes: likes,
        comments: comments,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      // Notify admin of new content
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: '📷 Nuevo Contenido Subido',
          html: `<p>Un creador ha subido nuevo contenido.</p>
                 <ul>
                   <li><strong>Creador:</strong> ${user.displayName || user.email}</li>
                   <li><strong>Plataforma:</strong> ${newContent.platform}</li>
                   <li><strong>Título:</strong> ${title}</li>
                   <li><strong>URL:</strong> <a href="${newContent.url}">${newContent.url}</a></li>
                 </ul>`
        })
      }).catch(err => console.error("Notification failed:", err));

      setIsUploading(false);
      setNewContent({ campaignId: '', platform: 'youtube', url: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'content');
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

      await updateDoc(doc(db, 'content', editingContent.id), {
        campaignId: editingContent.campaignId,
        platform: editingContent.platform,
        url: editingContent.url,
        title: title,
        views: views,
        likes: likes,
        comments: comments,
      });
      setEditingContent(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'content');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const confirmDelete = async () => {
    if (!contentToDelete) return;
    try {
      await deleteDoc(doc(db, 'content', contentToDelete));
      setContentToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'content');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Content</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={openPaymentModal}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <Wallet className="h-4 w-4 text-gray-500" />
            <span className="hidden sm:inline">Payment Info</span>
          </button>
          <button
            onClick={() => { setIsUploading(true); setEditingContent(null); }}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Upload
          </button>
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
                            paymentMethod === 'binance' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Binance Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wallet')}
                          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset transition-colors ${
                            paymentMethod === 'wallet' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Crypto Wallet
                        </button>
                      </div>
                    </div>

                    {paymentMethod === 'binance' ? (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label htmlFor="binanceId" className="block text-sm font-medium leading-6 text-gray-900">Binance Pay ID</label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id="binanceId"
                            required
                            value={binanceId}
                            onChange={(e) => setBinanceId(e.target.value)}
                            placeholder="Enter your Binance Pay ID"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                        <div>
                          <label htmlFor="walletNetwork" className="block text-sm font-medium leading-6 text-gray-900">Network</label>
                          <div className="mt-2">
                            <select
                              id="walletNetwork"
                              value={walletNetwork}
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
                          <label htmlFor="walletAddress" className="block text-sm font-medium leading-6 text-gray-900">Wallet Address</label>
                          <div className="mt-2">
                            <input
                              type="text"
                              id="walletAddress"
                              required
                              value={walletAddress}
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
                  value={editingContent ? editingContent.campaignId : newContent.campaignId}
                  onChange={(e) => editingContent 
                    ? setEditingContent({ ...editingContent, campaignId: e.target.value })
                    : setNewContent({ ...newContent, campaignId: e.target.value })}
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
                    {campaigns.find(c => c.id === item.campaignId)?.name || 'General'}
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
                <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido a CreatorHub!</h2>
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
