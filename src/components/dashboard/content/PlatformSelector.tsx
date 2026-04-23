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
        Transmission Protocol
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {availablePlatforms.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-300 ${
              selectedPlatform === p.id
                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/5'
                : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <p.icon className={`h-4 w-4 mb-1.5 transition-colors ${selectedPlatform === p.id ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${selectedPlatform === p.id ? 'text-emerald-400' : 'text-slate-500'}`}>
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlatformSelector;
