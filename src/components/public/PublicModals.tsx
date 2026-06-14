import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, StickyNote, Eye } from 'lucide-react';
import { Content, UserProfile, Campaign } from '../../supabase';
import { getProxiedUrl } from '../../utils/urlHelpers';
import { getPlatformIcon, getPlatformColor } from '../../utils/platformUtils';

interface PublicModalsProps {
  selectedImage: string | null;
  setSelectedImage: (val: string | null) => void;
  showPlatformsModal: boolean;
  setShowPlatformsModal: (val: boolean) => void;
  showTop5Modal: boolean;
  setShowTop5Modal: (val: boolean) => void;
  showNotesModal: boolean;
  setShowNotesModal: (val: boolean) => void;
  stats: {
    platforms: Record<string, number>;
    platformStats?: Record<string, { views: number; likes: number; comments: number }>;
  } | null;
  filterPlatform: string;
  setFilters: (updates: any) => void;
  rankingContent: Content[];
  users: UserProfile[];
  campaign: Campaign | null;
  modalLimit: '5' | '10' | 'all';
  setModalLimit: (val: '5' | '10' | 'all') => void;
  lang: 'en' | 'es';
  translations: {
    platformDistribution: string;
    top5Content: string;
    additionalInfo: string;
    anonymous: string;
    close: string;
    allContent: string;
  };
}

const PublicModals: React.FC<PublicModalsProps> = ({
  selectedImage, setSelectedImage,
  showPlatformsModal, setShowPlatformsModal,
  showTop5Modal, setShowTop5Modal,
  showNotesModal, setShowNotesModal,
  stats, filterPlatform, setFilters,
  rankingContent, users, campaign,
  modalLimit, setModalLimit,
  lang, translations
}) => {
  const formatCompact = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <>
      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full rounded-[2rem] overflow-hidden shadow-2xl z-10"
              onClick={e => e.stopPropagation()}
            >
              <img src={getProxiedUrl(selectedImage, 'https://cdn-icons-png.flaticon.com/512/174/174855.png')} alt="Preview" className="w-full h-auto max-h-[85vh] object-contain" />
              <button onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platforms Modal (Mobile) */}
      <AnimatePresence>
        {showPlatformsModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPlatformsModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="relative w-full max-w-lg bg-white border-t border-gray-100 rounded-t-[2.5rem] p-6 shadow-2xl"
            >
              <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{translations.platformDistribution}</h3>
                <button onClick={() => setShowPlatformsModal(false)} className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {Object.entries(stats?.platforms || {}).map(([platform, count]) => {
                  const lowerPlatform = platform.toLowerCase();
                  const pStats = stats?.platformStats?.[lowerPlatform];
                  return (
                    <button key={platform}
                      onClick={() => { setFilters({ platform, section: 'content' }); setShowPlatformsModal(false); }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-95 ${
                        filterPlatform === lowerPlatform
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100'
                          : 'bg-white border-gray-100 hover:border-indigo-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 text-left">
                        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${filterPlatform === lowerPlatform ? 'bg-white/20 text-white' : getPlatformColor(platform)}`}>
                          {getPlatformIcon(platform, 'h-4 w-4')}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`font-black capitalize leading-tight ${filterPlatform === lowerPlatform ? 'text-white' : 'text-slate-700'}`}>
                            {lowerPlatform === 'coinmarketcap' ? 'CMC' : lowerPlatform === 'twitch' ? 'Stream' : platform}
                          </span>
                          <span className={`text-[9px] font-bold mt-0.5 whitespace-nowrap truncate ${
                            filterPlatform === lowerPlatform ? 'text-white/80' : 'text-slate-400'
                          }`}>
                            {count} {count === 1 ? 'post' : 'posts'} • {pStats ? formatCompact(pStats.likes) : '0'} likes
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col text-right shrink-0">
                        <span className={`text-base font-black leading-none ${filterPlatform === lowerPlatform ? 'text-white' : 'text-slate-700'}`}>
                          {pStats ? formatCompact(pStats.views) : '0'}
                        </span>
                        <span className={`text-[7px] font-black mt-1 uppercase tracking-wider leading-none ${filterPlatform === lowerPlatform ? 'text-white/70' : 'text-slate-400'}`}>
                          views
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setShowPlatformsModal(false)}
                className="w-full mt-5 py-4 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-gray-100"
              >
                {translations.close}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top 5 Modal */}
      <AnimatePresence>
        {showTop5Modal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowTop5Modal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{translations.top5Content}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={modalLimit}
                    onChange={(e: any) => setModalLimit(e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase text-gray-500 outline-none focus:border-indigo-400 transition-colors cursor-pointer"
                  >
                    <option value="5">Top 5</option>
                    <option value="10">Top 10</option>
                    <option value="all">{translations.allContent}</option>
                  </select>
                  <button onClick={() => setShowTop5Modal(false)} className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                {rankingContent.map((item, index) => {
                  const creator = users.find(u => u.id === item.creator_id);
                  const isStream = item.platform === 'twitch';
                  return (
                    <a
                      key={item.id || index}
                      href={isStream ? '#' : item.url}
                      target={isStream ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all group"
                    >
                      <div className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-lg font-black text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate mb-1">{item.title || (isStream ? `Stream · ${new Date(item.uploaded_at || item.created_at).toLocaleDateString()}` : '—')}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-500">{creator?.display_name || translations.anonymous}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-[10px] font-black text-indigo-600 flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {(item.views || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors text-gray-400">
                         {getPlatformIcon(item.platform || '', 'h-4 w-4')}
                      </div>
                    </a>
                  )
                })}
              </div>
              <button onClick={() => setShowTop5Modal(false)}
                className="w-full mt-6 py-4 bg-gray-50 border border-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-gray-100"
              >
                {translations.close}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {showNotesModal && campaign?.notes && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNotesModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <StickyNote className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{translations.additionalInfo}</h3>
                </div>
                <button onClick={() => setShowNotesModal(false)} className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                <div className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed whitespace-pre-wrap break-words border-l-4 border-indigo-100 pl-6 py-1">
                  {campaign.notes}
                </div>
              </div>
              <button onClick={() => setShowNotesModal(false)}
                className="w-full mt-6 py-4 bg-gray-50 border border-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-gray-100"
              >
                {translations.close}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicModals;
