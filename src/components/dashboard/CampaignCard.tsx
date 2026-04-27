import React from 'react';
import { Calendar, Trash2, Edit2, Link, Zap, StickyNote, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
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
  onEditNotes?: (campaign: any) => void;
}

const CampaignCard = React.memo(({
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
  onClearNote,
  onEditNotes
}: CampaignCardProps) => {
  const [showNotes, setShowNotes] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`group relative glass-dark rounded-[2.5rem] shadow-2xl transition-all duration-500 border ${
        isAssigned ? 'border-indigo-200' : 'border-slate-200'
      } hover:border-emerald-500/40 flex flex-col overflow-hidden`}
      onClick={() => onClick?.(campaign.id)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Decorative Glow */}
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-50 transition-all duration-1000" />

      {/* Edit / Delete Actions */}
      {role === 'admin' && (
        <div className="absolute top-6 right-6 flex gap-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(campaign.id); }}
            className="p-2.5 rounded-xl bg-white text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(campaign.id); }}
            className="p-2.5 rounded-xl bg-white text-slate-500 hover:text-rose-500 border border-slate-200 hover:border-rose-500/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Body Content */}
      <div className="flex flex-col flex-1 p-8">

        {/* Row 1: Badges */}
        <div className="flex items-center gap-3 mb-6 pr-20 flex-wrap">
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex-shrink-0 border ${
            campaign.status === 'active'
              ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
              : 'bg-white text-slate-500 border-slate-200'
          }`}>
            {campaign.status === 'active' ? 'Active_Node' : 'Draft_Node'}
          </span>

          {onCopyLink && campaign.slug && (
            <button
              onClick={(e) => { e.stopPropagation(); onCopyLink(campaign.slug!, e, 'slug'); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-800 border border-slate-200 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest transition-all"
            >
              <Zap className="h-3 w-3 text-indigo-600" />
              {campaign.slug}
            </button>
          )}

          {isAssigned && (
            <span className="px-4 py-1.5 bg-emerald-600 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 border border-white/20 animate-in zoom-in duration-500">
              Personal_Target
            </span>
          )}

          {role === 'admin' && campaign.notes && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                showNotes 
                  ? 'bg-white text-slate-950 border-white' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-white/20'
              }`}
            >
              <StickyNote className="h-3 w-3" />
              Protocol_Notes
            </button>
          )}
        </div>

        {/* Date Context */}
        <div className="flex items-center gap-2 text-slate-500 mb-4 italic">
          <Calendar className="h-3 w-3" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
            {campaign.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : 'NO_TIMESTAMP'}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-black text-white mb-3 leading-tight tracking-tighter uppercase group-hover:text-indigo-600 transition-colors line-clamp-2">
          {campaign.name}
        </h3>
        <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed mb-8 italic">
          {campaign.description || 'Null_Description_Protocol'}
        </p>

        {/* Expandable Notes */}
        <AnimatePresence>
          {role === 'admin' && showNotes && campaign.notes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-200 relative group/note shadow-inner">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onEditNotes?.(campaign); }} className="p-2 text-slate-600 hover:text-white transition-colors"><Maximize2 className="h-3.5 w-3.5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); onClearNote?.(campaign.id); }} className="p-2 text-slate-600 hover:text-rose-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-3 flex items-center gap-2 italic">
                  <StickyNote className="h-3.5 w-3.5" /> Internal_Directives
                </h4>
                <div className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap break-words max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {campaign.notes}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metrics Grid */}
        <div className="mt-auto space-y-3 mb-8">
          <div className="flex items-center justify-between bg-slate-50/30 rounded-2xl px-5 py-4 border border-slate-200 group-hover:border-indigo-200 transition-all duration-500">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Total_Impact</span>
            <span className="text-xl font-black text-white tabular-nums tracking-tighter">
              {totalViews.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between bg-slate-50/30 rounded-2xl px-5 py-4 border border-slate-200 group-hover:border-indigo-200 transition-all duration-500">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Content_Nodes</span>
            <span className="text-xl font-black text-indigo-600 tabular-nums tracking-tighter">
              {totalPosts}
            </span>
          </div>
          <div className={`flex items-center justify-between rounded-2xl px-5 py-4 border transition-all duration-500 ${
            role === 'admin' ? 'bg-emerald-600 border-white/20' : 'bg-white border-slate-200'
          }`}>
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${role === 'admin' ? 'text-white' : 'text-slate-500'}`}>
              {role === 'admin' ? 'Expenditure_Total' : 'Protocol_Yield'}
            </span>
            <span className="text-xl font-black text-white tabular-nums tracking-tighter">
              ${spent?.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {onViewReport && (
              <button
                onClick={(e) => { e.stopPropagation(); onViewReport(campaign.id, e); }}
                className="px-5 py-2.5 bg-white hover:bg-rose-600 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 hover:border-rose-500/30 transition-all shadow-xl"
              >
                Analytics
              </button>
            )}

            {campaign.share_token && onCopyLink && (
              <button
                onClick={(e) => { e.stopPropagation(); onCopyLink(campaign.share_token!, e, 'review'); }}
                className="p-3 bg-white text-slate-500 hover:text-indigo-600 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all shadow-xl"
              >
                <Link className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); role === 'admin' ? onEdit(campaign.id) : onClick?.(campaign.id); }}
            className={`flex-1 px-6 py-3 text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-2xl active:scale-95 ${
              role === 'admin' ? 'bg-white hover:bg-slate-200' : 'bg-indigo-600 hover:bg-emerald-400'
            }`}
          >
            {role === 'admin' ? 'Open_Node' : 'Initialize'}
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default CampaignCard;
