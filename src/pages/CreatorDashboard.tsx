import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Plus, Youtube, Instagram, Link as LinkIcon, Twitter, Trash2, Edit2, X, ExternalLink } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed';
}

interface Content {
  id: string;
  campaignId: string;
  creatorId: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'x';
  url: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  uploadedAt: string;
  createdAt: string;
}

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [newContent, setNewContent] = useState({ campaignId: '', platform: 'youtube', url: '' });
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);

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
        <button
          onClick={() => { setIsUploading(true); setEditingContent(null); }}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="h-4 w-4" />
          Upload Content
        </button>
      </div>

      {(isUploading || editingContent) && (
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
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
                  <option value="" disabled>Select a campaign</option>
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {content.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg bg-white shadow flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {item.platform === 'youtube' && <Youtube className="h-6 w-6 text-red-600" />}
                    {item.platform === 'instagram' && <Instagram className="h-6 w-6 text-pink-600" />}
                    {item.platform === 'tiktok' && <LinkIcon className="h-6 w-6 text-black" />}
                    {item.platform === 'x' && <Twitter className="h-6 w-6 text-black" />}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        {campaigns.find(c => c.id === item.campaignId)?.name || 'Unknown Campaign'}
                      </dt>
                      <dd>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors" 
                          title={item.title || item.url}
                        >
                          {item.title || item.url}
                        </a>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-indigo-600"
                    title="Open original post"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button onClick={() => { setEditingContent(item); setIsUploading(false); }} className="text-gray-400 hover:text-indigo-600" title="Edit">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setContentToDelete(item.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 mt-auto">
              <div className="text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Views: {item.views?.toLocaleString() || 0}</span>
                  <span>Likes: {item.likes?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {content.length === 0 && !isUploading && !editingContent && (
          <div className="col-span-full text-center py-12">
            <p className="text-sm text-gray-500">No content uploaded yet. Click "Upload Content" to get started.</p>
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
