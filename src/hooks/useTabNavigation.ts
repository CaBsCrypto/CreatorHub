import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Syncs the active tab with URL search params (?tab=X).
 * This makes the browser back button navigate between tabs
 * instead of leaving the page entirely.
 */
export function useTabNavigation<T extends string>(
  defaultTab: T,
  validTabs: readonly T[]
): [T, (tab: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab');
  const activeTab: T = rawTab && validTabs.includes(rawTab as T)
    ? (rawTab as T)
    : defaultTab;

  const setActiveTab = useCallback((tab: T) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tab === defaultTab) {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  }, [setSearchParams, defaultTab]);

  return [activeTab, setActiveTab];
}

/**
 * Syncs filter values with URL search params.
 * Filters are stored as query params (e.g. ?tab=content&platform=tiktok&campaign=abc).
 * Default values are omitted from the URL to keep it clean.
 */
export function useFilterParams<T extends Record<string, string>>(
  defaults: T
): [T, (key: keyof T, value: string) => void, (updates: Partial<T>) => void, () => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  // Build current filter values from URL, falling back to defaults
  const filters = {} as T;
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const urlValue = searchParams.get(key as string);
    (filters as any)[key] = urlValue ?? defaults[key];
  }

  const setFilters = useCallback((updates: Partial<T>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(updates)) {
        if (value === defaults[key]) {
          next.delete(key);
        } else {
          next.set(key, value as string);
        }
      }
      return next;
    });
  }, [setSearchParams, defaults]);

  const setFilter = useCallback((key: keyof T, value: string) => {
    setFilters({ [key]: value } as Partial<T>);
  }, [setFilters]);

  const resetFilters = useCallback((overrides?: Partial<T>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      for (const key of Object.keys(defaults)) {
        next.delete(key);
      }
      if (overrides) {
        for (const [key, value] of Object.entries(overrides)) {
          next.set(key, value as string);
        }
      }
      return next;
    });
  }, [setSearchParams, defaults]);

  return [filters, setFilter, setFilters, resetFilters];
}
