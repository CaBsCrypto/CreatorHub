import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Platform {
  id: string;
  icon: LucideIcon;
  color: string;
  label: string;
}

interface PlatformSelectorProps {
  availablePlatforms: Platform[];
  selectedPlatform: string;
  onSelect: (id: string) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  availablePlatforms,
  selectedPlatform,
  onSelect
}) => {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
        Transmission Protocol
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {availablePlatforms.map((p) => {
          const isSelected = selectedPlatform === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-300 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${
                isSelected ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200 shadow-sm'
              }`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                isSelected ? 'text-indigo-600' : 'text-slate-500'
              }`}>
                {p.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformSelector;
