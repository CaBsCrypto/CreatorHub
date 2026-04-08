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
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">
        Plataforma
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {availablePlatforms.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 ${
              selectedPlatform === p.id
                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
            }`}
          >
            <p.icon className={`h-5 w-5 mb-1.5 ${selectedPlatform === p.id ? 'text-indigo-600' : p.color}`} />
            <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedPlatform === p.id ? 'text-indigo-600' : 'text-slate-400'}`}>
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlatformSelector;
