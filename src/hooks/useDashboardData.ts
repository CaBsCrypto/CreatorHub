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

function aggregateContentItems(filteredItems: Content[], allItems: Content[]): Content[] {
  const allGroups = new Map<string, Content[]>();
  allItems.forEach(item => {
    const groupId = item.parent_id || item.id;
    if (!allGroups.has(groupId)) {
      allGroups.set(groupId, []);
    }
    allGroups.get(groupId)!.push(item);
  });

  const matchedGroupIds = new Set<string>();
  filteredItems.forEach(item => {
    const groupId = item.parent_id || item.id;
    matchedGroupIds.add(groupId);
  });

  const result: Content[] = [];
  
  matchedGroupIds.forEach(groupId => {
    const groupMembers = allGroups.get(groupId) || [];
    const filteredGroupMembers = groupMembers.filter(m => filteredItems.some(f => f.id === m.id));
    if (filteredGroupMembers.length === 0) return;
    
    const masterInFiltered = filteredGroupMembers.find(m => m.id === groupId);
    const representative = masterInFiltered || filteredGroupMembers[0];
    
    const totalViews = groupMembers.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalLikes = groupMembers.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const totalComments = groupMembers.reduce((acc, curr) => acc + (curr.comments || 0), 0);
    const totalUniqueViewers = groupMembers.reduce((acc, curr) => acc + (curr.unique_viewers || 0), 0);
    const totalPeekViewers = groupMembers.reduce((acc, curr) => acc + (curr.peek_viewers || 0), 0);
    const totalSharesCount = groupMembers.reduce((acc, curr) => acc + (curr.shares_count || 0), 0);
    const totalFollowers = groupMembers.reduce((acc, curr) => acc + (curr.followers || 0), 0);
    const totalNewSubscriptions = groupMembers.reduce((acc, curr) => acc + (curr.new_subscriptions || 0), 0);
    
    const otherPlatforms = groupMembers
      .filter(m => m.id !== representative.id)
      .map(m => m.platform);
    const uniqueOtherPlatforms = [...new Set(otherPlatforms)];

    result.push({
      ...representative,
      is_repost: false, // Ensure it is treated as master since it represents the group
      views: totalViews,
      likes: totalLikes,
      comments: totalComments,
      unique_viewers: totalUniqueViewers,
      peek_viewers: totalPeekViewers,
      shares_count: totalSharesCount,
      followers: totalFollowers,
      new_subscriptions: totalNewSubscriptions,
      coupledPlatforms: uniqueOtherPlatforms
    } as any);
  });

  return result.sort((a, b) => (b.views || 0) - (a.views || 0));
}

export const useDashboardData = (role: 'admin' | 'creator', filters?: { platform?: string, campaign?: string, creator?: string, showOnlyZeroViews?: boolean }) => {
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
  const [assignedCampaignIds, setAssignedCampaignIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [conts, usrs] = await Promise.all([
        supabase.from('content').select('*').is('deleted_at', null).order('created_at', { ascending: false }).limit(1000),
        supabase.from('users').select('*').is('deleted_at', null)
      ]);

      // Fetch all active campaigns for everyone (Admin and Creator)
      const camps = await supabase
        .from('campaigns')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Fetch all campaign creator assignments to determine who is assigned to which campaign
      const { data: allAssignments, error: assignmentsErr } = await supabase
        .from('campaign_creators')
        .select('campaign_id, creator_id');

      if (camps.error) throw camps.error;
      if (conts.error) throw conts.error;
      if (usrs.error) throw usrs.error;
      if (assignmentsErr) throw assignmentsErr;

      const assignmentList = allAssignments || [];

      // Find Cabs user profile
      const cabsUser = (usrs.data || []).find(u => u.email === 'cabscryptocontacto@gmail.com');
      const cabsUserId = cabsUser?.id;

      // Group creator IDs by campaign_id
      const creatorsByCampaign = new Map<string, Set<string>>();
      assignmentList.forEach(a => {
        if (!creatorsByCampaign.has(a.campaign_id)) {
          creatorsByCampaign.set(a.campaign_id, new Set());
        }
        creatorsByCampaign.get(a.campaign_id)!.add(a.creator_id);
      });

      // Also parse content to see if other creators have uploaded to this campaign
      const rawContent = conts.data || [];
      const contentByCampaign = new Map<string, Set<string>>();
      rawContent.forEach(c => {
        if (c.creator_id) {
          if (!contentByCampaign.has(c.campaign_id)) {
            contentByCampaign.set(c.campaign_id, new Set());
          }
          contentByCampaign.get(c.campaign_id)!.add(c.creator_id);
        }
      });

      if (role === 'creator' && user?.id) {
        setAssignedCampaignIds(assignmentList.filter(a => a.creator_id === user.id).map(a => a.campaign_id));
      }

      // --- CAMPAIGN PRIVACY FILTERING ---
      // A campaign is private to Cabs if:
      // 1. Cabs is the ONLY active creator (assigned or who uploaded content).
      // 2. OR if it has NO active creators and client_id is null.
      // All other campaigns (including those with only ONE creator that is NOT Cabs) remain visible.
      const isCabs = user?.email === 'cabscryptocontacto@gmail.com';
      const rawCampaigns = camps.data || [];
      
      const visibleCampaigns = isCabs ? rawCampaigns : rawCampaigns.filter(campaign => {
        const assignedCreators = creatorsByCampaign.get(campaign.id) || new Set();
        const contentCreators = contentByCampaign.get(campaign.id) || new Set();
        
        // Merge assigned and content creators to get all active creators on this campaign
        const allActiveCreators = new Set([...assignedCreators, ...contentCreators]);
        
        const isOnlyCabs = allActiveCreators.size === 1 && cabsUserId && allActiveCreators.has(cabsUserId);
        const isEmptyAndPersonal = allActiveCreators.size === 0 && campaign.client_id === null;

        // Hide ONLY if it's only Cabs or completely empty/personal, AND show_to_all is not true
        if ((isOnlyCabs || isEmptyAndPersonal) && !campaign.show_to_all) {
          return false; // Hide from other admins
        }
        return true;
      });
      
      const visibleCampaignIds = new Set(visibleCampaigns.map(c => c.id));

      setCampaigns(visibleCampaigns);
      
      // Filter content to only include items belonging to visible campaigns
      const visibleContent = rawContent.filter(c => visibleCampaignIds.has(c.campaign_id));

      // Normalize: 'stream' → 'twitch' para que todos los checks existentes funcionen
      setContent(visibleContent.map(c => {
        const platform = (c.platform === 'stream' ? 'twitch' : c.platform) as Content['platform'];
        let views = c.views || 0;
        
        // Normalize views for Discord/BaseApp/Streams where views might be 0 but we have other metrics
        if (views === 0 && (platform === 'discord' || platform === 'baseapp' || platform === 'twitch')) {
          views = Math.max(c.unique_viewers || 0, c.peek_viewers || 0);
        }

        return {
          ...c,
          platform,
          views
        };
      }));
      setUsers(usrs.data || []);

      // Fetch payments (admin-only)
      if (role === 'admin') {
        const [payRes, delCont, delCamp, delUsr] = await Promise.all([
          supabase.from('payments').select('*').order('paid_at', { ascending: false }),
          supabase.from('content').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false }),
          supabase.from('campaigns').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false }),
          supabase.from('users').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
        ]);

        // Filter payments to only include visible campaigns
        const rawPayments = payRes.data || [];
        setPayments(isCabs ? rawPayments : rawPayments.filter(p => !p.campaign_id || visibleCampaignIds.has(p.campaign_id)));
        
        // Filter deleted items
        const rawDelCont = delCont.data || [];
        const rawDelCamp = delCamp.data || [];
        setDeletedContent(isCabs ? rawDelCont : rawDelCont.filter(c => visibleCampaignIds.has(c.campaign_id)));
        setDeletedCampaigns(isCabs ? rawDelCamp : rawDelCamp.filter(c => visibleCampaignIds.has(c.id)));
        setDeletedUsers(delUsr.data || []);

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
      } else {
        // Fetch only MY payments if I am a creator
        const { data: myPayments } = await supabase
          .from('payments')
          .select('*')
          .eq('creator_id', user?.id)
          .order('paid_at', { ascending: false });
        
        if (myPayments) {
          const paymentsFiltered = isCabs ? myPayments : (myPayments as Payment[]).filter(p => !p.campaign_id || visibleCampaignIds.has(p.campaign_id));
          setPayments(paymentsFiltered);
        }
      }
    } catch (err: any) {
      console.error("Dashboard data fetch error:", err);
      toastError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  }, [role, toastError]);

  useEffect(() => {
    if (!user) return;
    fetchData();

    let debounceTimer: ReturnType<typeof setTimeout>;

    const handleRealtimeUpdate = () => {
      // Debounce: wait 3 seconds after the last realtime event before fetching data
      // This prevents the UI from freezing and API spam when scrapers update bulk rows
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchData();
      }, 3000);
    };

    const channel = supabase.channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public' }, handleRealtimeUpdate)
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [user, fetchData]);

  const filteredContent = useMemo(() => {
    let result = role === 'creator' ? content.filter(c => c.creator_id === user?.id) : content;
    
    if (filters) {
      // Improved defensive filtering
      if (filters.platform && filters.platform !== 'all' && filters.platform !== '') {
        const pFilter = filters.platform.toLowerCase().trim();
        if (pFilter === 'stream') {
          // "Streams" filter: atrapa 'stream' literal, 'twitch' y TikTok lives
          result = result.filter(c => {
            const p = c.platform?.toLowerCase().trim();
            return p === 'stream' || p === 'twitch' ||
              (p === 'tiktok' && (c.duration_minutes || 0) > 0);
          });
        } else {
          result = result.filter(c => c.platform?.toLowerCase().trim() === pFilter);
        }
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
      if (filters.showOnlyZeroViews) {
        result = result.filter(c => (c.views || 0) === 0);
      }
      
    }

    return aggregateContentItems(result, content);
  }, [content, role, user, filters?.platform, filters?.campaign, filters?.creator, filters?.showOnlyZeroViews]);

  const metrics = useMemo(() => {
    const totalViews = filteredContent.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalEngagement = filteredContent.reduce((acc, curr) => acc + (curr.likes || 0) + (curr.comments || 0), 0);
    const totalPosts = filteredContent.filter(c => !c.is_repost).length;

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
    const thisMonthPosts = thisMonthContent.filter(c => !c.is_repost).length;
    const lastMonthPosts = lastMonthContent.filter(c => !c.is_repost).length;

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
    // Determine Cabs user profile ID
    const cabsUser = users.find(u => u.email === 'cabscryptocontacto@gmail.com');
    const cabsUserId = cabsUser?.id;

    // Group assigned creators by campaign
    const assignmentsByCampaign = new Map<string, Set<string>>();
    // We can populate this from the state variables if we expose assignments,
    // but we can also build it on-the-fly or query it. Since we parsed it in fetchData, 
    // let's do a simple check using content creator ids and client_id.
    
    return campaigns.map(campaign => {
      const campaignPayments = payments.filter(p => p.campaign_id === campaign.id);
      const spent = campaignPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);
      const remaining = (campaign.budget || 0) - spent;
      
      const campaignContent = content.filter(c => c.campaign_id === campaign.id);
      const views = campaignContent.reduce((acc, curr) => acc + (curr.views || 0), 0);
      
      // A campaign is personal if only Cabs has uploaded content to it, OR if it has no content and is owned by Cabs
      // AND it is not marked as show_to_all
      const uniqueCreators = new Set(campaignContent.map(c => c.creator_id).filter(Boolean));
      const isPersonal = !campaign.show_to_all && cabsUserId && (
        (uniqueCreators.size === 1 && uniqueCreators.has(cabsUserId)) ||
        (uniqueCreators.size === 0 && campaign.client_id === null)
      );

      return {
        ...campaign,
        views,
        contentCount: campaignContent.filter(c => !c.is_repost).length,
        spent, // For creators, this is "their" spent (earnings)
        remaining,
        isPersonal: !!isPersonal,
        isAssigned: role === 'admin' ? true : (assignedCampaignIds.includes(campaign.id) || !!campaign.show_to_all)
      };
    }).sort((a, b) => {
      // Sort assigned campaigns first, then by date
      if (a.isAssigned && !b.isAssigned) return -1;
      if (!a.isAssigned && b.isAssigned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [campaigns, payments, content, role, assignedCampaignIds, users]);

  const creatorStats = useMemo(() => {
    const stats: Record<string, any> = {};
    const statsContent = role === 'admin' ? content : filteredContent;
    
    statsContent.forEach(c => {
      // Skip orphaned content or content without a valid creator linked
      if (!c.creator_id || c.creator_id === 'null' || c.creator_id === 'undefined') return;
      
      if (!stats[c.creator_id]) stats[c.creator_id] = { views: 0, engagement: 0, contentCount: 0, estimatedValue: 0 };
      const views = c.views || 0;
      stats[c.creator_id].views += views;
      stats[c.creator_id].engagement += (c.likes || 0) + (c.comments || 0);
      if (!c.is_repost) {
        stats[c.creator_id].contentCount += 1;
      }
      stats[c.creator_id].estimatedValue += (views / 1000) * 2.5;
    });

    return Object.entries(stats).map(([id, data]) => {
      const u = users.find(usr => usr.id === id);
      const totalPaid = payments.filter(p => p.creator_id === id).reduce((s, p) => s + Number(p.amount), 0);
      return {
        creator_id: id,
        name: (role === 'admin' && u?.admin_alias) ? u.admin_alias : (u?.display_name || u?.email || 'Unknown'),
        paymentMethod: u?.payment_method,
        paymentId: u?.payment_method === 'binance' ? u.binance_id : (u?.wallet_address || u?.wallet_address_2),
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
