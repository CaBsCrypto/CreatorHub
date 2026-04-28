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
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="relative flex-1 max-w-2xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-all duration-300 relative z-10" />
          <input 
            type="text" 
            placeholder="Buscar creadores..." 
            className="w-full pl-16 pr-8 py-5 rounded-2xl bg-white border border-gray-200 text-base font-medium tracking-wide placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none relative z-10 text-slate-900 shadow-sm" 
            value={searchTerm} 
            onChange={e => setFilter('search', e.target.value)} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
