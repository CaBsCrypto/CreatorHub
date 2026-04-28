import React from 'react';
import { Briefcase, BarChart3 } from 'lucide-react';
import { UserProfile } from '../../supabase';

interface ClientsTabProps {
  users: UserProfile[];
  campaigns: any[];
  content: any[];
  PLATFORM_COLORS: Record<string, string>;
  setSelectedCampaignReport: (id: string | null) => void;
  info: (msg: string) => void;
}

const ClientsTab: React.FC<ClientsTabProps> = ({ 
  users, 
  campaigns, 
  content, 
  PLATFORM_COLORS, 
  setSelectedCampaignReport, 
  info 
}) => {
  const clients = users.filter(u => u.role === 'client');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entidad Cliente</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto Directo</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campañas Activas</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ecosistema</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Análisis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clients.map(client => {
              const clientCampaigns = campaigns.filter(c => c.client_id === client.id);
              const platforms = Array.from(new Set(
                content.filter(cnt => clientCampaigns.some(camp => camp.id === cnt.campaign_id))
                       .map(cnt => cnt.platform)
              ));
              
              return (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg overflow-hidden border border-indigo-100 shadow-sm">
                        {client.photo_url ? <img src={client.photo_url} alt="" className="w-full h-full object-cover" /> : client.display_name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 leading-tight text-base uppercase tracking-tight">{client.display_name || 'Sin nombre'}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {client.id.slice(0,8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-sm font-bold text-slate-500">{client.email}</td>
                  <td className="px-10 py-8">
                    <div className="flex flex-wrap gap-2">
                      {clientCampaigns.map(c => (
                        <span key={c.id} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest">
                          {c.name}
                        </span>
                      ))}
                      {clientCampaigns.length === 0 && <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">Sin Campañas</span>}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                     <div className="flex justify-center -space-x-3">
                       {platforms.map(p => (
                         <div key={p as string} className="w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-white text-[10px] font-black shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: PLATFORM_COLORS[p as string] || '#ccc' }}>
                           {(p as string).charAt(0).toUpperCase()}
                         </div>
                       ))}
                       {platforms.length === 0 && <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">—</span>}
                     </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => {
                        if (clientCampaigns[0]) {
                          setSelectedCampaignReport(clientCampaigns[0].id);
                        } else {
                          info("Este cliente aún no tiene campañas asignadas.");
                        }
                      }}
                      className="p-4 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-indigo-100 hover:shadow-lg active:scale-95"
                      title="Ver métricas de campaña"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="py-32 text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm">
                    <Briefcase className="h-10 w-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">No hay clientes invitados</h3>
                  <p className="text-sm text-slate-400 mt-2 font-medium">Invita a un cliente para que pueda acceder al panel de resultados.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsTab;
