import React from 'react';
import { Search } from 'lucide-react';
import CreatorCard from './CreatorCard';

interface CreatorsTabProps {
  creatorStats: any[];
  searchTerm: string;
  setFilter: (key: string, value: string) => void;
  deletedUserIds: string[];
  users: any[];
  setManagingUser: (user: any) => void;
  setEditingAudienceUser: (user: any) => void;
}

const CreatorsTab: React.FC<CreatorsTabProps> = ({
  creatorStats,
  searchTerm,
  setFilter,
  deletedUserIds,
  users,
  setManagingUser,
  setEditingAudienceUser
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-lg group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar creadores..." 
            className="w-full pl-14 pr-6 py-4.5 rounded-[1.75rem] bg-white border border-slate-100/80 text-base font-medium placeholder:text-gray-300 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-200 transition-all shadow-sm shadow-slate-100/50 outline-none" 
            value={searchTerm} 
            onChange={e => setFilter('search', e.target.value)} 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {creatorStats
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
          ))}
      </div>
    </div>
  );
};

export default CreatorsTab;
