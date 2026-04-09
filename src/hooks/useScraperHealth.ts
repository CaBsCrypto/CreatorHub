import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export interface ScraperHealth {
  successRate: number;
  errorCount: number;
  total: number;
  loading: boolean;
}

export function useScraperHealth() {
  const [health, setHealth] = useState<ScraperHealth>({
    successRate: 100,
    errorCount: 0,
    total: 0,
    loading: true
  });

  const fetchHealth = async () => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('scraper_logs')
        .select('status')
        .gt('created_at', twentyFourHoursAgo);

      if (error) throw error;

      if (!data || data.length === 0) {
        setHealth({ successRate: 100, errorCount: 0, total: 0, loading: false });
        return;
      }

      const successCount = data.filter(l => l.status === 'success').length;
      const errorCount = data.filter(l => l.status === 'error').length;
      const total = data.length;
      const successRate = Math.round((successCount / total) * 100);

      setHealth({ successRate, errorCount, total, loading: false });
    } catch (err) {
      console.error("Error fetching scraper health:", err);
      setHealth(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchHealth();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return health;
}
