import React from 'react';
import { Search } from 'lucide-react';
import CreatorCard from './CreatorCard';
import { CardSkeleton } from './Skeleton';

interface CreatorsTabProps {
  creatorStats: any[];
  searchTerm: string;
  setFilter: (key: string, value: string) => void;
  deletedUserIds: string[];
  users: any[];
  setManagingUser: (user: any) => void;
  setEditingAudienceUser: (user: any) => void;
  isLoading?: boolean;
}

const CreatorsTab = React.memo(({
  creatorStats,
  searchTerm,
  setFilter,
  deletedUserIds,
  users,
  setManagingUser,
  setEditingAudienceUser,
  isLoading
}: CreatorsTabProps) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
        <div className="relative flex-1 max-w-2xl group">
          <div className="absolute inset-0 bg-emerald-500/5 blur-2xl group-focus-within:bg-emerald-500/10 transition-all duration-700" />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition-all duration-500 relative z-10" />
          <input 
            type="text" 
            placeholder="Search_Agents_Database..." 
            className="w-full pl-16 pr-8 py-6 rounded-[2rem] glass-dark border border-white/5 text-lg font-black uppercase tracking-[0.2em] placeholder:text-slate-600 focus:border-emerald-500/30 focus:shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all outline-none relative z-10 text-white italic" 
            value={searchTerm} 
            onChange={e => setFilter('search', e.target.value)} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-10">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          creatorStats
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(c => !deletedUserIds.includes(c.creator_id))
            .map((c, i) => (
              <CreatorCard 
                key={c.creator_id} 
                creator={c} 
                index={i}
                userRole={users.find(u => u.id === c.creator_id)?.role}
                onViewProfile={() => setManagingUser(users.find(u => u.id === c.creator_id) || null)}
                onEditAudience={() => setEditingAudienceUser(users.find(u => u.id === c.creator_id) || null)} 
              />
            ))
        )}
      </div>
    </div>
  );
});

export default CreatorsTab;
