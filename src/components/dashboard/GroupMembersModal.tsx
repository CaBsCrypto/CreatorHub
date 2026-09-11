import React from 'react';
import { X, UserCheck, Users } from 'lucide-react';
import { CreatorGroup, CreatorGroupMember, UserProfile } from '../../supabase';

interface GroupMembersModalProps {
  group: CreatorGroup | null;
  creators: UserProfile[];       // all active creators
  members: CreatorGroupMember[]; // all memberships (all groups)
  onToggleMember: (creatorId: string, isMember: boolean) => void; // parent handles optimistic update + async
  onClose: () => void;
}

const GroupMembersModal: React.FC<GroupMembersModalProps> = ({ group, creators, members, onToggleMember, onClose }) => {
  if (!group) return null;

  const memberIds = new Set(
    members.filter(m => m.group_id === group.id).map(m => m.creator_id)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <Users className="h-5 w-5 text-indigo-600" />
            Miembros de {group.name}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-50 text-slate-400 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
          Un creator puede pertenecer a varios grupos.
        </p>

        <div className="space-y-1.5">
          {creators.map(creator => {
            const isMember = memberIds.has(creator.id);
            return (
              <label
                key={creator.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  isMember
                    ? 'border-indigo-200 bg-indigo-50/60'
                    : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isMember}
                  onChange={() => onToggleMember(creator.id, isMember)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {creator.display_name || creator.email}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{creator.email}</p>
                </div>
                {isMember && <UserCheck className="h-4 w-4 text-indigo-500 flex-shrink-0" />}
              </label>
            );
          })}
        </div>

        <div className="pt-4">
          <div className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">
            {memberIds.size} {memberIds.size === 1 ? 'miembro' : 'miembros'} en {group.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
