import React from 'react';
import { Target, Calendar, Trash2, Edit2, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Campaign } from '../../supabase';
import { format } from 'date-fns';

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onClick: (id: string) => void;
  index: number;
  totalViews?: number;
  totalPosts?: number;
  spent?: number;
  remaining?: number;
  onViewReport?: (id: string, e: React.MouseEvent) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  onDelete, 
  onEdit,
  onClick, 
  index, 
  totalViews = 0, 
  totalPosts = 0, 
  spent = 0,
  remaining = 0,
  onViewReport 
}) => {
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
          <div className="flex flex-col gap-2">
            <div className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}>
              {campaign.status}
            </div>
            
            <div className="flex gap-2">
              {campaign.twitter_url && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100">
                  <span className="font-black">X</span> {campaign.twitter_url}
                </div>
              )}
              {campaign.contact_info && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 uppercase">
                  <span className="font-black">TG</span> {campaign.contact_info}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                onEdit(campaign.id);
              }}
              className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
            >
              <Edit2 className="h-4 w-4" />
            </button>
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
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {campaign.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 min-h-[40px]">
          {campaign.description || 'Sin descripción proporcionada.'}
        </p>

        <div className="space-y-4">
          {/* Budget row */}
          {campaign.budget ? (
            <div className="bg-indigo-50/30 p-4 rounded-2xl border border-indigo-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Presupuesto Real</span>
                <span className="text-xs font-black text-indigo-600 font-mono">${campaign.budget.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200/50 h-2 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full transition-all duration-1000 ${remaining < 0 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min(100, (spent / campaign.budget) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold">
                <div className="flex flex-col">
                  <span className="text-gray-400 uppercase tracking-tighter">Gastado</span>
                  <span className="text-gray-900 font-black">${spent.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-400 uppercase tracking-tighter">Disponible</span>
                  <span className={`font-black ${remaining < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    ${remaining.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between border-dashed">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sin Presupuesto</span>
               <button onClick={(e) => { e.stopPropagation(); onEdit(campaign.id); }} className="text-[8px] font-black text-indigo-600 uppercase hover:underline">Configurar</button>
            </div>
          )}

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
