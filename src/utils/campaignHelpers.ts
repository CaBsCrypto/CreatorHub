import { Content } from '../supabase';

export interface DeliverableTargets {
  video_largo: number;
  video_corto: number;
  stream: number;
  game_night: number;
  post: number;
}

export function parseCampaignDeliverables(description: string | null | undefined): {
  cleanDescription: string;
  targets: DeliverableTargets;
} {
  const defaultTargets: DeliverableTargets = {
    video_largo: 0,
    video_corto: 0,
    stream: 0,
    game_night: 0,
    post: 0
  };

  if (!description) {
    return { cleanDescription: '', targets: defaultTargets };
  }

  const marker = '[deliverables]:';
  const index = description.indexOf(marker);
  if (index === -1) {
    return { cleanDescription: description, targets: defaultTargets };
  }

  const cleanDescription = description.substring(0, index).trim();
  const jsonStr = description.substring(index + marker.length).trim();
  try {
    const parsed = JSON.parse(jsonStr);
    const targets: DeliverableTargets = {
      video_largo: Number(parsed.video_largo) || 0,
      video_corto: Number(parsed.video_corto) || 0,
      stream: Number(parsed.stream) || 0,
      game_night: Number(parsed.game_night) || 0,
      post: Number(parsed.post) || 0
    };
    return { cleanDescription, targets };
  } catch (e) {
    return { cleanDescription: description, targets: defaultTargets };
  }
}

export function serializeCampaignDeliverables(description: string, targets: DeliverableTargets): string {
  // Strip any existing deliverables block first
  const cleanDescription = description.replace(/\[deliverables\]:.*$/s, '').trim();
  const jsonStr = JSON.stringify(targets);
  return `${cleanDescription}\n\n[deliverables]: ${jsonStr}`;
}

export function getDeliverableStats(contentItems: Content[], targets: DeliverableTargets) {
  const completed: DeliverableTargets = {
    video_largo: 0,
    video_corto: 0,
    stream: 0,
    game_night: 0,
    post: 0
  };

  contentItems.forEach(item => {
    // Only count active content and non-reposts
    if (item.status === 'archived' || item.is_repost) return;

    // Use content_type if explicitly set
    if (item.content_type === 'video_largo') {
      completed.video_largo++;
    } else if (item.content_type === 'video_corto') {
      completed.video_corto++;
    } else {
      const platform = item.platform?.toLowerCase();
      // Classify based on platform and characteristics
      if (platform === 'twitch') {
        completed.stream++;
      } else if (platform === 'discord') {
        completed.game_night++;
      } else if (platform === 'youtube') {
        // If it's on youtube and not explicitly marked, assume video_largo
        completed.video_largo++;
      } else if (platform === 'tiktok' || platform === 'instagram_story') {
        completed.video_corto++;
      } else if (platform === 'instagram') {
        // Instagram can be posts/carousel or video_corto (Reels).
        completed.post++;
      } else {
        completed.post++;
      }
    }
  });

  return { completed, targets };
}
