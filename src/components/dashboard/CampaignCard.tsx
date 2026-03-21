import React from 'react';
import { Target, Calendar, Trash2, Edit2, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Campaign } from '../../supabase';
import { format } from 'date-fns';

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
  index: number;
  totalViews?: number;
  totalPosts?: number;
  onViewReport?: (id: string, e: React.MouseEvent) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDelete, onClick, index, totalViews = 0, totalPosts = 0, onViewReport }) => {
  const isCompleted = campaign.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(campaign.id)}
      className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 overflow-hidden cursor-pointer"
    >
      {/* Decorative background */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
          }`}>
            {campaign.status}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(campaign.id);
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {campaign.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 min-h-[40px]">
          {campaign.description || 'Sin descripción proporcionada.'}
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Vistas Totales</span>
              <span className="text-xl font-black text-indigo-600">{totalViews.toLocaleString()}</span>
            </div>
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Contenidos</span>
              <span className="text-xl font-black text-emerald-600">{totalPosts}</span>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              {campaign.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : 'N/A'}
            </div>
            <div className="flex items-center gap-3">
              {onViewReport && (
                <button 
                  onClick={(e) => {
                    onViewReport(campaign.id, e);
                  }}
                  className="text-[10px] font-black text-rose-500 hover:text-white hover:bg-rose-500 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-rose-100 hover:border-transparent transition-all"
                >
                  Reporte CSV
                </button>
              )}
              <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">
                Ver Detalles
              </button>
            </div>
          </div>
        </div> {/* Closing div for space-y-4 */}
      </div>
    </motion.div>
  );
};

export default CampaignCard;
