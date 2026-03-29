import React from 'react';
import { Target, Calendar, Trash2, Edit2, Link, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Campaign } from '../../supabase';
import { format } from 'date-fns';

interface CampaignCardProps {
  campaign: Campaign;
  totalViews?: number;
  totalPosts?: number;
  spent?: number;
  remaining?: number;
  onClick?: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onViewReport?: (id: string, e: React.MouseEvent) => void;
  onCopyLink?: (token: string, e: React.MouseEvent, type: 'review' | 'slug') => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  totalViews = 0,
  totalPosts = 0,
  onDelete,
  onEdit,
  onClick,
  onViewReport,
  onCopyLink
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-100 overflow-hidden"
      onClick={() => onClick?.(campaign.id)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Upper Actions */}
      <div className="absolute top-0 right-0 p-6 flex gap-2">
        <button 
          onClick={(e) => { e.preventDefault(); onEdit(campaign.id); }}
          className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); onDelete(campaign.id); }}
          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Header with Status & Date */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
              campaign.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {campaign.status === 'active' ? 'Active' : 'Draft'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">
              {format(new Date(campaign.created_at), "MMM d, yyyy")}
            </span>
          </div>
        </div>
        
        <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {campaign.name}
        </h3>
        <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed">
          {campaign.description || 'Sin descripción'}
        </p>
      </div>

      {/* Stats Area */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-5 text-center transition-all group-hover:bg-white group-hover:border-indigo-100 group-hover:shadow-lg group-hover:shadow-indigo-50/50">
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Vistas Totales</span>
          <span className="text-2xl font-black text-indigo-600 tabular-nums">
            {totalViews.toLocaleString()}
          </span>
        </div>
        <div className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-5 text-center transition-all group-hover:bg-white group-hover:border-indigo-100 group-hover:shadow-lg group-hover:shadow-indigo-50/50">
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Contenidos</span>
          <span className="text-2xl font-black text-emerald-500 tabular-nums">
            {totalPosts}
          </span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="pt-6 border-t border-gray-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {onViewReport && (
            <button
              onClick={(e) => { e.preventDefault(); onViewReport(campaign.id, e); }}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100 transition-all"
            >
              Reporte
            </button>
          )}
          
          {campaign.share_token && onCopyLink && (
            <div className="flex items-center gap-1.5 p-1 bg-gray-50/80 rounded-xl border border-gray-100">
              <button 
                onClick={(e) => onCopyLink(campaign.share_token!, e, 'review')}
                title="ID Seguro (UUID)"
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                <Link className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => onCopyLink(campaign.slug || '', e, 'slug')}
                title={campaign.slug ? "Pretty URL (Rayo ⚡)" : "Edita para generar Slug"}
                disabled={!campaign.slug}
                className={`p-2 rounded-lg transition-all ${
                  campaign.slug ? 'text-amber-500 hover:text-amber-600 hover:bg-white hover:shadow-sm' : 'text-gray-200 cursor-not-allowed'
                }`}
              >
                <Zap className={`h-4 w-4 ${campaign.slug ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={() => onEdit(campaign.id)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-100 flex-shrink-0"
        >
          Ver Detalle
        </button>
      </div>
    </motion.div>
  );
};

export default CampaignCard;
