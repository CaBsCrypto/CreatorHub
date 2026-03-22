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
