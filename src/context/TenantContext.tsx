import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { supabase, CreatorGroup } from '../supabase';

export type TenantType = 'umbra' | 'tellus' | 'all';

export interface TenantConfig {
  id: TenantType;
  name: string;
  shortName: string;
  tagline: string;
  primaryColor: string;
  colorName: 'rose' | 'emerald' | 'indigo';
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  themeClass: string;
  glowClass: string;
  publicUrl: string;
  description: string;
}

export const TENANT_CONFIGS: Record<TenantType, TenantConfig> = {
  umbra: {
    id: 'umbra',
    name: 'Umbra Agency',
    shortName: 'Umbra',
    tagline: 'Web3 & Tech High-Impact Creative Agency',
    primaryColor: '#e11d48', // rose-600
    colorName: 'rose',
    bgGradient: 'from-rose-500 to-red-600',
    badgeBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    badgeText: 'text-rose-500',
    accentBorder: 'border-rose-500',
    themeClass: 'theme-umbra',
    glowClass: 'text-glow-red',
    publicUrl: '/umbra',
    description: 'Gestión exclusiva de creadores tech y campañas de alto impacto Web3.'
  },
  tellus: {
    id: 'tellus',
    name: 'Tellus Cooperative',
    shortName: 'Tellus',
    tagline: 'Cooperative Web3 Ecosystem & Creator Community',
    primaryColor: '#10b981', // emerald-500
    colorName: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    badgeText: 'text-emerald-500',
    accentBorder: 'border-emerald-500',
    themeClass: 'theme-tellus',
    glowClass: 'text-glow-emerald',
    publicUrl: '/tellus',
    description: 'Comunidad de creadores cooperativos, sostenibilidad e impacto colectivo.'
  },
  all: {
    id: 'all',
    name: 'Creator Hub',
    shortName: 'Hub',
    tagline: 'Multi-Agency & Multi-Ecosystem Platform',
    primaryColor: '#4f46e5', // indigo-600
    colorName: 'indigo',
    bgGradient: 'from-indigo-500 to-indigo-600',
    badgeBg: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    badgeText: 'text-indigo-600',
    accentBorder: 'border-indigo-500',
    themeClass: 'theme-hub',
    glowClass: 'text-glow-indigo',
    publicUrl: '/',
    description: 'Gestión organizada por marca.'
  }
};

interface TenantContextType {
  tenant: TenantType;
  setTenant: (tenant: TenantType) => void;
  config: TenantConfig;
  availableTenants: TenantType[];
  groups: CreatorGroup[];
  activeDbGroupId: string | null;
  loading: boolean;
  refreshTenantData: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType>({
  tenant: 'umbra',
  setTenant: () => {},
  config: TENANT_CONFIGS.umbra,
  availableTenants: ['umbra', 'tellus'],
  groups: [],
  activeDbGroupId: null,
  loading: true,
  refreshTenantData: async () => {}
});

export const useTenant = () => useContext(TenantContext);

const STORAGE_KEY = 'creatorhub_active_tenant';

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [tenant, setTenantState] = useState<TenantType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as TenantType;
      if (saved && ['umbra', 'tellus'].includes(saved)) {
        return saved;
      }
    }
    return 'umbra';
  });

  const [groups, setGroups] = useState<CreatorGroup[]>([]);
  const [userGroupSlugs, setUserGroupSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenantGroups = useCallback(async () => {
    if (!supabase) return;
    try {
      // 1. Obtener grupos registrados
      const { data: dbGroups, error: grpErr } = await supabase
        .from('creator_groups')
        .select('*')
        .is('deleted_at', null);

      if (grpErr) throw grpErr;
      const loadedGroups = dbGroups || [];
      setGroups(loadedGroups);

      // 2. Si el usuario es creator, determinar a qué grupos pertenece
      if (user?.id && profile?.role === 'creator') {
        const { data: memberships } = await supabase
          .from('creator_group_members')
          .select('group_id')
          .eq('creator_id', user.id);

        const memberGroupIds = new Set((memberships || []).map(m => m.group_id));
        const matchedSlugs = loadedGroups
          .filter(g => memberGroupIds.has(g.id))
          .map(g => (g.slug || g.name.toLowerCase()));

        setUserGroupSlugs(matchedSlugs);

        // Si solo pertenece a un grupo específico, auto-asignar tenant
        const isUmbraOnly = matchedSlugs.some(s => s.includes('umbra')) && !matchedSlugs.some(s => s.includes('tellus'));
        const isTellusOnly = matchedSlugs.some(s => s.includes('tellus')) && !matchedSlugs.some(s => s.includes('umbra'));

        if (isUmbraOnly) {
          setTenantState('umbra');
        } else if (isTellusOnly) {
          setTenantState('tellus');
        }
      }
    } catch (e) {
      console.warn('Error loading tenant groups:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, profile?.role]);

  useEffect(() => {
    fetchTenantGroups();
  }, [fetchTenantGroups]);

  const setTenant = useCallback((newTenant: TenantType) => {
    setTenantState(newTenant);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTenant);
    }
  }, []);

  const config = useMemo(() => TENANT_CONFIGS[tenant] || TENANT_CONFIGS.all, [tenant]);

  // Opciones disponibles de organizaciones (Umbra y Tellus exclusivamente)
  const availableTenants: TenantType[] = useMemo(() => {
    if (profile?.role === 'admin' || user?.email === 'cabscryptocontacto@gmail.com') {
      return ['umbra', 'tellus'];
    }
    if (profile?.role === 'creator') {
      const canUmbra = userGroupSlugs.some(s => s.includes('umbra'));
      const canTellus = userGroupSlugs.some(s => s.includes('tellus'));

      if (canUmbra && canTellus) return ['umbra', 'tellus'];
      if (canTellus) return ['tellus'];
      if (canUmbra) return ['umbra'];
    }
    return ['umbra', 'tellus'];
  }, [profile?.role, user?.email, userGroupSlugs]);

  // Id de base de datos coincidente si existe un CreatorGroup con nombre/slug similar
  const activeDbGroupId = useMemo(() => {
    if (tenant === 'all') return null;
    const found = groups.find(g => {
      const s = (g.slug || g.name).toLowerCase();
      return s.includes(tenant);
    });
    return found ? found.id : null;
  }, [tenant, groups]);

  // Sincronizar clases globales de tema en el elemento raíz del body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-umbra', 'theme-tellus', 'theme-hub');
      document.body.classList.add(config.themeClass);
    }
  }, [config.themeClass]);

  const value = useMemo(() => ({
    tenant,
    setTenant,
    config,
    availableTenants,
    groups,
    activeDbGroupId,
    loading,
    refreshTenantData: fetchTenantGroups
  }), [tenant, setTenant, config, availableTenants, groups, activeDbGroupId, loading, fetchTenantGroups]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
