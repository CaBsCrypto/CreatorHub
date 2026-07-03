import React from 'react';
import { motion } from 'framer-motion';
import { Award, X, ChevronRight, Globe, LayoutGrid, Users, PieChart, Trophy } from 'lucide-react';
import { Content, UserProfile } from '../../supabase';
import ReviewContentCard from './ReviewContentCard';

const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

interface PublicContentGridProps {
  activeSection: 'content' | 'creators' | 'stats';
  setActiveSection: (val: 'content' | 'creators' | 'stats') => void;
  filteredContent: Content[];
  users: UserProfile[];
  filterPlatform: string;
  setFilterPlatform: (val: string) => void;
  filterCreatorId: string;
  setFilterCreatorId: (val: string) => void;
  setFilters: (updates: any) => void;
  setSelectedImage: (val: string | null) => void;
  onCoupledClick?: (item: any) => void;
  setShowPlatformsModal: (val: boolean) => void;
  setShowCreatorRankingModal: (val: boolean) => void;
  lang: 'en' | 'es';
  translations: {
    publishedContent: string;
    creatorDirectory: string;
    anonymous: string;
    posts: string;
    noResults: string;
    allPlatforms: string;
    allCreators: string;
  };
}

const PublicContentGrid: React.FC<PublicContentGridProps> = ({
  activeSection,
  setActiveSection,
  filteredContent,
  users,
  filterPlatform,
  setFilterPlatform,
  filterCreatorId,
  setFilterCreatorId,
  setFilters,
  setSelectedImage,
  onCoupledClick,
  setShowPlatformsModal,
  setShowCreatorRankingModal,
  lang,
  translations
}) => {
  return (
    <div className={`lg:col-span-3 ${activeSection === 'stats' ? 'hidden lg:block' : 'block'}`}>
      {/* Mobile Nav Tabs */}
      <div className="lg:hidden flex items-center gap-2 mb-6">
        <div className="flex-1 flex items-center bg-white/5 border border-white/10 p-1 rounded-2xl">
          {[
            { id: 'content', label: lang === 'en' ? 'Feed' : 'Contenido', icon: LayoutGrid },
            { id: 'creators', label: lang === 'en' ? 'Creators' : 'Autores', icon: Users }
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeSection === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowPlatformsModal(true)}
          className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/50 shrink-0"
        >
          <PieChart className="h-5 w-5" />
        </button>
        <button
          onClick={() => setShowCreatorRankingModal(true)}
          className="w-12 h-12 flex items-center justify-center bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/50 shrink-0"
        >
          <Trophy className="h-5 w-5" />
        </button>
      </div>

      {/* Section Header + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-indigo-500" />
            {activeSection === 'content' ? translations.publishedContent : translations.creatorDirectory}
          </h3>
          {filterCreatorId !== 'all' && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[9px] font-black uppercase">
              {users.find(u => u.id === filterCreatorId)?.display_name || translations.anonymous}
              <button onClick={() => setFilters({ creator: 'all' })} className="hover:text-indigo-800"><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
          {filterPlatform !== 'all' && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[9px] font-black uppercase">
              {filterPlatform}
              <button onClick={() => setFilters({ platform: 'all' })} className="hover:text-indigo-800"><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-500 outline-none focus:border-indigo-400 transition-colors cursor-pointer shadow-sm"
          >
            <option value="all">{translations.allPlatforms}</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="x">X / Twitter</option>
            <option value="twitch">Stream</option>
            <option value="coinmarketcap">CMC</option>
          </select>
          <select value={filterCreatorId} onChange={e => setFilterCreatorId(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase text-gray-500 outline-none focus:border-indigo-400 transition-colors cursor-pointer shadow-sm"
          >
            <option value="all">{translations.allCreators}</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.display_name || translations.anonymous}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Creators Grid */}
      {activeSection === 'creators' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4">
          {users.map((u, i) => {
            const posts = filteredContent.filter(c => {
              if (u.id.startsWith('guest:')) {
                const normFilter = u.id.replace('guest:', '');
                return !c.creator_id && normalizeName(c.guest_name || '') === normFilter;
              }
              return c.creator_id === u.id;
            });
            const views = posts.reduce((s, c) => s + (c.views || 0), 0);
            const isFiltered = filterCreatorId === u.id;
            return (
              <motion.button
                key={u.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setFilters({ creator: isFiltered ? 'all' : u.id, section: 'content' })}
                className={`p-5 rounded-[1.75rem] border text-left group transition-all duration-300 ${
                  isFiltered
                    ? 'bg-indigo-50 border-indigo-200 shadow-md'
                    : 'bg-white border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-white font-black text-xl shadow-lg ${
                      !u.photo_url ? 'bg-indigo-600' : ''
                    }`}>
                      {u.photo_url
                        ? <img src={u.photo_url} alt={u.display_name || ''} className="w-full h-full object-cover" />
                        : (u.display_name || '?').charAt(0).toUpperCase()
                      }
                    </div>
                    {isFiltered && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                        <X className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-black text-slate-800 text-sm leading-tight">{u.display_name || translations.anonymous}</p>
                    {u.id.startsWith('guest:') && (
                      <span className="mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[7px] font-black uppercase tracking-widest leading-none border border-slate-200">
                        {lang === 'en' ? 'GUEST' : 'INVITADO'}
                      </span>
                    )}
                    <div className="flex items-center justify-center gap-2 mt-1.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{posts.length} {translations.posts}</span>
                      <span className="w-0.5 h-3 bg-gray-200 rounded-full" />
                      <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{views.toLocaleString()}</span>
                    </div>
                  </div>
                  <ChevronRight className={`h-3.5 w-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors ${isFiltered ? 'rotate-90' : ''}`} />
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : filteredContent.length > 0 ? (
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5 pb-12">
            {filteredContent.map((item, i) => (
              <ReviewContentCard
                key={item.id}
                item={item}
                creator={item.creator_id 
                  ? users.find(u => u.id === item.creator_id)
                  : item.guest_name
                  ? users.find(u => u.id === `guest:${normalizeName(item.guest_name)}`)
                  : undefined
                }
                index={i}
                onStreamClick={setSelectedImage}
                onCoupledClick={onCoupledClick}
                lang={lang}
                translations={{ anonymous: translations.anonymous }}
              />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center shadow-sm">
          <Globe className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{translations.noResults}</p>
        </div>
      )}
    </div>
  );
};

export default PublicContentGrid;
