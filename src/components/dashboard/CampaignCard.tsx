import React from 'react';
import { Calendar, Trash2, Edit2, Link, Zap, StickyNote, ChevronDown, ChevronUp } from 'lucide-react';
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
  role?: 'admin' | 'creator';
  onClick?: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onViewReport?: (id: string, e: React.MouseEvent) => void;
  onCopyLink?: (token: string, e: React.MouseEvent, type: 'review' | 'slug') => void;
  onClearNote?: (id: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  totalViews = 0,
  totalPosts = 0,
  spent = 0,
  remaining = 0,
  isAssigned = false,
  role = 'admin',
  onDelete,
  onEdit,
  onClick,
  onViewReport,
  onCopyLink,
  onClearNote
}) => {
  const [showNotes, setShowNotes] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border ${
        isAssigned ? 'border-indigo-100 ring-1 ring-indigo-50' : 'border-gray-100'
      } hover:border-indigo-100 flex flex-col`}
      onClick={() => onClick?.(campaign.id)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Edit / Delete — aparecen en hover, top-right (Admin only) */}
      {role === 'admin' && (
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
      )}

      {/* Body */}
      <div className="flex flex-col flex-1 p-6">

        {/* Row 1: Status + ⚡ Slug pill */}
        <div className="flex items-center gap-2 mb-3 pr-16 flex-wrap">
          {/* Status badge */}
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${
            campaign.status === 'active'
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-gray-100 text-gray-400'
          }`}>
            {campaign.status === 'active' ? 'Active' : 'Draft'}
          </span>

          {/* ⚡ Pretty URL pill — siempre visible */}
          {onCopyLink && (
            campaign.slug ? (
              <button
                onClick={(e) => { e.stopPropagation(); onCopyLink(campaign.slug!, e, 'slug'); }}
                title={`Copiar Pretty URL: /${campaign.slug}`}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-wide transition-all flex-shrink-0"
              >
                <Zap className="h-3 w-3 fill-current" />
                {campaign.slug}
              </button>
            ) : (
              <span
                title="Sin slug — edita la campaña para añadir uno"
                className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-[9px] font-bold text-gray-300 uppercase tracking-wide flex-shrink-0"
              >
                <Zap className="h-3 w-3" />
                Sin slug
              </span>
            )
          )}
          {/* User Specific Assigned Badge */}
          {isAssigned && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 animate-in zoom-in duration-300">
              Tu Campaña
            </span>
          )}

          {/* 📝 Note pill if exists (Admin + Client only, NOT creators) */}
          {role === 'admin' && campaign.notes && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                showNotes 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              <StickyNote className="h-3 w-3" />
              Ver Notas
              {showNotes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
        </div>

        {/* Row 2: Date */}
        <div className="flex items-center gap-1.5 text-gray-300 mb-4">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className="text-[9px] font-bold uppercase tracking-wide whitespace-nowrap">
            {campaign.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : 'Sin fecha'}
          </span>
        </div>

        {/* Title + Description */}
        <h3 className="text-xl font-black text-gray-900 mb-1.5 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
          {campaign.name}
        </h3>
        <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed mb-5">
          {campaign.description || 'Sin descripción'}
        </p>

        {/* 📘 Expandable Notes Section */}
        <AnimatePresence>
          {role === 'admin' && showNotes && campaign.notes && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 20 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 relative group/note">
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {role === 'admin' && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(campaign.id); }}
                        className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onClearNote?.(campaign.id); }}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                        title="Eliminar nota"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                </div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <StickyNote className="h-3 w-3" /> Información Extra
                </h4>
                <div className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap break-words max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {campaign.notes}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats — tres filas horizontales (Admin) o dos (Creator) */}
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
          {role === 'admin' ? (
            <div className="flex items-center justify-between bg-sky-600 rounded-xl px-4 py-3 border border-sky-500 transition-colors">
              <span className="text-[9px] font-black text-sky-50 uppercase tracking-widest">Gasto Total</span>
              <span className="text-base font-black text-white tabular-nums">
                ${spent?.toLocaleString() || '0'}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-emerald-600 rounded-xl px-4 py-3 border border-emerald-500 transition-colors">
              <span className="text-[9px] font-black text-emerald-50/70 uppercase tracking-widest">Mis Ganancias</span>
              <span className="text-base font-black text-white tabular-nums">
                ${spent?.toLocaleString() || '0'}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">

          {/* Left: Reporte + UUID link */}
          <div className="flex items-center gap-1.5">
            {onViewReport && (
              <button
                onClick={(e) => { e.stopPropagation(); onViewReport(campaign.id, e); }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-500 text-[9px] font-black uppercase tracking-wide rounded-xl border border-rose-100 transition-all whitespace-nowrap"
              >
                Reporte
              </button>
            )}

            {campaign.share_token && onCopyLink && (
              <button
                onClick={(e) => { e.stopPropagation(); onCopyLink(campaign.share_token!, e, 'review'); }}
                title="Copiar link seguro (UUID)"
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              >
                <Link className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right: Ver Detalle / Entrar */}
          <button
            onClick={(e) => { e.stopPropagation(); role === 'admin' ? onEdit(campaign.id) : onClick?.(campaign.id); }}
            className={`px-4 py-2 text-white text-[9px] font-black uppercase tracking-wide rounded-xl transition-all shadow-md whitespace-nowrap ${
              role === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
            }`}
          >
            {role === 'admin' ? 'Ver Detalle' : 'Entrar'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignCard;
