import React from 'react';
import { Calendar, Trash2, Edit2, Link, Zap, StickyNote, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Campaign } from '../../supabase';
import { format } from 'date-fns';

interface CampaignCardProps {
  campaign: Campaign;
  totalViews?: number;
  totalPosts?: number;
  spent?: number;
  remaining?: number;
  isAssigned?: boolean;
  isPersonal?: boolean;
  role?: 'admin' | 'creator';
  onClick?: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onViewReport?: (id: string, e: React.MouseEvent) => void;
  onCopyLink?: (token: string, e: React.MouseEvent, type: 'review' | 'slug') => void;
  onClearNote?: (id: string) => void;
  onEditNotes?: (campaign: any) => void;
}

const CampaignCard = React.memo(({
  campaign,
  totalViews = 0,
  totalPosts = 0,
  spent = 0,
  remaining = 0,
  isAssigned = false,
  isPersonal = false,
  role = 'admin',
  onDelete,
  onEdit,
  onClick,
  onViewReport,
  onCopyLink,
  onClearNote,
  onEditNotes
}: CampaignCardProps) => {
  const [showNotes, setShowNotes] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border ${
        isPersonal
          ? 'border-red-500/30 bg-red-950/[0.005]'
          : isAssigned ? 'border-indigo-100' : 'border-gray-100'
      } hover:border-indigo-200 flex flex-col overflow-hidden`}
      onClick={() => onClick?.(campaign.id)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Edit / Delete Actions */}
      {role === 'admin' && (
        <div className="absolute top-4 right-4 flex gap-1.5 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(campaign.id); }}
            className="p-2 rounded-lg bg-white/90 text-slate-400 hover:text-indigo-600 border border-gray-100 hover:border-indigo-200 transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(campaign.id); }}
            className="p-2 rounded-lg bg-white/90 text-slate-400 hover:text-rose-500 border border-gray-100 hover:border-rose-200 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Body Content */}
      <div className="flex flex-col flex-1 p-6">

        {/* Row 1: Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pr-16">
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
            campaign.status === 'active'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
              : 'bg-gray-50 text-slate-400 border-gray-100'
          }`}>
            {campaign.status === 'active' ? '● Activa' : '○ Borrador'}
          </span>

          {isPersonal && (
            <span className="px-2.5 py-1 bg-red-650/10 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse">
              ★ Campaña Personal
            </span>
          )}

          {onCopyLink && campaign.slug && (
            <button
              onClick={(e) => { e.stopPropagation(); onCopyLink(campaign.slug!, e, 'slug'); }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-100 transition-colors"
            >
              <Zap className="h-2.5 w-2.5" />
              {campaign.slug}
            </button>
          )}

          {isAssigned && (
            <span className="px-2.5 py-1 bg-indigo-600 text-white border border-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
              Asignada
            </span>
          )}

          {role === 'admin' && campaign.notes && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                showNotes
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                  : 'bg-gray-50 text-slate-400 border-gray-100 hover:border-gray-200'
              }`}
            >
              <StickyNote className="h-2.5 w-2.5" />
              Notas
            </button>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-slate-400 mb-2">
          <Calendar className="h-3 w-3" />
          <span className="text-[9px] font-bold uppercase tracking-widest">
            {campaign.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : '—'}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-black text-slate-900 mb-1 leading-tight tracking-tight uppercase group-hover:text-indigo-600 transition-colors line-clamp-2">
          {campaign.name}
        </h3>
        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-6">
          {campaign.description || 'Sin descripción.'}
        </p>

        {/* Expandable Notes */}
        <AnimatePresence>
          {role === 'admin' && showNotes && campaign.notes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 relative">
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); onEditNotes?.(campaign); }} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><Maximize2 className="h-3 w-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); onClearNote?.(campaign.id); }} className="p-1 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="h-3 w-3" /></button>
                </div>
                <h4 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <StickyNote className="h-2.5 w-2.5" /> Notas Internas
                </h4>
                <div className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                  {campaign.notes}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metrics Rows */}
        <div className="mt-auto space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vistas</span>
            <span className="text-base font-black text-slate-900 tabular-nums">
              {totalViews.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contenido</span>
            <span className="text-base font-black text-slate-900 tabular-nums">
              {totalPosts}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {role === 'admin' ? 'Presupuesto' : 'Inversión'}
            </span>
            <span className="text-base font-black text-indigo-600 tabular-nums">
              ${spent?.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2">
          {onViewReport && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewReport(campaign.id, e); }}
              className="flex-1 px-3 py-2 bg-gray-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-100 hover:border-indigo-200 transition-all"
            >
              Reporte
            </button>
          )}

          {campaign.share_token && onCopyLink && (
            <button
              onClick={(e) => { e.stopPropagation(); onCopyLink(campaign.share_token!, e, 'review'); }}
              className="p-2 bg-gray-50 text-slate-400 hover:text-indigo-600 rounded-lg border border-gray-100 hover:border-indigo-200 transition-all"
              title="Copiar Link de Review"
            >
              <Link className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); role === 'admin' ? onEdit(campaign.id) : onClick?.(campaign.id); }}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 ${
              role === 'admin'
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
            }`}
          >
            Abrir
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default CampaignCard;
