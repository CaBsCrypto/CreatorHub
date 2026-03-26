import React from 'react';
import { Search } from 'lucide-react';
import CreatorCard from './CreatorCard';

interface CreatorsTabProps {
  creatorStats: any[];
  searchTerm: string;
  setFilter: (key: string, value: any) => void;
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar creadores..." 
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
            value={searchTerm} 
            onChange={e => setFilter('search', e.target.value)} 
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
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
