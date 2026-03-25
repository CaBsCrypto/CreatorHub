import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, Campaign, Content, UserProfile, Payment } from '../supabase';
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

export const useDashboardData = (role: 'admin' | 'creator', filters?: { platform?: string, campaign?: string, creator?: string }) => {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [deletedContent, setDeletedContent] = useState<Content[]>([]);
  const [deletedCampaigns, setDeletedCampaigns] = useState<Campaign[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [camps, conts, usrs] = await Promise.all([
        supabase.from('campaigns').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('content').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('users').select('*').is('deleted_at', null)
      ]);

      if (camps.error) throw camps.error;
      if (conts.error) throw conts.error;
      if (usrs.error) throw usrs.error;

      setCampaigns(camps.data as Campaign[]);
      setContent(conts.data as Content[]);
      setUsers(usrs.data as UserProfile[]);

      // Fetch payments and deleted items (admin-only)
      if (role === 'admin') {
        const [payRes, delCont, delCamp, delUsr] = await Promise.all([
          supabase.from('payments').select('*').order('paid_at', { ascending: false }),
          supabase.from('content').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false }),
          supabase.from('campaigns').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false }),
          supabase.from('users').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
        ]);

        if (payRes.data) setPayments(payRes.data as Payment[]);
        if (delCont.data) setDeletedContent(delCont.data as Content[]);
        if (delCamp.data) setDeletedCampaigns(delCamp.data as Campaign[]);
        if (delUsr.data) setDeletedUsers(delUsr.data as UserProfile[]);

        // Fetch audit logs for admins
        const { data: logs, error: logsError } = await supabase
          .from('audit_logs')
          .select(`
            *,
            admin:admin_id (
              display_name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (logsError) throw logsError;
        setAuditLogs(logs || []);
      }
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

  const filteredContent = useMemo(() => {
    let result = role === 'creator' ? content.filter(c => c.creator_id === user?.id) : content;
    
    if (filters) {
      // Improved defensive filtering
      if (filters.platform && filters.platform !== 'all' && filters.platform !== '') {
        const pFilter = filters.platform.toLowerCase().trim();
        result = result.filter(c => c.platform?.toLowerCase().trim() === pFilter);
      }
      if (filters.campaign && filters.campaign !== 'all' && filters.campaign !== '') {
        const targetId = String(filters.campaign);
        result = result.filter(c => String(c.campaign_id) === targetId);
      }
      if (filters.creator && filters.creator !== 'all' && filters.creator !== '') {
        if (filters.creator.startsWith('guest:')) {
          const gName = filters.creator.replace('guest:', '');
          result = result.filter(c => c.guest_name === gName);
        } else {
          const targetCreatorId = String(filters.creator);
          result = result.filter(c => String(c.creator_id) === targetCreatorId);
        }
      }
      
      console.log('DEBUG [useDashboardData] filters:', filters);
      console.log('DEBUG [useDashboardData] initial count:', role === 'creator' ? content.filter(c => c.creator_id === user?.id).length : content.length);
      console.log('DEBUG [useDashboardData] filtered count:', result.length);
    }
    
    
    return result;
  }, [content, role, user, filters]);

  const metrics = useMemo(() => {
    const totalViews = filteredContent.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalEngagement = filteredContent.reduce((acc, curr) => acc + (curr.likes || 0) + (curr.comments || 0), 0);
    const totalPosts = filteredContent.length;

    // Calculate month-over-month trends
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthContent = filteredContent.filter(c => {
      const d = c.uploaded_at ? new Date(c.uploaded_at) : new Date(c.created_at);
      return d >= startOfThisMonth;
    });
    const lastMonthContent = filteredContent.filter(c => {
      const d = c.uploaded_at ? new Date(c.uploaded_at) : new Date(c.created_at);
      return d >= startOfLastMonth && d < startOfThisMonth;
    });

    const thisMonthViews = thisMonthContent.reduce((s, c) => s + (c.views || 0), 0);
    const lastMonthViews = lastMonthContent.reduce((s, c) => s + (c.views || 0), 0);
    const thisMonthPosts = thisMonthContent.length;
    const lastMonthPosts = lastMonthContent.length;

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? { value: 100, isPositive: true } : null;
      const pct = Math.round(((current - previous) / previous) * 100);
      return { value: Math.abs(pct), isPositive: pct >= 0 };
    };

    return {
      totalViews,
      totalEngagement,
      totalPosts,
      activeCreators: users.filter(u => u.role === 'creator').length,
      roi: (totalViews / 1000) * 2.5,
      viewsTrend: calcTrend(thisMonthViews, lastMonthViews),
      postsTrend: calcTrend(thisMonthPosts, lastMonthPosts)
    };
  }, [filteredContent, users]);

  const campaignStats = useMemo(() => {
    return campaigns.map(campaign => {
      const campaignPayments = payments.filter(p => p.campaign_id === campaign.id);
      const spent = campaignPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);
      const remaining = (campaign.budget || 0) - spent;
      
      const campaignContent = content.filter(c => c.campaign_id === campaign.id);
      const views = campaignContent.reduce((acc, curr) => acc + (curr.views || 0), 0);
      
      return {
        ...campaign,
        spent,
        remaining,
        views,
        contentCount: campaignContent.length
      };
    });
  }, [campaigns, payments, content]);

  const creatorStats = useMemo(() => {
    const stats: Record<string, any> = {};
    const statsContent = role === 'admin' ? content : filteredContent;
    
    statsContent.forEach(c => {
      if (!stats[c.creator_id]) stats[c.creator_id] = { views: 0, engagement: 0, contentCount: 0, estimatedValue: 0 };
      const views = c.views || 0;
      stats[c.creator_id].views += views;
      stats[c.creator_id].engagement += (c.likes || 0) + (c.comments || 0);
      stats[c.creator_id].contentCount += 1;
      stats[c.creator_id].estimatedValue += (views / 1000) * 2.5;
    });

    return Object.entries(stats).map(([id, data]) => {
      const u = users.find(usr => usr.id === id);
      const totalPaid = payments.filter(p => p.creator_id === id).reduce((s, p) => s + Number(p.amount), 0);
      return {
        creator_id: id,
        name: (role === 'admin' && u?.admin_alias) ? u.admin_alias : (u?.display_name || u?.email || 'Unknown'),
        paymentMethod: u?.payment_method,
        paymentId: u?.payment_method === 'binance' ? u.binance_id : u?.wallet_address,
        rank: getAgencyRank(data.contentCount, data.views),
        totalPaid,
        ...data
      };
    }).sort((a, b) => b.views - a.views);
  }, [content, filteredContent, users, payments, role]);

  return {
    campaigns,
    content,
    users,
    payments,
    deletedContent,
    deletedCampaigns,
    deletedUsers,
    auditLogs,
    loading,
    metrics,
    creatorStats,
    campaignStats,
    refresh: fetchData,
    filteredContent
  };
};
