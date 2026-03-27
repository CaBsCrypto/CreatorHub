import { Target, Calendar, Trash2, Edit2, Play, CheckCircle2, Link, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Campaign } from '../../supabase';
import { format } from 'date-fns';

interface CampaignCardProps {
  campaign: Campaign;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onViewReport?: (id: string, e: React.MouseEvent) => void;
  onCopyLink?: (token: string, e: React.MouseEvent, type: 'review' | 'slug') => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  onDelete, 
  onEdit,
  onViewReport,
  onCopyLink
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-indigo-100 overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 flex gap-2">
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
            e.preventDefault();
            onDelete(campaign.id);
          }}
          className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
            campaign.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {campaign.status === 'active' ? 'Active' : 'Draft'}
          </span>
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {campaign.name}
        </h3>
        <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed">
          {campaign.description || 'Sin descripción'}
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8 p-1 sm:p-2 bg-gray-50/50 rounded-2xl border border-gray-100/50">
        <div className="flex -space-x-2">
          {/* Aquí podrían ir avatares de creadores si fuera necesario */}
        </div>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-2">
          {campaign.budget > 0 ? (
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Budget</span>
              <span className="text-sm font-bold text-gray-900">${campaign.budget.toLocaleString()} USDT</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 group/budget pointer-events-none">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sin presupuesto</span>
              <button className="text-[8px] font-black text-indigo-600 uppercase tracking-widest hover:underline pointer-events-auto">Configurar</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-[2rem] p-5 text-center transition-all group-hover:border-indigo-100 group-hover:shadow-lg group-hover:shadow-indigo-50/50">
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Vistas Totales</span>
          <span className="text-2xl font-black text-indigo-600 tabular-nums">
            {campaign.stats?.total_views?.toLocaleString() || 0}
          </span>
        </div>
        <div className="bg-white border border-gray-100 rounded-[2rem] p-5 text-center transition-all group-hover:border-indigo-100 group-hover:shadow-lg group-hover:shadow-indigo-50/50">
          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Contenidos</span>
          <span className="text-2xl font-black text-emerald-500 tabular-nums">
            {campaign.stats?.content_count || 0}
          </span>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {format(new Date(campaign.created_at), "MMM d, yyyy")}
          </span>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onViewReport && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                onViewReport(campaign.id, e);
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100 transition-all flex items-center justify-center"
            >
              CSV
            </button>
          )}
          
          {campaign.share_token && onCopyLink && (
            <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
              <button 
                onClick={(e) => onCopyLink(campaign.share_token!, e, 'review')}
                title="Copia el enlace seguro (UUID)"
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                <Link className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => onCopyLink(campaign.slug || '', e, 'slug')}
                title={campaign.slug ? "Copia el enlace bonito (Zap ⚡)" : "Edita la campaña para generar el Slug"}
                disabled={!campaign.slug}
                className={`p-2 rounded-lg transition-all ${
                  campaign.slug 
                    ? 'text-amber-500 hover:text-amber-600 hover:bg-white hover:shadow-sm' 
                    : 'text-gray-200 cursor-not-allowed'
                }`}
              >
                <Zap className={`h-4 w-4 ${campaign.slug ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}

          <button 
            onClick={() => onEdit(campaign.id)}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-100"
          >
            Ver Detalle
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CampaignCard;
