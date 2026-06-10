import React from 'react';
import { Music2, Instagram, Youtube, Twitter, Zap, TrendingUp, Globe } from 'lucide-react';

/**
 * Get the appropriate Lucide icon for a given platform.
 */
export function getPlatformIcon(platform: string, className = 'h-4 w-4') {
  const p = platform.toLowerCase();
  switch (p) {
    case 'tiktok': return <Music2 className={className} />;
    case 'instagram': 
    case 'instagram_story': return <Instagram className={className} />;
    case 'youtube': return <Youtube className={className} />;
    case 'x': return <Twitter className={className} />;
    case 'twitch': return <Zap className={className} />;
    case 'coinmarketcap': return <TrendingUp className={className} />;
    default: return <Globe className={className} />;
  }
}

/**
 * Get the associated CSS classes for a platform background/text color.
 */
export function getPlatformColor(platform: string) {
  const p = platform.toLowerCase();
  switch (p) {
    case 'tiktok': return 'bg-slate-900 text-white';
    case 'instagram': return 'bg-pink-50 text-pink-600';
    case 'instagram_story': return 'bg-rose-50 text-rose-500';
    case 'youtube': return 'bg-red-50 text-red-600';
    case 'x': return 'bg-sky-50 text-sky-600';
    case 'twitch': return 'bg-indigo-50 text-indigo-600';
    case 'coinmarketcap': return 'bg-amber-50 text-amber-600';
    default: return 'bg-gray-50 text-gray-400';
  }
}
