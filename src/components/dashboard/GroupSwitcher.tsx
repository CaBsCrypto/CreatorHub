import React, { useState } from 'react';
import { Check, ChevronsUpDown, Layers } from 'lucide-react';
import { CreatorGroup } from '../../supabase';

interface GroupSwitcherProps {
  groups: CreatorGroup[];
  activeGroupId: string; // 'all' | group id
  onChange: (groupId: string) => void;
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COLOR_DOT: Record<string, string> = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  fuchsia: 'bg-fuchsia-500',
  amber: 'bg-amber-400',
  sky: 'bg-sky-400',
  rose: 'bg-rose-400'
};

const GroupSwitcher: React.FC<GroupSwitcherProps> = ({ groups, activeGroupId, onChange }) => {
  const [open, setOpen] = useState(false);

  const activeGroup = groups.find(g => g.id === activeGroupId);
  const label = activeGroupId === 'all'
    ? 'Todos los Grupos'
    : (activeGroup?.name || 'Grupo Desconocido');

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest shadow-sm",
          activeGroupId !== 'all'
            ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
            : "bg-white text-slate-700 border-gray-100 hover:bg-gray-50"
        )}
      >
        <Layers className="h-4 w-4" />
        <span className="max-w-[120px] truncate">{label}</span>
        <ChevronsUpDown className="h-3 w-3 opacity-50" />
      </button>

      {open && (
        <>
          {/* Overlay (simple dismiss) */}
          <div
            className="fixed inset-0 z-[90] bg-slate-900/10 backdrop-blur-[1px] animate-in fade-in duration-150"
            onClick={() => setOpen(false)}
          />

          {/* Menu Panel */}
          <div className={cn(
            "absolute right-0 top-full z-[100] mt-2 w-64 origin-top-right rounded-xl border border-gray-100 bg-white p-2 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
          )}>
            <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Filtrar Dashboard por Grupo
            </p>

            {/* All Groups Option */}
            <div
              onClick={() => handleSelect('all')}
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="h-4 w-4 text-slate-400" />
                <span className="truncate">Todos los Grupos</span>
              </div>
              {activeGroupId === 'all' && <Check className="h-4 w-4 text-indigo-600" />}
            </div>

            <div className="my-1 h-px bg-gray-100" />

            {/* Dynamic Group Options */}
            <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1">
              {groups.map(group => (
                <div
                  key={group.id}
                  onClick={() => handleSelect(group.id)}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {group.logo_emoji ? (
                      <span className="text-base">{group.logo_emoji}</span>
                    ) : (
                      <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", COLOR_DOT[group.color] || COLOR_DOT.indigo)} />
                    )}
                    <span className="truncate">{group.name}</span>
                  </div>
                  {activeGroupId === group.id && <Check className="h-4 w-4 text-indigo-600" />}
                </div>
              ))}
              {groups.length === 0 && (
                <p className="px-3 py-2 text-xs font-medium text-slate-400">Sin grupos definidos.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GroupSwitcher;