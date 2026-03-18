import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, Campaign, Content, UserProfile } from '../supabase';
import { useAuth } from '../AuthContext';
import { useToast } from './useToast';
import { 
  Trophy, Zap, Target, Award, Shield, Sparkles, Flame, Rocket, Star,
  CheckCircle2, LucideIcon
} from 'lucide-react';

export interface Tier {
  name: string;
  level: number;
  minPosts: number;
  minViews: number;
  color: string;
  icon: LucideIcon;
  benefits: string[];
}

export const AGENCY_TIERS: Tier[] = [
  { name: 'Rookie Agent', level: 1, minPosts: 0, minViews: 0, color: 'from-violet-600 to-indigo-600', icon: Target, benefits: ['Acceso a la plataforma', 'Perfil básico'] },
  { name: 'Rising Star', level: 2, minPosts: 2, minViews: 5000, color: 'from-blue-500 to-cyan-500', icon: Rocket, benefits: ['Badge de Rising Star', 'Soporte prioritario'] },
  { name: 'Active Creator', level: 3, minPosts: 5, minViews: 15000, color: 'from-teal-500 to-emerald-600', icon: CheckCircle2, benefits: ['Dashboard avanzado', 'Estadísticas en tiempo real'] },
  { name: 'Pro Artist', level: 4, minPosts: 10, minViews: 30000, color: 'from-emerald-600 to-teal-700', icon: Zap, benefits: ['Colaboraciones premium', 'Acceso a eventos'] },
  { name: 'Elite Partner', level: 5, minPosts: 25, minViews: 75000, color: 'from-indigo-700 to-blue-800', icon: Award, benefits: ['Gestor de cuenta personal', 'Comisiones extra'] },
  { name: 'Viral Master', level: 6, minPosts: 50, minViews: 200000, color: 'from-fuchsia-600 to-rose-600', icon: Flame, benefits: ['Verificación de cuenta', 'Asesoramiento de contenido'] },
  { name: 'Iconic Legend', level: 7, minPosts: 100, minViews: 500000, color: 'from-rose-600 to-orange-600', icon: Trophy, benefits: ['Viajes para creadores', 'Merchandising exclusivo'] },
  { name: 'Umbra Titan', level: 8, minPosts: 250, minViews: 1000000, color: 'from-amber-400 via-orange-500 to-red-600', icon: Sparkles, benefits: ['Partner vitalicio', 'Participación en beneficios'] }
];

export const getAgencyRank = (posts: number, views: number) => {
  for (let i = AGENCY_TIERS.length - 1; i >= 0; i--) {
    if (posts >= AGENCY_TIERS[i].minPosts || views >= AGENCY_TIERS[i].minViews) return AGENCY_TIERS[i];
  }
  return AGENCY_TIERS[0];
};

export const useDashboardData = (role: 'admin' | 'creator') => {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [camps, conts, usrs] = await Promise.all([
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('content').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('*')
      ]);

      if (camps.error) throw camps.error;
      if (conts.error) throw conts.error;
      if (usrs.error) throw usrs.error;

      setCampaigns(camps.data as Campaign[]);
      setContent(conts.data as Content[]);
      setUsers(usrs.data as UserProfile[]);
    } catch (err: any) {
      console.error("Dashboard data fetch error:", err);
      toastError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (!user) return;
    fetchData();

    const channel = supabase.channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchData]);

  const metrics = useMemo(() => {
    // Filter content based on role if needed (though usually admin sees all and creator sees their own but dashboards often show global/personal context differently)
    const filteredContent = role === 'creator' ? content.filter(c => c.creator_id === user?.id) : content;
    
    const totalViews = filteredContent.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalEngagement = filteredContent.reduce((acc, curr) => acc + (curr.likes || 0) + (curr.comments || 0), 0);
    const totalPosts = filteredContent.length;
    
    return {
      totalViews,
      totalEngagement,
      totalPosts,
      activeCreators: users.filter(u => u.role === 'creator').length,
      roi: (totalViews / 1000) * 2.5 // Estimated $2.5 CPM
    };
  }, [content, users, user, role]);

  const creatorStats = useMemo(() => {
    const stats: Record<string, any> = {};
    content.forEach(c => {
      if (!stats[c.creator_id]) stats[c.creator_id] = { views: 0, engagement: 0, contentCount: 0, estimatedValue: 0 };
      const views = c.views || 0;
      stats[c.creator_id].views += views;
      stats[c.creator_id].engagement += (c.likes || 0) + (c.comments || 0);
      stats[c.creator_id].contentCount += 1;
      stats[c.creator_id].estimatedValue += (views / 1000) * 2.5;
    });

    return Object.entries(stats).map(([id, data]) => {
      const u = users.find(usr => usr.id === id);
      return {
        creator_id: id,
        name: u?.display_name || u?.email || 'Unknown',
        paymentMethod: u?.payment_method,
        paymentId: u?.payment_method === 'binance' ? u.binance_id : u?.wallet_address,
        rank: getAgencyRank(data.contentCount, data.views),
        ...data
      };
    }).sort((a, b) => b.views - a.views);
  }, [content, users]);

  return {
    campaigns,
    content,
    users,
    loading,
    metrics,
    creatorStats,
    refresh: fetchData
  };
};
