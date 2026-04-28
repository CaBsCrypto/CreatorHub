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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <Search className="h-4 w-4 text-slate-400 ml-1 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar creadores..."
          className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
          value={searchTerm}
          onChange={e => setFilter('search', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
