import React from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Campaign, UserProfile } from '../../supabase';

interface PublicReviewHeaderProps {
  project: UserProfile | null;
  campaign: Campaign;
  progressPercentage: number;
  lang: 'en' | 'es';
  setLang: (val: 'en' | 'es') => void;
  filterCreatorId: string;
  filterPlatform: string;
  setFilters: (updates: Partial<{ platform: string; creator: string; section: 'content' | 'creators' | 'stats' }>) => void;
  translations: {
    clientReport: string;
    live: string;
  };
}

const PublicReviewHeader: React.FC<PublicReviewHeaderProps> = ({
  project,
  campaign,
  progressPercentage,
  lang,
  setLang,
  filterCreatorId,
  filterPlatform,
  setFilters,
  translations
}) => {
  return (
    <div className="relative bg-white/70 border-b border-gray-100 sticky top-0 z-50 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
          {(filterCreatorId !== 'all' || filterPlatform !== 'all') && (
            <button
              onClick={() => setFilters({ creator: 'all', platform: 'all', section: 'content' })}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 transition-all border border-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center gap-3 min-w-0">
            {project?.photo_url ? (
              <img src={project.photo_url} alt="" className="w-10 h-10 rounded-2xl object-cover ring-4 ring-indigo-50 flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-100">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="hidden sm:inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[9px] font-black uppercase tracking-widest">{translations.clientReport}</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">{translations.live}</span>
              </div>
              <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight truncate">
                {project?.display_name || campaign.name}
              </h1>
              {project && <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{campaign.name}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 p-0.5 rounded-xl border border-gray-200">
            {(['en', 'es'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === l ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >{l.toUpperCase()}</button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-1000 rounded-full" style={{ width: `${progressPercentage}%` }} />
            </div>
            <span className="text-[10px] font-black text-indigo-600">{progressPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicReviewHeader;
