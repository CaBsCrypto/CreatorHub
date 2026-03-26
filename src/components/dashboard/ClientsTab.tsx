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
            <tr className="bg-gray-50/50">
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contacto</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Proyectos</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Redes</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Métricas</th>
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
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                        {client.photo_url ? <img src={client.photo_url} alt="" className="w-full h-full object-cover" /> : client.display_name?.charAt(0) || client.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 leading-tight">{client.display_name || 'Sin nombre'}</div>
                        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">ID: {client.id.slice(0,8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-gray-500">{client.email}</td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap gap-2">
                      {clientCampaigns.map(c => (
                        <span key={c.id} className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase">
                          {c.name}
                        </span>
                      ))}
                      {clientCampaigns.length === 0 && <span className="text-gray-300 text-xs italic">Sin campañas</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex -space-x-2">
                       {platforms.map(p => (
                         <div key={p as string} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: PLATFORM_COLORS[p as string] || '#ccc' }}>
                           {(p as string).charAt(0).toUpperCase()}
                         </div>
                       ))}
                       {platforms.length === 0 && <span className="text-gray-300 text-xs px-3">-</span>}
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => {
                        if (clientCampaigns[0]) {
                          setSelectedCampaignReport(clientCampaigns[0].id);
                        } else {
                          info("Este cliente aún no tiene campañas asignadas.");
                        }
                      }}
                      className="p-3 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
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
                <td colSpan={5} className="py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-gray-200" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">No hay clientes invitados</h3>
                  <p className="text-sm text-gray-400">Invita a un cliente para que pueda ver los resultados.</p>
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
