import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Search, Check } from 'lucide-react';
import { Campaign } from '../../../supabase';

interface CampaignSelectorProps {
  campaigns: Campaign[];
  selectedCampaignId: string;
  onSelect: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const CampaignSelector: React.FC<CampaignSelectorProps> = ({
  campaigns,
  selectedCampaignId,
  onSelect,
  isOpen,
  setIsOpen,
  dropdownRef
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredCampaigns = React.useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    return campaigns.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [campaigns, searchQuery]);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Campaña</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50/30 py-2.5 px-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-left"
      >
        <span className={selectedCampaignId ? 'text-slate-900' : 'text-slate-400'}>
          {selectedCampaign?.name || 'Seleccionar...'}
        </span>
        <ExternalLink className={`h-4 w-4 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-[110] left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="p-2 border-b border-slate-50 flex items-center gap-2 sticky top-0 bg-white/80 backdrop-blur-md">
              <Search className="h-3.5 w-3.5 text-slate-400 ml-1.5" />
              <input
                type="text"
                autoFocus
                placeholder="Buscar campaña..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0 outline-none py-1"
              />
            </div>

            <div className="max-h-48 overflow-y-auto pt-1 pb-2">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map(c => {
                  const isSelected = selectedCampaignId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelect(c.id);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-indigo-50 text-indigo-600' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{c.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-slate-400 italic text-[11px]">
                  No se encontraron campañas
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input type="hidden" required value={selectedCampaignId} />
    </div>
  );
};

export default CampaignSelector;
