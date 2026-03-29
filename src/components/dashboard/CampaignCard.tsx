import React from 'react';
import { Calendar, Trash2, Edit2, Link, Zap, BarChart3 } from 'lucide-react';
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
      className="group relative bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-100 flex flex-col"
      onClick={() => onClick?.(campaign.id)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Edit / Delete — aparecen en hover, top-right */}
      <div className="absolute top-4 right-4 flex gap-1 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(campaign.id); }}
          className="p-2 rounded-xl text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(campaign.id); }}
          className="p-2 rounded-xl text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6">

        {/* Status + Date */}
        <div className="flex items-center justify-between mb-4 pr-16">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
            campaign.status === 'active'
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {campaign.status === 'active' ? 'Active' : 'Draft'}
          </span>
          <div className="flex items-center gap-1.5 text-gray-300">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-wide whitespace-nowrap">
              {format(new Date(campaign.created_at), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Title + Description */}
        <h3 className="text-xl font-black text-gray-900 mb-1.5 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
          {campaign.name}
        </h3>
        <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed mb-5">
          {campaign.description || 'Sin descripción'}
        </p>

        {/* Stats — dos filas horizontales */}
        <div className="mt-auto space-y-2 mb-5">
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 group-hover:border-indigo-50 transition-colors">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Vistas Totales</span>
            <span className="text-base font-black text-indigo-600 tabular-nums">
              {totalViews.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 group-hover:border-indigo-50 transition-colors">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contenidos</span>
            <span className="text-base font-black text-emerald-500 tabular-nums">
              {totalPosts}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">

          {/* Left: Reporte + Copy links */}
          <div className="flex items-center gap-1.5 min-w-0">
            {onViewReport && (
              <button
                onClick={(e) => { e.stopPropagation(); onViewReport(campaign.id, e); }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-500 text-[9px] font-black uppercase tracking-wide rounded-xl border border-rose-100 transition-all whitespace-nowrap flex-shrink-0"
              >
                Reporte
              </button>
            )}

            {campaign.share_token && onCopyLink && (
              <>
                {/* Link UUID */}
                <button
                  onClick={(e) => { e.stopPropagation(); onCopyLink(campaign.share_token!, e, 'review'); }}
                  title="Copiar link seguro (UUID)"
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all flex-shrink-0"
                >
                  <Link className="h-3.5 w-3.5" />
                </button>

                {/* Slug — Pretty URL ⚡ */}
                <button
                  onClick={(e) => { e.stopPropagation(); if (campaign.slug) onCopyLink(campaign.slug, e, 'slug'); }}
                  title={campaign.slug ? `Copiar Pretty URL: /${campaign.slug}` : 'Sin slug — edita la campaña para añadir uno'}
                  disabled={!campaign.slug}
                  className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                    campaign.slug
                      ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Zap className={`h-3.5 w-3.5 ${campaign.slug ? 'fill-current' : ''}`} />
                </button>
              </>
            )}
          </div>

          {/* Right: Ver Detalle */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(campaign.id); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-wide rounded-xl transition-all shadow-md shadow-indigo-100 whitespace-nowrap flex-shrink-0"
          >
            Ver Detalle
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignCard;
